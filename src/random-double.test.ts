import assert from "node:assert/strict";
import test from "node:test";
import { randomDoubleFromUnitInterval } from "./random-double.ts";

const MAX_UNIT_RANDOM = (2 ** 53 - 1) / 2 ** 53;

test("randomDoubleFromUnitInterval excludes max after floating-point rounding", () => {
  const result = randomDoubleFromUnitInterval(1, 2, MAX_UNIT_RANDOM);

  assert.ok(result >= 1);
  assert.ok(result < 2);
});

test("randomDoubleFromUnitInterval handles adjacent bounds", () => {
  const min = 1;
  const max = 1 + Number.EPSILON;

  assert.equal(randomDoubleFromUnitInterval(min, max, MAX_UNIT_RANDOM), min);
});

test("randomDoubleFromUnitInterval handles a zero upper bound", () => {
  const result = randomDoubleFromUnitInterval(-1, 0, MAX_UNIT_RANDOM);

  assert.ok(result >= -1);
  assert.ok(result < 0);
});