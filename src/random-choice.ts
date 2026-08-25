export function sumWeights(weights: readonly number[]): number {
  return weights.reduce((sum, weight) => sum + weight, 0);
}