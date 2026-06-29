# Signal Health Mapping — Demonstration Rule Catalog v1.0

**Status**: **APPROVED**  
**Module**: `src/domain/scoring/signalHealth.ts`  
**Feature**: `001-pm-copilot-demo`

Maps each **valid canonical signal** to a **health value 0–100**. Higher is healthier. All values are clamped to 0–100 after mapping.

**Demonstration-only. Not a universal DXC standard.**

---

## Global mapping rules

| Rule | Behaviour |
|------|-----------|
| Input validation | Payload fields MUST be present, typed, and within valid range for mapping to proceed |
| Invalid value | Signal marked **invalid evidence**; excluded from scoring; visible exclusion reason |
| Missing required field | Invalid evidence — no imputation |
| Clamping | All mapped health values clamped to 0–100 |
| Polarity | Higher health value = healthier condition (documented per type) |
| Equal influence | Each required canonical type contributes once to dimension mean (HD-07); equal weight per type |
| Duplicate sources | Multiple valid signals per type → mean within type before dimension mean (HD-07) |
| Equivalent signals | Same canonical type + same payload semantics → identical per-signal health value |

---

## Schedule Health

### `schedule.milestone-slip`

| Property | Value |
|----------|-------|
| Payload field | `slipDays` |
| Field type | `number` (integer) |
| Valid range | Any finite number; mapping uses bands below |
| Polarity | Lower slip → higher health |
| Invalid | Non-numeric, `NaN`, `Infinity`, or missing `slipDays` |
| Optional field | `milestoneDueDate` (ISO 8601 date) — required on Sample B for REC-002 golden coverage (HD-08); used only for finding/recommendation timing, not health mapping |

| slipDays | Health value |
|----------|-------------|
| ≤ 0 | 100 |
| 1–3 | 85 |
| 4–7 | 65 |
| 8–14 | 40 |
| ≥ 15 | 20 |

Boundary: inclusive on stated bands (e.g. 3 → 85, 7 → 65, 14 → 40).

**REC-002 timing**: When `milestoneDueDate` is present and valid, `daysUntilDue = milestoneDueDate − snapshot.asOfDate` (calendar days). FND-002 uses this field; health mapping uses `slipDays` only.

### `schedule.baseline-health`

| Property | Value |
|----------|-------|
| Payload field | `onTimePercent` |
| Field type | `number` |
| Valid range | 0–100 |
| Polarity | Higher on-time % → higher health |
| Invalid | Non-numeric, outside 0–100, or missing field |

**Mapping**: `health = clamp(onTimePercent, 0, 100)` — use directly.

### Required Schedule canonical types

- `schedule.milestone-slip`
- `schedule.baseline-health`

---

## Delivery and Scope

### `delivery.blocker-open`

| Property | Value |
|----------|-------|
| Payload field | `blockerState` |
| Field type | `enum` |
| Valid values | `none`, `closed`, `advisory`, `important`, `urgent` |
| Polarity | Less severe blocker → higher health |
| Invalid | Unknown enum value or missing field |

| blockerState | Health value |
|--------------|-------------|
| `none`, `closed` | 100 |
| `advisory` | 75 |
| `important` | 50 |
| `urgent` | 20 |

### `delivery.scope-stability`

| Property | Value |
|----------|-------|
| Payload field | `changeRatePercent` |
| Field type | `number` |
| Valid range | ≥ 0 |
| Polarity | Lower change rate → higher health |
| Invalid | Negative, non-numeric, or missing |

| changeRatePercent | Health value |
|-------------------|-------------|
| 0–5 | 95 |
| > 5 through 10 | 80 |
| > 10 through 20 | 60 |
| > 20 | 35 |

### `delivery.velocity-trend`

| Property | Value |
|----------|-------|
| Payload field | `trendPercent` |
| Field type | `number` |
| Valid range | Any finite % |
| Polarity | Higher trend → higher health |
| Invalid | Non-numeric or missing |

| trendPercent | Health value |
|--------------|-------------|
| ≥ 10 | 95 |
| 0 ≤ x < 10 | 85 |
| -10 ≤ x < 0 | 65 |
| < -10 | 40 |

### Required Delivery canonical types

- `delivery.blocker-open`
- `delivery.scope-stability`
- `delivery.velocity-trend`

---

## Team and Communications

### `team.engagement-score`

| Property | Value |
|----------|-------|
| Payload field | `engagementScore` |
| Field type | `number` |
| Valid range | 0–100 |
| Polarity | Higher score → higher health |
| Invalid | Non-numeric, outside 0–100, or missing |

**Mapping**: `health = clamp(engagementScore, 0, 100)`.

### `team.communication-cadence`

| Property | Value |
|----------|-------|
| Payload field | `completionPercent` |
| Field type | `number` |
| Valid range | 0–100 |
| Polarity | Higher completion → higher health |
| Invalid | Non-numeric, outside 0–100, or missing |

**Mapping**: `health = clamp(completionPercent, 0, 100)`.

### Required Team canonical types

- `team.engagement-score`
- `team.communication-cadence`

---

## Risk and Governance

### `risk.issue-escalation`

| Property | Value |
|----------|-------|
| Payload field | `escalationPriority` |
| Field type | `enum` |
| Valid values | `none`, `closed`, `advisory`, `important`, `urgent` |
| Polarity | Less severe escalation → higher health |
| Invalid | Unknown enum or missing field |

| escalationPriority | Health value |
|--------------------|-------------|
| `none`, `closed` | 100 |
| `advisory` | 75 |
| `important` | 50 |
| `urgent` | 20 |

### `risk.governance-gap`

| Property | Value |
|----------|-------|
| Payload field | `gapPriority` |
| Field type | `enum` |
| Valid values | `none`, `closed`, `advisory`, `important`, `urgent` |
| Polarity | Less severe gap → higher health |
| Invalid | Unknown enum or missing field |

| gapPriority | Health value |
|-------------|-------------|
| `none`, `closed` | 100 |
| `advisory` | 75 |
| `important` | 50 |
| `urgent` | 20 |

### Required Risk canonical types

- `risk.issue-escalation`
- `risk.governance-gap`

---

## Payload schema reference (fixture contract)

See `fixture-schema.md` for `SourceSignalFixture.payload` examples per mapping key. Implementation MUST validate payload shape before mapping.

---

## Tests

| Layer | File |
|-------|------|
| Unit | `tests/domain/signal-health-mapping.test.ts` |
| Golden | `tests/golden/sample-a.test.ts`, `sample-b.test.ts`, `sample-c.test.ts` |
| Spec | AS-061 (equivalent mapping), FR-020, BR-001 |
