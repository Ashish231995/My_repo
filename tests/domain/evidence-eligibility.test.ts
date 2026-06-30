import { describe, expect, it } from 'vitest';
import type { DimensionResult, EvidenceItem } from '../../src/domain/model/evaluation';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { deriveFindings } from '../../src/domain/findings/deriveFindings';
import { generateRecommendations } from '../../src/domain/recommendations/generateRecommendations';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';
import { buildEvaluationInput } from '../helpers/evaluation-input';

const snapshotDate = '2026-06-01';

function urgentBlockerEvidence(overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: 'ev-blocker',
    canonicalSignalId: 'ev-blocker',
    validity: 'valid',
    exclusionReason: null,
    mapping: {
      status: 'mapped',
      canonicalType: 'delivery.blocker-open',
      reason: null,
      provenance: {
        representativeSourceLabel: 'Representative work-tracker (demo)',
        originalSourceTerm: 'Open blocker state',
        canonicalSignalType: 'delivery.blocker-open',
        mappingStatus: 'mapped',
      },
    },
    snapshot: { asOfDate: snapshotDate, label: 'test' },
    includedInScoring: true,
    resolvedAsOfDate: snapshotDate,
    sourceTerm: 'Open blocker state',
    healthValue: 20,
    sourcePayload: { blockerState: 'urgent' },
    ...overrides,
  };
}

function scopeInstabilityEvidence(overrides: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: 'ev-scope',
    canonicalSignalId: 'ev-scope',
    validity: 'valid',
    exclusionReason: null,
    mapping: {
      status: 'mapped',
      canonicalType: 'delivery.scope-stability',
      reason: null,
      provenance: {
        representativeSourceLabel: 'Representative work-tracker (demo)',
        originalSourceTerm: 'Scope change rate',
        canonicalSignalType: 'delivery.scope-stability',
        mappingStatus: 'mapped',
      },
    },
    snapshot: { asOfDate: snapshotDate, label: 'test' },
    includedInScoring: true,
    resolvedAsOfDate: snapshotDate,
    sourceTerm: 'Scope change rate',
    healthValue: 35,
    sourcePayload: { changeRatePercent: 25 },
    ...overrides,
  };
}

describe('evidence eligibility — excluded evidence must not drive FND/REC rules', () => {
  it('does not emit FND-001 or REC-001 for a disabled urgent blocker', () => {
    const evidence = urgentBlockerEvidence({
      validity: 'invalid',
      includedInScoring: false,
      exclusionReason: 'Signal group disabled',
    });
    const evidenceIndex = new Map([[evidence.id, evidence]]);
    const findings = deriveFindings([], evidenceIndex);
    const recommendations = generateRecommendations(
      { dimensions: [], findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );

    expect(findings.some((f) => f.id === 'FND-001')).toBe(false);
    expect(recommendations.some((r) => r.id === 'REC-001')).toBe(false);
  });

  it('does not emit FND-006 or REC-006 for disabled scope evidence', () => {
    const evidence = scopeInstabilityEvidence({
      validity: 'invalid',
      includedInScoring: false,
      exclusionReason: 'Signal group disabled',
    });
    const evidenceIndex = new Map([[evidence.id, evidence]]);
    const findings = deriveFindings([], evidenceIndex);
    const recommendations = generateRecommendations(
      { dimensions: [], findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );

    expect(findings.some((f) => f.id === 'FND-006')).toBe(false);
    expect(recommendations.some((r) => r.id === 'REC-006')).toBe(false);
  });

  it('does not emit findings or recommendations for invalid failed-mapping evidence', () => {
    const evidence: EvidenceItem = {
      id: 'ev-failed',
      canonicalSignalId: null,
      validity: 'invalid',
      exclusionReason: 'Unrecognized mapping key',
      mapping: {
        status: 'failed',
        canonicalType: null,
        reason: 'Unrecognized mapping key',
        provenance: {
          representativeSourceLabel: 'Unknown',
          originalSourceTerm: 'Open blocker state',
          canonicalSignalType: 'unknown',
          mappingStatus: 'failed',
        },
      },
      snapshot: { asOfDate: snapshotDate, label: 'test' },
      includedInScoring: false,
      resolvedAsOfDate: snapshotDate,
      sourceTerm: 'Open blocker state',
      sourcePayload: { blockerState: 'urgent', changeRatePercent: 25 },
    };
    const evidenceIndex = new Map([[evidence.id, evidence]]);
    const findings = deriveFindings([], evidenceIndex);
    const recommendations = generateRecommendations(
      { dimensions: [], findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );

    expect(findings).toHaveLength(0);
    expect(recommendations).toHaveLength(0);
  });

  it('runEvaluation with Sample B delivery group disabled retains excluded evidence without delivery FND/REC rules', () => {
    const input = buildEvaluationInput('sample-b');
    const deliveryGroup = SAMPLE_PROJECTS['sample-b'].signalGroups.find((group) =>
      group.dimensionAffinity.includes('delivery'),
    )!;
    const enabledGroups = new Set(
      [...input.enabledSignalGroupIds].filter((groupId) => groupId !== deliveryGroup.id),
    );

    const output = runEvaluation({
      ...input,
      enabledSignalGroupIds: enabledGroups,
    });

    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const deliveryEvidence = [...output.result.evidenceIndex.values()].filter((item) =>
      item.mapping.canonicalType?.startsWith('delivery.'),
    );

    expect(deliveryEvidence.length).toBeGreaterThan(0);
    expect(deliveryEvidence.every((item) => item.includedInScoring === false)).toBe(true);
    expect(deliveryEvidence.every((item) => item.validity === 'invalid')).toBe(true);

    expect(output.result.findings.some((f) => f.id === 'FND-001')).toBe(false);
    expect(output.result.findings.some((f) => f.id === 'FND-006')).toBe(false);
    expect(output.result.recommendations.some((r) => r.id === 'REC-001')).toBe(false);
    expect(output.result.recommendations.some((r) => r.id === 'REC-006')).toBe(false);

    const deliveryDimension = output.result.dimensions.find((d) => d.dimensionId === 'delivery');
    expect(deliveryDimension?.measurementStatus).toBe('unmeasured');
    expect(
      output.result.recommendations.some(
        (r) => r.id === 'REC-004-delivery' || r.id === 'REC-003-delivery',
      ),
    ).toBe(true);
  });
});
