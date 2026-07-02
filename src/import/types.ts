import type { SignalGroupFixture, SourceSignal } from '../domain/model/evaluation.js';
import type { WorksheetName } from './parsing/types.js';

export interface ImportProvenance {
  workbookFilename: string;
  worksheet: WorksheetName;
  row: 2;
  column: string;
  mappingOutcome: 'mapped' | 'failed' | 'unsupported';
  scoringIncluded: boolean;
  exclusionReason: string | null;
}

export interface ImportedSourceSignal extends SourceSignal {
  provenance: ImportProvenance;
}

export interface ImportSessionMetadata {
  filename: string;
  workbookAsOfDate: string;
  localLastModifiedMs: number;
  trustLabel: string;
}

export interface ImportedSnapshotProject {
  schemaVersion: '1.0';
  id: string;
  displayName: string;
  scenario: 'imported';
  origin: 'imported';
  identity: {
    projectKey: string;
    projectName: string;
  };
  snapshot: {
    asOfDate: string;
    label?: string;
  };
  signalGroups: SignalGroupFixture[];
  sourceSignals: ImportedSourceSignal[];
  importMeta: ImportSessionMetadata;
}
