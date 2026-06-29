# Fixture Schema Contract

**Feature**: `001-pm-copilot-demo`  
**Location**: `src/data/fixtures/`

Bundled fixtures are fictional. No real customer, employee, or credential data.

---

## SampleProjectFixture (root)

```typescript
interface SampleProjectFixture {
  schemaVersion: '1.0';
  id: string;
  displayName: string;
  scenario: 'healthy' | 'at-risk' | 'incomplete' | 'invalid';
  identity: {
    projectKey: string;
    projectName: string;
  };
  snapshot: {
    asOfDate: string; // ISO 8601 date
    label?: string;
  };
  signalGroups: SignalGroupFixture[];
  sourceSignals: SourceSignalFixture[];
  /** Optional: expected outcomes for golden tests */
  expectations?: ProjectExpectations;
}
```

---

## SignalGroupFixture

```typescript
interface SignalGroupFixture {
  id: string;
  representativeSourceLabel: string; // e.g. "Representative work-tracker (demo)"
  displayName: string;
  defaultEnabled: boolean;
  dimensionAffinity: DimensionId[];
  requiredForFullMeasurement: boolean;
}
```

**Constraint**: Labels MUST NOT imply live enterprise connectivity (FR-011, AS-063).

---

## SourceSignalFixture

```typescript
interface SourceSignalFixture {
  id: string;
  signalGroupId: string;
  sourceTerm: string;
  sourceField?: string;
  mappingKey: string; // key into MappingRegistry
  payload: Record<string, unknown>;
  asOfDate?: string;
  /** For adverse testing only */
  forceMappingFailure?: boolean;
}
```

---

## MappingRegistry entry

```typescript
interface MappingRegistryEntry {
  mappingKey: string;
  canonicalType: CanonicalSignalType;
  dimensionId: DimensionId;
  representativeSourceLabel: string;
  /** Equivalent business meaning → same canonicalType */
  equivalentKeys?: string[];
}
```

---

## CanonicalSignalType (finite enum)

| Type | Dimension | Description |
|------|-----------|-------------|
| `schedule.milestone-slip` | schedule | Milestone behind plan |
| `schedule.baseline-health` | schedule | Baseline adherence |
| `delivery.blocker-open` | delivery | Active delivery blocker |
| `delivery.scope-stability` | delivery | Scope change pressure |
| `delivery.velocity-trend` | delivery | Throughput trend |
| `team.engagement-score` | team | Team sentiment/engagement |
| `team.communication-cadence` | team | Stakeholder comms frequency |
| `risk.issue-escalation` | risk | Escalated risk/issue |
| `risk.governance-gap` | risk | Governance control gap |

New types require spec/plan amendment and golden test updates.

---

## Payload fields per mapping key

Implementation MUST supply payloads conforming to [signal-health-mapping.md](./signal-health-mapping.md).

| mappingKey → canonicalType | Payload fields |
|----------------------------|----------------|
| `milestone-slip` → `schedule.milestone-slip` | `slipDays` (number); `milestoneDueDate` (ISO date, optional globally; **required on Sample B** per HD-08 for REC-002) |
| `baseline-health` → `schedule.baseline-health` | `onTimePercent` (0–100) |
| `blocker-open` → `delivery.blocker-open` | `blockerState` (enum) |
| `scope-stability` → `delivery.scope-stability` | `changeRatePercent` (≥0) |
| `velocity-trend` → `delivery.velocity-trend` | `trendPercent` (number) |
| `engagement-score` → `team.engagement-score` | `engagementScore` (0–100) |
| `communication-cadence` → `team.communication-cadence` | `completionPercent` (0–100) |
| `issue-escalation` → `risk.issue-escalation` | `escalationPriority` (enum) |
| `governance-gap` → `risk.governance-gap` | `gapPriority` (enum) |

Enum values for priority/state fields: `none`, `closed`, `advisory`, `important`, `urgent`.

---

## ProjectExpectations (golden test aid)

```typescript
interface ProjectExpectations {
  minMeasuredDimensions: number;
  minRecommendations: number;
  expectedCompositeEligible: boolean;
  dimensionStatuses: Partial<Record<DimensionId, MeasurementStatus>>;
  dominantClassification?: HealthClassification;
  guaranteedBlocker?: boolean; // Sample B — FND-001 / REC-001
  guaranteedMilestoneRecovery?: boolean; // Sample B — FND-002 / REC-002 (HD-08)
  requiredRecommendationIds?: string[]; // e.g. ['REC-001', 'REC-002'] for Sample B
}
```

---

## Required fixtures (implementation)

| File | Scenario | Spec refs | Picker |
|------|----------|-----------|--------|
| `sample-project-a.json` | Healthy | FR-003, AS-003 | **Normal** project picker |
| `sample-project-b.json` | At-risk/critical + blocker + REC-001 + REC-002 | FR-004, AS-001, AS-004 | **Normal** project picker |
| `sample-project-c.json` | Incomplete, ≥1 Unmeasured | FR-005, AS-005, AS-052 | **Normal** project picker |
| `sample-project-invalid.json` | Adverse invalid data | AS-050, AS-051, AS-028 | **Test-only** — NOT in normal picker (HD-04) |

Golden expected calculations: [golden-scenarios.md](./golden-scenarios.md) (planning contract; not runtime code).

Each valid fixture MUST include:

- Authoritative `snapshot.asOfDate` (Sample B: **2026-06-01** per `golden-scenarios.md`)
- Sample B `schedule.milestone-slip` MUST include `slipDays: 8` and `milestoneDueDate` exactly 10 calendar days after snapshot (HD-08)
- At least one successfully mapped signal per representative source label used
- At least one cross-methodology equivalent mapping pair (for AS-060) across the fixture set
- One failed-mapping example (invalid fixture or dedicated signals in test harness)

---

## Invalid fixture variants

Use `scenario: 'invalid'` with one of:

| Variant | `expectations.invalidCategory` |
|---------|-------------------------------|
| Empty object / empty signals | `empty-file` |
| Missing `identity.projectKey` | `missing-identity` |
| Bad `snapshot.asOfDate` | `invalid-snapshot` |
| Unknown `mappingKey` on all signals | `unrecognizable-signals` |
| Malformed JSON (separate corrupt file) | `malformed-structure` |

---

## Import contract

```typescript
// src/data/fixtures/index.ts
export const SAMPLE_PROJECTS: Record<string, SampleProjectFixture>;  // A, B, C only
export const MAPPING_REGISTRY: MappingRegistry;
export const INVALID_FIXTURES: Record<string, SampleProjectFixture>;  // test / adverse path only
```

**HD-04**: Invalid fixture is test-only. Leadership demo may expose adverse handling via a separately labelled test path if required later — not the normal project picker.
