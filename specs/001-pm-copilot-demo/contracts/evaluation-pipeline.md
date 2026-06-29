# Evaluation Pipeline Contract

**Feature**: `001-pm-copilot-demo`  
**Orchestrator**: `src/domain/evaluation/runEvaluation.ts`

## Deterministic pipeline

```text
Bundled SampleProjectFixture
  │
  ▼
validateProject ──────────────────────────► InvalidProjectResult (stop)
  │ ok
  ▼
Filter sourceSignals by enabledSignalGroupIds
  │
  ▼
For each sourceSignal:
  normalizeSignal(mappingRegistry)
  validateSignal(context)
  mapHealthValue(signal-health-mapping) when valid
  assembleEvidence → EvidenceItem (valid | invalid, mapping provenance)
  │
  ▼
Group evidence by DimensionId
  │
  ▼
For each dimension in DIMENSION_CATALOG:
  aggregateCanonicalTypeHealth(evidence)   // HD-07: mean within type, full precision
  calculateDimension(evidence, ruleCatalog)
  │
  ▼
calculateComposite(dimensions)
  │
  ▼
deriveFindings(dimensions, evidenceIndex)   // evidence assembly co-located in src/domain/findings/
  │
  ▼
generateRecommendations(findings, ruleCatalog, snapshotDate)
  │
  ▼
orderRecommendations(recommendations)
  │
  ▼
EvaluationResult (immutable)
  │
  ▼
projectForPersona(evaluation, session.persona) ──► PersonaPresentation
  │
  ▼
React UI (read-only render)
```

## Input

```typescript
interface EvaluationInput {
  project: ValidatedProject;
  enabledSignalGroupIds: ReadonlySet<string>;
  mappingRegistry: MappingRegistry;
  ruleCatalogs: {
    dimension: DimensionRuleCatalog;      // scoring-rules.md + signal-health-mapping.md
    recommendation: RecommendationRuleCatalog;  // recommendation-rules.md
  };
}
```

## Output

```typescript
type EvaluationOutput =
  | { ok: true; result: EvaluationResult }
  | { ok: false; error: EvaluationError };
```

`EvaluationError` is for unexpected internal failures only (AS-029). Invalid fixtures are handled at `validateProject`, not here.

## Invariants

1. Pipeline is **synchronous** — target <200 ms on bundled fixtures.
2. No `Date.now()` for business rules — use `snapshot.asOfDate`.
3. Persona is **not** an input to `runEvaluation`.
4. Equivalent normalized signals with equal attributes produce identical per-signal health values; duplicate sources aggregate per HD-07 before dimension mean (AS-061).
5. Failed mappings appear in `evidenceIndex` with `includedInScoring: false`.

## UI trigger

React dispatches `EVALUATE` action → calls `runEvaluation` → stores result in session → calls `projectForPersona`.

Persona change dispatches `SET_PERSONA` → calls `projectForPersona` only.
