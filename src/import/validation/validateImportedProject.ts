import type { MappingRegistry } from '../../data/fixtures/mapping-registry.js';
import type { ProjectLoadResult, SampleProjectFixture } from '../../domain/model/evaluation.js';

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

export function validateImportedProject(
  project: SampleProjectFixture,
  _registry: MappingRegistry,
): ProjectLoadResult {
  if (project.scenario !== 'imported') {
    return {
      ok: false,
      invalid: { category: 'malformed-structure', message: 'Not an imported project' },
    };
  }

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

  const groupIds = new Set(project.signalGroups.map((group) => group.id));
  if (!groupIds.has('import-workbook')) {
    return {
      ok: false,
      invalid: { category: 'malformed-structure', message: 'Missing import-workbook signal group' },
    };
  }

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

  return { ok: true, project: project as SampleProjectFixture };
}
