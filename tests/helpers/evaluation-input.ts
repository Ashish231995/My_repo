import { MAPPING_REGISTRY, SAMPLE_PROJECTS } from '../../src/data/fixtures';
import { RULE_CATALOGS } from '../../src/domain/scoring/ruleCatalogs';

export type SampleProjectId = 'sample-a' | 'sample-b' | 'sample-c';

export function buildEvaluationInput(projectId: SampleProjectId) {
  const project = SAMPLE_PROJECTS[projectId];
  return {
    project: project as never,
    enabledSignalGroupIds: new Set(project.signalGroups.map((group) => group.id)),
    mappingRegistry: MAPPING_REGISTRY,
    ruleCatalogs: RULE_CATALOGS,
  };
}
