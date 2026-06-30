import type { HealthClassification } from '../model/enums';

/**
 * Classify a display score per Demonstration Rule Catalog bands (AS-013–AS-015).
 * Input is expected to be an already-rounded display score.
 */
export function classifyHealth(displayScore: number): HealthClassification {
  if (displayScore >= 80) {
    return 'healthy';
  }
  if (displayScore >= 50) {
    return 'at-risk';
  }
  return 'critical';
}
