import { describe, expect, it } from 'vitest';
import type { SourceSignal } from '../../src/domain/model/evaluation';
import { MAPPING_REGISTRY } from '../../src/data/fixtures';
import { normalizeSignal } from '../../src/domain/normalization/normalizeSignal';

describe('normalizeSignal — methodology-neutral mapping (UD-011)', () => {
  it('maps milestone-slip to schedule.milestone-slip', () => {
    const source: SourceSignal = {
      id: 'sig-1',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Milestone slip days',
      mappingKey: 'milestone-slip',
      payload: { slipDays: 0 },
    };

    const result = normalizeSignal(source, MAPPING_REGISTRY);

    expect(result.status).toBe('mapped');
    expect(result.canonicalType).toBe('schedule.milestone-slip');
    expect(result.canonical?.canonicalType).toBe('schedule.milestone-slip');
  });

  it('maps equivalent milestone-slip-waterfall to same canonical type (AS-060)', () => {
    const waterfall: SourceSignal = {
      id: 'sig-wf',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Waterfall slip days',
      mappingKey: 'milestone-slip-waterfall',
      payload: { slipDays: 8 },
    };

    const agile: SourceSignal = {
      id: 'sig-ag',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Milestone slip days',
      mappingKey: 'milestone-slip',
      payload: { slipDays: 8 },
    };

    const wf = normalizeSignal(waterfall, MAPPING_REGISTRY);
    const ag = normalizeSignal(agile, MAPPING_REGISTRY);

    expect(wf.canonicalType).toBe(ag.canonicalType);
    expect(wf.canonicalType).toBe('schedule.milestone-slip');
  });

  it('returns failed mapping with visible reason for unknown mappingKey', () => {
    const source: SourceSignal = {
      id: 'sig-unknown',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Unknown metric',
      mappingKey: 'unknown-key',
      payload: { value: 1 },
    };

    const result = normalizeSignal(source, MAPPING_REGISTRY);

    expect(result.status).toBe('failed');
    expect(result.canonical).toBeNull();
    expect(result.reason).toBeTruthy();
  });

  it('preserves representative source label in provenance (AS-062)', () => {
    const source: SourceSignal = {
      id: 'sig-team',
      signalGroupId: 'grp-team',
      sourceTerm: 'Engagement score',
      mappingKey: 'engagement-score',
      payload: { engagementScore: 88 },
    };

    const result = normalizeSignal(source, MAPPING_REGISTRY);

    expect(result.provenance.representativeSourceLabel).toBe(
      'Representative collaboration survey (demo)',
    );
  });
});
