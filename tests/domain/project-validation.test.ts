import { describe, expect, it } from 'vitest';
import type { SampleProjectFixture } from '../../src/domain/model/evaluation';
import { SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { validateProject } from '../../src/domain/validation/validateProject';

describe('validateProject — fixture schema and blocking rules', () => {
  it('accepts bundled Sample Projects A, B and C', () => {
    for (const id of ['sample-a', 'sample-b', 'sample-c'] as const) {
      const result = validateProject(SAMPLE_PROJECTS[id]);
      expect(result.ok).toBe(true);
    }
  });

  it('rejects empty sourceSignals (AS-050 empty-file category)', () => {
    const invalid: SampleProjectFixture = {
      ...SAMPLE_PROJECTS['sample-a'],
      id: 'invalid-empty',
      scenario: 'invalid',
      sourceSignals: [],
    };

    const result = validateProject(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalid.category).toMatch(/empty/i);
    }
  });

  it('rejects missing identity.projectKey (AS-051)', () => {
    const invalid = {
      ...SAMPLE_PROJECTS['sample-a'],
      id: 'invalid-identity',
      scenario: 'invalid',
      identity: { projectKey: '', projectName: 'Missing key' },
    } as SampleProjectFixture;

    const result = validateProject(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalid.category).toMatch(/identity/i);
    }
  });

  it('rejects invalid snapshot.asOfDate', () => {
    const invalid: SampleProjectFixture = {
      ...SAMPLE_PROJECTS['sample-a'],
      id: 'invalid-snapshot',
      scenario: 'invalid',
      snapshot: { asOfDate: 'not-a-date', label: 'bad' },
    };

    const result = validateProject(invalid);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalid.category).toMatch(/snapshot/i);
    }
  });

  it('rejects unrecognizable mappingKey on all signals', () => {
    const invalid: SampleProjectFixture = {
      ...SAMPLE_PROJECTS['sample-a'],
      id: 'invalid-mapping',
      scenario: 'invalid',
      sourceSignals: [
        {
          id: 'bad-signal',
          signalGroupId: 'grp-schedule',
          sourceTerm: 'Unknown',
          mappingKey: 'unknown-mapping-key',
          payload: {},
        },
      ],
    };

    const result = validateProject(invalid);
    expect(result.ok).toBe(false);
  });

  it('allows valid project with missing dimension evidence (Partial/Unmeasured deferred)', () => {
    const incomplete: SampleProjectFixture = {
      ...SAMPLE_PROJECTS['sample-c'],
      id: 'sample-c-check',
    };

    expect(validateProject(incomplete).ok).toBe(true);
  });
});
