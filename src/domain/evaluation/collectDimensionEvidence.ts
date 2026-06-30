import type { DimensionId } from '../model/enums';
import type { EvidenceItem, SampleProjectFixture } from '../model/evaluation';

export function collectDimensionEvidence(
  dimensionId: DimensionId,
  project: SampleProjectFixture,
  allEvidence: EvidenceItem[],
): EvidenceItem[] {
  const groupIds = new Set(
    project.signalGroups
      .filter((group) => group.dimensionAffinity.includes(dimensionId))
      .map((group) => group.id),
  );
  const signalIds = new Set(
    project.sourceSignals
      .filter((signal) => groupIds.has(signal.signalGroupId))
      .map((signal) => signal.id),
  );

  return allEvidence.filter((item) => {
    const signalId = item.id.replace(/^evidence-/, '');
    return signalIds.has(signalId);
  });
}
