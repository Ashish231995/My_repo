# Domain Function Contracts

**Feature**: `001-pm-copilot-demo`  
**Module root**: `src/domain/`

All functions are **pure** (no React, no DOM, no storage, no network). Side-effect-free except explicit `resetSession` factory returning new state.

---

## validateProject

```typescript
function validateProject(project: SampleProjectFixture): ProjectLoadResult;
```

**Input**: Bundled project fixture after parse.

**Output**:

```typescript
type ProjectLoadResult =
  | { ok: true; project: ValidatedProject }
  | { ok: false; invalid: InvalidProjectResult };
```

**Rules** (UD-009):

- Run immediately on project selection.
- Fail categories: empty file, malformed structure, missing required identity, invalid snapshot metadata, unrecognizable signal structure.
- Valid project with missing dimension evidence is **ok: true** (Partial/Unmeasured handled later).

**Tests**: AS-050, AS-051, AS-052, FR-038, BR-016

---

## validateSignal

```typescript
function validateSignal(
  source: SourceSignal,
  context: ValidationContext
): SignalValidationResult;
```

**Context**: enabled groups, project snapshot, mapping registry.

**Output**: field-level validity, resolved as-of date, exclusion reason if invalid.

**Rules** (Signal Validity policy): enabled, present, required fields, successful mapping, identifiable source, valid as-of.

**Tests**: AS-042, AS-043, FR-035, BR-013

---

## normalizeSignal

```typescript
function normalizeSignal(
  source: SourceSignal,
  mappingRegistry: MappingRegistry
): MappingResult & { canonical: CanonicalSignal | null };
```

**Rules** (UD-011):

- Deterministic lookup in documented mapping registry.
- Equivalent business terms from different representative sources map to same `CanonicalSignalType`.
- Failed/unsupported mappings return `canonical: null` with visible reason.

**Tests**: AS-059, AS-060, AS-062, FR-040, BR-002, BR-018

---

## calculateDimension

```typescript
function calculateDimension(
  dimensionId: DimensionId,
  evidence: EvidenceItem[],
  dimensionDef: DimensionDefinition,
  ruleCatalog: DimensionRuleCatalog
): DimensionResult;
```

**Rules**:

- Uses only **valid**, **mapped**, **included** evidence.
- Computes `measurementStatus`: measured | partial | unmeasured per coverage thresholds in rule catalog (HD-02).
- **HD-07**: Group valid evidence by `canonicalType`; mean health values within each type (full precision); dimension `rawScore` = mean of canonical-type health values (one per present required type).
- Apply half-up rounding for `displayScore` before classification labels.
- Partial: provisional score + labels; Unmeasured: no numeric score.
- Trend only when ≥2 valid dated evidence points support direction.

**Tests**: AS-009–AS-011, AS-032–AS-036, AS-061, FR-014–FR-020, BR-003, BR-004, BR-010

---

## calculateComposite

```typescript
function calculateComposite(
  dimensions: DimensionResult[]
): CompositeHealthResult;
```

**Rules** (Demonstration Policy v1.0):

- Include only **measured** dimensions.
- Equal 25% nominal weights re-normalized across eligible.
- Composite from **raw** eligible scores; single half-up round at end.
- <2 Measured → insufficient coverage state, no numeric composite.
- 2–3 Measured → "Based on X of 4 Measured dimensions".
- 4 Measured → complete coverage.

**Tests**: AS-005, AS-012, AS-033–AS-039, FR-020, FR-031, FR-033, BR-009, BR-011

---

## deriveFindings

```typescript
function deriveFindings(
  dimensions: DimensionResult[],
  evidenceIndex: Map<string, EvidenceItem>
): Finding[];
```

**Rules**: Deterministic finding IDs per [recommendation-rules.md](./recommendation-rules.md) (FND-*). Findings reference evidence IDs only — no new facts beyond evidence. Evidence assembly co-located under `src/domain/findings/`.

**Tests**: AS-016, AS-001, BR-001

---

## generateRecommendations

```typescript
function generateRecommendations(
  evaluation: Pick<EvaluationResult, 'dimensions' | 'findings' | 'evidenceIndex'>,
  ruleCatalog: RecommendationRuleCatalog,
  snapshotDate: string
): Recommendation[];
```

**Rules** (see [recommendation-rules.md](./recommendation-rules.md)):

- Emit only when a documented REC-* rule matches a finding; no match → no recommendation.
- Priority: urgent | important | advisory per approved rule catalog.
- Dates from valid evidence only; evaluated relative to snapshot date.
- Stable `id` assignment (deterministic hash of finding + action key).

**Tests**: AS-001, AS-004, AS-021–AS-023, AS-040–AS-041, FR-021–FR-024, BR-005, BR-012

---

## orderRecommendations

```typescript
function orderRecommendations(recommendations: Recommendation[]): Recommendation[];
```

**Ordering**:

1. Priority rank: urgent → important → advisory
2. Supported due date ascending (snapshot-relative)
3. Undated after dated within same priority
4. Stable id ascending

**Tests**: AS-040, AS-041, FR-034, BR-012

---

## projectForPersona

```typescript
function projectForPersona(
  evaluation: EvaluationResult,
  persona: Persona
): PersonaPresentation;
```

**Rules** (Persona Coaching Contract):

- Copy all analytical fields unchanged.
- Apply presentation templates per persona tier (required elements in `ui-states.md`).
- Expert: collapsed sections by default; full evidence reachable via expansion metadata.
- Novice: glossary and expanded walkthrough — no new findings or urgency.

**Invariant**: `projectForPersona(eval, p1)` and `projectForPersona(eval, p2)` differ only in presentation subtrees.

**Tests**: AS-055–AS-058, FR-009, FR-010, FR-039, SC-003, BR-006, BR-017

---

## resetSession

```typescript
function createInitialSession(): SessionState;
function applyReset(state: SessionState): SessionState;
```

**Rules**:

- `createInitialSession`: Intermediate persona, no project, no evaluation.
- `applyReset`: clear all session fields; return `createInitialSession()` shape.
- Not persisted; reload uses `createInitialSession()` via page init.

**Tests**: AS-026, AS-027, AS-048, AS-049, FR-007, FR-036, BR-007

---

## runEvaluation (orchestrator)

```typescript
function runEvaluation(input: EvaluationInput): EvaluationResult | EvaluationError;
```

**Pipeline** (see `evaluation-pipeline.md`): validate → normalize → evidence validity → dimensions → composite → findings → recommendations → order.

**Determinism**: Same input → deep-equal output.

**Tests**: SC-002, AS-021, golden fixtures A–C

---

## Shared utilities

```typescript
function aggregateCanonicalTypeHealth(
  evidence: EvidenceItem[],
  requiredTypes: CanonicalSignalType[]
): Map<CanonicalSignalType, number>;
function roundHalfUp(value: number): number;
function classifyHealth(score: number): HealthClassification;
function compareSnapshotDates(a: string, b: string): number;
```

**aggregateCanonicalTypeHealth** (HD-07): Groups valid included evidence by canonical type; returns mean health per type at full precision. Used by `calculateDimension`.

**classifyHealth**: Healthy 80–100, At Risk 50–79, Critical 0–49 inclusive after half-up round.
