/**
 * Half-up rounding for display scores (AS-032, BR-008).
 */
export function roundHalfUp(value: number): number {
  if (value >= 0) {
    return Math.floor(value + 0.5);
  }
  return Math.ceil(value - 0.5);
}
