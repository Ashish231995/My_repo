# Implementation Plan: PM Copilot Local Demonstration

**Branch**: `001-pm-copilot-demo` | **Date**: 2026-06-29 | **Spec**: [spec.md](./spec.md)

**Input**: Approved specification and Demonstration Policy v1.0 (UD-001–UD-011 resolved).

**Planning scope**: Design artifacts only. No application implementation, no `tasks.md`, no dependency installation.

**Remediation** (2026-06-29): Architecture quality gate B-01–B-06 resolved; HD-07–HD-08 resolved (canonical aggregation; Sample B REC-002 golden). **Demonstration Rule Catalog v1.0 APPROVED**.

---

## Summary

PM Copilot is a **local, privacy-first React SPA** that transforms bundled fictional project signals into explainable four-dimensional health insight, a Composite Health Index, and prioritized Next Best Actions for DXC leadership demonstration.

**Technical approach**: Single Vite + React 19 + TypeScript 6 application with **pure TypeScript domain modules** for all deterministic logic, **React Context + useReducer** for memory-only session state, **CSS Modules + design tokens** for accessible UI, and **Vitest + React Testing Library** for verification. All Demonstration Policy v1.0 rules are implemented as documented rule catalogs and golden fixture tests — not runtime AI.

---

## Technical Context

| Item | Value |
|------|-------|
| **Language** | TypeScript 6.0.3 |
| **UI** | React 19.2.7, React DOM 19.2.7 |
| **Build** | Vite 8.1.0, @vitejs/plugin-react 6.0.3 |
| **Storage** | React memory only; no localStorage/IndexedDB/cookies |
| **Testing** | Vitest, React Testing Library, user-event, vitest-axe (proposed) |
| **Target platform** | Microsoft Edge (primary), Chromium desktop; local Vite preview |
| **Project type** | Local SPA — no backend, API, database, auth, cloud |
| **Performance** | Evaluation <200 ms; interaction <200 ms; usable <2 s (demo targets) |
| **Constraints** | No external runtime network; bundled assets only; deterministic rules; persona-safe |
| **Scale** | Single user; bounded fixtures; 4 dimensions; 3+1 sample projects |

See [research.md](./research.md) for ADRs and baseline validation.

---

## Constitution Check

*GATE: Completed before Phase 0 and re-validated after Phase 1 design.*

Reference: `.specify/memory/constitution.md` v1.0.0

| Principle | Gate question | Design response | Status |
|-----------|---------------|-----------------|--------|
| **I. Specification-first** | Every capability maps to FR/AS? | Full matrix: `contracts/implementation-traceability.md` (127 items) | ✅ PASS |
| **II. Local-only privacy** | No external runtime network, no persistence? | Memory-only session; static fixtures; privacy indicator; no storage APIs | ✅ PASS |
| **III. Deterministic** | Rules documented with evidence? | **Demonstration Rule Catalog v1.0 APPROVED**: scoring, health mapping, recommendations, golden scenarios | ✅ PASS |
| **IV. Methodology-agnostic** | Core uses normalized signals only? | Mapping layer separate; scoring on `CanonicalSignalType` + health mapping | ✅ PASS |
| **V. Persona-safe** | Presentation only? | `projectForPersona` projection; evaluation invariant | ✅ PASS |
| **VI. Simplicity** | Domain separated; deps justified? | Pure `src/domain/`; Context+reducer; folder consolidation (10 boundaries) | ✅ PASS |
| **VII. Testability** | Automated tests planned? | Layered test strategy + traceability matrix + quality gates | ✅ PASS |
| **VIII. UX & accessibility** | States designed; non-colour health? | ui-states contract; axe + manual checklist | ✅ PASS |

**Gate status**: ✅ **PASS** — post-remediation validation complete. Proceed to `/speckit-tasks` when approved.

### Post-design compliance report (remediated)

| Area | Evidence |
|------|----------|
| Traceability | `contracts/implementation-traceability.md` — FR-001–040, BR-001–018, AS-001–063, SC-001–006 |
| Rule catalog | `demonstration-rule-catalog.md` (APPROVED); `scoring-rules.md`, `signal-health-mapping.md`, `recommendation-rules.md` |
| Golden expectations | `golden-scenarios.md` (planning contract; fixtures remain implementation) |
| Privacy boundary | `session-state.md`; no persistence; reload = INIT |
| Methodology neutrality | `normalizeSignal` + mapping registry; drilldown provenance |
| Persona safety | `projectForPersona`; SET_PERSONA never calls evaluate |
| Simplicity | Composite under `scoring/`; evidence assembly under `findings/` |
| Testability | Domain, golden, integration, a11y, privacy test layers per traceability matrix |

