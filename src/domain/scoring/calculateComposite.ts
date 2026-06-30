import type { CompositeHealthResult, DimensionResult } from '../model/evaluation';
import { classifyHealth } from '../utils/classifyHealth';
import { roundHalfUp } from '../utils/roundHalfUp';

export function calculateComposite(dimensions: DimensionResult[]): CompositeHealthResult {
  const measured = dimensions.filter((dimension) => dimension.measurementStatus === 'measured');

  if (measured.length < 2) {
    return {
      eligible: false,
      rawComposite: null,
      displayComposite: null,
      classification: null,
      contributingDimensionIds: [],
      coverageStatement: 'Insufficient measured coverage for composite',
      insufficientCoverage: {
        measuredCount: measured.length,
        requiredMinimum: 2,
        message: 'At least two Measured dimensions are required for a numeric composite',
      },
    };
  }

  const rawComposite =
    measured.reduce((sum, dimension) => sum + (dimension.rawScore ?? 0), 0) / measured.length;
  const displayComposite = roundHalfUp(rawComposite);
  const classification = classifyHealth(displayComposite);
  const contributingDimensionIds = measured.map((dimension) => dimension.dimensionId);

  const coverageStatement =
    measured.length === 4
      ? 'Complete (4 Measured)'
      : `Based on ${measured.length} of 4 Measured dimensions`;

  return {
    eligible: true,
    rawComposite,
    displayComposite,
    classification,
    contributingDimensionIds,
    coverageStatement,
    insufficientCoverage: null,
  };
}
