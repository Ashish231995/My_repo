import { describe, expect, it } from 'vitest';
import type { DimensionResult, EvidenceItem, Finding } from '../../src/domain/model/evaluation';
import { deriveFindings } from '../../src/domain/findings/deriveFindings';
import { generateRecommendations } from '../../src/domain/recommendations/generateRecommendations';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';

const snapshotDate = '2026-06-01';

function urgentBlockerEvidence(id = 'ev-blocker'): EvidenceItem {
  return {
    id,
    canonicalSignalId: id,
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
  };
}

function slipEvidence(
  slipDays: number,
  milestoneDueDate: string,
  id = 'ev-slip',
): EvidenceItem {
  return {
    id,
    canonicalSignalId: id,
    validity: 'valid',
    exclusionReason: null,
    mapping: {
      status: 'mapped',
      canonicalType: 'schedule.milestone-slip',
      reason: null,
      provenance: {
        representativeSourceLabel: 'Representative work-tracker (demo)',
        originalSourceTerm: 'Milestone slip days',
        canonicalSignalType: 'schedule.milestone-slip',
        mappingStatus: 'mapped',
      },
    },
    snapshot: { asOfDate: snapshotDate, label: 'test' },
    includedInScoring: true,
  };
}

describe('recommendation rules — REC-001 through REC-007', () => {
  it('emits FND-001 and REC-001 for urgent delivery blocker', () => {
    const evidenceIndex = new Map([['ev-blocker', urgentBlockerEvidence()]]);
    const dimensions: DimensionResult[] = [];

    const findings = deriveFindings(dimensions, evidenceIndex);
    expect(findings.some((f) => f.id === 'FND-001')).toBe(true);

    const recommendations = generateRecommendations(
      { dimensions, findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );
    expect(recommendations.some((r) => r.id === 'REC-001')).toBe(true);
  });

  it('emits FND-002 and REC-002 when slipDays ≥ 8 and due within 14 days (HD-08)', () => {
    const slip = slipEvidence(8, '2026-06-11');
    const evidenceIndex = new Map([['ev-slip', slip]]);

    const findings = deriveFindings([], evidenceIndex);
    expect(findings.some((f) => f.id === 'FND-002')).toBe(true);

    const recommendations = generateRecommendations(
      { dimensions: [], findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );
    const rec002 = recommendations.find((r) => r.id === 'REC-002');
    expect(rec002).toBeDefined();
    expect(rec002?.supportedDueDate).toBe('2026-06-11');
    expect(rec002?.priority).toBe('urgent');
  });

  it('does not emit FND-002 when milestoneDueDate is missing', () => {
    const evidenceIndex = new Map<string, EvidenceItem>();
    const findings = deriveFindings([], evidenceIndex);
    expect(findings.some((f) => f.id === 'FND-002')).toBe(false);
  });

  it('emits FND-004-team and REC-004-team for Unmeasured team dimension (Sample C)', () => {
    const teamDimension: DimensionResult = {
      dimensionId: 'team',
      measurementStatus: 'unmeasured',
      rawScore: null,
      displayScore: null,
      canonicalTypeHealth: {},
      classification: null,
      coveragePercent: 0,
      missingRequiredCanonicalTypes: ['team.engagement-score', 'team.communication-cadence'],
      missingSignalGroupIds: ['grp-team'],
      trend: null,
      findings: [],
      evidence: [],
      explanation: '',
    };

    const findings = deriveFindings([teamDimension], new Map());
    expect(findings.some((f) => f.id === 'FND-004-team')).toBe(true);

    const recommendations = generateRecommendations(
      { dimensions: [teamDimension], findings, evidenceIndex: new Map() },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );
    expect(recommendations.some((r) => r.id === 'REC-004-team')).toBe(true);
  });

  it('emits no recommendations for Sample A healthy scenario', () => {
    const dimensions: DimensionResult[] = [
      {
        dimensionId: 'schedule',
        measurementStatus: 'measured',
        rawScore: 95,
        displayScore: 95,
        canonicalTypeHealth: {},
        classification: 'healthy',
        coveragePercent: 100,
        missingRequiredCanonicalTypes: [],
        missingSignalGroupIds: [],
        trend: null,
        findings: [],
        evidence: [],
        explanation: '',
      },
    ];

    const findings = deriveFindings(dimensions, new Map());
    const recommendations = generateRecommendations(
      { dimensions, findings, evidenceIndex: new Map() },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );
    expect(recommendations).toHaveLength(0);
  });

  it('emits FND-005 and REC-005 for important governance gap', () => {
    const evidence: EvidenceItem = {
      id: 'ev-gov',
      canonicalSignalId: 'ev-gov',
      validity: 'valid',
      exclusionReason: null,
      mapping: {
        status: 'mapped',
        canonicalType: 'risk.governance-gap',
        reason: null,
        provenance: {
          representativeSourceLabel: 'Representative risk register (demo)',
          originalSourceTerm: 'Governance gap priority',
          canonicalSignalType: 'risk.governance-gap',
          mappingStatus: 'mapped',
        },
      },
      snapshot: { asOfDate: snapshotDate, label: 'test' },
      includedInScoring: true,
    };
    const evidenceIndex = new Map([['ev-gov', evidence]]);
    const findings = deriveFindings([], evidenceIndex);
    expect(findings.some((f: Finding) => f.id === 'FND-005')).toBe(true);

    const recommendations = generateRecommendations(
      { dimensions: [], findings, evidenceIndex },
      RULE_CATALOGS.recommendation,
      snapshotDate,
    );
    expect(recommendations.some((r) => r.id === 'REC-005')).toBe(true);
  });
});
