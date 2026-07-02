import type { MappingRegistry } from '../../data/fixtures/mapping-registry';
import type { ProjectValidator } from '../validation/projectValidator';
import type {
  CanonicalSignalType,
  DimensionId,
  HealthClassification,
  MeasurementStatus,
  Persona,
  RecommendationPriority,
} from './enums';

export interface SnapshotMetadata {
  asOfDate: string;
  label: string;
}

export interface SourceSignal {
  id: string;
  signalGroupId: string;
  sourceTerm: string;
  sourceField?: string;
  mappingKey: string;
  payload: Record<string, unknown>;
  asOfDate?: string | null;
  /** For adverse testing only */
  forceMappingFailure?: boolean;
  /** Import workbook provenance (Feature 002); absent on bundled fixtures */
  provenance?: {
    workbookFilename: string;
    worksheet: string;
    row: number;
    column: string;
    mappingOutcome: 'mapped' | 'failed' | 'unsupported';
    scoringIncluded: boolean;
    exclusionReason: string | null;
  };
}

export interface MappingProvenance {
  representativeSourceLabel: string;
  originalSourceTerm: string;
  canonicalSignalType: string;
  mappingStatus: string;
}

export interface MappingResult {
  status: 'mapped' | 'failed' | 'unsupported';
  canonicalType: CanonicalSignalType | null;
  reason: string | null;
  provenance: MappingProvenance;
}

export interface WorkbookEvidenceProvenance {
  worksheet: string;
  row: number;
  column: string;
}

export interface EvidenceItem {
  id: string;
  canonicalSignalId: string | null;
  validity: 'valid' | 'invalid';
  exclusionReason: string | null;
  mapping: MappingResult;
  snapshot: SnapshotMetadata;
  /** Authoritative project snapshot — not replaced by signal-level dates */
  includedInScoring: boolean;
  /** Signal-resolved as-of date from validation (may differ from snapshot for trend) */
  resolvedAsOfDate: string;
  sourceTerm: string;
  sourceField?: string;
  /** Mapped 0–100 health when valid; used for HD-07 aggregation and finding rules */
  healthValue?: number | null;
  /** Original signal payload for finding derivation (FND-*) */
  sourcePayload?: Record<string, unknown>;
  /** Import workbook cell location (Feature 002); absent on bundled fixtures */
  workbookProvenance?: WorkbookEvidenceProvenance;
}

export interface TrendResult {
  direction: 'improving' | 'declining' | 'stable';
  label: string;
}

export interface Finding {
  id: string;
  dimensionId: DimensionId;
  summary: string;
  evidenceIds: string[];
  supportsRecommendation: boolean;
}

export interface Recommendation {
  id: string;
  priority: RecommendationPriority;
  action: string;
  reason: string;
  dimensionId: DimensionId;
  findingIds: string[];
  evidenceIds: string[];
  supportedDueDate: string | null;
  urgencyInferred: false;
}

export interface DimensionResult {
  dimensionId: DimensionId;
  measurementStatus: MeasurementStatus;
  rawScore: number | null;
  displayScore: number | null;
  /** HD-07: full precision, one value per present required canonical type */
  canonicalTypeHealth: Partial<Record<CanonicalSignalType, number>>;
  classification: HealthClassification | null;
  coveragePercent: number;
  missingRequiredCanonicalTypes: CanonicalSignalType[];
  missingSignalGroupIds: string[];
  trend: TrendResult | null;
  findings: Finding[];
  evidence: EvidenceItem[];
  explanation: string;
}

export interface InsufficientCoverageDetails {
  measuredCount: number;
  requiredMinimum: number;
  message: string;
}

export interface CompositeHealthResult {
  eligible: boolean;
  rawComposite: number | null;
  displayComposite: number | null;
  classification: HealthClassification | null;
  contributingDimensionIds: DimensionId[];
  coverageStatement: string;
  insufficientCoverage: InsufficientCoverageDetails | null;
}

export interface EvaluationResult {
  projectId: string;
  snapshot: SnapshotMetadata;
  evaluatedAtSnapshotDate: string;
  dimensions: DimensionResult[];
  composite: CompositeHealthResult;
  findings: Finding[];
  recommendations: Recommendation[];
  evidenceIndex: Map<string, EvidenceItem>;
}

