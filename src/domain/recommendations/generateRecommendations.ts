import type {
  EvaluationResult,
  Finding,
  Recommendation,
  RecommendationRuleCatalog,
} from '../model/evaluation';
import { getDimensionDisplayName } from '../findings/deriveFindings';

function findingMap(findings: Finding[]): Map<string, Finding> {
  return new Map(findings.map((finding) => [finding.id, finding]));
}

function evidenceDueDate(
  evidenceIndex: EvaluationResult['evidenceIndex'],
  evidenceIds: string[],
): string | null {
  for (const evidenceId of evidenceIds) {
    const item = evidenceIndex.get(evidenceId);
    if (item?.sourcePayload?.milestoneDueDate && typeof item.sourcePayload.milestoneDueDate === 'string') {
      return item.sourcePayload.milestoneDueDate;
    }
    if (item?.sourcePayload?.asOfDate && typeof item.sourcePayload.asOfDate === 'string') {
      return item.sourcePayload.asOfDate;
    }
  }
  return null;
}

export function generateRecommendations(
  evaluation: Pick<EvaluationResult, 'dimensions' | 'findings' | 'evidenceIndex'>,
  _ruleCatalog: RecommendationRuleCatalog,
  snapshotDate: string,
): Recommendation[] {
  void snapshotDate;
  const findingsById = findingMap(evaluation.findings);
  const recommendations: Recommendation[] = [];

  if (findingsById.has('FND-001')) {
    const finding = findingsById.get('FND-001')!;
    recommendations.push({
      id: 'REC-001',
      priority: 'urgent',
      action: 'Resolve and escalate the delivery blocker',
      reason: finding.summary,
      dimensionId: 'delivery',
      findingIds: [finding.id],
      evidenceIds: finding.evidenceIds,
      supportedDueDate: evidenceDueDate(evaluation.evidenceIndex, finding.evidenceIds),
      urgencyInferred: false,
    });
  }

  if (findingsById.has('FND-002')) {
    const finding = findingsById.get('FND-002')!;
    recommendations.push({
      id: 'REC-002',
      priority: 'urgent',
      action: 'Establish and escalate a milestone recovery plan',
      reason: finding.summary,
      dimensionId: 'schedule',
      findingIds: [finding.id],
      evidenceIds: finding.evidenceIds,
      supportedDueDate: evidenceDueDate(evaluation.evidenceIndex, finding.evidenceIds),
      urgencyInferred: false,
    });
  }

  for (const finding of evaluation.findings) {
    if (finding.id.startsWith('FND-003-')) {
      const dimensionId = finding.dimensionId;
      recommendations.push({
        id: `REC-003-${dimensionId}`,
        priority: 'important',
        action: `Provide the specifically identified missing evidence for ${getDimensionDisplayName(dimensionId)}`,
        reason: finding.summary,
        dimensionId,
        findingIds: [finding.id],
        evidenceIds: finding.evidenceIds,
        supportedDueDate: null,
        urgencyInferred: false,
      });
    }
  }

  for (const finding of evaluation.findings) {
    if (finding.id.startsWith('FND-004-')) {
      const dimensionId = finding.dimensionId;
      recommendations.push({
        id: `REC-004-${dimensionId}`,
        priority: 'important',
        action: `Enable or provide the required evidence for ${getDimensionDisplayName(dimensionId)}`,
        reason: finding.summary,
        dimensionId,
        findingIds: [finding.id],
        evidenceIds: finding.evidenceIds,
        supportedDueDate: null,
        urgencyInferred: false,
      });
    }
  }

  if (findingsById.has('FND-005')) {
    const finding = findingsById.get('FND-005')!;
    recommendations.push({
      id: 'REC-005',
      priority: 'important',
      action: 'Close or formally accept the governance gap',
      reason: finding.summary,
      dimensionId: 'risk',
      findingIds: [finding.id],
      evidenceIds: finding.evidenceIds,
      supportedDueDate: evidenceDueDate(evaluation.evidenceIndex, finding.evidenceIds),
      urgencyInferred: false,
    });
  }

  if (findingsById.has('FND-006')) {
    const finding = findingsById.get('FND-006')!;
    recommendations.push({
      id: 'REC-006',
      priority: 'important',
      action: 'Review scope baseline and change controls',
      reason: finding.summary,
      dimensionId: 'delivery',
      findingIds: [finding.id],
      evidenceIds: finding.evidenceIds,
      supportedDueDate: evidenceDueDate(evaluation.evidenceIndex, finding.evidenceIds),
      urgencyInferred: false,
    });
  }

  if (findingsById.has('FND-007')) {
    const finding = findingsById.get('FND-007')!;
    recommendations.push({
      id: 'REC-007',
      priority: 'advisory',
      action: 'Restore the agreed communication cadence',
      reason: finding.summary,
      dimensionId: 'team',
      findingIds: [finding.id],
      evidenceIds: finding.evidenceIds,
      supportedDueDate: evidenceDueDate(evaluation.evidenceIndex, finding.evidenceIds),
      urgencyInferred: false,
    });
  }

  return recommendations;
}
