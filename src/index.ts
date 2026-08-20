import {
  OAuthProvider,
} from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import type { Env } from "./env";
import { GitHubHandler } from "./github-handler";

const TWO_POW_53 = 9_007_199_254_740_992;

function randomUint32(): number {
  const data = new Uint32Array(1);
  crypto.getRandomValues(data);
  return data[0];
}

function random53BitInteger(): number {
  const high = randomUint32() >>> 5;
  const low = randomUint32() >>> 6;
  return high * 67_108_864 + low;
}

function unitRandom(): number {
  return random53BitInteger() / TWO_POW_53;
}

function randomIntInclusive(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new Error("min and max must be safe integers");
  }
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }

  const span = max - min + 1;

  if (
    !Number.isInteger(span) ||
    span <= 0 ||
    span > TWO_POW_53
  ) {
    throw new Error("integer range is too large");
  }

  // 剰余バイアスを除去する
  const limit = Math.floor(TWO_POW_53 / span) * span;
  let value: number;

  do {
    value = random53BitInteger();
  } while (value >= limit);

  return min + (value % span);
}

function randomDoubleValue(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    throw new Error("min and max must be finite and min < max");
  }

  const width = max - min;
  if (!Number.isFinite(width)) {
    throw new Error("range is too large");
  }

  return min + width * unitRandom();
}

function normal(mean: number, standardDeviation: number): number {
  if (standardDeviation < 0) {
    throw new Error("standard_deviation must be nonnegative");
  }
  if (standardDeviation === 0) {
    return mean;
  }

  let u = 0;
  while (u === 0) {
    u = unitRandom();
  }

  const v = unitRandom();

  return (
    mean +
    standardDeviation *
      Math.sqrt(-2 * Math.log(u)) *
      Math.cos(2 * Math.PI * v)
  );
}

const batchCountSchema = z.number().int().min(1).max(1000);

function probability(value: number): number {
  if (value < 0 || value > 1) {
    throw new Error("probability must be between 0 and 1");
  }
  return value;
}

function parameter(
  parameters: Record<string, number>,
  name: string,
): number {
  const value = parameters[name];

  if (value === undefined || !Number.isFinite(value)) {
    throw new Error(`missing or invalid parameter: ${name}`);
  }

  return value;
}

function weightedChoice(
  choices: string[],
  weights?: number[],
): string {
  if (weights === undefined) {
    return choices[randomIntInclusive(0, choices.length - 1)];
  }

  if (weights.length !== choices.length) {
    throw new Error("weights must have the same length as choices");
  }

  let total = 0;

  for (const weight of weights) {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new Error("weights must be finite and nonnegative");
    }
    total += weight;
  }

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("the sum of weights must be positive and finite");
  }

  let target = unitRandom() * total;

  for (let i = 0; i < choices.length; i++) {
    target -= weights[i];
    if (target < 0) {
      return choices[i];
    }
  }

  return choices[choices.length - 1];
}

function sampleOne(
  distribution: string,
  parameters: Record<string, number>,
): number {
  switch (distribution) {
    case "uniform":
      return randomDoubleValue(
        parameter(parameters, "min"),
        parameter(parameters, "max"),
      );

    case "normal":
      return normal(
        parameter(parameters, "mean"),
        parameter(parameters, "standard_deviation"),
      );

    case "lognormal": {
      // muとsigmaはlog(X)が従う正規分布の母数
      const value = Math.exp(
        normal(
          parameter(parameters, "mu"),
          parameter(parameters, "sigma"),
        ),
      );

      if (!Number.isFinite(value)) {
        throw new Error("lognormal result overflowed");
      }

      return value;
    }

    case "exponential": {
      const rate = parameter(parameters, "rate");
      if (rate <= 0) {
        throw new Error("rate must be positive");
      }
      return -Math.log1p(-unitRandom()) / rate;
    }

    case "bernoulli":
      return unitRandom() <
        probability(parameter(parameters, "probability"))
        ? 1
        : 0;

    case "binomial": {
      const trials = parameter(parameters, "trials");
      const p = probability(parameter(parameters, "probability"));

      if (
        !Number.isSafeInteger(trials) ||
        trials < 0 ||
        trials > 100_000
      ) {
        throw new Error(
          "trials must be an integer between 0 and 100000",
        );
      }

      let successes = 0;

      for (let i = 0; i < trials; i++) {
        if (unitRandom() < p) {
          successes++;
        }
      }

      return successes;
    }

    case "poisson": {
      const lambda = parameter(parameters, "lambda");

      if (lambda < 0 || lambda > 100) {
        throw new Error("lambda must be between 0 and 100");
      }
      if (lambda === 0) {
        return 0;
      }

      const threshold = Math.exp(-lambda);
      let product = 1;
      let count = 0;

      do {
        count++;
        product *= unitRandom();
      } while (product > threshold);

      return count - 1;
    }

    default:
      throw new Error(`unsupported distribution: ${distribution}`);
  }
}