---

## Architecture Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| ADR-001 | Pin dependency versions (see research.md) | Reproducible leadership demo |
| ADR-002 | Context + useReducer | Constitutional simplicity |
| ADR-003 | Pure domain modules | Testability + separation |
| ADR-004 | Static bundled fixtures | Local-only determinism |
| ADR-005 | Reviewable rule catalog (Demonstration Rule Catalog v1.0 APPROVED) | Equal-mean scoring; no baseline weights |
| ADR-008 | Folder consolidation | Composite under `scoring/`; evidence assembly under `findings/` |
| ADR-006 | CSS Modules + tokens | No remote assets / UI framework |
| ADR-007 | Edge primary browser | Enterprise demo target |

---

## Internal Architecture (10 boundaries)

| # | Boundary | Location |
|---|----------|----------|
| 1 | Application & session orchestration | `src/app/`, `src/session/` |
| 2 | Canonical domain model | `src/domain/model/` |
| 3 | Bundled sample-project data | `src/data/fixtures/` |
| 4 | Project & signal validation | `src/domain/validation/` |
| 5 | Methodology-neutral normalization | `src/domain/normalization/` |
| 6 | Dimension scoring **and composite** | `src/domain/scoring/` |
| 7 | Findings, **evidence assembly**, recommendations | `src/domain/findings/`, `src/domain/recommendations/` |
| 8 | Persona presentation projection | `src/domain/persona/` |
| 9 | React feature presentation | `src/features/` |
| 10 | Shared accessible UI | `src/ui/` |

Pure functions and tests remain separate within consolidated folders (`calculateComposite` in `scoring/`, `assembleEvidence` in `findings/`).

---

## Data Flow

See [contracts/evaluation-pipeline.md](./contracts/evaluation-pipeline.md).

```text
Fixture → validateProject → normalizeSignal → validateSignal → EvidenceItem
  → calculateDimension (×4) → calculateComposite → deriveFindings
  → generateRecommendations → orderRecommendations → EvaluationResult
  → projectForPersona → React UI
```

Temporal rules use `snapshot.asOfDate` only. Persona switches re-project only.

---

## Demonstration Policy v1.0 — Technical Mapping

| Policy | Technical implementation |
|--------|-------------------------|
| Health 0–100, half-up, bands | `roundHalfUp`, `classifyHealth` utilities |
| Equal weights + re-normalize | `calculateComposite` in `src/domain/scoring/` |
| Partial provisional + exclude | `calculateDimension` status + labels (HD-02) |
| Signal → health mapping | `signal-health-mapping.md` → `mapSignalHealth` |
| Canonical type aggregation | HD-07 in `scoring-rules.md` → `aggregateCanonicalTypeHealth` |
| Recommendation rules | `recommendation-rules.md` (REC-001–REC-007) |
| Min 2 Measured for composite | `CompositeHealthResult.eligible` |
| Urgent/Important/Advisory order | `orderRecommendations` |
| Snapshot-relative dates | `compareSnapshotDates(snapshot, due)` |
| Signal validity | `validateSignal` + evidence flags |
| Intermediate default persona | `createInitialSession` |
| Conditional reset | `REQUEST_RESET` + `ResetConfirmDialog` |
| Invalid vs missing evidence | `validateProject` vs Partial/Unmeasured |
| Persona contract | `projectForPersona` templates |
| Mapping provenance | `EvidenceItem.mapping` + drilldown UI |

---

## Project Structure

### Documentation

```text
specs/001-pm-copilot-demo/
├── spec.md
├── plan.md                 # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── README.md
│   ├── demonstration-rule-catalog.md   # APPROVED index
│   ├── domain-functions.md
│   ├── fixture-schema.md
│   ├── scoring-rules.md
│   ├── signal-health-mapping.md
│   ├── recommendation-rules.md
│   ├── golden-scenarios.md
│   ├── implementation-traceability.md
│   ├── evaluation-pipeline.md
│   ├── session-state.md
│   └── ui-states.md
└── tasks.md                # NOT created by /speckit-plan
```

### Source code (implementation phase)

