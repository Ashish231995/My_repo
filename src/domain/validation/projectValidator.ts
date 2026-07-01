import type { MappingRegistry } from '../../data/fixtures/mapping-registry';
import type { ProjectLoadResult, SampleProjectFixture } from '../model/evaluation';

export type ProjectValidator = (
  project: SampleProjectFixture,
  registry: MappingRegistry,
) => ProjectLoadResult;
