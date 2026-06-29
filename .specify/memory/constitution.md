<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.0 (pre-ratification template alignment; not yet committed)
- Modified principles: None (principles and governance language unchanged)
- Governance alignment: Unchanged
- Template alignment (this pass):
  - ✅ .specify/templates/plan-template.md (local React placeholder; removed backend/API/mobile/DB examples)
  - ✅ .specify/templates/spec-template.md (local-only assumptions and requirement examples)
  - ✅ .specify/templates/tasks-template.md (constitution-safe foundational and sample placeholders)
- Prior corrections retained in principles II and III (see constitution body)
- N/A .specify/templates/commands/*.md (directory does not exist)
- N/A README.md (no update required at Constitution stage)
- Follow-up TODOs: None
-->

# PM Copilot Constitution

PM Copilot is a local, privacy-first application demonstrating how Spec-Driven
Development and AI-assisted development can produce governed, traceable software.
This constitution defines non-negotiable principles and governance rules for all
specifications, plans, tasks, and implementation work on the project.

## Core Principles

### I. Specification-First Development

Every implemented capability MUST trace to an approved requirement and at least one
acceptance scenario documented in the active feature specification. Requirement
changes MUST update the specification and acceptance scenarios before
implementation begins or continues.

**Rationale**: Governed software requires an auditable link from behavior to
intent. Implementation without an approved specification creates untraceable
drift.

**Verification**: For each delivered capability, produce a traceability matrix
mapping requirement IDs and acceptance scenarios to implementation and tests.
Reject pull requests or task completion when any capability lacks a documented
requirement and scenario reference.

### II. Local-Only Privacy and Zero Retention

The application MUST make no external network requests at runtime. Local
development-server requests for bundled application assets are permitted. The
application MUST operate without external APIs or backend services. Remote fonts,
remote assets, analytics, and telemetry are prohibited. Project information MUST
remain in browser memory only for the active session. Project information MUST NOT
be stored in localStorage, IndexedDB, cookies, analytics, telemetry, or
application logs. Reset or full page reload MUST clear all session information
with no recoverable project data.

**Rationale**: PM Copilot demonstrates privacy-first design for enterprise
leadership. Persistent storage, external data transmission, or third-party
observability violates the project's trust model and undermines the local-only
architectural boundary.

**Verification**: Automated and manual privacy audits MUST confirm no external
network requests at runtime (excluding local development-server delivery of
bundled assets), absence of storage APIs, no remote fonts or assets, and no log
statements containing project data. Session-reset and reload tests MUST confirm
memory is cleared and no prior project state is restored.

### III. Deterministic and Explainable Decisions

Health scores and recommendations MUST be generated using documented,
deterministic rules. Every score and recommendation MUST expose its supporting
evidence. Missing evidence MUST be marked **Unmeasured** and MUST NOT be guessed,
imputed, or inferred without explicit user-supplied input.

**Rationale**: Coaching value depends on trust. Opaque or fabricated scores
undermine explainability and auditability.

**Verification**: Rule documentation MUST exist for each score and
recommendation type. Unit tests MUST assert identical inputs produce identical
outputs. User-facing surfaces MUST display evidence references or an explicit
Unmeasured state. Tests MUST fail when evidence is absent but a score is still
produced.

### IV. Methodology-Agnostic Design

Core health calculations MUST NOT depend directly on Scrum, Waterfall, SAFe, or
any other named delivery methodology. Methodology-specific terminology MUST map
to a common project-signal model before participating in health calculations or
recommendations.

**Rationale**: PM Copilot serves practitioners across delivery approaches. Core
logic tied to one methodology limits reuse and fairness.

**Verification**: Architecture and specification reviews MUST confirm health
calculations consume only normalized project signals. Methodology adapters MUST
be identifiable as mapping layers, not embedded in core calculation logic.
Tests MUST use methodology-neutral signal fixtures.

### V. Persona-Safe Coaching

Novice, Intermediate, and Expert modes MAY change explanation depth, tone, and
presentation of supporting detail. Persona selection MUST NOT change underlying
project health values, recommendation severity, priority ordering, or which
recommendations are produced.

**Rationale**: Coaching adapts to audience without altering analytical truth.

**Verification**: Cross-persona tests MUST assert identical health scores,
severity levels, and recommendation sets for the same project input. Only
presentation-layer outputs (wording, detail level) MAY differ. Any divergence in
core outputs is a constitution violation.

### VI. Simplicity and Separation of Concerns

Business rules MUST remain separate from presentation components. The project
SHOULD prefer pure TypeScript functions and small React components.
Unnecessary dependencies and architectural layers MUST be avoided unless
explicitly justified in a plan's Complexity Tracking table.

**Rationale**: Clear separation improves testability, maintainability, and
alignment with spec-driven workflows.

**Verification**: Code review MUST confirm domain logic lives outside UI
components. New dependencies MUST cite necessity in plan or specification.
Complexity Tracking entries MUST exist for any added layer or dependency that
introduces indirection beyond the minimal structure required by the approved
plan.

### VII. Testability and Quality

Scoring logic, composite calculations, and recommendation rules MUST have
automated tests. Critical user journeys and boundary conditions MUST be tested.
Type checking, automated tests, and build validation MUST pass before a feature
or change is considered complete.

**Rationale**: Deterministic rules and privacy guarantees require repeatable
verification, not manual spot checks alone.

**Verification**: CI or pre-completion checks MUST run type checking, tests, and
build. Coverage reviews MUST confirm tests exist for every scoring and
recommendation rule, plus critical journeys and boundary cases defined in the
active specification. Completion is blocked when any gate fails.

### VIII. User Experience and Accessibility

Health status MUST NOT be represented using colour alone; text, icons, patterns,
or labels MUST convey meaning accessibly. The interface MUST support keyboard
navigation and responsive layouts across supported viewport sizes. Empty,
partial, unmeasured, and error states MUST be explicitly designed and tested —
not treated as incidental UI gaps.

**Rationale**: Accessible, resilient UX ensures coaching is usable under real
project conditions, including incomplete data.

**Verification**: Accessibility checks MUST confirm non-colour-only health
indicators and keyboard operability for primary flows. Visual and interaction
tests MUST cover empty, partial, unmeasured, and error states. Specifications
MUST define expected behavior for each state before implementation.

## Governance

### Constitutional Authority

This constitution is the highest governing document for PM Copilot. Feature
specifications, implementation plans, task lists, and code MUST comply with these
principles. Where conflict exists, the constitution prevails until formally
amended.

### Amendment Procedure

1. Propose the amendment with rationale, affected principles, and version bump
   classification (MAJOR, MINOR, or PATCH per semantic versioning below).
2. Update `.specify/memory/constitution.md` with the revised text and Sync
   Impact Report.
3. Propagate required changes to dependent templates and active specifications.
4. Record ratification approval and set `LAST_AMENDED_DATE` to the amendment
   date.

Material changes to privacy, determinism, or specification-first rules MUST use a
MAJOR version bump.

### Compliance Review Before Implementation

Every implementation plan MUST include a Constitution Check section completed
before Phase 0 research and re-validated after Phase 1 design. Every task batch
and pull request MUST verify:

- Traceability to approved requirements and acceptance scenarios
- No external runtime network requests (dev-server bundled assets permitted),
  prohibited persistence, remote assets, analytics, or telemetry
- Deterministic, evidence-backed scoring with Unmeasured handling
- Methodology-agnostic core logic and persona-safe presentation
- Separation of business rules from UI
- Required automated tests and passing quality gates
- Designed and tested accessibility and system states

Work MUST NOT proceed past planning when a constitution gate fails unless an
approved amendment or documented Complexity Tracking justification exists.

### Versioning and Ratification

Constitution versions follow semantic versioning:

- **MAJOR**: Backward-incompatible removal or redefinition of principles or
  governance rules
- **MINOR**: New principle or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-29
