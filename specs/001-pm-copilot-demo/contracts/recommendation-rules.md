# Recommendation Rules — Demonstration Rule Catalog v1.0

**Status**: **APPROVED**  
**Module**: `src/domain/recommendations/`  
**Feature**: `001-pm-copilot-demo`

**Demonstration-only. Not a universal DXC standard.**

Ordering follows **Demonstration Policy v1.0** via `orderRecommendations` (priority → due date → stable id).

Persona projection (`projectForPersona`) may change **explanation depth only** — not priority, timing, or rule matching.

**No matching rule → no recommendation.**

---

## Rule execution model

1. `deriveFindings` emits findings with stable IDs when conditions are met.
2. `generateRecommendations` maps findings → recommendations per table below.
3. `orderRecommendations` sorts output deterministically.

Dates and urgency MUST originate from valid evidence fields referenced by the finding.

---

## Finding catalog

| Finding ID | Condition | Evidence required |
|------------|-----------|-------------------|
| **FND-001** | Active **Urgent** `delivery.blocker-open` | Valid signal with `blockerState === 'urgent'` |
| **FND-002** | `schedule.milestone-slip` with `slipDays ≥ 8` AND milestone due within 14 snapshot-relative days | Valid slip signal with `slipDays` + valid `milestoneDueDate` on same signal payload |
| **FND-003-{dimensionId}** | Dimension `{dimensionId}` has `measurementStatus === 'partial'` | Dimension result + list of missing required canonical types |
| **FND-004-{dimensionId}** | Dimension `{dimensionId}` has `measurementStatus === 'unmeasured'` | Dimension result + required canonical type list |
| **FND-005** | `risk.governance-gap` with `gapPriority` in `important`, `urgent` | Valid governance-gap signal |
| **FND-006** | `delivery.scope-stability` with `changeRatePercent > 20` | Valid scope-stability signal |
| **FND-007** | `team.communication-cadence` with `completionPercent < 80` | Valid communication-cadence signal |

`{dimensionId}` ∈ `schedule` | `delivery` | `team` | `risk`.

---

## Recommendation catalog

| Rule ID | Finding | Condition summary | Priority | Recommendation text | Timing source |
|---------|---------|-------------------|----------|---------------------|---------------|
| **REC-001** | FND-001 | Active Urgent delivery blocker | **Urgent** | Resolve and escalate the delivery blocker | Blocker evidence `asOfDate` if present; else undated |
| **REC-002** | FND-002 | Slip ≥8 days, due within 14 days of snapshot | **Urgent** | Establish and escalate a milestone recovery plan | `milestoneDueDate` from evidence |
| **REC-003-{dimensionId}** | FND-003-{dimensionId} | Any Partial dimension | **Important** | Provide the specifically identified missing evidence for {dimension display name} | Undated |
| **REC-004-{dimensionId}** | FND-004-{dimensionId} | Any Unmeasured dimension | **Important** | Enable or provide the required evidence for {dimension display name} | Undated |
| **REC-005** | FND-005 | Important or Urgent governance gap | **Important** | Close or formally accept the governance gap | Gap evidence `asOfDate` if present |
| **REC-006** | FND-006 | Scope-change rate above 20% | **Important** | Review scope baseline and change controls | Scope signal `asOfDate` if present |
| **REC-007** | FND-007 | Communication-cadence completion below 80% | **Advisory** | Restore the agreed communication cadence | Cadence signal `asOfDate` if present |

### REC-002 temporal detail

```text
daysUntilDue = milestoneDueDate − snapshot.asOfDate (calendar days)
FND-002 fires when: slipDays ≥ 8 AND 0 ≤ daysUntilDue ≤ 14
```

Missing or invalid `milestoneDueDate` → FND-002 does not fire (no inferred urgency).

### Dimension-specific ID examples

| Scenario | IDs |
|----------|-----|
| Sample B (HD-08) | FND-001, FND-002 → REC-001, REC-002 (ordered: REC-002 then REC-001) |
| Team Unmeasured (Sample C) | FND-004-team, REC-004-team |
| Schedule Partial | FND-003-schedule, REC-003-schedule |

---

## Golden scenario requirements

| Scenario | Required recommendations |
|----------|-------------------------|
| Sample A | None (no rule matches) |
| Sample B | **REC-001** and **REC-002** (mandatory, HD-08); ordered REC-002 → REC-001 |
| Sample C | **REC-004-team** (mandatory) |
| Invalid fixture | None — evaluation blocked |

See [golden-scenarios.md](./golden-scenarios.md).

---

## Tests

| Layer | File |
|-------|------|
| Unit | `tests/domain/recommendation-rules.test.ts` |
| Unit | `tests/domain/findings.test.ts` |
| Golden | `tests/golden/sample-a.test.ts`, `sample-b.test.ts`, `sample-c.test.ts` |
| Spec | AS-001, AS-004, AS-021–AS-023, AS-040–AS-041, FR-021–FR-024, BR-005, BR-012 |
