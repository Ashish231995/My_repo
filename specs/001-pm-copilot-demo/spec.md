# Feature Specification: PM Copilot Local Demonstration

**Feature Branch**: `001-pm-copilot-demo`

**Created**: 2026-06-29

**Status**: Draft (pre-clarification quality revision)

**Input**: Enterprise demonstration of PM Copilot — transforming distributed project
signals into explainable health indicators and prioritized Next Best Actions for
IT Project Managers, using bundled local sample data and an integration checklist.

**Constitution**: Compliant with `.specify/memory/constitution.md` (PM Copilot
v1.0.0). Constitutional constraints apply throughout; this specification defines
business and functional behaviour only.

## Purpose and Business Context

IT Project Managers rely on systems of record (for example Jira, Azure DevOps, MS
Project) to record delivery activity. Those tools do not provide active,
explainable guidance on project health or what to do next.

PM Copilot demonstrates how project signals can become:

- Explainable health indicators across four dimensions
- A Composite Health Index with transparent coverage
- Prioritized Recommended Next Best Actions (NBA) with supporting evidence

This demonstration uses bundled local sample data and an integration checklist in
place of live enterprise integrations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Achieve Explainable Health Coaching (Priority: P1)

As an IT Project Manager, I want to select a bundled sample project, evaluate its
health using default enabled signals, and receive dimensional health insight plus
at least one explainable Next Best Action when findings support it — so that I can
demonstrate PM Copilot's core value without enterprise integration.

**Why this priority**: This is the minimum end-to-end outcome leadership must see:
from sample project to explainable health and actionable coaching.

**Independent Test**: Select any sample project that includes default enabled
signals, run health evaluation once, and confirm four dimensions, Composite
Health Index, and at least one NBA with supporting evidence appear without
configuring signals or changing persona.

**Acceptance Scenarios**:

- **AS-001** — **Given** a new local session, **When** the user selects a bundled
  sample project with its default enabled signals and requests health evaluation,
  **Then** the application presents the Composite Health Index, four health
  dimensions (Schedule Health; Delivery and Scope; Team and Communications; Risk
  and Governance), and at least one Recommended Next Best Action when findings
  support recommendations.
- **AS-002** — **Given** a new local session with no project selected, **When**
  the user attempts to evaluate health, **Then** the application guides the user
  to select a project first and does not present evaluation results.
- **AS-003** — **Given** Sample Project A with default enabled signals, **When**
  health is evaluated, **Then** the overall and dimensional results reflect a
  generally healthy project scenario.
- **AS-004** — **Given** Sample Project B with default enabled signals, **When**
  health is evaluated, **Then** results reflect an at-risk or critical project
  with a significant delivery blocker visible in findings or recommendations.
- **AS-005** — **Given** Sample Project C with default enabled signals, **When**
  health is evaluated, **Then** at least one dimension shows Unmeasured status
  and the composite reflects exclusion of that dimension from numeric contribution.

---

### User Story 2 - Configure Signal Evidence (Priority: P2)

As an IT Project Manager, I want to review the integration checklist and change
which signal groups are enabled so that I can demonstrate how evidence selection
affects Measured, Partial, and Unmeasured outcomes.

**Why this priority**: Signal configuration is the primary lever for
demonstrating coverage, partial measurement, and governance of evidence — beyond
the default P1 path.

**Independent Test**: Select a project, disable a signal group that affects one
dimension, re-evaluate, and observe Partial or Unmeasured behaviour without
imputed scores.

**Acceptance Scenarios**:

- **AS-006** — **Given** an active sample project, **When** the user opens the
  integration checklist, **Then** available signal groups are shown as
  representative integration sources without implying live enterprise
  connectivity.
- **AS-007** — **Given** the integration checklist, **When** the user enables or
  disables a signal group, **Then** subsequent health evaluation uses only
  enabled groups with valid evidence for the active project.
- **AS-008** — **Given** an active project with required signal groups still
  disabled or incomplete, **When** the user requests health evaluation, **Then**
  the application shows an incomplete integration checklist state and affected
  dimensions reflect Partial or Unmeasured status rather than assumed full
  measurement.
- **AS-009** — **Given** a dimension with sufficient enabled valid evidence,
  **When** health is evaluated, **Then** that dimension shows Measured status
  with health score, coverage, classification, findings, evidence used, and
  explanation.
- **AS-010** — **Given** a dimension with incomplete enabled evidence, **When**
  health is evaluated, **Then** that dimension shows Partial status and is not
  presented as fully Measured.
