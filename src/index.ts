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

const randomIntInputSchema = z.union([
  z.object({
    distribution: z.literal("uniform").default("uniform"),
    min: z.number().int(),
    max: z.number().int(),
    count: batchCountSchema.default(1),
  }).refine(({ min, max }) => min <= max, {
    message: "min must be less than or equal to max",
  }),
  z.object({
    distribution: z.literal("bernoulli"),
    probability: z.number().finite().min(0).max(1),
    count: batchCountSchema.default(1),
  }),
  z.object({
    distribution: z.literal("binomial"),
    trials: z.number().int().min(0).max(100_000),
    probability: z.number().finite().min(0).max(1),
    count: batchCountSchema.default(1),
  }),
  z.object({
    distribution: z.literal("poisson"),
    lambda: z.number().finite().min(0).max(100),
    count: batchCountSchema.default(1),
  }),
]);

type RandomIntInput = z.infer<typeof randomIntInputSchema>;

const randomDoubleInputSchema = z.union([
  z.object({
    distribution: z.literal("uniform").default("uniform"),
    min: z.number().finite(),
    max: z.number().finite(),
    count: batchCountSchema.default(1),
  }).refine(({ min, max }) => min < max, {
    message: "min must be less than max",
  }),
  z.object({
    distribution: z.literal("normal"),
    mean: z.number().finite(),
    standard_deviation: z.number().finite().min(0),
    count: batchCountSchema.default(1),
  }),
  z.object({
    distribution: z.literal("lognormal"),
    mu: z.number().finite(),
    sigma: z.number().finite().min(0),
    count: batchCountSchema.default(1),
  }),
  z.object({
    distribution: z.literal("exponential"),
    rate: z.number().finite().positive(),
    count: batchCountSchema.default(1),
  }),
]);

type RandomDoubleInput = z.infer<typeof randomDoubleInputSchema>;

function validateWeights(choices: string[], weights?: number[]): void {
  if (weights === undefined) return;

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
}

function weightedChoiceIndex(length: number, weights?: number[]): number {
  if (weights === undefined) {
    return randomIntInclusive(0, length - 1);
  }

  const total = weights.reduce((sum, weight) => sum + weight, 0);

  let target = unitRandom() * total;
  let lastPositiveIndex = 0;

  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > 0) lastPositiveIndex = i;
    target -= weights[i];
    if (target < 0) {
      return i;
    }
  }

  return lastPositiveIndex;
}

function randomChoices(
  choices: string[],
  count: number,
  withReplacement: boolean,
  weights?: number[],
): string[] {
  validateWeights(choices, weights);

  if (withReplacement) {
    return Array.from(
      { length: count },
      () => choices[weightedChoiceIndex(choices.length, weights)],
    );
  }

  if (count > choices.length) {
    throw new Error(
      "count must not exceed the number of choices when sampling without replacement",
    );
  }

  if (
    weights !== undefined &&
    count > weights.filter((weight) => weight > 0).length
  ) {
    throw new Error(
      "count must not exceed the number of positive weights when sampling without replacement",
    );
  }

  const remainingChoices = [...choices];
  const remainingWeights = weights === undefined ? undefined : [...weights];
  const values: string[] = [];

  for (let i = 0; i < count; i++) {
    const index = weightedChoiceIndex(
      remainingChoices.length,
      remainingWeights,
    );
    values.push(remainingChoices[index]);
    remainingChoices.splice(index, 1);
    remainingWeights?.splice(index, 1);
  }

  return values;
}

function randomIntValue(input: RandomIntInput): number {
  switch (input.distribution) {
    case "uniform":
      return randomIntInclusive(input.min, input.max);

    case "bernoulli":
      return unitRandom() < input.probability ? 1 : 0;

    case "binomial": {
      let successes = 0;

      for (let i = 0; i < input.trials; i++) {
        if (unitRandom() < input.probability) {
          successes++;
        }
      }

      return successes;
    }

    case "poisson": {
      if (input.lambda === 0) {
        return 0;
      }

      const threshold = Math.exp(-input.lambda);
      let product = 1;
      let count = 0;

      do {
        count++;
        product *= unitRandom();
      } while (product > threshold);

      return count - 1;
    }

    default:
      throw new Error("unsupported integer distribution");
  }
}

function randomDoubleFromDistribution(input: RandomDoubleInput): number {
  switch (input.distribution) {
    case "uniform":
      return randomDoubleValue(input.min, input.max);

    case "normal":
      return normal(input.mean, input.standard_deviation);

    case "lognormal": {
      // muとsigmaはlog(X)が従う正規分布の母数
      const value = Math.exp(normal(input.mu, input.sigma));

      if (!Number.isFinite(value)) {
        throw new Error("lognormal result overflowed");
      }

      return value;
    }

    case "exponential":
      return -Math.log1p(-unitRandom()) / input.rate;

    default:
      throw new Error("unsupported real-valued distribution");
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
    version: "1.1.0",
  });

  server.registerTool(
    "random_int",
    {
      description: [
        "Generate one or more integer results from the selected probability distribution.",
        "distribution defaults to uniform when omitted.",
        "uniform: {min,max}, with both endpoints inclusive.",
        "bernoulli: {probability}.",
        "binomial: {trials,probability}.",
        "poisson: {lambda}.",
        "count is the number of values to generate and defaults to 1.",
      ].join(" "),
      inputSchema: randomIntInputSchema,
    },
    async (input) => {
      if (
        input.distribution === "binomial" &&
        input.trials * input.count > 100_000
      ) {
        throw new Error(
          "trials multiplied by count must not exceed 100000",
        );
      }

      if (
        input.distribution === "poisson" &&
        input.lambda * input.count > 10_000
      ) {
        throw new Error(
          "lambda multiplied by count must not exceed 10000",
        );
      }

      return result({
        values: Array.from(
          { length: input.count },
          () => randomIntValue(input),
        ),
      });
    },
  );

  server.registerTool(
    "random_double",
    {
      description: [
        "Generate one or more floating-point results from the selected probability distribution.",
        "distribution defaults to uniform when omitted.",
        "uniform: {min,max}, using the half-open interval [min,max).",
        "normal: {mean,standard_deviation}.",
        "lognormal: {mu,sigma}, where log(X) is normal(mu,sigma).",
        "exponential: {rate}.",
        "count is the number of values to generate and defaults to 1.",
      ].join(" "),
      inputSchema: randomDoubleInputSchema,
    },
    async (input) =>
      result({
        values: Array.from(
          { length: input.count },
          () => randomDoubleFromDistribution(input),
        ),
      }),
  );

  server.registerTool(
    "random_choice",
    {
      description:
        "Select strings from choices. Optional weights select proportionally to nonnegative weights. Set with_replacement to false to prevent the same choice position from being selected more than once.",
      inputSchema: z.object({
        choices: z.array(z.string()).min(1).max(1000),
        weights: z.array(z.number().finite()).max(1000).optional(),
        count: batchCountSchema.default(1),
        with_replacement: z.boolean().default(true),
      }),
    },
    async ({ choices, weights, count, with_replacement }) =>
      result({
        values: randomChoices(
          choices,
          count,
          with_replacement,
          weights,
        ),
      }),
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
