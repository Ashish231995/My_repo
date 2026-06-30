import type { DimensionId } from '../model/enums';
import type { DimensionResult, EvidenceItem, Finding } from '../model/evaluation';
import { compareSnapshotDates } from '../utils/compareSnapshotDates';

const PRIORITY_GAPS = new Set(['important', 'urgent']);

function isScoringEligibleEvidence(item: EvidenceItem): boolean {
  return (
    item.validity === 'valid' &&
    item.includedInScoring === true &&
    item.mapping.status === 'mapped' &&
    item.mapping.canonicalType !== null
  );
}

function isUrgentBlocker(evidence: EvidenceItem): boolean {
  if (!isScoringEligibleEvidence(evidence) || evidence.mapping.canonicalType !== 'delivery.blocker-open') {
    return false;
  }
  const blockerState = evidence.sourcePayload?.blockerState;
  if (blockerState === 'urgent') {
    return true;
  }
  return evidence.healthValue === 20;
}

function isMilestoneRecovery(evidence: EvidenceItem): boolean {
  if (!isScoringEligibleEvidence(evidence) || evidence.mapping.canonicalType !== 'schedule.milestone-slip') {
    return false;
  }
  const payload = evidence.sourcePayload ?? {};
  const slipDays = payload.slipDays;
  const milestoneDueDate = payload.milestoneDueDate;
  if (typeof slipDays !== 'number' || slipDays < 8) {
    return false;
  }
  if (typeof milestoneDueDate !== 'string' || !milestoneDueDate.trim()) {
    return false;
  }
  const daysUntilDue = compareSnapshotDates(evidence.snapshot.asOfDate, milestoneDueDate);
  return daysUntilDue >= 0 && daysUntilDue <= 14;
}

function isGovernanceGap(evidence: EvidenceItem): boolean {
  if (!isScoringEligibleEvidence(evidence) || evidence.mapping.canonicalType !== 'risk.governance-gap') {
    return false;
  }
  const gapPriority = evidence.sourcePayload?.gapPriority;
  return typeof gapPriority === 'string' && PRIORITY_GAPS.has(gapPriority);
}

function isScopeInstability(evidence: EvidenceItem): boolean {
  if (!isScoringEligibleEvidence(evidence) || evidence.mapping.canonicalType !== 'delivery.scope-stability') {
    return false;
  }
  const changeRatePercent = evidence.sourcePayload?.changeRatePercent;
  return typeof changeRatePercent === 'number' && changeRatePercent > 20;
}

function isLowCommunicationCadence(evidence: EvidenceItem): boolean {
  if (
    !isScoringEligibleEvidence(evidence) ||
    evidence.mapping.canonicalType !== 'team.communication-cadence'
  ) {
    return false;
  }
  const completionPercent = evidence.sourcePayload?.completionPercent;
  return typeof completionPercent === 'number' && completionPercent < 80;
}

export function deriveFindings(
  dimensions: DimensionResult[],
  evidenceIndex: Map<string, EvidenceItem>,
): Finding[] {
  const findings: Finding[] = [];
  const evidence = [...evidenceIndex.values()];

  for (const item of evidence) {
    if (isUrgentBlocker(item)) {
      findings.push({
        id: 'FND-001',
        dimensionId: 'delivery',
        summary: 'Active urgent delivery blocker detected',
        evidenceIds: [item.id],
        supportsRecommendation: true,
      });
    }
  }

  for (const item of evidence) {
    if (isMilestoneRecovery(item)) {
      findings.push({
        id: 'FND-002',
        dimensionId: 'schedule',
        summary: 'Milestone slip requires recovery within snapshot-relative due window',
        evidenceIds: [item.id],
        supportsRecommendation: true,
      });
      break;
    }
  }

  for (const dimension of dimensions) {
    if (dimension.measurementStatus === 'partial') {
      findings.push({
        id: `FND-003-${dimension.dimensionId}`,
        dimensionId: dimension.dimensionId,
        summary: `Partial evidence for ${dimension.dimensionId}`,
        evidenceIds: dimension.evidence
          .filter((item) => isScoringEligibleEvidence(item))
          .map((item) => item.id),
        supportsRecommendation: true,
      });
    }
    if (dimension.measurementStatus === 'unmeasured') {
      findings.push({
        id: `FND-004-${dimension.dimensionId}`,
        dimensionId: dimension.dimensionId,
        summary: `Unmeasured evidence for ${dimension.dimensionId}`,
        evidenceIds: [],
        supportsRecommendation: true,
      });
    }
  }

  for (const item of evidence) {
    if (isGovernanceGap(item)) {
      findings.push({
        id: 'FND-005',
        dimensionId: 'risk',
        summary: 'Governance gap requires attention',
        evidenceIds: [item.id],
        supportsRecommendation: true,
      });
    }
  }

  for (const item of evidence) {
    if (isScopeInstability(item)) {
      findings.push({
        id: 'FND-006',
        dimensionId: 'delivery',
        summary: 'Scope change rate exceeds approved threshold',
        evidenceIds: [item.id],
        supportsRecommendation: true,
      });
    }
  }

  for (const item of evidence) {
    if (isLowCommunicationCadence(item)) {
      findings.push({
        id: 'FND-007',
        dimensionId: 'team',
        summary: 'Communication cadence completion below threshold',
        evidenceIds: [item.id],
        supportsRecommendation: true,
      });
    }
  }

  return dedupeFindings(findings);
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const byId = new Map<string, Finding>();
  for (const finding of findings) {
    if (!byId.has(finding.id)) {
      byId.set(finding.id, finding);
    }
  }
  return [...byId.values()];
}

export function getDimensionDisplayName(dimensionId: DimensionId): string {
  switch (dimensionId) {
    case 'schedule':
      return 'Schedule Health';
    case 'delivery':
      return 'Delivery and Scope';
    case 'team':
      return 'Team and Communications';
    case 'risk':
      return 'Risk and Governance';
  }
}
