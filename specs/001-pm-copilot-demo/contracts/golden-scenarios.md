# Golden Scenarios — Planning Contract

**Status**: **APPROVED**  
**Feature**: `001-pm-copilot-demo`  
**Type**: Planning contract — **not** runtime fixture source code

This document records **deterministic expected calculations** for bundled sample projects. Actual JSON/TypeScript fixture files remain an **implementation task** (`src/data/fixtures/`).

Validation references: [scoring-rules.md](./scoring-rules.md), [signal-health-mapping.md](./signal-health-mapping.md), [recommendation-rules.md](./recommendation-rules.md)

---

## Calculation conventions

- **HD-07**: For each required canonical type, `canonicalTypeHealth = mean(all valid per-signal health values for that type)` (full precision). Dimension **raw** score = mean of canonical-type health values (one per present required type).
- Dimension **display** score = `roundHalfUp(raw)` once.
- Composite **raw** = mean of dimension **raw** scores for Measured dimensions only.
- Composite **display** = `roundHalfUp(composite raw)` once.
- Classification applied to **display** scores.
- All temporal rules use bundled `snapshot.asOfDate` — never the computer's current date.

---

## Sample Project A — Healthy

**Scenario**: `healthy` | **Fixture id** (implementation): `sample-project-a`

### Input canonical-type health values (after HD-07 aggregation)

| Dimension | Canonical types (health values) |
|-----------|--------------------------------|
| Schedule | `milestone-slip` 100, `baseline-health` 90 |
| Delivery | `blocker-open` 100, `scope-stability` 95, `velocity-trend` 85 |
| Team | `engagement-score` 88, `communication-cadence` 90 |
| Risk | `issue-escalation` 100, `governance-gap` 100 |

### Expected dimension results

| Dimension | Raw | Display | Classification | Status |
|-----------|-----|---------|----------------|--------|
| Schedule | 95.00 | 95 | Healthy | Measured |
| Delivery | 93.33… | 93 | Healthy | Measured |
| Team | 89.00 | 89 | Healthy | Measured |
| Risk | 100.00 | 100 | Healthy | Measured |

### Expected composite

| Field | Value |
|-------|-------|
| Measured dimensions | 4 of 4 |
| Composite raw | (95 + 93.33… + 89 + 100) ÷ 4 = **94.33…** |
| Composite display | **94** |
| Classification | **Healthy** |
| Coverage label | Complete (4 Measured) |

### Expected recommendations

**None** — no rule in [recommendation-rules.md](./recommendation-rules.md) matches.

---

## Sample Project B — At Risk / Critical

**Scenario**: `at-risk` | **Fixture id** (implementation): `sample-project-b`

### Bundled snapshot (HD-08)

| Field | Value |
|-------|-------|
| `snapshot.asOfDate` | **2026-06-01** (fixed bundled date) |
| `milestoneDueDate` (on `schedule.milestone-slip`) | **2026-06-11** (exactly 10 calendar days after snapshot) |
| `slipDays` (on `schedule.milestone-slip`) | **8** |

`daysUntilDue = 10` → satisfies FND-002 (`slipDays ≥ 8` AND `0 ≤ daysUntilDue ≤ 14`).

### Input canonical-type health values (after HD-07 aggregation)

| Dimension | Canonical types (health values) | Notes |
|-----------|--------------------------------|-------|
| Schedule | `milestone-slip` **40** (`slipDays` 8), `baseline-health` 70 | Slip maps to 40 per health bands |
| Delivery | `blocker-open` 20 (`urgent`), `scope-stability` 35, `velocity-trend` 40 | Blocker triggers FND-001 |
| Team | `engagement-score` 65, `communication-cadence` 70 | |
| Risk | `issue-escalation` 50, `governance-gap` 50 | |

### Expected dimension results

| Dimension | Raw | Display | Classification | Status |
|-----------|-----|---------|----------------|--------|
| Schedule | 55.00 | 55 | At Risk | Measured |
| Delivery | 31.67… | 32 | Critical | Measured |
| Team | 67.50 | 68 | At Risk | Measured |
| Risk | 50.00 | 50 | At Risk | Measured |

### Expected composite

| Field | Value |
|-------|-------|
| Measured dimensions | 4 of 4 |
| Composite raw | (55 + 31.67… + 67.5 + 50) ÷ 4 = **51.04…** |
| Composite display | **51** |
| Classification | **At Risk** |

### Expected recommendations (HD-08)

| Order | Rule | Priority | Finding | Timing |
|-------|------|----------|---------|--------|
| **1** | **REC-002** | Urgent | FND-002 | `milestoneDueDate` **2026-06-11** (dated) |
| **2** | **REC-001** | Urgent | FND-001 | Undated (no blocker `asOfDate` in contract) |

Both **REC-001** and **REC-002** are **mandatory**. Ordering: same priority (Urgent) → dated REC-002 before undated REC-001 per Demonstration Policy v1.0 (`orderRecommendations`).

REC-003 through REC-007 only if their documented conditions are additionally satisfied.

---

## Sample Project C — Incomplete (Team Unmeasured)

**Scenario**: `incomplete` | **Fixture id** (implementation): `sample-project-c`

### Input canonical-type health values (after HD-07 aggregation)

| Dimension | Canonical types (health values) |
|-----------|--------------------------------|
| Schedule | `milestone-slip` 85, `baseline-health` 80 |
| Delivery | `blocker-open` 100, `scope-stability` 80, `velocity-trend` 85 |
| Team | *(no valid required types — 0% coverage)* |
| Risk | `issue-escalation` 75, `governance-gap` 100 |

### Expected dimension results

| Dimension | Raw | Display | Classification | Status |
|-----------|-----|---------|----------------|--------|
| Schedule | 82.50 | 83 | Healthy | Measured |
| Delivery | 88.33… | 88 | Healthy | Measured |
| Team | — | — | — | **Unmeasured** |
| Risk | 87.50 | 88 | Healthy | Measured |

### Expected composite

| Field | Value |
|-------|-------|
| Measured dimensions | 3 of 4 |
| Composite raw | (82.5 + 88.33… + 87.5) ÷ 3 = **86.11…** |
| Composite display | **86** |
| Classification | **Healthy** |
| Coverage label | **"Based on 3 of 4 Measured dimensions"** |

Team dimension **excluded** from composite (Unmeasured).

### Expected recommendations

| Rule | Mandatory |
|------|-----------|
| **REC-004-team** | **Yes** |
| Others | Only if conditions met |

Expected finding: **FND-004-team**.

---

## Invalid fixture — Evaluation blocked

**Scenario**: `invalid` | **Fixture id** (implementation): `sample-project-invalid`

| Outcome | Expected |
|---------|----------|
| Structural validation | **Fails** (`validateProject` → `ok: false`) |
| Dimension scores | **None** |
| Composite | **None** |
| Findings | **None** |
| Recommendations | **None** |
| UI state | Invalid sample data (see `ui-states.md`) |

**Placement (HD-04)**: Test-only adverse path. **Not** listed in normal project picker. Leadership demo may expose via separately labelled adverse-condition test path if required later.

---

## Implementation test mapping

| Golden scenario | Planned test file | Phase |
|-----------------|-------------------|-------|
| Sample A | `tests/golden/sample-a.test.ts` | P10 |
| Sample B | `tests/golden/sample-b.test.ts` | P10 |
| Sample C | `tests/golden/sample-c.test.ts` | P10 |
| Invalid | `tests/golden/sample-invalid.test.ts` | P10 |

Fixture JSON creation: **P2** (data layer) — payloads MUST match canonical-type health inputs and Sample B snapshot dates above.
