import { MAPPING_REGISTRY } from '../../data/fixtures/mapping-registry.js';
import { mapSignalHealth } from '../../domain/scoring/signalHealth.js';
import type { ParsedSheet, ParsedWorkbook } from '../parsing/types.js';
import type { ImportedSnapshotProject, ImportedSourceSignal } from '../types.js';
import {
  DIMENSION_WORKSHEETS,
  registryEntriesForWorksheet,
  workbookColumnRegistry,
} from './workbookColumnRegistry.js';

const TRUST_LABEL = 'Local snapshot from your selected workbook — not a live SharePoint connection.';

const IMPORT_SIGNAL_GROUP = {
  id: 'import-workbook',
  representativeSourceLabel: 'Imported workbook snapshot',
  displayName: 'Import workbook',
  defaultEnabled: true,
  dimensionAffinity: ['schedule', 'delivery', 'team', 'risk'] as const,
  requiredForFullMeasurement: false,
};

interface PendingSignal {
  mappingKey: string;
  worksheet: ImportedSourceSignal['provenance']['worksheet'];
  primaryColumn: string;
  payload: Record<string, unknown>;
}

function getRow2Cells(sheet: ParsedSheet) {
  return sheet.rows.find((row) => row.rowIndex === 2)?.cells ?? [];
}

function getProjectCell(sheet: ParsedSheet, columnName: string): string {
  return getRow2Cells(sheet).find((cell) => cell.columnName === columnName)?.displayValue ?? '';
}

function coercePayloadValue(field: string, raw: unknown): unknown {
  if (typeof raw === 'number') {
    return raw;
  }
  if (field === 'blockerState' || field === 'escalationPriority' || field === 'gapPriority') {
    return String(raw);
  }
  if (field === 'milestoneDueDate') {
    return String(raw);
  }
  const numeric = Number(raw);
  if (!Number.isNaN(numeric) && String(raw).trim() !== '') {
    return numeric;
  }
  return raw;
}

function assessPayload(
  mappingKey: string,
  payload: Record<string, unknown>,
): Pick<ImportedSourceSignal['provenance'], 'mappingOutcome' | 'scoringIncluded' | 'exclusionReason'> {
  const entry = MAPPING_REGISTRY[mappingKey];
  if (!entry) {
    return {
      mappingOutcome: 'unsupported',
      scoringIncluded: false,
      exclusionReason: `Unrecognized mapping key: ${mappingKey}`,
    };
  }

  const health = mapSignalHealth(entry.canonicalType, payload);
  if (health === null) {
    return {
      mappingOutcome: 'mapped',
      scoringIncluded: false,
      exclusionReason: 'Invalid or missing required payload fields',
    };
  }

  return {
    mappingOutcome: 'mapped',
    scoringIncluded: true,
    exclusionReason: null,
  };
}

function buildDimensionSignals(
  workbook: ParsedWorkbook,
  filename: string,
): ImportedSourceSignal[] {
  const signals: ImportedSourceSignal[] = [];

  for (const worksheet of DIMENSION_WORKSHEETS) {
    const sheet = workbook.sheets[worksheet];
    const row2Cells = getRow2Cells(sheet);
    const grouped = new Map<string, PendingSignal>();

    for (const cell of row2Cells) {
      const registryEntry = workbookColumnRegistry[`${worksheet}:${cell.columnName}`];
      if (!registryEntry) {
        continue;
      }

      const payloadValue = coercePayloadValue(registryEntry.payloadField, cell.rawValue);
      const existing = grouped.get(registryEntry.mappingKey);
      if (existing) {
        existing.payload[registryEntry.payloadField] = payloadValue;
        continue;
      }

      grouped.set(registryEntry.mappingKey, {
        mappingKey: registryEntry.mappingKey,
        worksheet,
        primaryColumn: cell.columnName,
        payload: { [registryEntry.payloadField]: payloadValue },
      });
    }

    const columnOrder = registryEntriesForWorksheet(worksheet).map((entry) => entry.column);
    const orderedGroups = [...grouped.values()].sort((left, right) => {
      return columnOrder.indexOf(left.primaryColumn) - columnOrder.indexOf(right.primaryColumn);
    });

    for (const pending of orderedGroups) {
      const registryEntry = MAPPING_REGISTRY[pending.mappingKey];
      const assessment = assessPayload(pending.mappingKey, pending.payload);
      signals.push({
        id: `${pending.worksheet}-${pending.primaryColumn}`,
        signalGroupId: 'import-workbook',
        sourceTerm: registryEntry?.representativeSourceLabel ?? pending.mappingKey,
        mappingKey: pending.mappingKey,
        payload: pending.payload,
        provenance: {
          workbookFilename: filename,
          worksheet: pending.worksheet,
          row: 2,
          column: pending.primaryColumn,
          mappingOutcome: assessment.mappingOutcome,
          scoringIncluded: assessment.scoringIncluded,
          exclusionReason: assessment.exclusionReason,
        },
      });
    }
  }

  return signals.sort((left, right) => left.id.localeCompare(right.id));
}

export function normalizeImportedWorkbook(
  workbook: ParsedWorkbook,
  meta: { filename: string; lastModifiedMs: number },
): ImportedSnapshotProject {
  const projectSheet = workbook.sheets.Project;
  const projectKey = getProjectCell(projectSheet, 'projectKey').trim();
  const projectName = getProjectCell(projectSheet, 'projectName').trim();
  const asOfDate = getProjectCell(projectSheet, 'asOfDate').trim();

  return {
    schemaVersion: '1.0',
    id: `import:${projectKey}`,
    displayName: projectName || projectKey,
    scenario: 'imported',
    origin: 'imported',
    identity: {
      projectKey,
      projectName: projectName || projectKey,
    },
    snapshot: {
      asOfDate,
      label: `Snapshot as of ${asOfDate}`,
    },
    signalGroups: [
      {
        ...IMPORT_SIGNAL_GROUP,
        dimensionAffinity: [...IMPORT_SIGNAL_GROUP.dimensionAffinity],
      },
    ],
    sourceSignals: buildDimensionSignals(workbook, meta.filename),
    importMeta: {
      filename: meta.filename,
      workbookAsOfDate: asOfDate,
      localLastModifiedMs: meta.lastModifiedMs,
      trustLabel: TRUST_LABEL,
    },
  };
}
