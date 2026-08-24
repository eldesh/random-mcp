function nextDown(value: number): number {
  if (value === Number.NEGATIVE_INFINITY || Number.isNaN(value)) {
    return value;
  }
  if (value === Number.POSITIVE_INFINITY) {
    return Number.MAX_VALUE;
  }
  if (value === 0) {
    return -Number.MIN_VALUE;
  }

  const data = new DataView(new ArrayBuffer(8));
  data.setFloat64(0, value);
  const bits = data.getBigUint64(0);
  data.setBigUint64(0, value > 0 ? bits - 1n : bits + 1n);
  return data.getFloat64(0);
}

export function randomDoubleFromUnitInterval(
  min: number,
  max: number,
  unit: number,
): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    throw new Error("min and max must be finite and min < max");
  }
  if (!Number.isFinite(unit) || unit < 0 || unit >= 1) {
    throw new Error("unit must be in the half-open interval [0, 1)");
  }

  const width = max - min;
  if (!Number.isFinite(width)) {
    throw new Error("range is too large");
  }

  const value = min + width * unit;

  // IEEE 754の丸めで上限値になった場合も半開区間を維持する
  return value < max ? value : nextDown(max);
}

export function lognormalFromNormalValue(normalValue: number): number {
  const value = Math.exp(normalValue);

  // JSONで表現できないInfinityの代わりに最大の有限値へ飽和させる
  return value === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : value;
}
