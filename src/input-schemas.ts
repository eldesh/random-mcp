import { z } from "zod";

export const batchCountSchema = z.number().int().min(1).max(1000);

export const randomChoiceInputSchema = z.object({
  choices: z.array(z.string()).min(1).max(1000),
  weights: z.array(z.number().finite().min(0)).max(1000).optional(),
  count: batchCountSchema.default(1),
  with_replacement: z.boolean().default(true),
}).superRefine(({ choices, weights, count, with_replacement }, ctx) => {
  if (weights !== undefined) {
    if (weights.length !== choices.length) {
      ctx.addIssue({
        code: "custom",
        message: "weights must have the same length as choices",
        path: ["weights"],
      });
    }

    const total = weights.reduce((sum, weight) => sum + weight, 0);
    if (!Number.isFinite(total) || total <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "the sum of weights must be positive and finite",
        path: ["weights"],
      });
    }
  }

  if (with_replacement) return;

  if (count > choices.length) {
    ctx.addIssue({
      code: "custom",
      message:
        "count must not exceed the number of choices when sampling without replacement",
      path: ["count"],
    });
  }

  if (
    weights !== undefined &&
    weights.length === choices.length &&
    count > weights.filter((weight) => weight > 0).length
  ) {
    ctx.addIssue({
      code: "custom",
      message:
        "count must not exceed the number of positive weights when sampling without replacement",
      path: ["count"],
    });
  }
});