```text
src/
├── app/
│   ├── App.tsx
│   ├── AppProviders.tsx
│   └── main.tsx
├── session/
│   ├── sessionContext.tsx
│   ├── sessionReducer.ts
│   ├── sessionActions.ts
│   └── initialSession.ts
├── domain/
│   ├── model/
│   ├── validation/
│   ├── normalization/
│   ├── scoring/              # dimension + composite + signal health mapping
│   ├── findings/             # findings + evidence assembly
│   ├── recommendations/
│   ├── persona/
│   ├── evaluation/
│   └── utils/
├── data/
│   └── fixtures/
├── features/
│   ├── project-select/
│   ├── integration-checklist/
│   ├── health-dashboard/
│   ├── dimension-detail/
│   ├── recommendations/
│   ├── reset-confirm/
│   └── invalid-project/
├── ui/
│   ├── Button/
│   ├── Card/
│   ├── Dialog/
│   ├── StatusLabel/
│   ├── PrivacyIndicator/
│   └── icons/
└── styles/
    ├── tokens.css
    └── global.css

tests/
├── domain/
├── golden/
├── integration/
├── perf/
└── privacy/
```

**Structure decision**: Feature-folder presentation + flat pure domain by capability. Aligns with constitution separation of concerns without excessive layering.

---

## Sample Data Strategy

| Fixture | Purpose | Key evidence |
|---------|---------|--------------|
| `sample-project-a` | Healthy (FR-003) | Strong schedule/delivery/team/risk signals |
| `sample-project-b` | At-risk + blocker + REC-001 + REC-002 (HD-08) | `delivery.blocker-open` urgent; `schedule.milestone-slip` slip 8d, due +10d |
| `sample-project-c` | Incomplete (FR-005) | Missing team group → Unmeasured |
| `sample-project-invalid` | Adverse (UD-009) | Malformed / invalid snapshot variant | **Test-only** — not in normal picker (HD-04) |

Each valid fixture includes snapshot date, representative source labels, mapping keys, and payloads per `signal-health-mapping.md`. Expected calculations: `contracts/golden-scenarios.md`. Runtime JSON/TS files are **implementation work**.

---

## State Management

See [contracts/session-state.md](./contracts/session-state.md).

- **Store**: `SessionState` in Context
- **Evaluation lifecycle**: `project-ready` → `EVALUATE` → `evaluated`
- **Persona**: `SET_PERSONA` re-projects only
- **Reset**: conditional confirmation per UD-008
- **No persistence** across reload

---

## UX & Component Architecture

See [contracts/ui-states.md](./contracts/ui-states.md).

- CSS Modules + `tokens.css`; system font stack
- Local SVG icons
- No chart library; no UI framework
- Health: text + icon + pattern (colour secondary only)
- Keyboard, focus trap, landmarks, responsive grid

---

## Testing Strategy

| Layer | Tool | Covers |
|-------|------|--------|
| Domain unit | Vitest | validate*, normalize*, calculate*, order*, projectForPersona |
| Golden | Vitest | Sample A/B/C expected outputs |
| Determinism | Vitest | SC-002 triple evaluation |
| Persona invariance | Vitest | SC-003 analytical equality |
| Mapping equivalence | Vitest | AS-060, AS-061 |
| Integration | RTL + user-event | Reset flows, checklist, dialog |
| Accessibility | vitest-axe + manual | SC-005, AS-030 |
| Privacy | Vitest + manual network | No storage APIs; SC-004 |
| Invalid recovery | RTL | AS-053, AS-054 |
| Performance smoke | Vitest bench | <200 ms evaluation |

### Traceability

Full matrix: [contracts/implementation-traceability.md](./contracts/implementation-traceability.md) — 127 requirements mapped to modules, test files, contracts, and phases (P0–P10).

**P0 first implementation task**: Pin dependencies per ADR-001 (`package.json` unchanged during planning).

---

## Quality Gates

| Gate | Command (post-implementation) | Constitution / Spec |
|------|-------------------------------|---------------------|
| Typecheck | `npm run typecheck` | VII |
| Unit + domain | `npm test` | VII, FR/BR coverage |
| Integration | `npm test -- tests/integration` | VIII |
| Accessibility | `npm run test:a11y` | FR-027, SC-005 |
| Build | `npm run build` | VII |
| Dependency pin review | Manual vs ADR-001 | II, VI |
| Constitution | Checklist in `checklists/architecture-plan-readiness.md` | I–VIII |
| Spec traceability | `contracts/implementation-traceability.md` vs tests | I |
| Rule catalog approval | `demonstration-rule-catalog.md` status APPROVED | III |
| Golden scenarios | `npm test -- tests/golden` vs `golden-scenarios.md` | III, SC-006 |

