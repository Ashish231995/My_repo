# Scoring Rules — Demonstration Rule Catalog v1.0

**Status**: **APPROVED**  
**Module**: `src/domain/scoring/`  
**Feature**: `001-pm-copilot-demo`

**Demonstration-only. Not a universal DXC standard.**

Companion documents: [signal-health-mapping.md](./signal-health-mapping.md), [demonstration-rule-catalog.md](./demonstration-rule-catalog.md)

---

## Global rules

| Rule | Implementation |
|------|----------------|
| Score range | All signal and dimension values clamped to 0–100 |
| Rounding | `roundHalfUp` **once** per displayed dimension score and composite |
| Classification | Healthy ≥80, At Risk 50–79, Critical 0–49 (inclusive, after half-up) |
| Invalid evidence | Excluded from means; visible with reason |
| No hidden weights | No baseline, bonus, or penalty weights permitted |
| Equal influence | Each required canonical signal type has equal weight within its dimension |

---

## Dimension score model (HD-01)

For each dimension:

1. Identify **required canonical signal types** for the dimension (see per-dimension tables below).
2. For each required type, apply **canonical type aggregation (HD-07)** when ≥1 valid mapped signal exists.
3. **Dimension raw score** = arithmetic mean of **canonical-type health values** (one value per present required type).
4. **Dimension display score** = `roundHalfUp(rawScore)` once.
5. Classify display score per global bands.

```text
canonicalTypeHealth[type] = mean(healthValues of all valid signals mapped to type)  // full precision
rawScore = mean(canonicalTypeHealth for each present required type)
displayScore = roundHalfUp(rawScore)
```

Only evidence where `includedInScoring === true` participates.

**Partial measurement**: Some but not all required types present with valid signals:

- Compute dimension mean over **available** canonical-type health values only (provisional).
- Status `partial`; label "Provisional score — Partial evidence".
- Classification prefixed "Provisional —".
- **Excluded from composite.**

**Unmeasured**: 0% required canonical signal type coverage → no numeric score.

---

## Canonical type aggregation (HD-07)

When multiple valid source signals map to the same required canonical type:

1. **Group** valid mapped signals by `canonicalType`.
2. **Convert** every valid signal to its approved 0–100 health value per [signal-health-mapping.md](./signal-health-mapping.md).
3. **Aggregate** `canonicalTypeHealth = arithmetic mean` of all valid health values within that type. Retain **full precision** for this intermediate value.
4. Each canonical type contributes **exactly once** to the dimension mean, regardless of how many source signals mapped to it.
5. **Round** only the final displayed dimension score (and composite) using half-up — not intermediate canonical-type values.
6. Invalid, disabled, or failed mappings do **not** participate; all included and excluded evidence remains **visible with provenance**.
7. If no valid signals exist for a required canonical type, that type is **missing** for coverage calculation.
8. No methodology or representative source receives preferred weighting.

---

## Coverage and measurement status (HD-02)

```text
coveragePercent = (valid required canonical signal types present ÷ total required canonical signal types) × 100
```

A required type is **present** when ≥1 valid mapped signal of that type exists in enabled evidence.

| Status | Coverage | Numeric score | Composite |
|--------|----------|---------------|-----------|
| **Measured** | 100% | Yes (mean of all required) | Eligible |
| **Partial** | >0% and <100% | Yes (provisional mean) | **Excluded** |
| **Unmeasured** | 0% | No | **Excluded** |

---

## Per-dimension required canonical types

### Schedule Health (`schedule`)

| Required type | Health mapping |
|---------------|----------------|
| `schedule.milestone-slip` | [signal-health-mapping.md](./signal-health-mapping.md#schedulemilestone-slip) |
| `schedule.baseline-health` | [signal-health-mapping.md](./signal-health-mapping.md#schedulebaseline-health) |

### Delivery and Scope (`delivery`)

| Required type | Health mapping |
|---------------|----------------|
| `delivery.blocker-open` | [signal-health-mapping.md](./signal-health-mapping.md#deliveryblocker-open) |
| `delivery.scope-stability` | [signal-health-mapping.md](./signal-health-mapping.md#deliveryscope-stability) |
| `delivery.velocity-trend` | [signal-health-mapping.md](./signal-health-mapping.md#deliveryvelocity-trend) |

### Team and Communications (`team`)

| Required type | Health mapping |
|---------------|----------------|
| `team.engagement-score` | [signal-health-mapping.md](./signal-health-mapping.md#teamengagement-score) |
| `team.communication-cadence` | [signal-health-mapping.md](./signal-health-mapping.md#teamcommunication-cadence) |

### Risk and Governance (`risk`)

| Required type | Health mapping |
|---------------|----------------|
| `risk.issue-escalation` | [signal-health-mapping.md](./signal-health-mapping.md#riskissue-escalation) |
| `risk.governance-gap` | [signal-health-mapping.md](./signal-health-mapping.md#riskgovernance-gap) |

---

## Composite calculation

Composite uses **raw** dimension scores (before display rounding) from **Measured** dimensions only.

```text
measured = dimensions where measurementStatus === 'measured'
if measured.length < 2 → insufficientCoverage (no numeric composite)

weight = 1 / measured.length
rawComposite = Σ(dimension.rawScore × weight) for d in measured
displayComposite = roundHalfUp(rawComposite)
```

| Measured count | Coverage label |
|----------------|----------------|
| 4 | Complete (no "Based on X of 4" prefix required) |
| 2–3 | "Based on X of 4 Measured dimensions" |
| 0–1 | Insufficient — no numeric composite |

Equal nominal 25% weights re-normalize across eligible Measured dimensions only (Demonstration Policy v1.0).

---

## Recommendations

See [recommendation-rules.md](./recommendation-rules.md). No rule match → no recommendation.

---

## Temporal evaluation

All date comparisons use `snapshot.asOfDate` as reference "today". Dates and urgency in recommendations may only come from valid evidence fields.

---

## Golden validation

Deterministic expected calculations: [golden-scenarios.md](./golden-scenarios.md).

Runtime fixture files (`src/data/fixtures/*.json`) are **implementation work**. Golden **tests** consume fixtures once created.

Any rule catalog change MUST update golden expected results in the same change set.
