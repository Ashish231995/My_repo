import { describe, expect, it } from 'vitest';
import type { SourceSignal } from '../../src/domain/model/evaluation';
import { MAPPING_REGISTRY, SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { validateSignal } from '../../src/domain/validation/validateSignal';

const snapshot = SAMPLE_PROJECTS['sample-b'].snapshot;
const enabledGroups = new Set(SAMPLE_PROJECTS['sample-b'].signalGroups.map((g) => g.id));

describe('validateSignal — payload and inclusion rules', () => {
  it('accepts valid Sample B milestone slip with HD-08 dates', () => {
    const signal = SAMPLE_PROJECTS['sample-b'].sourceSignals.find(
      (s) => s.id === 'sig-b-schedule-slip',
    )!;

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(true);
    expect(result.includedInScoring).toBe(true);
  });

  it('marks disabled signal groups invalid and excluded from scoring (AS-043)', () => {
    const signal = SAMPLE_PROJECTS['sample-b'].sourceSignals[0]!;

    const result = validateSignal(signal, {
      enabledSignalGroupIds: new Set<string>(),
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(false);
    expect(result.includedInScoring).toBe(false);
    expect(result.exclusionReason).toMatch(/disabled/i);
  });

  it('rejects empty sourceTerm', () => {
    const signal: SourceSignal = {
      id: 'bad-term',
      signalGroupId: 'grp-schedule',
      sourceTerm: '',
      mappingKey: 'milestone-slip',
      payload: { slipDays: 0 },
    };

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(false);
    expect(result.includedInScoring).toBe(false);
  });

  it('rejects malformed signal asOfDate', () => {
    const signal: SourceSignal = {
      id: 'bad-date',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Milestone slip days',
      mappingKey: 'milestone-slip',
      payload: { slipDays: 0 },
      asOfDate: 'not-a-date',
    };

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(false);
    expect(result.exclusionReason).toMatch(/asOfDate/i);
  });

  it('rejects missing project snapshot as-of date', () => {
    const signal = SAMPLE_PROJECTS['sample-a'].sourceSignals[0]!;

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot: { asOfDate: 'not-a-date' },
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(false);
    expect(result.exclusionReason).toMatch(/snapshot/i);
  });

  it('rejects signal with missing required payload fields', () => {
    const signal: SourceSignal = {
      id: 'bad-payload',
      signalGroupId: 'grp-schedule',
      sourceTerm: 'Milestone slip days',
      mappingKey: 'milestone-slip',
      payload: {},
    };

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.valid).toBe(false);
    expect(result.exclusionReason).toBeTruthy();
  });

  it('resolves as-of date from project snapshot when signal omits asOfDate (AS-042)', () => {
    const signal = SAMPLE_PROJECTS['sample-a'].sourceSignals[0]!;

    const result = validateSignal(signal, {
      enabledSignalGroupIds: enabledGroups,
      snapshot,
      mappingRegistry: MAPPING_REGISTRY,
    });

    expect(result.resolvedAsOfDate).toBe('2026-06-01');
  });
});
