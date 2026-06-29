# Research: PM Copilot Local Demonstration

**Feature**: `001-pm-copilot-demo`  
**Date**: 2026-06-29  
**Phase**: 0 — Outline & Research

## Research Tasks

| Task | Outcome |
|------|---------|
| Validate React/Vite/TypeScript baseline compatibility | Supported with pinned target versions |
| Select memory-only session state approach | React Context + `useReducer` |
| Select test stack for domain + UI | Vitest + React Testing Library + user-event |
| Select styling approach | CSS Modules + global design tokens |
| Resolve floating `latest` dependency risk | ADR-001 explicit version pinning |
| Accessibility testing without browser CI complexity | `vitest-axe` in jsdom for component a11y smoke tests |
| Chart library necessity | Rejected — text, labels, and patterns suffice |

---

## ADR-001: Pin Supported Dependency Versions

**Decision**: Pin explicit supported versions for reproducible leadership demonstrations.

**Target versions** (implementation phase; `package.json` not modified during planning):

| Package | Supported version |
|---------|-------------------|
| react | 19.2.7 |
| react-dom | 19.2.7 |
| typescript | 6.0.3 |
| vite | 8.1.0 |
| @vitejs/plugin-react | 6.0.3 |
| @types/react | 19.x (match React 19) |
| @types/react-dom | 19.x (match React 19) |

**Proposed dev-only additions** (install during implementation, not planning):

| Package | Purpose |
|---------|---------|
| vitest | Unit and integration test runner (Vite-native) |
| @vitest/coverage-v8 | Optional coverage reporting |
| jsdom | DOM environment for component tests |
| @testing-library/react | Component rendering and queries |
| @testing-library/user-event | Keyboard and interaction simulation |
| @testing-library/jest-dom | DOM assertion matchers |
| vitest-axe | Automated axe checks in Vitest |

**Rationale**: The starter manifest uses floating `latest` tags. Leadership demos and CI gates require deterministic builds. Pinning is a documentation and implementation task, not a planning-time `package.json` change.

**Alternatives considered**:

- **Keep `latest`**: Rejected — non-reproducible across machines and dates.
- **npm overrides only**: Rejected — less visible than explicit pins in manifest.

---

## ADR-002: Session State — Context + useReducer

**Decision**: Use React Context with a single `useReducer` session store.

**Rationale**: Constitution Principle VI favours simplicity. Session state is bounded, synchronous, and memory-only. No middleware, persistence, or cross-tab sync is required.

**Alternatives considered**:

- **Redux / Zustand**: Rejected — additional dependency and indirection without constitutional justification.
- **Multiple Contexts**: Rejected for v1 — one reducer with typed actions is sufficient; split only if complexity tracking is triggered later.

---

## ADR-003: Domain Logic Isolation

**Decision**: All scoring, normalization, validation, findings, recommendations, and persona projection live in pure TypeScript modules under `src/domain/`. React components consume immutable evaluation results.

**Rationale**: Principles III, IV, V, VI, and VII require testable deterministic rules separated from presentation.

**Alternatives considered**:

- **Rules inside React hooks**: Rejected — harder to test and violates separation of concerns.

---

## ADR-004: Bundled Fixtures as Source of Truth

**Decision**: Sample Projects A–C and invalid fixture are TypeScript/JSON modules imported at build time. Golden expected outputs are derived from fixtures and stored as test snapshots or explicit expected-result objects.

**Rationale**: Local-only, no backend, deterministic demonstration. Fixtures encode methodology labels, mapping expectations, and snapshot dates required by Demonstration Policy v1.0.

**Alternatives considered**:

- **Runtime fetch of JSON**: Rejected — unnecessary network-like pattern; static import is simpler and bundler-friendly.

---

## ADR-005: Scoring Rules as Reviewable Catalog

**Decision**: Dimension scoring uses **Demonstration Rule Catalog v1.0** (APPROVED): equal-mean of required canonical signal health values. No baseline-75 or hidden weights. Documented in `contracts/scoring-rules.md`, `signal-health-mapping.md`, and `recommendation-rules.md`.

**Rationale**: Constitution III requires fully documented rules before implementation. Human architecture approval recorded 2026-06-29.

**Alternatives considered**:

- **Baseline-75 + weighted contributions**: Rejected — superseded by HD-01 approval.
- **ML / weighted ad hoc code**: Rejected — violates determinism and spec.
- **Single monolithic score function**: Rejected — not reviewable or traceable per signal type.

---

## ADR-008: Domain Folder Consolidation

**Decision**: Merge composite calculation under `src/domain/scoring/` and co-locate evidence assembly with findings under `src/domain/findings/`. Preserve separate pure functions and test files.

**Rationale**: Reduces boundary count (12 → 10) without merging test concerns or violating separation of pure functions.

**Alternatives considered**:

- **Separate `composite/` package**: Rejected — composite is scoring concern with shared utilities.
- **Evidence in normalization layer**: Rejected — evidence is finding input, not mapping output.

---

## ADR-006: Styling Without UI Framework

**Decision**: CSS Modules per feature component plus `src/styles/tokens.css` for design tokens. System font stack only. Inline SVG icons as React components.

**Rationale**: No remote assets; professional demo without adding MUI/Chakra/Tailwind dependency surface.

**Alternatives considered**:

- **Component library**: Rejected — unnecessary dependency; custom accessible components are bounded in scope.
- **Chart library**: Rejected — health communicated via text, labels, icons, patterns (FR-027); Complexity Tracking not required.

---

## ADR-007: Browser Target

**Decision**: Primary demonstration target is Microsoft Edge (Chromium) on Windows corporate laptops. Secondary: latest Chrome. Vitest/jsdom covers automated tests; manual Edge verification before leadership demo.

**Rationale**: User-specified enterprise demonstration target.

---

## Baseline Compatibility Validation

| Requirement | React 19.2.7 + Vite 8.1.0 + TS 6.0.3 | Notes |
|-------------|--------------------------------------|-------|
| SPA local dev server | ✅ | Existing `vite.config.ts` |
| Static JSON/TS fixture import | ✅ | Vite bundling |
| CSS Modules | ✅ | Vite built-in |
| Vitest integration | ✅ | Official Vite plugin pattern |
| No SSR / no API routes | ✅ | Aligns with constitution |
| Context + useReducer | ✅ | React 19 stable API |

**NEEDS CLARIFICATION**: None remaining — all technical context resolved.

---

## Performance Research (Demonstration Targets)

| Target | Approach |
|--------|----------|
| Evaluation < 200 ms | Pure synchronous pipeline on bounded fixtures (< 500 signals) |
| Interaction < 200 ms | Local reducer updates; no I/O |
| Usable < 2 s local preview | Vite dev server; minimal initial bundle; lazy-load invalid fixture only if needed |

These are demonstration targets, not production SLAs.