- **AS-011** — **Given** a dimension with no valid enabled evidence, **When**
  health is evaluated, **Then** that dimension shows Unmeasured status and does
  not assign a numeric score or imputed value.
- **AS-012** — **Given** an evaluation where eligible dimensions are insufficient
  for composite presentation per approved coverage rules, **When** the user views
  the Composite Health Index, **Then** the application shows insufficient
  composite coverage and does not imply confidence beyond available evidence.
- **AS-013** — **Given** evaluated results classified as Healthy under approved
  rules, **When** the user reviews health output, **Then** Healthy classification
  is communicated with non-colour-only indicators.
- **AS-014** — **Given** evaluated results classified as At Risk under approved
  rules, **When** the user reviews health output, **Then** At Risk classification
  is communicated with non-colour-only indicators.
- **AS-015** — **Given** evaluated results classified as Critical under approved
  rules, **When** the user reviews health output, **Then** Critical classification
  is communicated with non-colour-only indicators.

---

### User Story 3 - Explain Results with Evidence (Priority: P3)

As an IT Project Manager, I want to drill into a health dimension and inspect
findings and evidence so that I can explain results to stakeholders with
traceable support.

**Why this priority**: Explainability separates PM Copilot from opaque dashboards
and supports the governance narrative for leadership.

**Independent Test**: After evaluation, open any dimension and verify measurement
status, findings, evidence, explanation, and trend behaviour (when applicable)
without relying on colour alone.

**Acceptance Scenarios**:

- **AS-016** — **Given** a completed health evaluation, **When** the user selects
  a dimension, **Then** the application shows measurement status, coverage,
  classification, findings, evidence used, and how the result was reached.
- **AS-017** — **Given** a dimension where trend is supported by available
  evidence, **When** the user reviews that dimension, **Then** trend is shown with
  supporting evidence.
- **AS-018** — **Given** a dimension where trend is not supported by available
  evidence, **When** the user reviews that dimension, **Then** trend is not
  presented as if evidence existed.
- **AS-019** — **Given** any displayed health classification or measurement
  status, **When** the user reviews the presentation, **Then** meaning is conveyed
  by text, labels, icons, or patterns and not by colour alone.

---

### User Story 4 - Adapt Coaching to Audience (Priority: P4)

As an IT Project Manager, I want to select and change experience level (Novice,
Intermediate, Expert) so that coaching detail matches my audience without changing
analytical truth.

**Why this priority**: Persona-safe coaching is a distinct business capability that
must be demonstrable independently from signal configuration or evidence drilldown.

**Independent Test**: Complete an evaluation, change persona, and confirm health
scores, classifications, composite results, recommendation set, severities, and
priority order are unchanged while coaching explanation depth changes.

**Acceptance Scenarios**:

- **AS-020** — **Given** a completed health evaluation, **When** the user changes
  persona among Novice, Intermediate, and Expert, **Then** health scores,
  dimension classifications, composite results, recommendation severities,
  priority order, and which recommendations appear remain unchanged while coaching
  explanation depth changes.
- **AS-021** — **Given** identical project, signal configuration, and persona,
  **When** health is evaluated twice in the same session, **Then** recommendations,
  severities, and priority order are identical.
- **AS-022** — **Given** a completed evaluation with actionable findings, **When**
  the user opens recommendations, **Then** each item includes priority or
  severity, recommended action, reason generated, supporting finding or evidence,
  relevant health dimension, and suggested timing or urgency when supported.
- **AS-023** — **Given** an evaluation state that produces no actionable
  recommendations, **When** the user opens recommendations, **Then** the
  application states that no recommendations are available and explains why.

---

### User Story 5 - Demonstrate Privacy-Safe Sessions (Priority: P5)

As an IT Project Manager, I want assurance that the demonstration runs locally with
no retained project data so that I can present PM Copilot to leadership without
privacy risk.

**Why this priority**: Local-only privacy is a constitutional and enterprise trust
requirement that must be independently demonstrable.

**Independent Test**: Complete a full evaluation, verify no external runtime
requests occur during the session, reset or reload, and confirm no session data
is recoverable.

**Acceptance Scenarios**:

- **AS-024** — **Given** an active demonstration session, **When** the user
  performs primary flows through project selection, evaluation, and
  recommendations, **Then** the application makes no external runtime network
  requests.
- **AS-025** — **Given** an active session with project data in memory, **When**
  the session operates through evaluation and recommendations, **Then** project
  information is not stored in persistent client storage, analytics, telemetry,
  or application logs.