All gates must pass before feature completion per Constitution VII.

---

## Performance & Scale

| Target | Value |
|--------|-------|
| Evaluation latency | <200 ms (bundled fixtures, corporate laptop) |
| UI response | <200 ms (local reducer) |
| Time to usable | <2 s (Vite dev/preview) |
| Users | 1 |
| Data | <500 signals per fixture |

Demonstration targets only — not production SLAs.

---

## Dependencies

### Current (installed)

- react, react-dom, typescript, vite, @vitejs/plugin-react (floating `latest` — **pin during implementation**)

### Proposed (implementation phase only — NOT installed during planning)

- vitest, jsdom, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, vitest-axe

**Not proposed**: Redux, Zustand, MUI, Chart.js, axios, any AI SDK.

---

## Complexity Tracking

| Addition | Why needed | Simpler alternative rejected |
|----------|------------|------------------------------|
| vitest-axe | Automate constitution a11y checks in CI | Manual-only insufficient for VII |
| Mapping registry file | UD-011 provenance + equivalence | Hard-coded switches not reviewable |

No constitution violations requiring override.

---

## Risks, Assumptions & Trade-offs

| Item | Type | Mitigation |
|------|------|------------|
| Floating `latest` deps | Risk | ADR-001 pin before demo |
| Rule catalog drift vs fixtures | Risk | Golden tests gate changes |
| jsdom a11y ≠ real browser | Assumption | Manual Edge pass in quickstart |
| Rule catalog drift vs fixtures | Risk | Golden tests gate changes per `golden-scenarios.md` |
| Invalid fixture not in main picker | **Approved (HD-04)** | Test-only; optional labelled adverse path for demo |
| No i18n | Out of scope | English only per spec |

---

## Human Architecture Decisions (HD-01 – HD-08) — APPROVED

| ID | Decision | Recorded in |
|----|----------|-------------|
| HD-01 | Equal-mean dimension scoring; no baseline-75 formula | `scoring-rules.md`, `signal-health-mapping.md` |
| HD-02 | Measured=100%, Partial=0–100% exclusive, Unmeasured=0% | `scoring-rules.md`, `data-model.md` |
| HD-03 | Recommendation catalog REC-001–REC-007 with FND-* findings | `recommendation-rules.md` |
| HD-04 | Invalid fixture test-only; not in normal picker | `fixture-schema.md`, `golden-scenarios.md` |
| HD-05 | ADR-001 versions approved; pin as P0 first implementation task | `research.md` ADR-001 |
| HD-06 | Demonstration Rule Catalog v1.0 APPROVED; distinct from Policy v1.0 | `demonstration-rule-catalog.md` |
| HD-07 | Canonical type aggregation: mean within type, one contribution per type to dimension mean | `scoring-rules.md`, `signal-health-mapping.md`, `domain-functions.md` |
| HD-08 | Sample B golden: slip 8d, due +10d from snapshot; REC-001 + REC-002 mandatory | `golden-scenarios.md`, `fixture-schema.md`, `recommendation-rules.md` |

## Items Requiring Human Approval (remaining)

1. **Pinned dependency versions** in `package.json` (ADR-001) — approved versions documented; implementation applies pins (P0).
2. **Leadership demo script** alignment with Sample Project B P1 path.

**Scoring and recommendation rule decisions**: All closed (HD-01–HD-08). No open catalog decisions remain.

---

## Phase Completion

| Phase | Artifact | Status |
|-------|----------|--------|
| 0 Research | research.md | ✅ Complete |
| 1 Design | data-model.md, contracts/, quickstart.md | ✅ Complete (remediated) |
| 1 Agent context | .cursor/rules/specify-rules.mdc | ✅ Updated |
| 2 Tasks | tasks.md | ⏸ Not started (per user instruction) |
| Implementation | src/ | ⏸ Not started |

---

## Confirmation

- ✅ No application source code modified (planning docs only)
- ✅ No dependencies installed
- ✅ No `tasks.md` generated
- ✅ Implementation not begun
- ✅ Demonstration Policy v1.0 preserved — not weakened
- ✅ Demonstration Rule Catalog v1.0 APPROVED — not universal DXC standards
- ✅ Blocking issues B-01–B-06 resolved in planning artifacts
- ✅ HD-07 and HD-08 resolved (canonical aggregation; Sample B REC-002 golden)

**Suggested next command**: `/speckit-tasks` (when approved to proceed)