export interface SignalGroupFixture {
  id: string;
  representativeSourceLabel: string;
  displayName: string;
  defaultEnabled: boolean;
  dimensionAffinity: DimensionId[];
  requiredForFullMeasurement: boolean;
}

export interface SampleProjectFixture {
  schemaVersion: '1.0';
  id: string;
  displayName: string;
  scenario: 'healthy' | 'at-risk' | 'incomplete' | 'invalid' | 'imported';
  origin?: 'imported';
  identity: {
    projectKey: string;
    projectName: string;
  };
  snapshot: {
    asOfDate: string;
    label?: string;
  };
  signalGroups: SignalGroupFixture[];
  sourceSignals: SourceSignal[];
  importMeta?: {
    filename: string;
    workbookAsOfDate: string;
    localLastModifiedMs: number;
    trustLabel: string;
  };
  expectations?: Record<string, unknown>;
}

export interface CoachSectionMeta {
  sectionId: string;
  collapsedByDefault: boolean;
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface DimensionPresentation {
  dimensionId: DimensionId;
  conditionDefinition: string;
  whyThisMatters: string;
  stepByStepGuidance: string | null;
  nextSteps: string | null;
  evidenceWalkthrough: string;
  evidenceSummary: string | null;
  evidenceReferences: string | null;
  glossary: GlossaryEntry[] | null;
  sections: {
    conditionDefinition: CoachSectionMeta;
    whyThisMatters: CoachSectionMeta;
    evidenceWalkthrough: CoachSectionMeta;
    glossary: CoachSectionMeta | null;
    stepByStepGuidance: CoachSectionMeta | null;
    nextSteps: CoachSectionMeta | null;
  };
}

export interface CompositePresentation {
  coverageStatement: string;
  coachingSummary: string;
  sections: {
    coachingSummary: CoachSectionMeta;
  };
}

export interface RecommendationPresentation {
  recommendationId: string;
  title: string;
  coachingRationale: string | null;
  whyThisMatters: string | null;
  stepByStepActions: string | null;
  nextSteps: string | null;
  evidenceSummary: string | null;
  evidenceReferences: string;
  findingsBullets: string[] | null;
  glossary: GlossaryEntry[] | null;
  sections: {
    whyThisMatters: CoachSectionMeta | null;
    coachingRationale: CoachSectionMeta | null;
    evidenceWalkthrough: CoachSectionMeta | null;
    stepByStepActions: CoachSectionMeta | null;
    nextSteps: CoachSectionMeta | null;
    glossary: CoachSectionMeta | null;
    findingsBullets: CoachSectionMeta | null;
  };
}

export interface PersonaPresentation {
  persona: Persona;
  dimensions: DimensionPresentation[];
  composite: CompositePresentation;
  recommendations: RecommendationPresentation[];
}

export type ValidatedProject = SampleProjectFixture;

export interface InvalidProjectResult {
  category: string;
  message: string;
}

export type ProjectLoadResult =
  | { ok: true; project: ValidatedProject }
  | { ok: false; invalid: InvalidProjectResult };

export interface ValidationContext {
  enabledSignalGroupIds: ReadonlySet<string>;
  snapshot: SampleProjectFixture['snapshot'];
  mappingRegistry: MappingRegistry;
}

export interface SignalValidationResult {
  valid: boolean;
  includedInScoring: boolean;
  exclusionReason: string | null;
  resolvedAsOfDate: string;
}

export interface CanonicalSignal {
  id: string;
  canonicalType: CanonicalSignalType;
  dimensionId: DimensionId;
  healthValue: number | null;
  sourcePayload: Record<string, unknown>;
}

export interface DimensionDefinition {
  dimensionId: DimensionId;
  requiredTypes: CanonicalSignalType[];
}

export interface DimensionRuleCatalog {
  dimensions: Record<DimensionId, DimensionDefinition>;
}

export interface RecommendationRuleCatalog {
  readonly version: '1.0';
}

export interface EvaluationInput {
  project: SampleProjectFixture;
  enabledSignalGroupIds: ReadonlySet<string>;
  mappingRegistry: MappingRegistry;
  ruleCatalogs: {
    dimension: DimensionRuleCatalog;
    recommendation: RecommendationRuleCatalog;
  };
  projectValidator?: ProjectValidator;
}

export interface EvaluationError {
  message: string;
}

export type EvaluationOutput =
  | { ok: true; result: EvaluationResult }
  | { ok: false; error: EvaluationError };