- **AS-026** — **Given** an active session with project selection, signal
  configuration, evaluation results, and persona recorded, **When** the user
  explicitly resets the session, **Then** all session information is cleared and
  the user returns to an initial session state.
- **AS-027** — **Given** a session that previously held project and evaluation
  data, **When** the user performs a full page reload, **Then** no prior project
  selection, signal configuration, evaluation results, or persona choice is
  restored.

---

### User Story 6 - Handle Incomplete and Error Conditions (Priority: P6)

As an IT Project Manager, I want clear outcomes when data is invalid or evaluation
cannot complete so that the demonstration remains trustworthy under adverse
conditions.

**Why this priority**: Resilient handling of incomplete and error states supports
accessibility, credibility, and constitution-required explicit system states.

**Independent Test**: Trigger invalid sample data and a general evaluation error
scenario; confirm recovery messaging and keyboard/responsive usability on primary
flows.

**Acceptance Scenarios**:

- **AS-028** — **Given** bundled sample project data that is invalid or empty for
  the selected project, **When** the user attempts to load or evaluate that
  project, **Then** the application shows an invalid sample data state with
  recovery guidance and does not present fabricated health results.
- **AS-029** — **Given** inputs that cause health evaluation to fail, **When** the
  user requests evaluation, **Then** the application shows a general error state
  with a user-understandable message and a path to retry or return to a safe
  session state.
- **AS-030** — **Given** a user operating by keyboard only, **When** they
  complete the primary flows of project selection, health evaluation, dimension
  review, and recommendations, **Then** all required actions and information are
  reachable without pointer input.
- **AS-031** — **Given** supported viewport categories from narrow to wide layouts,
  **When** the user completes primary flows, **Then** health, evidence, and
  recommendations remain readable and operable without loss of required
  information.

---

## Requirements *(mandatory)*

### Functional Requirements

**Session and sample projects**

- **FR-001**: The application MUST allow the user to start a new local PM
  Copilot session with no dependency on external systems of record.
- **FR-002**: The application MUST offer at least three bundled sample projects
  selectable in a single session.
- **FR-003**: Sample Project A MUST represent a generally healthy project
  scenario for demonstration purposes.
- **FR-004**: Sample Project B MUST represent an at-risk or critical project
  with a significant delivery blocker.
- **FR-005**: Sample Project C MUST represent an incomplete project containing
  at least one Unmeasured dimension when evaluated with default signal
  configuration for that scenario.
- **FR-006**: The application MUST keep all active session information in memory
  only for the duration of the session.
- **FR-007**: The application MUST clear all session information on explicit
  reset or full page reload.

**Persona and coaching**

- **FR-008**: The application MUST support Novice, Intermediate, and Expert
  experience levels.
- **FR-009**: Persona selection MUST affect coaching explanation depth and
  presentation only.
- **FR-010**: Persona selection MUST NOT change health scores, dimension
  classifications, composite results, recommendation severities, priority order,
  or which recommendations are produced.

**Integration checklist and signals**

- **FR-011**: The application MUST present an integration checklist representing
  available project signal groups without live enterprise integration.
- **FR-012**: The user MUST be able to enable or disable available signal groups
  for the active session.
- **FR-013**: Health evaluation MUST consider only enabled signal groups with
  valid evidence for the active sample project.

**Measurement and health dimensions**

- **FR-014**: The application MUST evaluate four health dimensions: Schedule
  Health; Delivery and Scope; Team and Communications; Risk and Governance.
- **FR-015**: Each dimension MUST communicate measurement status, coverage,
  health classification, findings, evidence used, and an explanation of how the
  result was reached.
- **FR-016**: Each dimension MUST communicate a health score only when status is
  Measured or otherwise eligible per approved partial-measurement rules.
- **FR-017**: Each dimension MUST communicate trend only when supported by
  available evidence.
- **FR-018**: The application MUST distinguish Measured, Partial, and Unmeasured
  states according to available enabled evidence.
- **FR-019**: Missing evidence MUST NOT be converted into a zero score, estimated
  score, or implied measurement.
- **FR-020**: The Composite Health Index MUST include only eligible contributing
  dimensions, exclude Unmeasured dimensions, show how many dimensions contributed,
  show overall evidence coverage, and avoid implying confidence beyond available
  coverage.

**Recommendations**

- **FR-021**: The application MUST produce Recommended Next Best Actions derived
  deterministically from evaluated health results and enabled evidence.
- **FR-022**: Each recommendation MUST include priority or severity, recommended
  action, reason generated, supporting finding or evidence, relevant health
  dimension, and suggested timing or urgency when supported.
