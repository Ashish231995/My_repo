# Tasks: PM Copilot Local Demonstration

**Input**: Design documents from `specs/001-pm-copilot-demo/`  
**Prerequisites**: Approved `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Architecture**: 10 boundaries per `plan.md`; Demonstration Rule Catalog v1.0 **APPROVED**

**Tests**: Constitution Principle VII — automated tests required for scoring, recommendations, golden scenarios, privacy, accessibility, and critical journeys.

**Organization**: Phases 0–1 (infrastructure) → Phase 2 (P1 MVP) → Phases 3–7 (US2–US6) → Phase 8 (compliance).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable — different files, no dependency on incomplete same-file work and safe for test-first ordering
- **[Story]**: US1–US6 maps to spec user stories
- Each task lists **Refs** (FR/BR/AS) and **Evidence** (test or validation artifact)

**Task totals**: 138 tasks (T001–T138); MVP scope Phase 0 + 1 + 2 = T001–T079 (79 tasks); **[P] tasks**: 64

---

## Phase 0: Environment and Dependency Pinning

**Purpose**: Reproducible toolchain per ADR-001 (HD-05). Blocks all other work.

- [X] T001 Pin exact ADR-001 versions in `package.json`: **runtime** `dependencies` — react 19.2.7, react-dom 19.2.7; **devDependencies** — typescript 6.0.3, vite 8.1.0, `@vitejs/plugin-react` 6.0.3, `@types/react` 19.x, `@types/react-dom` 19.x, vitest, `@vitest/coverage-v8`, jsdom, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, vitest-axe per `research.md`. **Refs**: FR-025, BR-007, Constitution VII | **Evidence**: `package.json` contains no `latest` tags; runtime vs dev split correct
- [X] T002 Run `npm install` once after complete manifest update. **Refs**: HD-05 | **Evidence**: `package-lock.json` generated; runtime and dev packages in `node_modules`
- [X] T003 Configure Vitest in `vite.config.ts` (jsdom environment, test globals, coverage provider). **Refs**: Constitution VII | **Evidence**: `npm test` discovers `tests/**/*.test.ts(x)`
- [X] T004 Create Vitest setup file `tests/setup.ts` importing `@testing-library/jest-dom`. **Refs**: Constitution VII | **Evidence**: setup referenced in `vite.config.ts`
- [X] T005 Add npm scripts in `package.json`: `test`, `test:coverage`, `test:a11y`, `test:integration`, `test:golden`, `test:privacy`, `test:perf`. **Refs**: plan.md Quality Gates | **Evidence**: scripts runnable from repo root
- [X] T006 [P] Create approved 10-boundary folder scaffold per `plan.md` (`src/app/`, `src/session/`, `src/domain/model/`, `src/domain/validation/`, `src/domain/normalization/`, `src/domain/scoring/`, `src/domain/findings/`, `src/domain/recommendations/`, `src/domain/persona/`, `src/domain/evaluation/`, `src/domain/utils/`, `src/data/fixtures/`, `src/features/`, `src/ui/`, `src/styles/`, `tests/domain/`, `tests/session/`, `tests/golden/`, `tests/integration/`, `tests/a11y/`, `tests/privacy/`, `tests/perf/`). **Refs**: plan.md §Internal Architecture | **Evidence**: boundary list matches plan.md §Internal Architecture; paths resolvable when first modules land in T017–T019
- [X] T007 [P] Create `src/styles/tokens.css` with design tokens (colour-secondary health cues, spacing, typography). **Refs**: FR-027, FR-029 | **Evidence**: file imports in `src/styles/global.css`
- [X] T008 [P] Create `src/styles/global.css` with system font stack and base landmarks. **Refs**: FR-027, plan.md ADR-006 | **Evidence**: `src/styles/global.css` exports base rules importable by App shell (T033)
- [X] T009 Run `npm run typecheck` on starter scaffold — must pass. **Refs**: Constitution VII | **Evidence**: exit code 0
- [X] T010 Run `npm run build` on starter scaffold — must pass. **Refs**: Constitution VII | **Evidence**: `dist/` produced
- [X] T011 Document Phase 0 baseline in `specs/001-pm-copilot-demo/quickstart.md` prerequisites section if versions drift. Note that Phase 0 `typecheck`/`build` (T009–T010) validate the existing starter entry (`index.html` → `/src/main.tsx`); **T034** must align `index.html` to `/src/app/main.tsx` before the Phase 1 checkpoint. **Refs**: quickstart.md | **Evidence**: versions match `package.json`; starter vs approved entry documented

**Checkpoint Phase 0**: Pinned deps installed; `typecheck` and `build` pass; folder scaffold matches plan.

---

## Phase 1: Foundational Domain Model and Session Structure

**Purpose**: Shared types, utilities, session contract, app shell — blocks user-story work.

### Tests (write first — expect fail)

- [X] T012 [P] Create unit test skeleton `tests/domain/round-half-up.test.ts` asserting half-up boundaries (79.5→80, 49.5→50). **Refs**: AS-032, FR-030, BR-008 | **Evidence**: tests fail (no implementation)
- [X] T013 [P] Create unit test skeleton `tests/domain/classify-health.test.ts` for Healthy/At Risk/Critical bands at 80, 50, 49. **Refs**: AS-013–AS-015, FR-030, BR-008 | **Evidence**: tests fail
- [X] T014 [P] Create session reducer test skeleton `tests/integration/session-defaults.test.tsx` expecting Intermediate persona on init. **Refs**: AS-044, FR-036, BR-014 | **Evidence**: tests fail
- [X] T015 [P] Create unit test skeleton `tests/domain/compare-snapshot-dates.test.ts` for calendar-day diff (REC-002 slip). **Refs**: FR-034, recommendation-rules.md REC-002 | **Evidence**: tests fail (no implementation)
- [X] T016 [P] Create unit test skeleton `tests/session/session-reducer.test.ts` for INIT, SET_PERSONA, REQUEST_RESET (no evaluate, no confirm reset). **Refs**: FR-007, FR-036, BR-014, BR-015 | **Evidence**: tests fail

### Implementation

- [X] T017 [P] Define core enumerations and types in `src/domain/model/enums.ts` (`Persona`, `DimensionId`, `MeasurementStatus`, `HealthClassification`, `RecommendationPriority`, `CanonicalSignalType`). **Refs**: data-model.md | **Evidence**: exported types compile
- [X] T018 [P] Define `SessionState`, `SessionPhase`, `SessionUiState`, `SessionAction` in `src/domain/model/session.ts` per `contracts/session-state.md`. **Refs**: FR-006, FR-007, data-model.md | **Evidence**: types match contract
- [X] T019 [P] Define `SampleProjectFixture`, `SourceSignal`, `EvidenceItem`, `DimensionResult`, `CompositeHealthResult`, `EvaluationResult`, `Recommendation`, `Finding` in `src/domain/model/evaluation.ts` per `data-model.md`. **Refs**: FR-014–FR-020, data-model.md | **Evidence**: includes `canonicalTypeHealth` (HD-07)
- [X] T020 Implement `roundHalfUp` in `src/domain/utils/roundHalfUp.ts`. **Refs**: AS-032, FR-030, BR-008 | **Evidence**: `tests/domain/round-half-up.test.ts` passes
- [X] T021 Implement `classifyHealth` in `src/domain/utils/classifyHealth.ts`. **Refs**: AS-013–AS-015, FR-030, BR-008 | **Evidence**: `tests/domain/classify-health.test.ts` passes
- [X] T022 Implement `compareSnapshotDates` in `src/domain/utils/compareSnapshotDates.ts` (calendar-day diff). **Refs**: FR-034, recommendation-rules.md REC-002 | **Evidence**: `tests/domain/compare-snapshot-dates.test.ts` passes
- [X] T023 Create `src/session/sessionActions.ts` with typed action creators per `contracts/session-state.md`. **Refs**: FR-007, FR-037 | **Evidence**: all actions exported
- [X] T024 Create `src/session/initialSession.ts` exporting `createInitialSession()` (Intermediate persona, no project). **Refs**: AS-044, FR-036, BR-014 | **Evidence**: matches session-state contract
- [X] T025 Implement `src/session/sessionReducer.ts` for INIT, SET_PERSONA, REQUEST_RESET branching only (no evaluate, no confirm reset). **Refs**: FR-007, BR-015 | **Evidence**: `tests/session/session-reducer.test.ts` passes
- [X] T026 Create `src/session/sessionContext.tsx` provider with Context + dispatch. **Refs**: FR-006, plan.md ADR-002 | **Evidence**: provider renders children
- [X] T027 [P] Create `src/ui/Dialog/Dialog.tsx` accessible modal primitive (focus trap, labelled title). **Refs**: FR-028, FR-029 | **Evidence**: component exports; used by reset and detail flows
- [X] T028 [P] Create `src/ui/Button/Button.tsx` + `Button.module.css` accessible button primitive. **Refs**: FR-028, FR-029 | **Evidence**: keyboard focusable
- [X] T029 [P] Create `src/ui/Card/Card.tsx` + `Card.module.css`. **Refs**: FR-029 | **Evidence**: component exports
- [X] T030 [P] Create `src/ui/StatusLabel/StatusLabel.tsx` + module CSS with text + icon (no colour-only). **Refs**: AS-019, FR-027, SC-005 | **Evidence**: renders label + icon slot
- [X] T031 [P] Create `src/ui/PrivacyIndicator/PrivacyIndicator.tsx` local-only badge. **Refs**: FR-025, FR-026, AS-024 | **Evidence**: static text, no network
- [X] T032 Create `src/app/AppProviders.tsx` wrapping SessionContext. **Refs**: FR-001 | **Evidence**: composes provider
- [X] T033 Create `src/app/App.tsx` shell with landmark regions per `contracts/ui-states.md`. **Refs**: FR-029, FR-028 | **Evidence**: `<main>` landmark present
- [X] T034 Wire `src/app/main.tsx` to render App with global styles and update root `index.html` script entry from `/src/main.tsx` to `/src/app/main.tsx`. **Refs**: FR-001 | **Evidence**: `npm run dev` shows shell; `index.html` entry matches approved path

**Checkpoint Phase 1**: App shell loads at `src/app/main.tsx`; session defaults to Intermediate; utils and reducer unit tests pass; no evaluation logic yet.

---

## Phase 2: P1 End-to-End Coaching Journey (User Story 1) 🎯 MVP

**Goal**: Select Sample Project B, evaluate with default signals, see four dimensions, composite, REC-001 + REC-002 with evidence (AS-001, AS-004).

**Independent Test**: `tests/integration/p1-journey.test.tsx` + `tests/golden/sample-b.test.ts` pass.

### Tests — domain rules (write first)

- [X] T035 [P] [US1] Implement `tests/domain/signal-health-mapping.test.ts` for all 9 canonical types, bands, invalid payloads per `contracts/signal-health-mapping.md`. **Refs**: FR-020, BR-001, AS-061 | **Evidence**: tests fail until T058 (`mapSignalHealth`)
- [X] T036 [P] [US1] Implement `tests/domain/canonical-type-aggregation.test.ts` for HD-07 duplicate-source mean and single contribution per type. **Refs**: FR-020, BR-001, AS-061, HD-07 | **Evidence**: tests fail until T059 (`aggregateCanonicalTypeHealth`)
- [X] T037 [P] [US1] Implement `tests/domain/measurement-status.test.ts` for Measured/Partial/Unmeasured thresholds (HD-02). **Refs**: AS-009–AS-011, FR-018, FR-019, BR-003, BR-004, BR-010 | **Evidence**: tests fail until T060 (`calculateDimension`)
- [X] T038 [P] [US1] Implement `tests/domain/dimension-scoring.test.ts` for equal-mean dimension raw/display scores. **Refs**: AS-009, AS-010, FR-014–FR-016, BR-001 | **Evidence**: tests fail until T060 (`calculateDimension`)
- [X] T039 [P] [US1] Implement `tests/domain/composite.test.ts` for re-normalized weights, min 2 Measured, raw-then-round composite (AS-033, AS-034, AS-037–AS-039). **Refs**: AS-012, AS-033–AS-039, FR-020, FR-031–FR-033, BR-009, BR-011 | **Evidence**: tests fail until T061 (`calculateComposite`)
- [X] T040 [P] [US1] Implement `tests/domain/recommendation-rules.test.ts` for REC-001–REC-007 conditions and FND-* emission. **Refs**: FR-021, FR-022, BR-005, AS-004 | **Evidence**: tests fail until T064 (`generateRecommendations`)
- [X] T041 [P] [US1] Implement `tests/domain/order-recommendations.test.ts` for priority → date → stable id (Sample B: REC-002 before REC-001). **Refs**: AS-040, AS-041, FR-034, BR-012, HD-08 | **Evidence**: tests fail until T065 (`orderRecommendations`)
- [X] T042 [P] [US1] Implement `tests/domain/findings.test.ts` for deterministic FND-* IDs. **Refs**: FR-021, recommendation-rules.md | **Evidence**: tests fail until T063 (`deriveFindings`)
- [X] T043 [P] [US1] Implement `tests/domain/determinism.test.ts` — identical inputs → deep-equal outputs (SC-002, AS-021). **Refs**: AS-021, FR-024, SC-002, BR-001 | **Evidence**: tests fail until T066 (`runEvaluation`)

### Tests — validation and normalization (write first)

- [X] T044 [P] [US1] Implement `tests/domain/project-validation.test.ts` for fixture schema violations and blocking rules. **Refs**: FR-038, BR-016, AS-050, AS-051 | **Evidence**: tests fail until T055 (`validateProject`)
- [X] T045 [P] [US1] Implement `tests/domain/signal-validation.test.ts` for signal payload and inclusion rules. **Refs**: FR-035, BR-013, AS-042, AS-043 | **Evidence**: tests fail until T056 (`validateSignal`)
- [X] T046 [P] [US1] Implement `tests/domain/normalization.test.ts` for methodology-neutral canonical mapping. **Refs**: FR-040, BR-002, BR-018, AS-060, AS-062 | **Evidence**: tests fail until T057 (`normalizeSignal`)

### Tests — fixtures and golden (write first)

- [X] T047 [P] [US1] Implement `tests/golden/sample-a.test.ts` expecting composite 94 Healthy per `contracts/golden-scenarios.md`. **Refs**: AS-003, FR-003, SC-006 | **Evidence**: fails until fixtures + pipeline (T066)
- [X] T048 [P] [US1] Implement `tests/golden/sample-b.test.ts` expecting composite 51, REC-001 + REC-002 ordered per HD-08. **Refs**: AS-001, AS-004, FR-004, SC-001, SC-006 | **Evidence**: fails until fixtures + pipeline (T066)
- [X] T049 [P] [US1] Implement `tests/golden/sample-c.test.ts` expecting 3/4 Measured, composite 86, REC-004-team. **Refs**: AS-005, FR-005, SC-006 | **Evidence**: fails until fixtures + pipeline (T066)

### Fixtures and mapping registry

- [X] T050 [P] [US1] Create `src/data/fixtures/mapping-registry.ts` with all `CanonicalSignalType` entries per `contracts/fixture-schema.md`. **Refs**: FR-040, BR-002, AS-060 | **Evidence**: registry keys documented
- [X] T051 [US1] Create `src/data/fixtures/sample-project-a.json` producing golden-scenarios.md canonical-type health values. **Refs**: FR-002, FR-003, golden-scenarios.md | **Evidence**: `tests/golden/sample-a.test.ts` fixture loads
- [X] T052 [US1] Create `src/data/fixtures/sample-project-b.json` with `snapshot.asOfDate` 2026-06-01, `slipDays` 8, `milestoneDueDate` 2026-06-11, urgent blocker per HD-08. **Refs**: FR-004, AS-001, AS-004, fixture-schema.md | **Evidence**: matches golden-scenarios.md §Sample B
- [X] T053 [US1] Create `src/data/fixtures/sample-project-c.json` with Team dimension 0% coverage. **Refs**: FR-005, AS-005, golden-scenarios.md | **Evidence**: matches golden-scenarios.md §Sample C
- [X] T054 [P] [US1] Create `src/data/fixtures/index.ts` exporting `SAMPLE_PROJECTS` (A/B/C only) and `MAPPING_REGISTRY`. **Refs**: FR-002, fixture-schema.md HD-04 | **Evidence**: static import, no fetch

### Domain — validation and normalization

- [X] T055 [US1] Implement `validateProject` in `src/domain/validation/validateProject.ts`. **Refs**: FR-038, BR-016, AS-050, AS-051 | **Evidence**: `tests/domain/project-validation.test.ts` passes
- [X] T056 [US1] Implement `validateSignal` in `src/domain/validation/validateSignal.ts`. **Refs**: FR-035, BR-013, AS-042, AS-043 | **Evidence**: `tests/domain/signal-validation.test.ts` passes
- [X] T057 [US1] Implement `normalizeSignal` in `src/domain/normalization/normalizeSignal.ts`. **Refs**: FR-040, BR-002, BR-018, AS-060 | **Evidence**: `tests/domain/normalization.test.ts` passes

### Domain — scoring (boundaries 6)

- [X] T058 [US1] Implement `mapSignalHealth` in `src/domain/scoring/signalHealth.ts` and create `src/domain/scoring/ruleCatalogs.ts` exposing approved static `DIMENSION_RULE_CATALOG` and `RULE_CATALOGS` (dimension + recommendation catalogs per `scoring-rules.md` and `recommendation-rules.md` — no new thresholds, weights, or rules). **Refs**: FR-020, BR-001, AS-061 | **Evidence**: `tests/domain/signal-health-mapping.test.ts` passes; `ruleCatalogs.ts` satisfies imports in `measurement-status.test.ts`, `dimension-scoring.test.ts`, `recommendation-rules.test.ts`, `evaluation-input.ts`
- [X] T059 [US1] Implement `aggregateCanonicalTypeHealth` in `src/domain/scoring/aggregateCanonicalTypeHealth.ts` per HD-07. **Refs**: FR-020, BR-001, AS-061, HD-07 | **Evidence**: `tests/domain/canonical-type-aggregation.test.ts` passes
- [X] T060 [US1] Implement `calculateDimension` in `src/domain/scoring/calculateDimension.ts` (status, raw, display, canonicalTypeHealth). **Refs**: AS-009–AS-011, FR-014–FR-019, BR-003, BR-004, BR-010 | **Evidence**: `tests/domain/dimension-scoring.test.ts`, `measurement-status.test.ts` pass
- [X] T061 [US1] Implement `calculateComposite` in `src/domain/scoring/calculateComposite.ts`. **Refs**: AS-012, AS-033–AS-039, FR-020, FR-031–FR-033, BR-009, BR-011 | **Evidence**: `tests/domain/composite.test.ts` passes

### Domain — findings, recommendations, evaluation (boundaries 7)

- [X] T062 [US1] Implement `assembleEvidence` in `src/domain/findings/assembleEvidence.ts` with provenance and inclusion flags. **Refs**: FR-013, FR-035, evaluation-pipeline.md | **Evidence**: evidence index populated in pipeline tests
- [X] T063 [US1] Implement `deriveFindings` in `src/domain/findings/deriveFindings.ts` per FND-* catalog. **Refs**: FR-021, recommendation-rules.md | **Evidence**: `tests/domain/findings.test.ts` passes
- [X] T064 [US1] Implement `generateRecommendations` in `src/domain/recommendations/generateRecommendations.ts` for REC-001–REC-007. **Refs**: FR-021, FR-022, BR-005, AS-004 | **Evidence**: `tests/domain/recommendation-rules.test.ts` passes
- [X] T065 [US1] Implement `orderRecommendations` in `src/domain/recommendations/orderRecommendations.ts`. **Refs**: AS-040, AS-041, FR-034, BR-012, HD-08 | **Evidence**: `tests/domain/order-recommendations.test.ts` passes
- [X] T066 [US1] Implement `runEvaluation` orchestrator in `src/domain/evaluation/runEvaluation.ts` per `contracts/evaluation-pipeline.md`. **Refs**: AS-001, FR-014, FR-020, FR-021, SC-002 | **Evidence**: `tests/domain/determinism.test.ts` passes; golden tests unblocked

### Golden validation

- [X] T067 [US1] Run and pass `npm run test:golden` (sample A, B, C). **Refs**: SC-006, golden-scenarios.md | **Evidence**: all golden tests green

### Session and features — P1 UI

- [X] T068 [US1] Extend `sessionReducer.ts` with SELECT_PROJECT (validateProject) and EVALUATE (runEvaluation + store result). **Refs**: AS-001, AS-002, FR-001, FR-002 | **Evidence**: evaluation stored in session
- [X] T069 [P] [US1] Create `src/features/project-select/ProjectSelector.tsx` + CSS listing Sample A/B/C only. **Refs**: FR-002, AS-002, fixture-schema.md HD-04 | **Evidence**: invalid fixture not listed
- [X] T070 [P] [US1] Create `src/features/health-dashboard/CompositeHealthCard.tsx` showing composite, coverage statement, StatusLabel. **Refs**: AS-037, AS-038, FR-015, FR-020 | **Evidence**: renders numeric composite for B
- [X] T071 [P] [US1] Create `src/features/health-dashboard/DimensionCard.tsx` for four dimensions with measurement status and score. **Refs**: AS-009, AS-013–AS-015, FR-015, FR-016 | **Evidence**: four cards for Sample B
- [X] T072 [P] [US1] Create `src/features/health-dashboard/SnapshotBanner.tsx` showing bundled as-of date. **Refs**: AS-042, FR-002 | **Evidence**: displays 2026-06-01 for Sample B
- [X] T073 [US1] Create `src/features/health-dashboard/EvaluateButton.tsx` disabled until valid project selected. **Refs**: AS-002, FR-001 | **Evidence**: AS-002 integration behaviour
- [X] T074 [P] [US1] Implement `tests/integration/recommendations.test.tsx` for AS-022 recommendation rendering with evidence refs, AS-023 valid no-recommendations empty state (Sample A), and FR-022 UI integration. **Refs**: AS-022, AS-023, FR-022 | **Evidence**: tests fail until T075 (`RecommendationsList`)
- [X] T075 [US1] Create `src/features/recommendations/RecommendationsList.tsx` + `RecommendationCard.tsx` with priority and evidence refs. **Refs**: AS-001, AS-022, FR-021, FR-022 | **Evidence**: `tests/integration/recommendations.test.tsx` passes; shows REC-002 then REC-001 for B
- [X] T076 [US1] Compose `src/features/health-dashboard/HealthDashboard.tsx` wiring cards, composite, recommendations. **Refs**: FR-001, FR-014, FR-021 | **Evidence**: dashboard renders after evaluate
- [X] T077 [US1] Integrate features into `src/app/App.tsx` (project select → evaluate → results). **Refs**: AS-001, FR-001, SC-001 | **Evidence**: manual P1 path works
- [X] T078 [US1] Implement `tests/integration/p1-journey.test.tsx` — select B, evaluate, assert 4 dimensions + composite + ≥2 recommendations. **Refs**: AS-001, AS-004, SC-001, FR-004 | **Evidence**: integration test passes
- [X] T079 [US1] Implement `tests/integration/project-select.test.tsx` for AS-002 no-project guard. **Refs**: AS-002, FR-001 | **Evidence**: test passes

**Checkpoint Phase 2 (US1)**: Leadership P1 demo path — Sample B → Evaluate → composite 51 At Risk → REC-002 then REC-001. Golden A/B/C pass.

---

## Phase 3: User Story 2 — Configure Signal Evidence (P2)

**Goal**: Integration checklist toggles signal groups; Partial/Unmeasured/insufficient composite visible.

**Independent Test**: Disable team group → re-evaluate → Partial or Unmeasured without imputed scores.

### Tests

- [X] T080 [P] [US2] Create `tests/integration/integration-checklist.test.tsx` covering AS-006 checklist groups, AS-007 enable/disable clears evaluation, AS-008 incomplete warning. **Refs**: AS-006, AS-007, AS-008, FR-011, FR-012, FR-013 | **Evidence**: tests fail until T084
- [X] T081 [P] [US2] Create `tests/integration/health-dashboard.test.tsx` covering AS-008–AS-010 dashboard states, Partial labels and “Excluded from Composite” (AS-010, AS-035). **Refs**: AS-008, AS-010, AS-035, AS-036, FR-032, BR-004, BR-010 | **Evidence**: tests fail until T086

### Implementation

- [X] T082 [US2] Extend `sessionReducer.ts` TOGGLE_SIGNAL_GROUP clearing evaluation and presentation. **Refs**: AS-007, FR-012, FR-013 | **Evidence**: add `TOGGLE_SIGNAL_GROUP` cases to `tests/session/session-reducer.test.ts` first (observed failing); cases pass after reducer implementation; `integration-checklist.test.tsx` passes after T084
- [X] T083 [P] [US2] Create `src/features/integration-checklist/IntegrationChecklist.tsx` with representative source labels (no live connectivity). **Refs**: AS-006, FR-011, AS-063 | **Evidence**: checklist renders groups
- [X] T084 [US2] Wire checklist to session `enabledSignalGroupIds` from fixture defaults. **Refs**: AS-007, FR-012 | **Evidence**: `integration-checklist.test.tsx` passes
- [X] T085 [US2] Update `DimensionCard.tsx` for Partial provisional labels and Unmeasured no-score states. **Refs**: AS-010, AS-011, FR-018, FR-019 | **Evidence**: visual states match ui-states.md
- [X] T086 [US2] Update `CompositeHealthCard.tsx` for insufficient coverage (AS-012) and “Based on X of 4” (AS-037). **Refs**: AS-012, AS-037, FR-033, BR-011 | **Evidence**: `health-dashboard.test.tsx` passes
- [X] T087 [US2] Show incomplete checklist warning state (AS-008) in `IntegrationChecklist.tsx`. **Refs**: AS-008, FR-011 | **Evidence**: warning when groups disabled

**Checkpoint Phase 3 (US2)**: Toggle delivery group off → re-evaluate B → affected dimension Partial/Unmeasured; composite eligibility updates.

---

## Phase 4: User Story 3 — Explain Results with Evidence (P3)

**Goal**: Dimension drilldown with mapping provenance and trend when supported.

**Independent Test**: Open dimension after evaluation → status, findings, evidence, explanation visible.

### Tests

- [X] T088 [P] [US3] Implement `tests/domain/mapping-equivalence.test.ts` for AS-060 cross-methodology same canonical type. **Refs**: AS-060, FR-040, BR-002, BR-018 | **Evidence**: fails until T092
- [X] T089 [P] [US3] Implement `tests/domain/trend.test.ts` for AS-017/AS-018 trend gating. **Refs**: AS-017, AS-018, FR-017 | **Evidence**: fails until T091
- [X] T090 [P] [US3] Implement `tests/integration/evidence-drilldown.test.tsx` for AS-016, AS-059, AS-063. **Refs**: AS-016, AS-059, AS-062, AS-063, FR-040 | **Evidence**: fails until T094

### Implementation

- [X] T091 [US3] Implement trend helper in `src/domain/scoring/trend.ts` (≥2 dated points). **Refs**: AS-017, AS-018, FR-017 | **Evidence**: `tests/domain/trend.test.ts` passes
- [X] T092 [US3] Add equivalent-mapping sample signals across fixtures for AS-060 demonstration. **Refs**: AS-060, FR-040, fixture-schema.md | **Evidence**: `mapping-equivalence.test.ts` passes
- [X] T093 [P] [US3] Create `src/features/dimension-detail/DimensionDetail.tsx` panel with measurement status, coverage, findings. **Refs**: AS-016, FR-015 | **Evidence**: opens from DimensionCard
- [X] T094 [US3] Create `src/features/dimension-detail/EvidenceDrilldown.tsx` showing provenance per UD-011. **Refs**: AS-059, AS-062, AS-063, FR-040 | **Evidence**: `evidence-drilldown.test.tsx` passes
- [X] T095 [US3] Wire dimension detail expand/collapse to session `expandedEvidenceIds`. **Refs**: AS-016, session-state.md | **Evidence**: UI state preserved in session

**Checkpoint Phase 4 (US3)**: After B evaluation, open Delivery dimension → blocker evidence with mapping provenance visible.

---

## Phase 5: User Story 4 — Adapt Coaching to Audience (P4)

**Goal**: Persona changes presentation only; analytical outputs invariant.

**Independent Test**: Evaluate B, switch Novice→Expert → scores and REC order unchanged.

### Tests

- [X] T096 [P] [US4] Implement `tests/domain/persona-projection.test.ts` for tier templates per FR-039. **Refs**: AS-055, AS-056, FR-009, FR-039, BR-006, BR-017 | **Evidence**: fails until T100 (`projectForPersona`)
- [X] T097 [P] [US4] Implement `tests/domain/persona-invariance.test.ts` — analytical fields identical across personas (SC-003). **Refs**: AS-020, AS-055, AS-058, FR-010, SC-003, BR-006 | **Evidence**: fails until T100 (`projectForPersona`)
- [X] T098 [P] [US4] Implement `tests/integration/persona-selector.test.tsx` for AS-044, AS-045. **Refs**: AS-044, AS-045, FR-008, FR-036 | **Evidence**: fails until T101
- [X] T099 [P] [US4] Implement `tests/integration/persona-coaching.test.tsx` for AS-056 depth tiers. **Refs**: AS-056, FR-023, FR-039 | **Evidence**: fails until T103

### Implementation

- [X] T100 [US4] Implement `projectForPersona` in `src/domain/persona/projectForPersona.ts` per persona coaching contract. **Refs**: AS-055–AS-058, FR-009, FR-010, FR-039, BR-006, BR-017 | **Evidence**: `persona-projection.test.ts` and `persona-invariance.test.ts` pass
- [X] T101 [P] [US4] Create `src/features/persona-selector/PersonaSelector.tsx` (Novice/Intermediate/Expert). **Refs**: FR-008, AS-044, AS-045 | **Evidence**: selector renders
- [X] T102 [US4] Wire SET_PERSONA to re-project presentation without re-running evaluation. **Refs**: AS-058, AS-020, FR-010, session-state.md | **Evidence**: `persona-invariance.test.ts` passes; `persona-coaching.test.tsx` pending T103
- [X] T103 [US4] Apply persona-projected copy in `RecommendationCard.tsx` and dimension explanations. **Refs**: AS-056, FR-023, FR-039 | **Evidence**: Novice expanded, Expert collapsed per ui-states.md; `persona-coaching.test.tsx` passes
- [X] T104 [US4] Implement Expert expand affordance for full evidence (AS-057). **Refs**: AS-057, FR-039 | **Evidence**: expanded sections reachable

**Checkpoint Phase 5 (US4)**: Evaluate B as Intermediate, switch to Expert — same scores, same REC-002→REC-001 order, coaching layout changes only.

---

## Phase 6: User Story 5 — Privacy-Safe Sessions (P5)

**Goal**: No persistence, no external requests, reset/reload clears session.

**Independent Test**: Full session → reset → empty state; reload → Intermediate default.

### Tests

- [X] T105 [P] [US5] Implement `tests/privacy/no-persistence.test.ts` mocking storage APIs (AS-025). **Refs**: AS-025, FR-006, FR-026, SC-004, BR-007 | **Evidence**: tests assert completed runtime behaviour (no storage API usage); pass after T113 privacy audit confirms no prohibited persistence
- [X] T106 [P] [US5] Implement `tests/privacy/no-network.test.ts` ensuring no fetch during evaluation (AS-024). **Refs**: AS-024, FR-025, SC-004 | **Evidence**: tests assert completed runtime behaviour (no fetch during evaluation); pass after T113 privacy audit confirms no network usage
- [X] T107 [P] [US5] Implement `tests/integration/reset-flow.test.tsx` for AS-026, AS-027, AS-048, AS-049. **Refs**: AS-026, AS-027, AS-048, AS-049, FR-007, BR-007 | **Evidence**: fails until T111 (`ResetButton` wiring)
- [X] T108 [P] [US5] Implement `tests/integration/reset-dialog.test.tsx` for AS-046, AS-047. **Refs**: AS-046, AS-047, FR-037, BR-015 | **Evidence**: tests fail until T109 (`ResetConfirmDialog`) and T110 (`CONFIRM_RESET`/`CANCEL_RESET` reducer); complete test passes only after both

### Implementation

- [X] T109 [US5] Create `src/features/reset-confirm/ResetConfirmDialog.tsx` using `Dialog` primitive (T027) with focus trap and Cancel default. **Refs**: AS-046, AS-047, FR-037, FR-028 | **Evidence**: component renders; focus management and Cancel default verified; `Dialog` integration works; full `reset-dialog.test.tsx` not yet complete (pending T110)
- [X] T110 [US5] Extend `sessionReducer.ts` with CONFIRM_RESET and CANCEL_RESET completing AS-046–AS-049 behaviour. **Refs**: AS-046–AS-049, FR-037, BR-015 | **Evidence**: `reset-dialog.test.tsx` and `session-reducer.test.ts` pass after reducer completion
- [X] T111 [US5] Create `src/features/reset-confirm/ResetButton.tsx` wiring REQUEST_RESET / CONFIRM_RESET. **Refs**: AS-026, AS-049, FR-007, FR-037 | **Evidence**: `reset-flow.test.tsx` passes
- [X] T112 [US5] Ensure page INIT on load always calls `createInitialSession()` (no restored state). **Refs**: AS-027, FR-007, SC-004 | **Evidence**: reload test in `reset-flow.test.tsx` passes
- [X] T113 [US5] Audit `src/` for `localStorage`, `sessionStorage`, `indexedDB`, `fetch` — none in runtime paths (negative-by-design; no enforcement wrapper code). **Refs**: FR-025, FR-026, BR-007, Constitution II | **Evidence**: `no-persistence.test.ts` and `no-network.test.ts` pass

**Checkpoint Phase 6 (US5)**: Complete B evaluation → Reset → confirm → empty session with Intermediate persona; privacy tests green.

---

## Phase 7: User Story 6 — Incomplete and Error Conditions (P6)

**Goal**: Invalid fixture blocked; error states; keyboard/a11y on primary flows.

**Independent Test**: Load invalid fixture via test path; keyboard-only P1 path usable.

### Tests

- [X] T114 [P] [US6] Implement `tests/golden/sample-invalid.test.ts` — evaluation blocked, no scores (golden-scenarios.md). **Refs**: AS-028, AS-050, AS-051, FR-038, BR-016 | **Evidence**: fails until T120–T121 (invalid fixture export and evaluation blocking)
- [X] T115 [P] [US6] Implement `tests/integration/invalid-project.test.tsx` for AS-053, AS-054 recovery. **Refs**: AS-053, AS-054, FR-038 | **Evidence**: fails until T122 (`InvalidSampleDataPanel` and recovery wiring)
- [X] T116 [P] [US6] Implement `tests/integration/evaluation-error.test.tsx` for AS-029. **Refs**: AS-029, FR-029 | **Evidence**: fails until T123 (`ErrorPanel`)
- [X] T117 [P] [US6] Implement `tests/a11y/keyboard-navigation.test.tsx` for AS-030 primary flows. **Refs**: AS-030, FR-028, SC-005 | **Evidence**: fails until T125 (keyboard/focus implementation)
- [X] T118 [P] [US6] Implement `tests/a11y/health-labels.test.tsx` for AS-019 non-colour health via StatusLabel and DimensionCard. **Refs**: AS-019, FR-027, SC-005 | **Evidence**: passes when T030 (`StatusLabel`) and T071 (`DimensionCard`) integrated in evaluated dashboard
- [X] T119 [P] [US6] Implement `tests/integration/responsive-layout.test.tsx` for AS-031. **Refs**: AS-031, FR-028 | **Evidence**: fails until T124 (`responsive-layout` implementation)

### Implementation

- [X] T120 [US6] Create `src/data/fixtures/sample-project-invalid.json` per fixture-schema (test-only, not in SAMPLE_PROJECTS). **Refs**: AS-050, AS-051, fixture-schema.md HD-04 | **Evidence**: `sample-invalid.test.ts` unblocked
- [X] T121 [US6] Export `INVALID_FIXTURES` from `src/data/fixtures/index.ts` for test/adverse path only. **Refs**: HD-04, fixture-schema.md | **Evidence**: `sample-invalid.test.ts` passes; not in ProjectSelector
- [X] T122 [US6] Create `src/features/invalid-project/InvalidSampleDataPanel.tsx` with validation category and recovery. **Refs**: AS-028, AS-053, AS-054, FR-038 | **Evidence**: `invalid-project.test.tsx` passes
- [X] T123 [US6] Create `src/features/health-dashboard/ErrorPanel.tsx` for AS-029 general errors. **Refs**: AS-029, FR-029 | **Evidence**: `evaluation-error.test.tsx` passes
- [X] T124 [US6] Implement responsive layout styles across `App.tsx`, `HealthDashboard.tsx`, and feature panels per AS-031 (supported viewport breakpoints). **Refs**: AS-031, FR-028 | **Evidence**: `responsive-layout.test.tsx` passes
- [X] T125 [US6] Add keyboard handlers and focus order across ProjectSelector, EvaluateButton, PersonaSelector, ResetButton. **Refs**: AS-030, FR-028 | **Evidence**: `keyboard-navigation.test.tsx` passes
- [X] T126 [US6] Configure `npm run test:a11y` with vitest-axe on StatusLabel, DimensionCard, Dialog. **Refs**: SC-005, FR-027 | **Evidence**: test:a11y passes
- [X] T127 [US6] Implement `tests/integration/ui-states.test.tsx` covering FR-029 explicit states table. **Refs**: AS-002, AS-008, AS-012, AS-023, FR-029 | **Evidence**: all listed states reachable

**Checkpoint Phase 7 (US6)**: Invalid fixture shows Invalid sample data panel; keyboard can complete P1; axe smoke passes.

---

## Phase 8: Privacy, Accessibility, Performance and Compliance Validation

**Purpose**: Final gates before leadership demo.

- [ ] T128 [P] Implement `tests/perf/evaluation-bench.test.ts` asserting evaluation <200ms on Sample B. **Refs**: plan.md Performance, FR-020 | **Evidence**: bench under threshold
- [ ] T129 Run full `npm test` suite — all unit, domain, golden, integration tests green. **Refs**: Constitution VII, SC-001–SC-006 | **Evidence**: exit code 0
- [ ] T130 Run `npm run test:a11y` and `npm run test:privacy` — all green. **Refs**: SC-004, SC-005, Constitution II, VIII | **Evidence**: exit code 0
- [ ] T131 Run `npm run typecheck` and `npm run build` — production build succeeds. **Refs**: Constitution VII | **Evidence**: `dist/` clean build
- [ ] T132 Run `npm audit` and verify dependency versions match ADR-001 manifest. **Refs**: HD-05, plan.md Quality Gates | **Evidence**: audit report archived
- [ ] T133 Cross-check `contracts/implementation-traceability.md` — confirm every FR-001–FR-040, BR-001–BR-018, AS-001–AS-063, SC-001–SC-006 has passing test evidence. **Refs**: Constitution I, FR-001–FR-040 | **Evidence**: traceability checklist completed
- [ ] T134 Execute constitution compliance checklist from `.specify/memory/constitution.md` Principles I–VIII against built app. **Refs**: Constitution I–VIII | **Evidence**: signed checklist in PR or demo packet
- [ ] T135 Re-run architecture gate CHK067–CHK125 from `checklists/architecture-plan-readiness.md` — confirm zero Fail. **Refs**: plan.md Constitution Check | **Evidence**: gate record updated
- [ ] T136 **Human**: Manual Microsoft Edge verification per `quickstart.md` on Windows corporate laptop. **Refs**: ADR-007, SC-005 | **Evidence**: signed Edge checklist (requires human)
- [ ] T137 **Human**: Leadership demo rehearsal using Sample Project B P1 path per `quickstart.md` Scenario 1. **Refs**: SC-001, plan.md Items Requiring Human Approval | **Evidence**: timed rehearsal ≤5 min (requires human sponsor)
- [ ] T138 Run `quickstart.md` quality gates table end-to-end and document results. **Refs**: quickstart.md | **Evidence**: gate log attached

**Checkpoint Phase 8**: All automated gates green; human Edge + demo rehearsal complete; traceability verified.

---

## Dependencies and Execution Order

### Phase dependencies

```text
Phase 0 → Phase 1 → Phase 2 (US1 MVP)
                      ↓
         Phase 3 (US2) → Phase 4 (US3) → Phase 5 (US4)
                      ↓
         Phase 6 (US5) ∥ Phase 7 (US6)  [after US1]
                      ↓
                  Phase 8
