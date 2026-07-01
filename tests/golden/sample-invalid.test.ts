import { describe, expect, it } from 'vitest';
import { INVALID_FIXTURES, SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { validateProject } from '../../src/domain/validation/validateProject';
import { MAPPING_REGISTRY } from '../../src/data/fixtures/mapping-registry';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';

describe('golden invalid fixture — evaluation blocked (AS-028, AS-050, AS-051)', () => {
  const fixture = INVALID_FIXTURES['sample-invalid'];

  it('loads from INVALID_FIXTURES only, not SAMPLE_PROJECTS (HD-04)', () => {
    expect(fixture).toBeDefined();
    expect(fixture.scenario).toBe('invalid');
    expect(SAMPLE_PROJECTS['sample-invalid']).toBeUndefined();
  });

  it('fails structural validation immediately', () => {
    const result = validateProject(fixture, MAPPING_REGISTRY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.invalid.category).toBe('missing-identity');
    }
  });

  it('blocks runEvaluation with no scores, composite, findings, or recommendations', () => {
    const output = runEvaluation({
      project: fixture,
      enabledSignalGroupIds: new Set(fixture.signalGroups.map((group) => group.id)),
      mappingRegistry: MAPPING_REGISTRY,
      ruleCatalogs: RULE_CATALOGS,
    });

    expect(output.ok).toBe(false);
    if (!output.ok) {
      expect(output.error.message).toMatch(/projectKey/i);
    }
  });
});
