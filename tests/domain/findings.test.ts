import { describe, expect, it } from 'vitest';
import type { DimensionResult, EvidenceItem } from '../../src/domain/model/evaluation';
import { deriveFindings } from '../../src/domain/findings/deriveFindings';

describe('deriveFindings — deterministic FND-* IDs', () => {
  it('assigns stable FND-001 for urgent blocker', () => {
    const evidenceIndex = new Map<string, EvidenceItem>([
      [
        'ev-1',
        {
          id: 'ev-1',
          canonicalSignalId: 'ev-1',
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
          snapshot: { asOfDate: '2026-06-01', label: 'test' },
          includedInScoring: true,
        },
      ],
    ]);

    const first = deriveFindings([], evidenceIndex);
    const second = deriveFindings([], evidenceIndex);

    expect(first.filter((f) => f.id === 'FND-001')).toHaveLength(1);
    expect(second).toEqual(first);
  });

  it('assigns FND-003-{dimensionId} for Partial dimensions', () => {
    const partialSchedule: DimensionResult = {
      dimensionId: 'schedule',
      measurementStatus: 'partial',
      rawScore: 80,
      displayScore: 80,
      canonicalTypeHealth: { 'schedule.milestone-slip': 85 },
      classification: 'healthy',
      coveragePercent: 50,
      missingRequiredCanonicalTypes: ['schedule.baseline-health'],
      missingSignalGroupIds: [],
      trend: null,
      findings: [],
      evidence: [],
      explanation: '',
    };

    const findings = deriveFindings([partialSchedule], new Map());
    expect(findings.some((f) => f.id === 'FND-003-schedule')).toBe(true);
  });

  it('assigns FND-004-team for Unmeasured team dimension', () => {
    const team: DimensionResult = {
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

    const findings = deriveFindings([team], new Map());
    expect(findings.some((f) => f.id === 'FND-004-team')).toBe(true);
  });

  it('assigns FND-002 only when slip and due-date conditions satisfied', () => {
    const findings = deriveFindings([], new Map());
    expect(findings.some((f) => f.id === 'FND-002')).toBe(false);
  });
});