- **FR-023**: Each recommendation MUST present persona-appropriate coaching detail
  without altering underlying recommendation content.
- **FR-024**: Identical project, signal configuration, and evaluation inputs MUST
  produce identical recommendations, severities, and priority order.

**Privacy and local operation**

- **FR-025**: The application MUST make no external runtime network requests.
- **FR-026**: The application MUST NOT use backends, external services,
  persistent project-data storage, analytics, telemetry, or remote assets for
  project information.

**Accessibility and required UX states**

- **FR-027**: Health status MUST NOT be communicated by colour alone; text,
  labels, icons, or patterns MUST convey meaning accessibly.
- **FR-028**: Primary user flows MUST be operable via keyboard navigation and
  usable across responsive layouts at supported viewport categories.
- **FR-029**: The application MUST provide explicit user-visible outcomes for:
  initial project selection; no project selected; integration checklist incomplete;
  Measured dimension; Partial dimension; Unmeasured dimension; insufficient
  composite coverage; Healthy, At Risk, and Critical classifications; no
  recommendations; invalid sample data; session reset; and general error state.

### Business Rules

- **BR-001**: Health scores and recommendations MUST be produced by documented,
  deterministic rules applied to normalized project signals.
- **BR-002**: Methodology-specific terminology from sample sources MUST map to a
  common project-signal model before participating in health calculations.
- **BR-003**: Unmeasured dimensions MUST NOT contribute numeric value to the
  Composite Health Index.
- **BR-004**: Partial dimensions MUST NOT be presented as fully Measured.
- **BR-005**: Recommendations MUST trace to at least one finding or evidence item
  and at least one health dimension.
- **BR-006**: Coaching narrative MAY expand or simplify by persona; analytical
  outputs MUST remain invariant across personas for the same inputs.
- **BR-007**: Session reset MUST remove active project, persona, signal
  configuration, evaluation results, and recommendations from memory.

### Key Entities

- **Session**: Active local demonstration context; holds selected project,
  persona, signal configuration, and evaluation outputs in memory only.
- **Sample Project**: Bundled demonstration scenario with predefined signal
  context representing healthy, at-risk, or incomplete conditions.
- **Integration Checklist**: Session-scoped list of signal groups representing
  integration sources; groups may be enabled or disabled.
- **Signal Group**: A logical bundle of project signals mapped to methodology-
  neutral inputs for health evaluation.
- **Project Signal**: A normalized unit of evidence about schedule, delivery,
  team, risk, or governance conditions.
- **Health Dimension**: One of four evaluated perspectives on project health.
- **Dimension Result**: Measurement status, optional score, coverage,
  classification, trend, findings, evidence, and explanation for one dimension.
- **Composite Health Index**: Aggregated session result using only eligible
  dimensions with stated contribution count and coverage.
- **Finding**: An evaluated condition derived from evidence that supports health
  classification or recommendations.
- **Evidence Item**: A traceable input used in a finding, score, or
  recommendation.
- **Recommended Next Best Action**: A prioritized coaching action with severity,
  rationale, supporting evidence, dimension linkage, and optional urgency.
- **Persona**: Novice, Intermediate, or Expert experience level affecting
  coaching presentation depth only.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A demonstration evaluator can complete the P1 journey (select
  project with defaults, evaluate health, review composite and dimensions,
  receive at least one NBA when supported) in under 5 minutes without external
  connectivity.
- **SC-002**: For the same project and signal configuration, health scores,
  composite contribution count, coverage, classifications, and recommendation
  priority order are identical across three consecutive evaluations in one
  session.
- **SC-003**: When persona changes after evaluation, 100% of health scores,
  severities, and recommendation priorities remain unchanged while coaching text
  length or depth differs between Novice and Expert in a structured review.
- **SC-004**: After session reset or reload, zero prior session attributes
  (project, persona, configuration, results) are recoverable by the user.
- **SC-005**: In moderated accessibility review, every health state shown in the
  demonstration is identifiable without relying on colour alone.
- **SC-006**: All three sample project scenarios produce distinguishable
  outcomes aligned with their defined business conditions (healthy, at-risk with
  blocker, incomplete with Unmeasured dimension).

## Assumptions

- The demonstration runs locally with bundled sample data; no live Jira, Azure
  DevOps, or MS Project connectivity is required or expected.
- One user operates one session at a time; multi-user collaboration is out of
  scope.
- Sample projects are fictional and contain no real customer or employee
  information.
- Leadership evaluators use a modern desktop browser; responsive layout supports
  common viewport sizes but native mobile apps are out of scope.
