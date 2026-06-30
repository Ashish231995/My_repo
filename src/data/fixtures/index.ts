import type { SampleProjectFixture } from '../../domain/model/evaluation';
import sampleProjectA from './sample-project-a.json';
import sampleProjectB from './sample-project-b.json';
import sampleProjectC from './sample-project-c.json';
import { MAPPING_REGISTRY } from './mapping-registry';

export { MAPPING_REGISTRY };

export const SAMPLE_PROJECTS: Record<string, SampleProjectFixture> = {
  'sample-a': sampleProjectA as SampleProjectFixture,
  'sample-b': sampleProjectB as SampleProjectFixture,
  'sample-c': sampleProjectC as SampleProjectFixture,
};

export const SAMPLE_PROJECT_IDS = ['sample-a', 'sample-b', 'sample-c'] as const;