```

### Critical path

`T001` → `T003` → `T017`–`T022` → `T050`–`T054` → `T058`–`T066` → `T067` → `T068`–`T078` → `T129` → `T131`

Longest pole: **fixture authoring (T051–T053) + scoring pipeline (T058–T066) + P1 UI integration (T068–T078)**.

### User story dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 (P1) | Phase 1 | `p1-journey.test.tsx`, `sample-b.test.ts` |
| US2 (P2) | US1 evaluate path | `integration-checklist.test.tsx` |
| US3 (P3) | US1 evaluation results | `evidence-drilldown.test.tsx` |
| US4 (P4) | US1 evaluation results | `persona-invariance.test.ts` |
| US5 (P5) | Phase 1 session + Dialog (T027) | `reset-flow.test.tsx`, `no-persistence.test.ts` |
| US6 (P6) | US1 validation path | `sample-invalid.test.ts`, `keyboard-navigation.test.tsx` |

US5 reset UI starts after Phase 1; full demo needs US1. US6 invalid fixture tests can parallel US2–US4 after T055 (`validateProject`).

### Parallel opportunities

| Batch | Tasks | Notes |
|-------|-------|-------|
| Phase 0 scaffold | T006, T007, T008 | Different files; T008 does not depend on `main.tsx` |
| Phase 1 tests | T012–T016 | Write all before T020–T025 |
| Phase 1 types + UI primitives | T017–T019, T027–T031 | Independent modules; Dialog (T027) before US5 reset |
| US1 domain tests | T035–T046 | Write all tests before T055–T066 implementation |
| US1 golden tests | T047–T049 | Parallel test files |
| US1 UI components | T069–T072 | Different feature folders; after T068 |
| US3–US4 tests | T088–T090, T096–T099 | After US1 |
| US5–US6 tests | T105–T108, T114–T119 | After US1; not parallel with T109–T111 same-file reducer work |
| Phase 8 audits | T128, T133 | Parallel read-only |

**[P] tasks**: 64 (verified against file-conflict and test-first safety)

---

## Requirement Coverage Summary

| Set | Tasks referencing | Notes |
|-----|-------------------|-------|
| FR-001–FR-040 | T001–T138 | Full coverage via implementation-traceability.md |
| BR-001–BR-018 | T035–T066, T113, T133 | Rule catalog tests in US1 |
| AS-001–AS-063 | Per-phase checkpoints | Each AS mapped in traceability matrix |
| SC-001–SC-006 | T078, T067, T097, T113, T126, T129 | Success criteria in Phase 8 |

**Orphan requirements**: None identified — all FR/BR/AS/SC have mapped tasks per `implementation-traceability.md`.

**Orphan tasks**: None — each task references at least one FR/BR/AS or constitution gate.

---

## Human Approval Required

| Task | Approval | Owner |
|------|----------|-------|
| T136 | Microsoft Edge manual sign-off | Demo engineer |
| T137 | Leadership demo script rehearsal | Demo sponsor (plan.md open item) |

---

## Implementation Strategy

### MVP (recommended stop)

1. Complete Phase 0 + Phase 1  
2. Complete Phase 2 (US1) through **Checkpoint Phase 2**  
3. Run `npm run test:golden` and `p1-journey` — demo Sample B  

**MVP task range**: T001–T079 (79 tasks)

### Incremental delivery

Add US2 → US3 → US4 → US5 → US6 in priority order; run checkpoint after each phase.

### Parallel team split (post Phase 1)

- Dev A: US1 domain pipeline (T035–T046 tests, then T055–T066)  
- Dev B: US1 fixtures + UI (T050–T054, T069–T077)  
- Dev C: US5 privacy (after T068 session wiring; Dialog already in T027)

---

## Notes

- Do not use runtime generative AI — deterministic rules only (Constitution III).  
- Do not add backend, API, database, or authentication.  
- Invalid fixture remains test-only (HD-04).  
- All dates in rules use bundled `snapshot.asOfDate` — never `Date.now()` for business logic.  
- Golden fixture payloads MUST match `contracts/golden-scenarios.md` exactly.  
- Privacy is negative-by-design: no storage/network enforcement wrapper code — audit (T113) confirms absence.