function result(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data),
      },
    ],
  };
}

function createServer() {
  const server = new McpServer({
    name: "random-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "random_int",
    {
      description:
        "Return a uniformly distributed integer. Both min and max are inclusive.",
      inputSchema: {
        min: z.number().int(),
        max: z.number().int(),
      },
    },
    async ({ min, max }) =>
      result({ value: randomIntInclusive(min, max) }),
  );

  server.registerTool(
    "random_ints",
    {
      description:
        "Return uniformly distributed integers. Both min and max are inclusive.",
      inputSchema: {
        min: z.number().int(),
        max: z.number().int(),
        count: batchCountSchema,
      },
    },
    async ({ min, max, count }) =>
      result({
        values: Array.from(
          { length: count },
          () => randomIntInclusive(min, max),
        ),
      }),
  );

  server.registerTool(
    "random_double",
    {
      description:
        "Return a uniformly distributed number in the half-open interval [min, max).",
      inputSchema: {
        min: z.number().finite(),
        max: z.number().finite(),
      },
    },
    async ({ min, max }) =>
      result({ value: randomDoubleValue(min, max) }),
  );

  server.registerTool(
    "random_doubles",
    {
      description:
        "Return uniformly distributed numbers in the half-open interval [min, max).",
      inputSchema: {
        min: z.number().finite(),
        max: z.number().finite(),
        count: batchCountSchema,
      },
    },
    async ({ min, max, count }) =>
      result({
        values: Array.from(
          { length: count },
          () => randomDoubleValue(min, max),
        ),
      }),
  );

  server.registerTool(
    "random_choice",
    {
      description:
        "Select one string from choices. Optional weights select proportionally to nonnegative weights.",
      inputSchema: z.object({
        choices: z.array(z.string()).min(1).max(1000),
        weights: z.array(z.number().finite()).max(1000).optional(),
      }),
    },
    async ({ choices, weights }) =>
      result({ value: weightedChoice(choices, weights) }),
  );

  server.registerTool(
    "random_sample",
    {
      description: [
        "Generate samples from a distribution.",
        "uniform: {min,max}",
        "normal: {mean,standard_deviation}",
        "lognormal: {mu,sigma}, where log(X) is normal(mu,sigma)",
        "exponential: {rate}",
        "bernoulli: {probability}",
        "binomial: {trials,probability}",
        "poisson: {lambda}",
      ].join(" "),
      inputSchema: z.object({
        distribution: z.enum([
          "uniform",
          "normal",
          "lognormal",
          "exponential",
          "bernoulli",
          "binomial",
          "poisson",
        ]),
        parameters: z.record(
          z.string(),
          z.number().finite(),
        ),
        count: z.number().int().min(1).max(100).default(1),
      }),
    },
    async ({ distribution, parameters, count }) => {
      if (
        distribution === "binomial" &&
        parameter(parameters, "trials") * count > 100_000
      ) {
        throw new Error(
          "trials multiplied by count must not exceed 100000",
        );
      }

      if (
        distribution === "poisson" &&
        parameter(parameters, "lambda") * count > 10_000
      ) {
        throw new Error(
          "lambda multiplied by count must not exceed 10000",
        );
      }

      return result({
        values: Array.from(
          { length: count },
          () => sampleOne(distribution, parameters),
        ),
      });
    },
  );

  return server;
}

const mcpHandler = createMcpHandler(createServer, {
  route: "/mcp",
});

const mcpApiHandler = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return mcpHandler(request, env, ctx);
  },
};

export default new OAuthProvider<Env>({
  apiRoute: "/mcp",
  apiHandler: mcpApiHandler,
  defaultHandler: GitHubHandler as any,

  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/oauth/token",
  clientRegistrationEndpoint: "/oauth/register",

  scopesSupported: ["mcp:use"],
  resourceMetadata: {
    scopes_supported: ["mcp:use"],
    resource_name: "random-mcp",
  }
});
