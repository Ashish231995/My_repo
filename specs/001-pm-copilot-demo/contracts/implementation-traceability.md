# Implementation Traceability Matrix

**Feature**: `001-pm-copilot-demo`  
**Date**: 2026-06-29 (task-plan remediation)  
**Purpose**: Maps every FR, BR, AS, and SC to planned modules, tests, contracts, and phases.

**Phases**:

| Phase | Scope |
|-------|-------|
| **P0** | Dependency pinning (ADR-001), Vitest scaffold, folder structure |
| **P1** | Domain model, shared utilities (`roundHalfUp`, `classifyHealth`) |
| **P2** | Bundled fixtures + mapping registry |
| **P3** | Validation & normalization |
| **P4** | Scoring (dimension + composite under `src/domain/scoring/`) |
| **P5** | Findings (evidence assembly) + recommendations |
| **P6** | Evaluation orchestration (`runEvaluation`) |
| **P7** | Session store + app shell |
| **P8** | Persona projection |
| **P9** | React features & UI |
| **P10** | Integration, golden, a11y, privacy, perf verification |

---

## Functional Requirements (FR-001 – FR-040)

| ID | Module | Test layer | Test file | Contract | Phase |
|----|--------|------------|-----------|----------|-------|
| FR-001 | `src/app/`, `src/session/` | Integration | `tests/integration/p1-journey.test.tsx` | `session-state.md`, `ui-states.md` | P9 |
| FR-002 | `src/data/fixtures/`, `src/features/project-select/` | Golden + Integration | `tests/golden/sample-a.test.ts`, `sample-b.test.ts`, `sample-c.test.ts`; `tests/integration/project-select.test.tsx` | `fixture-schema.md`, `golden-scenarios.md` | P2, P10 |
| FR-003 | `src/domain/scoring/` | Golden | `tests/golden/sample-a.test.ts` | `golden-scenarios.md`, `scoring-rules.md` | P4, P10 |
| FR-004 | `src/domain/scoring/`, `src/domain/recommendations/` | Golden + Integration | `tests/golden/sample-b.test.ts`; `tests/integration/p1-journey.test.tsx` | `golden-scenarios.md` (REC-001, REC-002), `recommendation-rules.md` | P4, P5, P10 |
| FR-005 | `src/domain/scoring/` | Golden | `tests/golden/sample-c.test.ts` | `golden-scenarios.md`, `scoring-rules.md` | P4, P10 |
| FR-006 | `src/session/` | Privacy | `tests/privacy/no-persistence.test.ts` | `session-state.md` | P7, P10 |
| FR-007 | `src/session/`, `src/features/reset-confirm/` | Integration + Unit | `tests/integration/reset-flow.test.tsx`; `tests/session/session-reducer.test.ts` | `session-state.md`, `ui-states.md` | P7, P9, P10 |
| FR-008 | `src/features/persona-selector/` | Integration | `tests/integration/persona-selector.test.tsx` | `ui-states.md`, `session-state.md` | P9, P10 |
| FR-009 | `src/domain/persona/` | Unit + Integration | `tests/domain/persona-projection.test.ts`; `tests/integration/persona-coaching.test.tsx` | `domain-functions.md`, `ui-states.md` | P8, P10 |
| FR-010 | `src/domain/persona/`, `src/domain/evaluation/` | Unit | `tests/domain/persona-invariance.test.ts` | `domain-functions.md` | P6, P8, P10 |
| FR-011 | `src/features/integration-checklist/` | Integration | `tests/integration/integration-checklist.test.tsx` | `fixture-schema.md`, `ui-states.md` | P9, P10 |
| FR-012 | `src/session/`, `src/features/integration-checklist/` | Integration | `tests/integration/integration-checklist.test.tsx` | `session-state.md` | P7, P9, P10 |
| FR-013 | `src/domain/validation/`, `src/session/` | Unit + Integration | `tests/domain/signal-validation.test.ts`; `tests/integration/integration-checklist.test.tsx` | `domain-functions.md`, `evaluation-pipeline.md` | P3, P10 |
| FR-014 | `src/domain/scoring/` | Golden + Unit | `tests/domain/dimension-scoring.test.ts`; `tests/golden/sample-a.test.ts` | `scoring-rules.md` | P4, P10 |
| FR-015 | `src/domain/scoring/`, `src/features/health-dashboard/` | Unit + Integration | `tests/domain/dimension-scoring.test.ts`; `tests/integration/health-dashboard.test.tsx` | `data-model.md`, `ui-states.md` | P4, P9, P10 |
| FR-016 | `src/domain/scoring/` | Unit | `tests/domain/dimension-scoring.test.ts` | `scoring-rules.md`, `data-model.md` | P4, P10 |
| FR-017 | `src/domain/scoring/` | Unit | `tests/domain/trend.test.ts` | `domain-functions.md` | P4, P10 |
| FR-018 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P4, P10 |
| FR-019 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md`, `data-model.md` | P4, P10 |
| FR-020 | `src/domain/scoring/` | Golden + Unit | `tests/domain/composite.test.ts`; `tests/domain/canonical-type-aggregation.test.ts`; `tests/golden/*.test.ts` | `scoring-rules.md` (HD-07), `golden-scenarios.md` | P4, P10 |
| FR-021 | `src/domain/recommendations/` | Golden + Unit | `tests/domain/recommendation-rules.test.ts`; `tests/golden/sample-b.test.ts` | `recommendation-rules.md` | P5, P10 |
| FR-022 | `src/domain/recommendations/`, `src/features/recommendations/` | Unit + Integration | `tests/domain/recommendation-rules.test.ts`; `tests/integration/recommendations.test.tsx` | `recommendation-rules.md`, `ui-states.md` | P5, P9, P10 |
| FR-023 | `src/domain/persona/` | Integration | `tests/integration/persona-coaching.test.tsx` | `ui-states.md` | P8, P10 |
| FR-024 | `src/domain/evaluation/` | Unit | `tests/domain/determinism.test.ts` | `evaluation-pipeline.md` | P6, P10 |
| FR-025 | `src/app/` | Privacy | `tests/privacy/no-network.test.ts` | `plan.md` §Privacy | P7, P10 |
| FR-026 | `src/app/`, `src/session/` | Privacy | `tests/privacy/no-persistence.test.ts` | `session-state.md` | P7, P10 |
| FR-027 | `src/ui/StatusLabel/`, `src/features/health-dashboard/` | A11y + Integration | `tests/a11y/health-labels.test.tsx` | `ui-states.md` | P9, P10 |
| FR-028 | `src/features/*`, `src/ui/` | A11y + Integration | `tests/a11y/keyboard-navigation.test.tsx` | `ui-states.md` | P9, P10 |
| FR-029 | `src/features/*` | Integration | `tests/integration/ui-states.test.tsx` | `ui-states.md` | P9, P10 |
| FR-030 | `src/domain/scoring/` | Unit | `tests/domain/classify-health.test.ts` | `scoring-rules.md` | P1, P4, P10 |
| FR-031 | `src/domain/scoring/` | Unit + Golden | `tests/domain/composite.test.ts`; `tests/golden/sample-c.test.ts` | `scoring-rules.md` | P4, P10 |
| FR-032 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P4, P10 |
| FR-033 | `src/domain/scoring/` | Golden + Unit | `tests/domain/composite.test.ts`; `tests/golden/sample-c.test.ts` | `scoring-rules.md`, `golden-scenarios.md` | P4, P10 |
| FR-034 | `src/domain/recommendations/`, `src/domain/utils/` | Unit + Golden | `tests/domain/order-recommendations.test.ts`; `tests/domain/compare-snapshot-dates.test.ts`; `tests/golden/sample-b.test.ts` (REC-002 before REC-001) | `recommendation-rules.md`, `golden-scenarios.md` | P5, P10 |
| FR-035 | `src/domain/validation/` | Unit | `tests/domain/signal-validation.test.ts` | `domain-functions.md`, `signal-health-mapping.md` | P3, P10 |
| FR-036 | `src/session/` | Integration | `tests/integration/session-defaults.test.tsx` | `session-state.md` | P7, P10 |
| FR-037 | `src/features/reset-confirm/`, `src/session/` | Integration | `tests/integration/reset-dialog.test.tsx` | `session-state.md`, `ui-states.md` | P7, P9, P10 |
| FR-038 | `src/domain/validation/`, `src/features/invalid-project/` | Unit + Integration | `tests/domain/project-validation.test.ts`; `tests/integration/invalid-project.test.tsx` | `fixture-schema.md`, `golden-scenarios.md` | P3, P9, P10 |
| FR-039 | `src/domain/persona/` | Unit + Integration | `tests/domain/persona-projection.test.ts`; `tests/integration/persona-coaching.test.tsx` | `domain-functions.md`, `ui-states.md` | P8, P10 |
| FR-040 | `src/domain/normalization/`, `src/features/dimension-detail/` | Unit + Integration | `tests/domain/normalization.test.ts`; `tests/integration/evidence-drilldown.test.tsx` | `fixture-schema.md`, `signal-health-mapping.md` | P3, P9, P10 |

---

## Business Rules (BR-001 – BR-018)

| ID | Module | Test layer | Test file | Contract | Phase |
|----|--------|------------|-----------|----------|-------|
| BR-001 | `src/domain/scoring/`, `src/domain/recommendations/` | Golden + Unit | `tests/domain/signal-health-mapping.test.ts`; `tests/golden/*.test.ts` | `demonstration-rule-catalog.md`, `signal-health-mapping.md` | P4, P5, P10 |
| BR-002 | `src/domain/normalization/` | Unit | `tests/domain/normalization.test.ts` | `fixture-schema.md` | P3, P10 |
| BR-003 | `src/domain/scoring/` | Unit + Golden | `tests/domain/composite.test.ts`; `tests/golden/sample-c.test.ts` | `scoring-rules.md` | P4, P10 |
| BR-004 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P4, P10 |
| BR-005 | `src/domain/recommendations/` | Unit | `tests/domain/recommendation-rules.test.ts` | `recommendation-rules.md` | P5, P10 |
| BR-006 | `src/domain/persona/` | Unit + Integration | `tests/domain/persona-projection.test.ts` | `domain-functions.md` | P8, P10 |
| BR-007 | `src/session/` | Integration + Privacy | `tests/integration/reset-flow.test.tsx`; `tests/privacy/no-persistence.test.ts` | `session-state.md` | P7, P10 |
| BR-008 | `src/domain/scoring/` | Unit | `tests/domain/classify-health.test.ts` | `scoring-rules.md` | P4, P10 |
| BR-009 | `src/domain/scoring/` | Unit + Golden | `tests/domain/composite.test.ts` | `scoring-rules.md`, `golden-scenarios.md` | P4, P10 |
| BR-010 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P4, P10 |
| BR-011 | `src/domain/scoring/` | Golden + Unit | `tests/domain/composite.test.ts`; `tests/golden/sample-c.test.ts` | `scoring-rules.md` | P4, P10 |
| BR-012 | `src/domain/recommendations/` | Unit | `tests/domain/order-recommendations.test.ts` | `recommendation-rules.md` | P5, P10 |
| BR-013 | `src/domain/validation/` | Unit | `tests/domain/signal-validation.test.ts` | `signal-health-mapping.md` | P3, P10 |
| BR-014 | `src/session/` | Integration | `tests/integration/session-defaults.test.tsx` | `session-state.md` | P7, P10 |
| BR-015 | `src/features/reset-confirm/`, `src/session/` | Integration + Unit | `tests/integration/reset-dialog.test.tsx`; `tests/session/session-reducer.test.ts` | `session-state.md` | P7, P9, P10 |
| BR-016 | `src/domain/validation/`, `src/features/invalid-project/` | Unit + Integration | `tests/domain/project-validation.test.ts`; `tests/golden/sample-invalid.test.ts` | `fixture-schema.md`, `golden-scenarios.md` | P3, P10 |
| BR-017 | `src/domain/persona/` | Unit | `tests/domain/persona-projection.test.ts` | `domain-functions.md` | P8, P10 |
| BR-018 | `src/domain/normalization/` | Unit | `tests/domain/mapping-equivalence.test.ts` | `fixture-schema.md` | P3, P10 |

---

## Acceptance Scenarios (AS-001 – AS-063)

| ID | Module | Test layer | Test file | Contract | Phase |
|----|--------|------------|-----------|----------|-------|
| AS-001 | `src/domain/evaluation/` | Golden + Integration | `tests/golden/sample-b.test.ts`; `tests/integration/p1-journey.test.tsx` | `golden-scenarios.md`, `recommendation-rules.md` | P6, P10 |
| AS-002 | `src/features/project-select/` | Integration | `tests/integration/project-select.test.tsx` | `ui-states.md` | P9, P10 |
| AS-003 | `src/domain/scoring/` | Golden | `tests/golden/sample-a.test.ts` | `golden-scenarios.md` | P10 |
| AS-004 | `src/domain/recommendations/` | Golden | `tests/golden/sample-b.test.ts` | `golden-scenarios.md` (REC-001 + REC-002), `recommendation-rules.md` | P10 |
| AS-005 | `src/domain/scoring/` | Golden | `tests/golden/sample-c.test.ts` | `golden-scenarios.md` | P10 |
| AS-006 | `src/features/integration-checklist/` | Integration | `tests/integration/integration-checklist.test.tsx` | `ui-states.md` | P10 |
| AS-007 | `src/session/`, `src/features/integration-checklist/` | Integration | `tests/integration/integration-checklist.test.tsx` | `session-state.md` | P10 |
| AS-008 | `src/features/health-dashboard/` | Integration | `tests/integration/health-dashboard.test.tsx` | `ui-states.md` | P10 |
| AS-009 | `src/domain/scoring/` | Unit | `tests/domain/dimension-scoring.test.ts` | `scoring-rules.md` | P10 |
| AS-010 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P10 |
| AS-011 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P10 |
| AS-012 | `src/domain/scoring/` | Unit + Golden | `tests/domain/composite.test.ts` | `scoring-rules.md` | P10 |
| AS-013 | `src/domain/scoring/` | Unit | `tests/domain/classify-health.test.ts` | `scoring-rules.md` | P10 |
| AS-014 | `src/domain/scoring/` | Unit | `tests/domain/classify-health.test.ts` | `scoring-rules.md` | P10 |
| AS-015 | `src/domain/scoring/` | Unit | `tests/domain/classify-health.test.ts` | `scoring-rules.md` | P10 |
| AS-016 | `src/features/dimension-detail/` | Integration | `tests/integration/evidence-drilldown.test.tsx` | `ui-states.md` | P10 |
| AS-017 | `src/domain/scoring/` | Unit | `tests/domain/trend.test.ts` | `domain-functions.md` | P10 |
| AS-018 | `src/domain/scoring/` | Unit | `tests/domain/trend.test.ts` | `domain-functions.md` | P10 |
| AS-019 | `src/ui/StatusLabel/` | A11y | `tests/a11y/health-labels.test.tsx` | `ui-states.md` | P10 |
| AS-020 | `src/domain/persona/` | Unit | `tests/domain/persona-invariance.test.ts` | `domain-functions.md` | P10 |
| AS-021 | `src/domain/evaluation/` | Unit | `tests/domain/determinism.test.ts` | `evaluation-pipeline.md` | P10 |
| AS-022 | `src/domain/recommendations/`, `src/features/recommendations/` | Unit + Integration | `tests/domain/recommendation-rules.test.ts`; `tests/integration/recommendations.test.tsx` | `recommendation-rules.md`, `ui-states.md` | P10 |
| AS-023 | `src/features/recommendations/` | Integration | `tests/integration/recommendations.test.tsx` | `ui-states.md` | P10 |
| AS-024 | `src/app/` | Privacy | `tests/privacy/no-network.test.ts` | `plan.md` | P10 |
| AS-025 | `src/session/` | Privacy | `tests/privacy/no-persistence.test.ts` | `session-state.md` | P10 |
| AS-026 | `src/session/` | Integration | `tests/integration/reset-flow.test.tsx` | `session-state.md` | P10 |
| AS-027 | `src/session/` | Integration | `tests/integration/reset-flow.test.tsx` | `session-state.md` | P10 |
| AS-028 | `src/domain/validation/` | Golden | `tests/golden/sample-invalid.test.ts` | `golden-scenarios.md` | P10 |
| AS-029 | `src/domain/evaluation/` | Integration | `tests/integration/evaluation-error.test.tsx` | `evaluation-pipeline.md` | P10 |
| AS-030 | `src/features/*` | A11y | `tests/a11y/keyboard-navigation.test.tsx` | `ui-states.md` | P10 |
| AS-031 | `src/features/health-dashboard/` | Integration | `tests/integration/responsive-layout.test.tsx` | `ui-states.md` | P10 |
| AS-032 | `src/domain/scoring/` | Unit | `tests/domain/round-half-up.test.ts` | `scoring-rules.md` | P10 |
| AS-033 | `src/domain/scoring/` | Unit + Golden | `tests/domain/composite.test.ts`; `tests/golden/sample-c.test.ts` | `golden-scenarios.md` | P10 |
| AS-034 | `src/domain/scoring/` | Unit | `tests/domain/composite.test.ts` | `scoring-rules.md` | P10 |
| AS-035 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P10 |
| AS-036 | `src/domain/scoring/` | Unit | `tests/domain/measurement-status.test.ts` | `scoring-rules.md` | P10 |
| AS-037 | `src/domain/scoring/` | Golden | `tests/golden/sample-c.test.ts` | `golden-scenarios.md` | P10 |
| AS-038 | `src/domain/scoring/` | Golden | `tests/golden/sample-a.test.ts` | `golden-scenarios.md` | P10 |
| AS-039 | `src/domain/scoring/` | Unit | `tests/domain/composite.test.ts` | `scoring-rules.md` | P10 |
| AS-040 | `src/domain/recommendations/` | Unit | `tests/domain/order-recommendations.test.ts` | `recommendation-rules.md` | P10 |
| AS-041 | `src/domain/recommendations/` | Unit | `tests/domain/order-recommendations.test.ts` | `recommendation-rules.md` | P10 |
| AS-042 | `src/domain/validation/` | Unit | `tests/domain/signal-validation.test.ts` | `signal-health-mapping.md` | P10 |
| AS-043 | `src/domain/validation/` | Unit + Integration | `tests/domain/signal-validation.test.ts` | `domain-functions.md` | P10 |
| AS-044 | `src/session/` | Integration | `tests/integration/session-defaults.test.tsx` | `session-state.md` | P10 |
| AS-045 | `src/features/persona-selector/` | Integration | `tests/integration/persona-selector.test.tsx` | `session-state.md` | P10 |
| AS-046 | `src/features/reset-confirm/` | Integration | `tests/integration/reset-dialog.test.tsx` | `session-state.md` | P10 |
| AS-047 | `src/features/reset-confirm/` | Integration | `tests/integration/reset-dialog.test.tsx` | `ui-states.md` | P10 |
| AS-048 | `src/session/` | Integration | `tests/integration/reset-flow.test.tsx` | `session-state.md` | P10 |
| AS-049 | `src/session/` | Integration | `tests/integration/reset-flow.test.tsx` | `session-state.md` | P10 |
| AS-050 | `src/domain/validation/` | Unit + Golden | `tests/domain/project-validation.test.ts`; `tests/golden/sample-invalid.test.ts` | `fixture-schema.md` | P10 |
| AS-051 | `src/domain/validation/` | Golden | `tests/golden/sample-invalid.test.ts` | `golden-scenarios.md` | P10 |
| AS-052 | `src/domain/validation/`, `src/domain/scoring/` | Golden | `tests/golden/sample-c.test.ts` | `golden-scenarios.md` | P10 |
| AS-053 | `src/features/invalid-project/` | Integration | `tests/integration/invalid-project.test.tsx` | `ui-states.md` | P10 |
| AS-054 | `src/features/invalid-project/` | Integration | `tests/integration/invalid-project.test.tsx` | `ui-states.md` | P10 |
| AS-055 | `src/domain/persona/` | Unit | `tests/domain/persona-projection.test.ts` | `domain-functions.md` | P10 |
| AS-056 | `src/domain/persona/` | Integration | `tests/integration/persona-coaching.test.tsx` | `ui-states.md` | P10 |
| AS-057 | `src/domain/persona/`, `src/features/dimension-detail/` | Integration | `tests/integration/persona-coaching.test.tsx` | `ui-states.md` | P10 |
| AS-058 | `src/domain/persona/` | Unit + Integration | `tests/domain/persona-invariance.test.ts` | `domain-functions.md` | P10 |
| AS-059 | `src/features/dimension-detail/` | Integration | `tests/integration/evidence-drilldown.test.tsx` | `fixture-schema.md` | P10 |
| AS-060 | `src/domain/normalization/` | Unit | `tests/domain/mapping-equivalence.test.ts` | `fixture-schema.md` | P10 |
| AS-061 | `src/domain/scoring/` | Unit | `tests/domain/canonical-type-aggregation.test.ts`; `tests/domain/signal-health-mapping.test.ts` | `scoring-rules.md` (HD-07), `signal-health-mapping.md` | P10 |
| AS-062 | `src/domain/normalization/` | Unit | `tests/domain/normalization.test.ts` | `fixture-schema.md` | P10 |
| AS-063 | `src/features/dimension-detail/` | Integration | `tests/integration/evidence-drilldown.test.tsx` | `fixture-schema.md` | P10 |

---

## Success Criteria (SC-001 – SC-006)

| ID | Module | Test layer | Test file | Contract | Phase |
|----|--------|------------|-----------|----------|-------|
| SC-001 | `src/app/`, `src/features/*` | Integration | `tests/integration/p1-journey.test.tsx` | `quickstart.md` | P10 |
| SC-002 | `src/domain/evaluation/` | Unit | `tests/domain/determinism.test.ts` | `evaluation-pipeline.md` | P10 |
| SC-003 | `src/domain/persona/` | Unit | `tests/domain/persona-invariance.test.ts` | `domain-functions.md` | P10 |
| SC-004 | `src/session/` | Privacy + Integration | `tests/privacy/no-persistence.test.ts`; `tests/integration/reset-flow.test.tsx` | `session-state.md` | P10 |
| SC-005 | `src/ui/`, `src/features/*` | A11y | `tests/a11y/*.test.tsx` | `ui-states.md`, `quickstart.md` | P10 |
| SC-006 | `src/data/fixtures/`, `src/domain/scoring/` | Golden | `tests/golden/sample-a.test.ts`, `sample-b.test.ts`, `sample-c.test.ts` | `golden-scenarios.md` | P10 |

---

## Coverage summary

| Set | Count | Mapped |
|-----|-------|--------|
| FR-001 – FR-040 | 40 | 40 |
| BR-001 – BR-018 | 18 | 18 |
| AS-001 – AS-063 | 63 | 63 |
| SC-001 – SC-006 | 6 | 6 |
| **Total** | **127** | **127** |

**P0 first implementation task**: Pin dependencies per ADR-001 (`package.json` unchanged during planning).

**HD-07 / HD-08**: Resolved in rule catalog and `golden-scenarios.md` (2026-06-29 amendment).
