# Contracts: PM Copilot Local Demonstration

**Feature**: `001-pm-copilot-demo`  
**Date**: 2026-06-29 (remediation)

This directory defines **internal TypeScript contracts** and **bundled fixture schemas** only. There are no HTTP APIs, OpenAPI specifications, or external service contracts.

| Document | Purpose |
|----------|---------|
| [demonstration-rule-catalog.md](./demonstration-rule-catalog.md) | **APPROVED** rule catalog governance index |
| [domain-functions.md](./domain-functions.md) | Pure function signatures and invariants |
| [fixture-schema.md](./fixture-schema.md) | Bundled sample project JSON/TS schema |
| [scoring-rules.md](./scoring-rules.md) | Dimension scoring model (equal-mean, no baseline) |
| [signal-health-mapping.md](./signal-health-mapping.md) | Canonical signal → 0–100 health mappings |
| [recommendation-rules.md](./recommendation-rules.md) | Finding and recommendation rule IDs |
| [golden-scenarios.md](./golden-scenarios.md) | Deterministic expected calculations (planning contract) |
| [implementation-traceability.md](./implementation-traceability.md) | FR/BR/AS/SC → module → test mapping |
| [evaluation-pipeline.md](./evaluation-pipeline.md) | End-to-end data flow and orchestration |
| [session-state.md](./session-state.md) | React session store shape and actions |
| [ui-states.md](./ui-states.md) | Required UX states and component contracts |

**Demonstration Policy v1.0** (behavioural) lives in `spec.md`. **Demonstration Rule Catalog v1.0** (deterministic calculations) is **APPROVED** in this directory. Neither represents universal DXC standards.
