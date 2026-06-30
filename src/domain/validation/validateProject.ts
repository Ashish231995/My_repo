import type { MappingRegistry } from '../../data/fixtures/mapping-registry';
import { MAPPING_REGISTRY } from '../../data/fixtures/mapping-registry';
import type {
  ProjectLoadResult,
  SampleProjectFixture,
  ValidatedProject,
} from '../model/evaluation';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function hasRecognizableSignal(
  project: SampleProjectFixture,
  registry: MappingRegistry,
): boolean {
  return project.sourceSignals.some((signal) => Boolean(registry[signal.mappingKey]));
}

export function validateProject(
  project: SampleProjectFixture,
  registry: MappingRegistry = MAPPING_REGISTRY,
): ProjectLoadResult {
  if (project.schemaVersion !== '1.0') {
    return {
      ok: false,
      invalid: { category: 'malformed-structure', message: 'Unsupported schema version' },
    };
  }

  if (!project.id?.trim() || !project.displayName?.trim()) {
    return {
      ok: false,
      invalid: { category: 'malformed-structure', message: 'Missing project identity metadata' },
    };
  }

  if (!project.identity?.projectKey?.trim()) {
    return {
      ok: false,
      invalid: { category: 'missing-identity', message: 'Missing required projectKey' },
    };
  }

  if (!project.snapshot?.asOfDate || !isValidIsoDate(project.snapshot.asOfDate)) {
    return {
      ok: false,
      invalid: { category: 'invalid-snapshot', message: 'Invalid snapshot.asOfDate' },
    };
  }

  if (!Array.isArray(project.signalGroups) || project.signalGroups.length === 0) {
    return {
      ok: false,
      invalid: { category: 'malformed-structure', message: 'Missing signal groups' },
    };
  }

  if (!Array.isArray(project.sourceSignals) || project.sourceSignals.length === 0) {
    return {
      ok: false,
      invalid: { category: 'empty-file', message: 'No source signals present' },
    };
  }

  const groupIds = new Set(project.signalGroups.map((group) => group.id));
  for (const signal of project.sourceSignals) {
    if (!signal.id?.trim() || !signal.mappingKey?.trim() || !signal.signalGroupId?.trim()) {
      return {
        ok: false,
        invalid: { category: 'malformed-structure', message: 'Invalid source signal structure' },
      };
    }
    if (!groupIds.has(signal.signalGroupId)) {
      return {
        ok: false,
        invalid: { category: 'malformed-structure', message: 'Unknown signal group reference' },
      };
    }
  }

  if (!hasRecognizableSignal(project, registry)) {
    return {
      ok: false,
      invalid: {
        category: 'unrecognizable-signals',
        message: 'No recognizable mapping keys in source signals',
      },
    };
  }

  const validated: ValidatedProject = project;
  return { ok: true, project: validated };
}
