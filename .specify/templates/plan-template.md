# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., TypeScript 5.x — or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., React, Vite — bundled locally; or NEEDS CLARIFICATION]

**Storage**: Browser memory only for active session; no persistent storage (per
Constitution Principle II)

**Testing**: [e.g., Vitest, React Testing Library — or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Modern desktop browser, local dev server — or NEEDS
CLARIFICATION]

**Project Type**: Local single-page React application (no backend, no external
services)

**Performance Goals**: [domain-specific, e.g., interactive UI responsiveness —
or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., no external runtime network requests,
memory-only session, bundled assets only — or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., single-user local demonstration — or
NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Reference: `.specify/memory/constitution.md` (PM Copilot v1.0.0)

| Principle | Gate Question | Pass Criteria |
|-----------|---------------|---------------|
| I. Specification-First | Does every planned capability map to spec requirements and acceptance scenarios? | Traceability matrix drafted; no orphan implementation |
| II. Local-Only Privacy | Does the plan enforce no external runtime network calls, no remote assets, and no persistence? | Memory-only session; no APIs/backend; dev-server bundled assets only; reset/reload clears state |
| III. Deterministic Decisions | Are scoring and recommendation rules documented with evidence exposure? | Rules documented; Unmeasured handling defined |
| IV. Methodology-Agnostic | Do core calculations use normalized project signals only? | No methodology logic in core health calculations |
| V. Persona-Safe Coaching | Do personas affect presentation only, not scores or priorities? | Cross-persona output parity confirmed in design |
| VI. Simplicity | Are business rules separated from UI? Are new dependencies justified? | Domain logic isolated; Complexity Tracking if needed |
| VII. Testability | Are automated tests planned for rules, journeys, and boundaries? | Test plan covers scoring, recommendations, critical paths |
| VIII. UX & Accessibility | Are non-colour health indicators and all system states designed? | Empty, partial, unmeasured, error states specified |

**Gate status**: [ ] PASS — proceed | [ ] FAIL — amend spec/plan or constitution first

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: During /speckit-plan, define the concrete source layout for
  this local React and TypeScript application. Do not assume backends, APIs,
  databases, or external services. Final folder structure is decided here, not
  in the constitution or templates.
-->

```text
# Local React application — concrete layout to be defined in plan output
[src/ — structure TBD during planning]
[tests/ — structure TBD during planning]
```

**Structure Decision**: [Document the selected local application structure when
planning completes. Reference only paths chosen for this feature.]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., additional dependency] | [current need] | [why minimal approach insufficient] |
| [e.g., extra abstraction layer] | [specific problem] | [why direct approach insufficient] |
