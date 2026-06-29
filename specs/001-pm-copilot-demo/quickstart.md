# Quickstart: PM Copilot Local Demonstration

**Feature**: `001-pm-copilot-demo`  
**Date**: 2026-06-29

Validation guide for proving the feature works end-to-end after implementation. **Planning artifact only** — commands assume implementation tasks are complete.

**Related docs**: [plan.md](./plan.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/)

---

## Prerequisites

- Node.js LTS (20.x or 22.x recommended)
- Microsoft Edge or Chromium browser
- Repository dependencies installed with **pinned versions** per [research.md](./research.md) ADR-001

---

## Setup (implementation phase)

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`) in Edge.

**Privacy check**: With devtools Network tab open, complete a full evaluation. Confirm no external runtime requests (only localhost dev-server assets).

---

## Quality gates (must pass before feature complete)

| Gate | Command | Constitution / Spec |
|------|---------|---------------------|
| Type check | `npm run typecheck` | VII |
| Unit tests | `npm test` | VII, FR/BR coverage |
| Coverage (optional) | `npm run test:coverage` | VII |
| Component tests | `npm test -- tests/integration` | VIII |
| Accessibility | `npm run test:a11y` | FR-027, SC-005 |
| Production build | `npm run build` | VII |
| Dependency review | `npm audit` + manual pin verify | II, VI |
| Constitution checklist | Manual review per plan.md | I–VIII |
| Traceability | Matrix in `contracts/implementation-traceability.md` | I |

---

## Scenario 1 — P1 leadership path (SC-001, AS-001)

1. Start fresh session — confirm **Intermediate** persona active (AS-044).
2. Select **Sample Project B**.
3. Leave default enabled signals.
4. Run health evaluation.
5. **Expect**: Composite Health Index, four dimensions, ≥1 Recommended Next Best Action with evidence.
6. Complete within 5 minutes; no external network calls.

---

## Scenario 2 — Sample Project outcomes (SC-006)

Deterministic expected values: [contracts/golden-scenarios.md](./contracts/golden-scenarios.md).

| Project | Expect |
|---------|--------|
| A | Composite **94** Healthy; 4/4 Measured; no required recommendations |
| B | Composite **51** At Risk; REC-001 mandatory |
| C | Composite **86** Healthy; 3/4 Measured; REC-004-team mandatory |
| Invalid | Evaluation blocked; no scores or recommendations |

Run `npm test -- tests/golden` for automated golden validation (after fixture implementation).

---

## Scenario 3 — Signal configuration (AS-007, AS-008)

1. Select any valid project.
2. Disable a signal group affecting one dimension.
3. Re-evaluate.
4. **Expect**: Partial or Unmeasured on affected dimension; no imputed scores.

---

## Scenario 4 — Persona invariance (SC-003, AS-055–058)

1. Evaluate Sample Project B.
2. Record scores, classifications, recommendation IDs and order.
3. Switch Novice → Expert → Intermediate.
4. **Expect**: Analytical outputs identical; presentation elements differ per persona contract.
5. **Expect**: No re-fetch or loading indicator implying re-evaluation.

---

## Scenario 5 — Mapping provenance (AS-059–063)

1. Evaluate Sample Project B.
2. Open a dimension → evidence drilldown.
3. **Expect**: Representative source label, original term, canonical type, mapping status.
4. **Expect**: Labels do not imply live connectivity.
5. Run `npm test -- tests/domain/normalization` for equivalence and failure cases.

---

## Scenario 6 — Reset and privacy (SC-004, AS-026–027, AS-046–049)

1. Evaluate a project; change persona to Novice.
2. Click Reset → confirm dialog appears.
3. Cancel → session unchanged.
4. Reset again → Confirm → initial project selection; Intermediate default.
5. Reload page → same clean state; no restored Novice selection.

---

## Scenario 7 — Invalid data recovery (AS-028, AS-050–054)

1. Select invalid adverse fixture.
2. **Expect**: Invalid sample data state; evaluation blocked.
3. Use **Select another sample project** → evaluate Sample A successfully.
4. Or **Reset session** → clean initial state.

---

## Scenario 8 — Accessibility smoke (SC-005)

```bash
npm run test:a11y
```

Manual: keyboard-only pass through project select → evaluate → dimension drilldown → recommendations → reset cancel/confirm (AS-030).

---

## Scenario 9 — Determinism (SC-002)

```bash
npm test -- tests/domain/determinism
```

Same project + signal config evaluated three times → identical outputs.

---

## Scenario 10 — Performance smoke (demonstration targets)

```bash
npm test -- tests/perf/evaluation.perf.test.ts
```

**Expect**: Bundled evaluation completes <200 ms on CI runner (conservative threshold with margin).

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| Golden test mismatch | Fixture or rule catalog changed — update golden baselines deliberately |
| a11y failure | Missing accessible name or colour-only health label |
| External network request | Remote font/asset import — remove per constitution |

---

## Out of scope for quickstart

- Production deployment
- Live Jira/Azure DevOps/MS Project connectivity
- Task execution (`tasks.md` not generated in planning phase)
