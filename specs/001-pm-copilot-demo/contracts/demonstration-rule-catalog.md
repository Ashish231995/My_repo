# Demonstration Rule Catalog v1.0

**Status**: **APPROVED** (Architecture remediation — Session 2026-06-29)  
**Feature**: `001-pm-copilot-demo`  
**Approval**: Human architecture approval recorded in planning remediation prompt

## Governance

| Artifact | Scope | Status |
|----------|-------|--------|
| [Demonstration Policy v1.0](../spec.md) | Behavioural policy (UD-001–UD-011) | **Approved** in spec |
| **Demonstration Rule Catalog v1.0** (this catalog) | Deterministic scoring, health mapping, findings, recommendations | **Approved** |
| Runtime JSON/TS fixtures | Bundled sample data | **Implementation** (not part of this catalog) |

**Neither Demonstration Policy v1.0 nor Demonstration Rule Catalog v1.0 represents universal DXC organizational standards.** Both apply to the local leadership demonstration only.

## Catalog documents

| Document | Contents |
|----------|----------|
| [scoring-rules.md](./scoring-rules.md) | Dimension scoring model, coverage, status, composite |
| [signal-health-mapping.md](./signal-health-mapping.md) | Canonical signal → 0–100 health value mappings |
| [recommendation-rules.md](./recommendation-rules.md) | Finding and recommendation rule IDs (REC-*, FND-*) |
| [golden-scenarios.md](./golden-scenarios.md) | Deterministic expected outcomes (planning contract) |
| [implementation-traceability.md](./implementation-traceability.md) | FR/BR/AS/SC → module → test mapping |

## Relationship to Demonstration Policy v1.0

- **Policy** defines *what* must happen (thresholds, persona safety, privacy, ordering).
- **Rule catalog** defines *how* deterministic calculations and rule matching execute.
- Rule catalog MUST NOT weaken policy. Where policy specifies bands (Healthy 80–100), catalog implements them via `classifyHealth`.

## Change control

After golden baselines are frozen in implementation, any rule catalog change requires:

1. Updated golden expected results in `tests/golden/`
2. Architecture review
3. Catalog version bump (v1.1+)
