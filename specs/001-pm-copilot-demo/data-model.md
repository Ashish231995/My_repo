# Data Model: PM Copilot Local Demonstration

**Feature**: `001-pm-copilot-demo`  
**Date**: 2026-06-29  
**Source**: `spec.md`, Demonstration Policy v1.0

## Overview

The domain model separates **bundled source data**, **canonical normalized signals**, **evaluation results**, and **persona presentation projections**. All evaluation outputs are immutable value objects produced by the deterministic pipeline.

---

## Entity Definitions

### Session

In-memory application context for one user demonstration.

| Field | Type | Notes |
|-------|------|-------|
| `sessionId` | `string` | Ephemeral UUID generated on init; not persisted |
| `persona` | `Persona` | Default `Intermediate` on init, reset, reload |
| `selectedProjectId` | `string \| null` | Active bundled project |
| `enabledSignalGroupIds` | `Set<string>` | Session-scoped checklist |
| `projectLoadResult` | `ProjectLoadResult \| null` | Validation outcome after selection |
| `evaluation` | `EvaluationResult \| null` | Null until successful evaluate |
| `presentation` | `PersonaPresentation \| null` | Derived from evaluation + persona; no recompute on persona change |
| `ui` | `SessionUiState` | Modals, focus, errors |

**Lifecycle**: `INITIAL` → `PROJECT_SELECTED` → `EVALUATED` | `INVALID_PROJECT` | `ERROR`

---

### SampleProject

Bundled fictional scenario definition (fixture).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | e.g. `sample-a`, `sample-b`, `sample-c`, `sample-invalid` |
| `displayName` | `string` | Leadership-friendly label |
| `scenario` | `healthy \| at-risk \| incomplete \| invalid` | |
| `snapshot` | `SnapshotMetadata` | Authoritative as-of |
| `identity` | `ProjectIdentity` | Required for structural validity |
| `signalGroups` | `SignalGroupDefinition[]` | Available groups for project |
| `sourceSignals` | `SourceSignal[]` | Raw bundled signals |

---

### SnapshotMetadata

| Field | Type | Notes |
|-------|------|-------|
| `asOfDate` | `string` (ISO date) | Authoritative snapshot date |
| `label` | `string` | Display: "Snapshot as of …" |

All temporal rules evaluate relative to this date, not system clock.

---

### SignalGroup

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable identifier |
| `representativeSourceLabel` | `string` | Must NOT imply live connectivity |
| `displayName` | `string` | Checklist label |
| `dimensionAffinity` | `DimensionId[]` | Expected dimensions served |
| `requiredForFullMeasurement` | `boolean` | UX hint; coverage measured by required **canonical types** per dimension |

---

### SourceSignal

