import assert from "node:assert/strict";
import test from "node:test";
import { randomChoiceInputSchema } from "./input-schemas.ts";

test("randomChoiceInputSchema rejects negative weights", () => {
  const result = randomChoiceInputSchema.safeParse({
    choices: ["a", "b"],
    weights: [1, -1],
  });

  assert.equal(result.success, false);
});

test("randomChoiceInputSchema requires one weight per choice", () => {
  const result = randomChoiceInputSchema.safeParse({
    choices: ["a", "b"],
    weights: [1],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some(({ message }) => message === "weights must have the same length as choices"));
  }
});

test("randomChoiceInputSchema rejects unusable weights", () => {
  const zeroTotal = randomChoiceInputSchema.safeParse({
    choices: ["a", "b"],
    weights: [0, 0],
  });
  const infiniteTotal = randomChoiceInputSchema.safeParse({
    choices: ["a", "b"],
    weights: [Number.MAX_VALUE, Number.MAX_VALUE],
  });
  const insufficientPositiveWeights = randomChoiceInputSchema.safeParse({
    choices: ["a", "b"],
    weights: [1, 0],
    count: 2,
    with_replacement: false,
  });

  assert.equal(zeroTotal.success, false);
  assert.equal(infiniteTotal.success, false);
  assert.equal(insufficientPositiveWeights.success, false);
});

test("randomChoiceInputSchema limits sampling without replacement", () => {
  const result = randomChoiceInputSchema.safeParse({
    choices: ["a"],
    count: 2,
    with_replacement: false,
  });

  assert.equal(result.success, false);
});
