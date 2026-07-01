import { describe, expect, it } from 'vitest';
import { CANONICAL_SIGNAL_TYPES } from '../../src/domain/model/enums';
import {
  INVALID_FIXTURES,
  MAPPING_REGISTRY,
  SAMPLE_PROJECTS,
  SAMPLE_PROJECT_IDS,
} from '../../src/data/fixtures';
import { validateProject } from '../../src/domain/validation/validateProject';

describe('fixture exports — T050–T054, T121', () => {
  it('exports only Sample A, B and C in SAMPLE_PROJECTS (HD-04)', () => {
    expect(SAMPLE_PROJECT_IDS).toEqual(['sample-a', 'sample-b', 'sample-c']);
    expect(Object.keys(SAMPLE_PROJECTS).sort()).toEqual(['sample-a', 'sample-b', 'sample-c']);
    expect(SAMPLE_PROJECTS['sample-invalid']).toBeUndefined();
  });

  it('exports invalid fixture only through INVALID_FIXTURES', () => {
    expect(INVALID_FIXTURES['sample-invalid']).toBeDefined();
    expect(INVALID_FIXTURES['sample-invalid'].scenario).toBe('invalid');
    expect(validateProject(INVALID_FIXTURES['sample-invalid']).ok).toBe(false);
  });

  it('includes all nine canonical signal types in MAPPING_REGISTRY', () => {
    const registryTypes = new Set(
      Object.values(MAPPING_REGISTRY).map((entry) => entry.canonicalType),
    );
    for (const type of CANONICAL_SIGNAL_TYPES) {
      expect(registryTypes.has(type)).toBe(true);
    }
    expect(registryTypes.size).toBe(9);
  });

  it('Sample B satisfies HD-08 bundled dates and slip', () => {
    const project = SAMPLE_PROJECTS['sample-b'];
    const slip = project.sourceSignals.find((s) => s.id === 'sig-b-schedule-slip');
    expect(project.snapshot.asOfDate).toBe('2026-06-01');
    expect(slip?.payload.slipDays).toBe(8);
    expect(slip?.payload.milestoneDueDate).toBe('2026-06-11');
  });

  it('Sample C has no team source signals (0% Team coverage)', () => {
    const teamGroup = SAMPLE_PROJECTS['sample-c'].signalGroups.find((g) =>
      g.dimensionAffinity.includes('team'),
    );
    const teamSignals = SAMPLE_PROJECTS['sample-c'].sourceSignals.filter(
      (s) => s.signalGroupId === teamGroup?.id,
    );
    expect(teamSignals).toHaveLength(0);
  });
});