Methodology-flavoured bundled input before normalization. Aligns with `contracts/fixture-schema.md` (`SourceSignalFixture`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable within project |
| `signalGroupId` | `string` | Parent group |
| `sourceTerm` | `string` | Original field/term |
| `sourceField` | `string` | Optional field path label |
| `mappingKey` | `string` | Key into `MappingRegistry` |
| `payload` | `Record<string, unknown>` | Type-specific raw values |
| `asOfDate` | `string \| null` | Optional signal-level snapshot override |
| `forceMappingFailure` | `boolean` | Optional; adverse testing only |

---

### CanonicalSignal

Methodology-neutral normalized signal used in scoring.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Derived from source + mapping |
| `canonicalType` | `CanonicalSignalType` | Finite enum — see `contracts/fixture-schema.md` |
| `dimensionId` | `DimensionId` | Primary dimension |
| `healthValue` | `number` | 0–100 after mapping per `signal-health-mapping.md` |
| `asOfDate` | `string` | Resolved from signal/group/project |
| `sourceProvenance` | `MappingProvenance` | For drilldown |

---

### MappingResult

| Field | Type | Notes |
|-------|------|-------|
| `status` | `mapped \| failed \| unsupported` | |
| `canonicalType` | `CanonicalSignalType \| null` | Set when mapped |
| `reason` | `string \| null` | User-understandable exclusion reason |
| `provenance` | `MappingProvenance` | Always populated for drilldown |

### MappingProvenance

| Field | Type |
|-------|------|
| `representativeSourceLabel` | `string` |
| `originalSourceTerm` | `string` |
| `canonicalSignalType` | `string` |
| `mappingStatus` | `string` |

---

### EvidenceItem

Traceable unit for findings, scores, recommendations.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `canonicalSignalId` | `string \| null` | Null if mapping failed |
| `validity` | `valid \| invalid` | Per Signal Validity policy |
| `exclusionReason` | `string \| null` | Required when invalid or mapping failed |
| `mapping` | `MappingResult` | |
| `snapshot` | `SnapshotMetadata` | |
| `includedInScoring` | `boolean` | |

---

### DimensionDefinition

Static catalog of four dimensions.

| `DimensionId` | Display name |
|---------------|--------------|
| `schedule` | Schedule Health |
| `delivery` | Delivery and Scope |
| `team` | Team and Communications |
| `risk` | Risk and Governance |

---

### DimensionResult

| Field | Type | Notes |
|-------|------|-------|
| `dimensionId` | `DimensionId` | |
| `measurementStatus` | `measured \| partial \| unmeasured` | |
| `rawScore` | `number \| null` | Pre-display rounding |
| `displayScore` | `number \| null` | Half-up rounded when Measured/Partial |
| `canonicalTypeHealth` | `Record<CanonicalSignalType, number>` | HD-07 intermediate values (full precision, one per present type) |
| `classification` | `HealthClassification \| null` | Healthy / At Risk / Critical band on display score; Partial uses same bands — "Provisional" is a presentation qualifier only |
| `coveragePercent` | `number` | Valid required canonical types present ÷ total required × 100 (HD-02) |
| `missingRequiredCanonicalTypes` | `CanonicalSignalType[]` | Partial/Unmeasured disclosure |
| `missingSignalGroupIds` | `string[]` | Optional UX cross-reference to checklist |
| `trend` | `TrendResult \| null` | Only when evidence supports |
| `findings` | `Finding[]` | |
| `evidence` | `EvidenceItem[]` | Includes excluded visible items |
| `explanation` | `string` | Deterministic template from rules |

---

### Finding

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable finding ID per `recommendation-rules.md` (e.g. FND-001, FND-004-team) |
| `dimensionId` | `DimensionId` | |
| `summary` | `string` | Neutral factual statement |
| `evidenceIds` | `string[]` | |
| `supportsRecommendation` | `boolean` | |

---

### CompositeHealthResult

| Field | Type | Notes |
|-------|------|-------|
| `eligible` | `boolean` | ≥2 Measured dimensions |
| `rawComposite` | `number \| null` | From raw dimension scores |
| `displayComposite` | `number \| null` | Single half-up round |
| `classification` | `HealthClassification \| null` | Only when eligible |
| `contributingDimensionIds` | `DimensionId[]` | Measured only |
| `coverageStatement` | `string` | e.g. "Based on 3 of 4 Measured dimensions" |
| `insufficientCoverage` | `InsufficientCoverageDetails \| null` | When <2 Measured |

---

### Recommendation

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Stable for ordering tie-break |
| `priority` | `urgent \| important \| advisory` | |
| `action` | `string` | |
| `reason` | `string` | |
| `dimensionId` | `DimensionId` | |
| `findingIds` | `string[]` | |
| `evidenceIds` | `string[]` | |
| `supportedDueDate` | `string \| null` | From valid evidence only |
| `urgencyInferred` | `false` | Always false per policy |

---

### Persona

```typescript
type Persona = 'novice' | 'intermediate' | 'expert';
```

Default: `intermediate`.

---

### PersonaPresentation

Presentation-only projection; analytical fields copied verbatim from `EvaluationResult`.

| Field | Type |
|-------|------|
| `persona` | `Persona` |
| `dimensions` | `DimensionPresentation[]` |
| `composite` | `CompositePresentation` |
| `recommendations` | `RecommendationPresentation[]` |

---

### InvalidProjectResult

| Field | Type | Notes |
|-------|------|-------|
| `projectId` | `string` | Retained for context |
| `category` | `InvalidProjectCategory` | User-facing validation category |
| `message` | `string` | No stack traces or paths |
| `recoveryActions` | `('select-other' \| 'reset')[]` | |

### InvalidProjectCategory

`empty-file` | `malformed-structure` | `missing-identity` | `invalid-snapshot` | `unrecognizable-signals`

---

### EvaluationResult (aggregate)

Immutable output of `runEvaluation` pipeline.

| Field | Type |
|-------|------|
| `projectId` | `string` |
| `snapshot` | `SnapshotMetadata` |
| `evaluatedAtSnapshotDate` | `string` |
| `dimensions` | `DimensionResult[]` |
| `composite` | `CompositeHealthResult` |
| `findings` | `Finding[]` |
| `recommendations` | `Recommendation[]` |
| `evidenceIndex` | `Map<string, EvidenceItem>` |

---

## Relationships

```text
SampleProject 1──* SourceSignal
SourceSignal 1──1 MappingResult ──0..1 CanonicalSignal
CanonicalSignal *──* EvidenceItem
DimensionDefinition 1──* DimensionResult
DimensionResult *──* Finding
Finding *──* Recommendation
EvaluationResult 1──1 CompositeHealthResult
Session 0..1── EvaluationResult
Session 1──1 PersonaPresentation (projection of EvaluationResult)
```

---

## State Transitions (Session)

| Event | Preconditions | Effects |
|-------|---------------|---------|
| `INIT` | Page load | Intermediate persona, no project |
| `SELECT_PROJECT` | Valid fixture id | Load + structural validate |
| `TOGGLE_SIGNAL_GROUP` | Project loaded, not invalid | Update enabled set; clear evaluation |
| `SET_PERSONA` | Any | Update persona; re-project only if evaluation exists |
| `EVALUATE` | Valid project, not invalid | Run pipeline → store EvaluationResult |
| `REQUEST_RESET` | Always | Open confirm if evaluation exists; else reset |
| `CONFIRM_RESET` | Confirm open | Clear to INITIAL + Intermediate |
| `CANCEL_RESET` | Confirm open | Restore focus, no state change |

Persona change never dispatches `EVALUATE`.

---

## Validation Rules Summary

| Layer | Invalid when |
|-------|--------------|
| Project | Empty, malformed, missing identity, invalid snapshot metadata, unrecognizable signal structure |
| Signal | Required fields missing, mapping failed, invalid as-of |
| Evidence | Signal group disabled, not present, invalid, unmapped |
| Missing evidence (valid project) | Partial or Unmeasured — **not** InvalidProjectResult |

---

## Enumerations

### HealthClassification

`healthy` | `at-risk` | `critical`

### MeasurementStatus

`measured` | `partial` | `unmeasured`

### RecommendationPriority

`urgent` | `important` | `advisory`

See `contracts/fixture-schema.md` for `CanonicalSignalType` and fixture field schemas.