- English is the demonstration language for coaching content.
- Numeric thresholds, dimension weights, partial eligibility, minimum composite
  coverage, and recommendation ordering rules are in scope but unresolved until
  `/speckit-clarify` and planning (see Unresolved Decisions).

## Dependencies

- Approved PM Copilot Constitution v1.0.0 governs privacy, determinism,
  persona safety, methodology neutrality, testability, and accessibility.
- Bundled sample project scenarios and signal catalog content must be available
  locally as part of the demonstration package.
- Deterministic health and recommendation rules will be defined and approved
  during clarification and planning; this specification depends on their
  approval but does not define formulas here.

## Out of Scope

- Real integrations with Jira, Azure DevOps, MS Project, or other systems of
  record
- Authentication and authorization
- Backend services, external APIs, databases, and cloud storage
- Runtime generative AI for scoring or recommendations
- Multi-user collaboration and role-based access
- Production deployment and organization-wide configuration
- Real project, customer, or employee information

## Unresolved Decisions (for `/speckit-clarify`)

The following decisions are **in scope** for PM Copilot but intentionally
unresolved in this specification. They MUST be resolved before implementation
planning finalizes.

| ID | Topic | Why it matters |
|----|-------|----------------|
| UD-001 | Health classification thresholds | Defines boundaries between Healthy, At Risk, and Critical |
| UD-002 | Dimension weighting for Composite Health Index | Determines relative influence of contributing dimensions |
| UD-003 | Partial versus Measured eligibility rules | Defines when a Partial dimension may contribute a score or composite value |
| UD-004 | Minimum composite coverage requirement | Defines when composite results may be shown versus withheld as insufficient |
| UD-005 | Recommendation severity levels and ordering rules | Defines how actions are ranked and labeled |
| UD-006 | Signal validity and freshness rules | Defines which enabled signals count as valid evidence |
| UD-007 | Default persona on session start | Affects first-run coaching presentation |
| UD-008 | Reset confirmation behaviour | Determines whether reset requires explicit user confirmation |
| UD-009 | Invalid or empty sample project handling | Determines user messaging and recovery when bundled data is unusable |

## Requirements Traceability

| Requirement | Acceptance Scenario(s) | Success Criteria |
|-------------|------------------------|------------------|
| FR-001 | AS-001, AS-024 | SC-001 |
| FR-002 | AS-001, AS-003, AS-004, AS-005 | SC-006 |
| FR-003 | AS-003 | SC-006 |
| FR-004 | AS-004 | SC-006 |
| FR-005 | AS-005 | SC-006 |
| FR-006 | AS-025 | SC-004 |
| FR-007 | AS-026, AS-027 | SC-004 |
| FR-008 | AS-020 | SC-003 |
| FR-009 | AS-020, AS-022 | SC-003 |
| FR-010 | AS-020, AS-021 | SC-002, SC-003 |
| FR-011 | AS-006 | — |
| FR-012 | AS-007 | — |
| FR-013 | AS-007, AS-008 | — |
| FR-014 | AS-001 | SC-001 |
| FR-015 | AS-009, AS-016 | — |
| FR-016 | AS-009, AS-010 | — |
| FR-017 | AS-017, AS-018 | — |
| FR-018 | AS-009, AS-010, AS-011 | — |
| FR-019 | AS-011 | — |
| FR-020 | AS-001, AS-005, AS-012 | SC-002 |
| FR-021 | AS-001, AS-021 | SC-002 |
| FR-022 | AS-022 | — |
| FR-023 | AS-020, AS-022 | SC-003 |
| FR-024 | AS-021 | SC-002 |
| FR-025 | AS-024 | SC-001 |
| FR-026 | AS-025 | SC-004 |
| FR-027 | AS-013, AS-014, AS-015, AS-019 | SC-005 |
| FR-028 | AS-030, AS-031 | SC-005 |
| FR-029 | AS-002, AS-008, AS-009, AS-010, AS-011, AS-012, AS-013, AS-014, AS-015, AS-023, AS-026, AS-028, AS-029 | SC-005 |
| BR-001 | AS-001, AS-021 | SC-002 |
| BR-002 | AS-001, AS-007 | — |
| BR-003 | AS-005, AS-011, AS-012 | — |
| BR-004 | AS-010 | — |
| BR-005 | AS-022 | — |
| BR-006 | AS-020 | SC-003 |
| BR-007 | AS-026 | SC-004 |

*Acceptance scenarios AS-001 through AS-031 are defined in User Scenarios & Testing.
Em dash (—) indicates no direct success criterion mapping for that requirement.*
