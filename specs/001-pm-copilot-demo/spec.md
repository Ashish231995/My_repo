# Feature Specification: PM Copilot Local Demonstration

**Feature Branch**: `001-pm-copilot-demo`

**Created**: 2026-06-29

**Status**: Draft (clarification pass 2 complete — Session 2026-06-29)

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

## Clarifications

### Session 2026-06-29

- Q: Health classification thresholds (UD-001) — numeric boundaries, rounding, and
  boundary inclusivity for Healthy, At Risk, and Critical? → A: **Demonstration
  Policy v1.0** — scores constrained to 0–100; round to nearest whole number
  (half-up) before classification; Healthy 80–100; At Risk 50–79; Critical 0–49;
  boundary values inclusive. Deterministic demonstration thresholds only — not
  claimed as universal DXC standards; production thresholds require organizational
  calibration.

- Q: Dimension weighting for Composite Health Index (UD-002)? → A: **Equal
  weights (Demonstration Policy v1.0)** — when all four dimensions are eligible,
  each has nominal weight 25%; ineligible dimensions excluded; weights re-normalized
  across remaining eligible dimensions (e.g., three eligible → one-third each);
  composite calculated from raw eligible dimension scores; final composite rounded
  once (half-up); not from already-rounded display scores; fixed, not
  user-configurable; demonstration-only, not universal DXC standards.

- Q: Partial versus Measured eligibility (UD-003)? → A: **Provisional Partial
  score; exclude from composite (Demonstration Policy v1.0)** — Partial may display
  deterministic provisional score from available valid evidence only; labelled
  “Provisional score — Partial evidence”; show coverage % and missing signal
  groups; no unqualified Healthy/At Risk/Critical (provisional classifications
  only); Partial never contributes to composite; only fully Measured dimensions
  eligible; display “Excluded from Composite”; Unmeasured shows no numeric score;
  demonstration-only.

- Q: Minimum composite coverage requirement (UD-004)? → A: **Minimum 2 fully
  Measured dimensions (Demonstration Policy v1.0)** — numeric composite only when
  ≥2 Measured; 0–1 Measured shows “Insufficient composite coverage” with no numeric
  composite or qualified classification; 2–3 Measured shows composite with “Based
  on X of 4 Measured dimensions”; 4 Measured shows complete coverage; never use
  Partial scores to satisfy minimum; Sample Project C may show composite with 3
  Measured + 1 Unmeasured; demonstration-only.

- Q: Recommendation severity and ordering (UD-005)? → A: **Urgent / Important /
  Advisory with evidence-based ordering (Demonstration Policy v1.0)** — priority
  levels distinct from health classification; ordering: priority rank → evidence-
  supported time-to-impact or due date (earliest first) → undated after dated within
  same priority → stable recommendation identifier; no fixed dimension-priority order;
  persona changes explanation depth only; demonstration-only.

### Session 2026-06-29 (Pass 2)

- Q: Signal validity and freshness (UD-006)? → A: **Structural validity with
  authoritative bundled as-of date (Demonstration Policy v1.0)** — valid only when
  enabled, present, fields complete, canonical mapping succeeds, source
  identifiable, and as-of metadata exists; snapshot displayed; temporal rules
  relative to snapshot not system clock; no staleness threshold; invalid evidence
  excluded and visibly identified; demonstration-only.

- Q: Default persona on session start (UD-007)? → A: **Intermediate pre-selected
  (Demonstration Policy v1.0)** — non-blocking; changeable before or after
  evaluation; presentation depth only; reset/reload clear user selection then
  re-initialize Intermediate default (not restored preference); active persona
  visible and changeable; demonstration-only.

- Q: Reset confirmation behaviour (UD-008)? → A: **Confirm only when evaluation
  results exist (Demonstration Policy v1.0)** — immediate reset otherwise;
  project/signal/persona changes alone do not trigger confirmation; Cancel safe
  default; Reset session clears to initial project-selection state with
  Intermediate default; accessible confirmation dialog; no undo; reload unchanged;
  demonstration-only.

- Q: Invalid or empty sample project handling (UD-009)? → A: **Allow selection;
  validate immediately; block evaluation when unusable** — invalid-data state;
  no fabrication; user-understandable validation category; recovery to another
  project or reset; distinguish from Partial/Unmeasured missing evidence;
  demonstration-only.

- Q: Persona coaching contract (UD-010)? → A: **Structured depth tiers
  (Demonstration Policy v1.0)** — analytical invariance; Novice/Intermediate/
  Expert required presentation elements; Expert collapses but retains evidence
  access; no recalculation on persona change; test by required elements not word
  count; demonstration-only.

- Q: Methodology normalization verification (UD-011)? → A: **Canonical mapping in
  evidence drilldown (Demonstration Policy v1.0)** — mapping provenance per
  evidence item; representative sources without live connectivity; equivalent
  terms map to same canonical type; deterministic rules; failed mappings excluded
  and visible; distinguish from absent evidence; demonstration-only.

### Demonstration Policy v1.0 — Health Classification

The following rules apply to dimension scores and Composite Health Index
classification for this local demonstration:

- Scores are constrained to the range **0–100** (higher indicates healthier).
- Each score MUST be rounded to the nearest whole number using **half-up rounding**
  before classification is applied.
- **Healthy**: rounded score **80–100** (inclusive).
- **At Risk**: rounded score **50–79** (inclusive).
- **Critical**: rounded score **0–49** (inclusive).
- Boundary values are inclusive (for example, 80 → Healthy; 50 → At Risk; 49 →
  Critical).

These thresholds are deterministic demonstration policy for the PM Copilot
leadership demo. They are **not** presented as universal DXC organizational
standards. Production deployments would require separate organizational
calibration.

### Demonstration Policy v1.0 — Composite Weighting

The following rules apply to Composite Health Index calculation for this local
demonstration:

- When all four dimensions are eligible to contribute, each has a **nominal weight
  of 25%**.
- **Ineligible** dimensions (Partial and Unmeasured) are excluded from the composite
  calculation. Only **fully Measured** dimensions are eligible to contribute.
- Equal nominal weights are **re-normalized** across remaining eligible dimensions
  only (for example, three eligible dimensions each contribute **one-third**).
- The Composite Health Index MUST be calculated using **raw eligible dimension
  scores** (pre-display rounding).
- The **final composite** MUST be rounded **once** to the nearest whole number using
  half-up rounding, then classified per the Health Classification policy.
- The composite MUST **NOT** be calculated from already-rounded display scores.
- Weighting is **fixed** for Demonstration Policy v1.0 and is **not**
  user-configurable.
- These weights are deterministic demonstration policy and are **not** claimed as
  universal DXC organizational standards.

### Demonstration Policy v1.0 — Partial Measurement

The following rules apply when a dimension has **Partial** measurement status:

- A Partial dimension MAY display a **deterministic provisional score** calculated
  only from available valid evidence.
- The score MUST be labelled explicitly as **“Provisional score — Partial
  evidence”**.
- The dimension MUST display **evidence coverage percentage**.
- The dimension MUST identify the **expected evidence or signal groups that are
  missing**.
- The score MUST NOT be presented as a fully **Measured** result.
- The dimension MUST NOT receive an unqualified **Healthy**, **At Risk**, or
  **Critical** classification. Any classification shown MUST be labelled
  **“Provisional”** (for example, “Provisional — At Risk”).
- **Partial dimensions never contribute** to the Composite Health Index.
- Only **fully Measured** dimensions are eligible for composite contribution.
- Every Partial dimension MUST clearly display **“Excluded from Composite”**.
- **Unmeasured** dimensions continue to show **no numeric score**.

These partial-measurement rules are deterministic demonstration policy and are
**not** claimed as universal DXC organizational standards.

### Demonstration Policy v1.0 — Minimum Composite Coverage

The following rules govern when a numeric Composite Health Index may be displayed:

- A numeric Composite Health Index is displayed **only when at least two of the
  four dimensions are fully Measured**.
- **Partial** and **Unmeasured** dimensions do **not** contribute toward the
  minimum or the composite calculation.
- With **zero or one** fully Measured dimension, the application MUST show:
  **“Insufficient composite coverage.”**
- When coverage is insufficient, the application MUST:
  - Show **no numeric composite**
  - Show **no** Healthy, At Risk, or Critical **composite classification**
  - Display the **number of Measured dimensions**
  - Identify **Partial** and **Unmeasured** dimensions
  - Explain **which evidence is missing**
- With **two or three** fully Measured dimensions, the application MUST display
  the composite and classification together with a prominent statement: **“Based
  on X of 4 Measured dimensions.”** (where X is 2 or 3).
- With **four** fully Measured dimensions, the application MUST identify coverage
  as **complete**.
- Equal nominal weights MUST be **re-normalized** across eligible Measured
  dimensions only.
- Partial scores MUST **never** be substituted to satisfy the minimum coverage
  requirement.
- **Sample Project C** MAY display a composite when at least three dimensions are
  fully Measured, while clearly identifying the excluded Unmeasured dimension.

These minimum-coverage rules are deterministic demonstration policy and are **not**
claimed as universal DXC organizational standards.

### Demonstration Policy v1.0 — Recommendation Priority

Health classifications remain **Healthy**, **At Risk**, and **Critical**.
Recommendation priorities are separate and use **Urgent**, **Important**, and
**Advisory**.

**Priority levels**

1. **Urgent** — Immediate intervention is required to prevent or limit material
   delivery, governance, milestone, or payment impact.
2. **Important** — Action is required within the near term to prevent deterioration
   or remove a significant constraint.
3. **Advisory** — Preventive or improvement action that does not require immediate
   escalation.

**Deterministic ordering**

1. **Priority rank**: Urgent → Important → Advisory
2. Within the same priority, order by **evidence-supported time-to-impact or due
   date**, earliest first
3. Recommendations with **no supported date** appear after dated recommendations
   within the same priority; urgency MUST NOT be invented
4. **Final tie-breaker**: stable recommendation identifier ascending

Recommendation date ordering MAY use only dates from **valid evidence** per Signal
Validity policy. No date or urgency may be inferred when valid date evidence is
missing.

**Additional controls**

- Priority MUST be assigned by documented deterministic rules.
- Every recommendation MUST trace to evidence and a finding.
- Persona changes MUST NOT alter priority, ordering, or recommendation content.
- Persona changes MAY alter explanation depth only.
- A **fixed dimension-priority order** MUST NOT be used; there is no approved
  organizational basis for claiming one health dimension always outranks another.

These recommendation rules are deterministic demonstration policy and are **not**
claimed as universal DXC organizational standards.

### Demonstration Policy v1.0 — Signal Validity and Snapshot Freshness

A signal is **valid** only when **all** of the following are true:

- Its signal group is **enabled**
- It is **present** in the selected bundled sample project
- All **required fields** for that signal type are populated and valid
- It **maps successfully** to the canonical project-signal model
- Its **evidence source** can be identified
- An **authoritative bundled as-of date** exists at the project, signal-group, or
  individual-signal level

**Freshness policy (demonstration snapshot)**

- Every sample project represents an authoritative **point-in-time snapshot**
- The snapshot **as-of date** MUST be displayed in project and evidence views
- All temporal rules MUST be evaluated relative to the **bundled snapshot date**,
  not the computer's current date
- Demonstration Policy v1.0 does **NOT** introduce a staleness threshold
- Missing or invalid as-of metadata makes the affected evidence **invalid**

**Invalid evidence handling**

- Invalid evidence is **excluded** from scoring and recommendations
- Invalid evidence MUST be **visibly identified** with the reason for exclusion
- Invalid evidence affects **coverage** and may result in **Partial** or
  **Unmeasured** status
- Recommendation date ordering MAY use **only dates from valid evidence**
- No freshness or urgency MAY be **inferred** when date evidence is missing

These rules provide temporal transparency while keeping the local demonstration
deterministic. They are **not** a production freshness policy; production
thresholds would require organizational calibration.

### Demonstration Policy v1.0 — Default Persona

The following rules apply to persona selection for this local demonstration:

- A **new session** starts with **Intermediate** pre-selected.
- P1 independent testing uses **Intermediate** coaching unless the user changes
  persona.
- Persona selection is **not** a blocking onboarding step.
- The user MAY change persona **before or after** health evaluation.
- Changing persona affects **coaching presentation depth only**.
- Scores, classifications, findings, recommendations, priorities, and ordering
  MUST remain unchanged when persona changes.
- **Reset** and **full page reload** clear any **user-selected** persona from the
  prior session.
- After clearing the previous session, the new session **initializes** again with
  the **Intermediate** demonstration default.
- The Intermediate default MUST **NOT** be described or presented as a restored or
  persisted user preference.
- The UI MUST clearly show the **active persona** and allow it to be changed.

This default supports the demonstration audience. It is **not** a universal DXC
user-profile policy.

### Demonstration Policy v1.0 — Persona Coaching Contract

The following rules govern persona-safe coaching presentation for this local
demonstration:

**Analytical invariance**

- All personas receive identical **scores**, **classifications**, **coverage**,
  **findings**, **evidence references**, **recommendation identifiers**,
  **recommendation content**, **priorities**, and **ordering**.
- Changing persona MUST **not** trigger health recalculation.
- Persona affects **presentation only**.

**Novice**

- Plain-language definition of the health condition
- Expanded **“why this matters”** explanation
- Step-by-step recommended-action guidance
- Expanded evidence walkthrough
- Methodology-neutral glossary for unfamiliar terms

**Intermediate**

- Standard professional coaching
- Concise rationale
- Key evidence summary
- Clear recommended action and immediate next steps
- Remains the **default persona**

**Expert**

- Compact action-oriented presentation
- Recommendation title and priority
- Bullet-point findings
- Key evidence references
- Abbreviated rationale
- Explanatory sections **collapsed by default**

**Evidence and accessibility**

- Every persona MUST retain access to the **complete supporting evidence and
  explanation** through drilldown or expansion.
- Expert mode MAY collapse detail but MUST **not** remove access to it.
- Novice mode MUST **not** introduce new findings, recommendations, or urgency.
- Persona differences MUST be tested through **required presentation elements**,
  not arbitrary word-count targets.
- Persona controls and expandable evidence MUST be keyboard accessible.

This contract is specific to the local demonstration.

### Demonstration Policy v1.0 — Session Reset Confirmation

The following rules apply to the in-application **Reset** action for this local
demonstration:

- Reset **requires confirmation** when **health evaluation results** exist in the
  active session.
- If **no evaluation results** exist, Reset executes **immediately**.
- Project selection, signal changes, or persona changes **alone** do **not**
  trigger confirmation.
- The confirmation MUST explain that **project selection**, **signal
  configuration**, **findings**, **scores**, and **recommendations** will be
  cleared.
- The confirmation MUST provide two explicit actions:
  - **Cancel**
  - **Reset session**
- **Cancel** is the safe/default action and preserves the complete session.
- Confirming **Reset session** clears the session and returns to the **initial
  project-selection state**.
- The new session initializes with the **Intermediate** demonstration default
  persona.
- The confirmation MUST be keyboard accessible, trap focus while open, restore
  focus appropriately when cancelled, and not rely on colour alone.
- No undo or recovery mechanism MAY persist cleared session information.
- **Full page reload** does **not** use this confirmation flow and continues to
  clear the session immediately.

This behaviour is specific to the local demonstration.

### Demonstration Policy v1.0 — Invalid Sample Data Handling

The following rules apply when bundled sample project data is unusable:

- A selected bundled project is **validated immediately** after loading.
- If project data is **invalid or unusable**, retain enough selection context to
  identify the affected sample project, but **block health evaluation**.
- Display a dedicated **“Invalid sample data”** state.
- Do **not** display scores, classifications, findings, composite results, or
  recommendations from invalid data.
- Do **not** attempt to repair, infer, or fabricate missing required information.
- Explain the **validation category** in user-understandable language without
  exposing stack traces, local file paths, or raw project content.
- Provide two recovery actions:
  - **Select another sample project**
  - **Reset session**
- Recovery actions MUST be keyboard accessible and MUST NOT rely on colour alone.
- Valid Sample Projects **A**, **B**, and **C** remain unaffected during normal
  flows.
- Invalid-data behaviour MAY be demonstrated using a dedicated adverse-condition
  sample or test fixture.

**Invalid data versus missing evidence**

- An **empty file**, **malformed project structure**, **missing required project
  identity**, **invalid snapshot metadata**, or an **unrecognizable signal
  structure** makes the project **unusable** and blocks evaluation.
- A **structurally valid** project containing no evidence for one or more
  dimensions is **not** a project-load error.
- Valid-but-missing evidence MUST produce **Partial** or **Unmeasured** dimension
  states and insufficient composite coverage per Demonstration Policy v1.0.

This behaviour is specific to the local demonstration.

### Demonstration Policy v1.0 — Methodology Normalization Verification

The following rules govern methodology-neutral signal normalization for this local
demonstration:

- Every evidence item used in evaluation MUST expose in the evidence drilldown:
  - **Representative source label**
  - **Original source term or field**
  - **Canonical project-signal type**
  - **Mapping status**
- Representative source labels MUST **not** imply live enterprise connectivity.
- Bundled sample data MUST include at least one **successfully mapped** example for
  every representative source shown in the demonstration.
- Source terminology from different methodologies that has **equivalent business
  meaning** MUST map to the **same canonical signal type**.
- Equivalent normalized signals MUST have **identical scoring influence** when all
  other evidence attributes are equal.
- Mapping rules MUST be **deterministic** and **documented**.
- Successfully mapped **valid** evidence MAY participate in scoring.
- Unsupported, failed, or invalid mappings MUST be **excluded** from scoring.
- Excluded mappings MUST remain **visible** in the evidence view with a clear
  reason.
- Mapping failure MUST be **distinguishable** from evidence that is simply absent.
- Excluded mappings affect **coverage** and MAY result in **Partial** or
  **Unmeasured** status per Demonstration Policy v1.0.
- No raw sensitive information, live credentials, or real project content is
  required for mapping verification.

This verification approach is specific to the local demonstration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Achieve Explainable Health Coaching (Priority: P1)

As an IT Project Manager, I want to select a bundled sample project, evaluate its
health using default enabled signals, and receive dimensional health insight plus
at least one explainable Next Best Action when findings support it — so that I can
demonstrate PM Copilot's core value without enterprise integration.

**Why this priority**: This is the minimum end-to-end outcome leadership must see:
from sample project to explainable health and actionable coaching.

**Independent Test**: Select **Sample Project B** with default enabled signals,
run health evaluation once with the default **Intermediate** persona, and confirm
four dimensions, Composite Health Index, and at least one Recommended Next Best
Action with supporting evidence — without configuring signals or changing persona.
(Sample Project A or C may validly produce no recommendations when findings do
not support actions.)

**Acceptance Scenarios**:

- **AS-001** — **Given** a new local session, **When** the user selects
  **Sample Project B** with its default enabled signals and requests health
  evaluation, **Then** the application presents the Composite Health Index, four
  health dimensions (Schedule Health; Delivery and Scope; Team and Communications;
  Risk and Governance), and at least one Recommended Next Best Action with
  supporting evidence.
- **AS-002** — **Given** a new local session with no project selected, **When**
  the user attempts to evaluate health, **Then** the application guides the user
  to select a project first and does not present evaluation results.
- **AS-003** — **Given** Sample Project A with default enabled signals, **When**
  health is evaluated, **Then** measured dimensions and the composite (when
  eligible) reflect a generally healthy project scenario with classifications
  predominantly **Healthy** per Demonstration Policy v1.0.
- **AS-004** — **Given** Sample Project B with default enabled signals, **When**
  health is evaluated, **Then** results reflect an **At Risk** or **Critical**
  project per Demonstration Policy v1.0 with a significant delivery blocker
  visible in findings and at least one recommendation.
- **AS-005** — **Given** Sample Project C with default enabled signals, **When**
  health is evaluated, **Then** at least one dimension shows Unmeasured status,
  at least three dimensions are fully Measured, the composite is displayed with
  “Based on 3 of 4 Measured dimensions”, the Unmeasured dimension is clearly
  identified and excluded, and weights are re-normalized across the three Measured
  contributors only.

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
- **AS-042** — **Given** a selected sample project with bundled as-of metadata,
  **When** the user views project or evidence details, **Then** the authoritative
  snapshot as-of date is displayed.
- **AS-043** — **Given** enabled evidence that fails signal validity rules (for
  example missing as-of metadata or incomplete required fields), **When** health
  is evaluated, **Then** that evidence is excluded from scoring and recommendations,
  visibly identified with an exclusion reason, and may contribute to Partial or
  Unmeasured status for the affected dimension.
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
  health is evaluated, **Then** that dimension shows **Partial** status with a
  provisional score labelled “Provisional score — Partial evidence”, evidence
  coverage percentage, identification of missing signal groups, any classification
  labelled “Provisional”, display of “Excluded from Composite”, and is not
  presented as fully Measured.
- **AS-011** — **Given** a dimension with no valid enabled evidence, **When**
  health is evaluated, **Then** that dimension shows Unmeasured status and does
  not assign a numeric score or imputed value.
- **AS-012** — **Given** an evaluation with zero or one fully Measured dimension,
  **When** the user views the Composite Health Index area, **Then** the application
  shows “Insufficient composite coverage”, no numeric composite, no qualified
  composite classification, the count of Measured dimensions, identification of
  Partial and Unmeasured dimensions, and an explanation of missing evidence.
- **AS-013** — **Given** a dimension or composite with rounded score 80–100,
  **When** the user reviews health output, **Then** classification is **Healthy**
  and is communicated with non-colour-only indicators.
- **AS-014** — **Given** a dimension or composite with rounded score 50–79,
  **When** the user reviews health output, **Then** classification is **At Risk**
  and is communicated with non-colour-only indicators.
- **AS-015** — **Given** a dimension or composite with rounded score 0–49,
  **When** the user reviews health output, **Then** classification is **Critical**
  and is communicated with non-colour-only indicators.
- **AS-032** — **Given** an unrounded dimension score, **When** health
  classification is applied, **Then** the score is rounded to the nearest whole
  number using half-up rounding before mapping to Healthy, At Risk, or Critical
  per Demonstration Policy v1.0 (boundary values 80, 50, and 49 inclusive per
  band).
- **AS-033** — **Given** exactly three eligible contributing dimensions with raw
  scores, **When** the Composite Health Index is calculated, **Then** each
  eligible dimension contributes one-third after re-normalization of equal
  nominal weights.
- **AS-034** — **Given** raw eligible dimension scores, **When** the Composite
  Health Index is presented, **Then** the composite is computed from raw eligible
  scores, rounded once using half-up rounding, classified per Demonstration
  Policy v1.0, and is not derived from already-rounded display scores.
- **AS-035** — **Given** a Partial dimension with a provisional score, **When**
  the user views the Composite Health Index, **Then** that dimension is excluded
  from composite calculation and shows “Excluded from Composite”.
- **AS-036** — **Given** a Partial dimension with sufficient evidence for a
  provisional band, **When** the user reviews classification, **Then** any
  classification is prefixed or labelled “Provisional” and no unqualified Healthy,
  At Risk, or Critical label is shown.
- **AS-037** — **Given** an evaluation with two or three fully Measured
  dimensions, **When** the user views the Composite Health Index, **Then** the
  application displays the numeric composite, qualified composite classification,
  and the prominent statement “Based on X of 4 Measured dimensions.”
- **AS-038** — **Given** an evaluation with four fully Measured dimensions,
  **When** the user views the Composite Health Index, **Then** the application
  identifies coverage as complete and displays the numeric composite with qualified
  classification.
- **AS-039** — **Given** an evaluation with only Partial or Unmeasured dimensions
  below the minimum Measured count, **When** composite eligibility is evaluated,
  **Then** Partial scores are not substituted to satisfy the minimum coverage
  requirement.

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
  classification, findings, evidence used with mapping provenance per
  Demonstration Policy v1.0 Methodology Normalization Verification, and how the
  result was reached.
- **AS-059** — **Given** a completed health evaluation with evidence from a
  representative bundled source, **When** the user drills into that evidence
  item, **Then** the drilldown shows representative source label, original source
  term or field, canonical project-signal type, and mapping status, including at
  least one successfully mapped example for every representative source shown in
  the demonstration.
- **AS-060** — **Given** bundled sample evidence where equivalent business terms
  from different representative methodologies are present, **When** the user
  reviews evidence drilldown for those items, **Then** each maps to the same
  canonical project-signal type.
- **AS-061** — **Given** two valid normalized signals of the same canonical type
  with equivalent business meaning and equal other evidence attributes, **When**
  health is evaluated under the same project and signal configuration, **Then**
  those signals receive identical scoring influence.
- **AS-062** — **Given** bundled evidence with a failed or unsupported mapping,
  **When** health is evaluated, **Then** that mapping is excluded from scoring,
  remains visible in the evidence view with a clear exclusion reason, is
  distinguishable from simply absent evidence, and may contribute to Partial or
  Unmeasured status per Demonstration Policy v1.0.
- **AS-063** — **Given** a completed health evaluation, **When** the user reviews
  evidence drilldown mapping provenance, **Then** representative source labels are
  shown without implying live enterprise connectivity.
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
scores, classifications, composite results, recommendation set, priorities, and
priority order are unchanged while coaching explanation depth changes.

**Acceptance Scenarios**:

- **AS-044** — **Given** a new local session, **When** the user views the
  application before changing persona, **Then** **Intermediate** is shown as the
  active persona, persona selection is available and non-blocking, and coaching
  uses Intermediate presentation depth.
- **AS-045** — **Given** a new local session, **When** the user changes persona
  before requesting health evaluation, **Then** coaching presentation depth
  reflects the selected persona and evaluation may proceed without a separate
  onboarding step.
- **AS-055** — **Given** a completed health evaluation, **When** the user views
  results as Novice, Intermediate, and Expert in turn, **Then** scores,
  classifications, coverage, findings, evidence references, recommendation
  identifiers, recommendation content, priorities, and ordering remain identical
  across all personas.
- **AS-056** — **Given** a completed health evaluation, **When** the user views
  coaching for each persona, **Then** Novice shows plain-language condition
  definition, expanded “why this matters”, step-by-step action guidance, expanded
  evidence walkthrough, and methodology-neutral glossary; Intermediate shows
  concise rationale, key evidence summary, clear recommended action, and immediate
  next steps; Expert shows compact action-oriented presentation with recommendation
  title and priority, bullet-point findings, key evidence references, abbreviated
  rationale, and explanatory sections collapsed by default.
- **AS-057** — **Given** a completed health evaluation viewed in Expert persona,
  **When** the user expands or drills into supporting evidence and explanation,
  **Then** the same complete evidence and explanation available to Novice users
  is accessible.
- **AS-058** — **Given** a completed health evaluation, **When** the user changes
  persona, **Then** health evaluation is not rerun and analytical outputs remain
  unchanged.
- **AS-020** — **Given** a completed health evaluation, **When** the user changes
  persona among Novice, Intermediate, and Expert, **Then** health scores,
  dimension classifications, composite results, findings, evidence references,
  recommendation identifiers, recommendation content, recommendation priorities,
  priority order, and which recommendations appear remain unchanged while coaching
  presentation depth changes per Demonstration Policy v1.0 Persona Coaching
  Contract.
- **AS-021** — **Given** identical project, signal configuration, and persona,
  **When** health is evaluated twice in the same session, **Then** recommendations,
  priorities, and priority order are identical.
- **AS-022** — **Given** a completed evaluation with actionable findings, **When**
  the user opens recommendations, **Then** each item includes priority (Urgent,
  Important, or Advisory), recommended action, reason generated, supporting finding
  or evidence, relevant health dimension, and evidence-supported timing or urgency
  when available.
- **AS-040** — **Given** multiple recommendations with the same priority, **When**
  the user reviews the ordered list, **Then** recommendations with evidence-
  supported due dates or time-to-impact appear before those without supported dates,
  ordered earliest first within the priority band.
- **AS-041** — **Given** recommendations tied on priority and date ordering, **When**
  the list is presented, **Then** final order follows stable recommendation
  identifier ascending and no urgency is invented for undated items.
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
- **AS-026** — **Given** an active session where the user changed persona from
  the default, with project selection, signal configuration, and evaluation results
  recorded, **When** the user completes reset (including confirmation when
  evaluation results exist), **Then** all prior session information including the
  user-selected persona is cleared, no prior project, configuration, or evaluation
  results remain, and the new session initializes with **Intermediate** as the
  active demonstration default — not as a restored user preference.
- **AS-027** — **Given** a session where the user changed persona from the
  default and held project and evaluation data, **When** the user performs a full
  page reload, **Then** no prior project selection, signal configuration,
  evaluation results, or user-selected persona is restored, and the new session
  initializes with **Intermediate** as the active demonstration default — not as
  a restored user preference.
- **AS-046** — **Given** an active session with health evaluation results,
  **When** the user initiates Reset, **Then** a confirmation is displayed
  explaining that project selection, signal configuration, findings, scores, and
  recommendations will be cleared, with explicit **Cancel** and **Reset session**
  actions.
- **AS-047** — **Given** the reset confirmation is displayed, **When** the user
  chooses **Cancel**, **Then** the complete session is preserved unchanged and
  focus is restored appropriately.
- **AS-048** — **Given** the reset confirmation is displayed after evaluation
  results exist, **When** the user chooses **Reset session**, **Then** the session
  is cleared, the user returns to the initial project-selection state, and
  **Intermediate** is initialized as the active demonstration default.
- **AS-049** — **Given** an active session with project selection, signal
  configuration, or persona changes but **no** health evaluation results,
  **When** the user initiates Reset, **Then** Reset executes immediately without
  a confirmation step and returns to the initial project-selection state with
  **Intermediate** initialized.

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

- **AS-028** — **Given** a bundled sample project with invalid or unusable data,
  **When** the user selects that project, **Then** validation runs immediately,
  the application shows the dedicated **Invalid sample data** state with a user-
  understandable validation category, retains enough context to identify the
  affected project, blocks health evaluation, and does not present fabricated
  scores, classifications, findings, composite results, or recommendations.
- **AS-050** — **Given** a bundled sample project with a structurally invalid
  project definition, **When** the user selects that project, **Then** health
  evaluation is blocked and the Invalid sample data state is shown.
- **AS-051** — **Given** a bundled sample project that is empty or malformed,
  **When** the user selects that project, **Then** the Invalid sample data state
  is shown with a user-understandable validation category and no fabricated
  health results.
- **AS-052** — **Given** Sample Project C with structurally valid data but
  missing evidence for at least one dimension, **When** health is evaluated,
  **Then** the application shows Partial or Unmeasured dimension states and
  insufficient composite coverage per Demonstration Policy v1.0 — not the Invalid
  sample data state.
- **AS-053** — **Given** the Invalid sample data state for a selected project,
  **When** the user chooses **Select another sample project** and selects a valid
  bundled project, **Then** recovery succeeds and health evaluation may proceed
  normally.
- **AS-054** — **Given** the Invalid sample data state for a selected project,
  **When** the user chooses **Reset session**, **Then** the invalid project
  context is cleared and the session returns to the initial project-selection
  state with **Intermediate** initialized.
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
  configuration for that scenario; structurally valid missing evidence MUST NOT
  trigger the Invalid sample data state.
- **FR-006**: The application MUST keep all active session information in memory
  only for the duration of the session.
- **FR-007**: The application MUST clear all session information on confirmed
  in-application reset or full page reload, per Demonstration Policy v1.0 Session
  Reset Confirmation.
- **FR-037**: In-application Reset MUST follow Demonstration Policy v1.0 Session
  Reset Confirmation: confirm only when evaluation results exist; immediate reset
  otherwise; Cancel preserves session; Reset session clears to initial project-
  selection state with Intermediate default; accessible confirmation; no undo;
  reload exempt; demonstration-only.
- **FR-038**: Invalid sample data handling MUST follow Demonstration Policy v1.0:
  validate immediately on project load; retain selection context; block evaluation
  when unusable; dedicated Invalid sample data state; no fabrication; user-
  understandable validation category; recovery actions; distinguish from Partial/
  Unmeasured missing evidence; demonstration-only.

**Persona and coaching**

- **FR-008**: The application MUST support Novice, Intermediate, and Expert
  experience levels.
- **FR-036**: Default persona MUST follow Demonstration Policy v1.0: Intermediate
  pre-selected on new session and after reset or reload; non-blocking selection;
  changeable before or after evaluation; active persona visible and changeable;
  prior user-selected persona cleared on reset or reload; demonstration default
  re-initialized without presenting it as restored preference; demonstration-only.
- **FR-009**: Persona selection MUST affect coaching presentation per
  Demonstration Policy v1.0 Persona Coaching Contract only.
- **FR-010**: Persona selection MUST NOT change health scores, dimension
  classifications, composite results, coverage, findings, evidence references,
  recommendation identifiers, recommendation content, recommendation priorities,
  priority order, or which recommendations are produced; persona change MUST NOT
  trigger health recalculation.
- **FR-039**: Persona coaching MUST follow Demonstration Policy v1.0 Persona
  Coaching Contract: structured depth tiers; analytical invariance; required
  presentation elements per persona; complete evidence accessible via drilldown
  or expansion; keyboard-accessible controls; test by required elements not word
  count; demonstration-only.

**Integration checklist and signals**

- **FR-011**: The application MUST present an integration checklist representing
  available project signal groups without live enterprise integration.
- **FR-012**: The user MUST be able to enable or disable available signal groups
  for the active session.
- **FR-013**: Health evaluation MUST consider only enabled signal groups with
  valid evidence per Demonstration Policy v1.0 Signal Validity rules; successfully
  mapped valid evidence MAY participate in scoring; failed or unsupported mappings
  MUST be excluded per Methodology Normalization Verification policy.
- **FR-040**: Methodology normalization MUST follow Demonstration Policy v1.0
  Methodology Normalization Verification: evidence drilldown mapping provenance;
  bundled mapped examples per representative source; equivalent terms to same
  canonical type; identical scoring influence for equivalent normalized signals;
  deterministic documented rules; failed mappings excluded and visible;
  distinguish mapping failure from absent evidence; demonstration-only.

**Measurement and health dimensions**

- **FR-014**: The application MUST evaluate four health dimensions: Schedule
  Health; Delivery and Scope; Team and Communications; Risk and Governance.
- **FR-015**: Each dimension MUST communicate measurement status, coverage,
  health classification, findings, evidence used with mapping provenance when
  applicable, and an explanation of how the result was reached.
- **FR-016**: Measured dimensions MUST communicate a health score and qualified
  classification per Demonstration Policy v1.0. Partial dimensions MUST communicate
  a provisional score and provisional classification per Partial Measurement policy.
  Unmeasured dimensions MUST NOT communicate a numeric score.
- **FR-017**: Each dimension MUST communicate trend only when supported by
  available evidence.
- **FR-018**: The application MUST distinguish Measured, Partial, and Unmeasured
  states according to available enabled evidence.
- **FR-019**: Missing evidence MUST NOT be converted into a zero score, estimated
  score, or implied measurement.
- **FR-020**: The Composite Health Index MUST follow Demonstration Policy v1.0
  minimum coverage, weighting, and calculation rules: display numeric composite
  only when at least two dimensions are fully Measured; show insufficient coverage
  state when fewer than two are Measured; include only fully Measured dimensions;
  re-normalize equal weights across eligible Measured dimensions; compute from raw
  scores; round once before classification; show contribution count and coverage
  statements; never substitute Partial scores for minimum coverage.
- **FR-030**: Measured dimension scores and composite classification MUST follow
  Demonstration Policy v1.0 Health Classification (0–100; half-up rounding;
  Healthy 80–100; At Risk 50–79; Critical 0–49; inclusive boundaries). Partial
  dimensions use provisional classification labelling only. Composite qualified
  classification is shown only when minimum coverage is met. Composite uses single
  final half-up rounding on the raw-score aggregate.
- **FR-031**: Composite dimension weighting MUST follow Demonstration Policy v1.0:
  equal nominal 25% weights, re-normalized across eligible Measured dimensions
  only, fixed and not user-configurable, demonstration-only.
- **FR-032**: Partial dimensions MUST follow Demonstration Policy v1.0 Partial
  Measurement: provisional score from available valid evidence only; required
  labelling; coverage and missing-signal disclosure; excluded from composite;
  no unqualified classification.
- **FR-033**: Minimum composite coverage MUST follow Demonstration Policy v1.0:
  at least two fully Measured dimensions required for numeric composite; insufficient
  coverage messaging and disclosures when below minimum; prominent “Based on X of
  4 Measured dimensions” when 2–3 contribute; complete coverage when all four
  Measured; demonstration-only.

**Recommendations**

- **FR-021**: The application MUST produce Recommended Next Best Actions derived
  deterministically from evaluated health results and enabled evidence, with
  priority assigned per Demonstration Policy v1.0.
- **FR-022**: Each recommendation MUST include priority (Urgent, Important, or
  Advisory), recommended action, reason generated, supporting finding or evidence,
  relevant health dimension, and evidence-supported timing or urgency when available.
- **FR-023**: Each recommendation MUST present persona-appropriate coaching per
  Demonstration Policy v1.0 Persona Coaching Contract without altering underlying
  recommendation content, priority, or order.
- **FR-024**: Identical project, signal configuration, and evaluation inputs MUST
  produce identical recommendations, priorities, and priority order.
- **FR-034**: Recommendation priority and ordering MUST follow Demonstration
  Policy v1.0: Urgent → Important → Advisory; evidence-supported date ordering
  from valid evidence only; undated after dated; stable identifier tie-breaker; no
  fixed dimension-priority order; no inferred urgency; demonstration-only.
- **FR-035**: Signal validity MUST follow Demonstration Policy v1.0: structural
  validity criteria; authoritative bundled as-of date; snapshot-relative temporal
  rules; no staleness threshold; invalid evidence excluded, identified, and
  coverage-impacting; demonstration-only.

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
  initial session with Intermediate default persona; initial project selection; no
  project selected; integration checklist incomplete; Measured dimension; Partial
  dimension; Unmeasured dimension; insufficient composite coverage; Healthy, At
  Risk, and Critical classifications; no recommendations; Invalid sample data
  state with recovery actions; session reset; reset confirmation when evaluation
  results exist; and general error state.

### Business Rules

- **BR-001**: Health scores and recommendations MUST be produced by documented,
  deterministic rules applied to normalized project signals.
- **BR-002**: Methodology-specific terminology from sample sources MUST map to a
  common project-signal model per Demonstration Policy v1.0 Methodology
  Normalization Verification before participating in health calculations;
  equivalent normalized signals MUST have identical scoring influence when all
  other evidence attributes are equal; mapping provenance MUST be visible in
  evidence drilldown; failed mappings excluded and disclosed.
- **BR-003**: Unmeasured and Partial dimensions MUST NOT contribute numeric value
  to the Composite Health Index.
- **BR-004**: Partial dimensions MUST NOT be presented as fully Measured; provisional
  scores and classifications MUST use required Partial Measurement labelling.
- **BR-005**: Recommendations MUST trace to at least one finding or evidence item
  and at least one health dimension; priority MUST follow documented deterministic
  rules per Demonstration Policy v1.0.
- **BR-006**: Coaching narrative MUST follow Demonstration Policy v1.0 Persona
  Coaching Contract; analytical outputs MUST remain invariant across personas for
  the same inputs; persona change MUST NOT trigger recalculation.
- **BR-007**: Session reset and full page reload MUST remove active project,
  user-selected persona, signal configuration, evaluation results, and
  recommendations from memory, then initialize the new session with the
  Intermediate demonstration default — not as a restored user preference. In-
  application reset MUST follow Session Reset Confirmation policy when evaluation
  results exist.
- **BR-015**: Session Reset Confirmation MUST follow Demonstration Policy v1.0:
  conditional confirmation; Cancel safe default; accessible dialog; no undo;
  demonstration-only.
- **BR-016**: Invalid sample data handling MUST follow Demonstration Policy v1.0:
  immediate validation; block evaluation when unusable; no fabrication; recovery
  actions; distinguish unusable project from valid missing evidence; demonstration-
  only.
- **BR-017**: Persona coaching MUST follow Demonstration Policy v1.0 Persona
  Coaching Contract: structured depth tiers; required presentation elements;
  complete evidence access; no new findings or urgency in Novice; demonstration-
  only.
- **BR-018**: Methodology normalization verification MUST follow Demonstration
  Policy v1.0: evidence drilldown provenance; bundled mapped examples per
  representative source; equivalent-term canonical mapping; identical scoring for
  equivalent normalized signals; deterministic rules; excluded failed mappings
  visible; distinguish from absent evidence; demonstration-only.
- **BR-014**: Default persona MUST follow Demonstration Policy v1.0: Intermediate
  on new session; non-blocking; presentation-depth-only changes; demonstration-only.
- **BR-008**: Health classification MUST follow Demonstration Policy v1.0
  (0–100 scores, half-up rounding to whole numbers, inclusive Healthy 80–100,
  At Risk 50–79, Critical 0–49). These thresholds are for the local demonstration
  only and do not represent organizational DXC standards.
- **BR-009**: Composite Health Index weighting MUST follow Demonstration Policy
  v1.0: equal nominal 25% per dimension when all four are Measured; exclude Partial
  and Unmeasured dimensions; re-normalize weights across eligible Measured
  dimensions only; compute from raw eligible scores; round composite once before
  classification; fixed weights, not user-configurable; demonstration-only.
- **BR-010**: Partial measurement MUST follow Demonstration Policy v1.0: provisional
  score from available valid evidence; explicit labelling; coverage and missing-
  signal disclosure; excluded from composite; provisional classification only;
  demonstration-only.
- **BR-011**: Minimum composite coverage MUST follow Demonstration Policy v1.0:
  numeric composite requires at least two fully Measured dimensions; insufficient
  coverage state below minimum; no Partial substitution; demonstration-only.
- **BR-012**: Recommendation priority and ordering MUST follow Demonstration
  Policy v1.0: Urgent, Important, Advisory (distinct from health classification);
  evidence-based date ordering; no invented urgency; persona-invariant priority and
  order; demonstration-only.
- **BR-013**: Signal validity and snapshot freshness MUST follow Demonstration
  Policy v1.0: structural validity; authoritative as-of date; snapshot-relative
  temporal evaluation; no staleness threshold; invalid evidence excluded and
  disclosed; demonstration-only.

### Key Entities

- **Session**: Active local demonstration context; holds selected project, active
  persona (default Intermediate on initialization), signal configuration, and
  evaluation outputs in memory only; user-selected persona is not persisted across
  reset or reload.
- **Sample Project**: Bundled demonstration scenario with predefined signal
  context, authoritative snapshot as-of date, representing healthy, at-risk, or
  incomplete conditions; validated immediately on selection; unusable projects
  block evaluation without fabricating results.
- **Integration Checklist**: Session-scoped list of signal groups representing
  integration sources; groups may be enabled or disabled.
- **Signal Group**: A logical bundle of project signals mapped to methodology-
  neutral inputs for health evaluation; representative source labels MUST NOT
  imply live enterprise connectivity.
- **Project Signal**: A normalized unit of evidence about schedule, delivery,
  team, risk, or governance conditions; carries canonical type and mapping status
  when used in evaluation.
- **Health Dimension**: One of four evaluated perspectives on project health.
- **Dimension Result**: Measurement status; for Measured — score, qualified
  classification, coverage, trend, findings, evidence, explanation; for Partial
  — provisional score and classification with required labelling, coverage, missing
  signals, “Excluded from Composite”; for Unmeasured — no numeric score.
- **Composite Health Index**: Aggregated session result using equal re-normalized
  weights across **fully Measured** dimensions only, computed from raw scores with
  single final rounding, with stated contribution count and coverage.
- **Finding**: An evaluated condition derived from evidence that supports health
  classification or recommendations.
- **Evidence Item**: A traceable input with identifiable source, normalization
  provenance (representative source label, original term, canonical type, mapping
  status), and as-of metadata when valid; used in scoring when mapping succeeds
  and validity rules pass; excluded mappings remain visible with reason.
- **Recommended Next Best Action**: A prioritized coaching action with priority
  (Urgent, Important, or Advisory), rationale, supporting evidence, dimension
  linkage, evidence-supported timing when available, and stable identifier for
  ordering.
- **Persona**: Novice, Intermediate, or Expert experience level affecting coaching
  presentation depth only; **Intermediate** is the demonstration default on session
  initialization; not a persisted user profile.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A demonstration evaluator can complete the P1 journey using Sample
  Project B (select project with defaults, evaluate health, review composite and
  dimensions, receive at least one NBA with supporting evidence) in under 5
  minutes without external connectivity.
- **SC-002**: For the same project and signal configuration, health scores,
  composite contribution count, coverage, classifications, and recommendation
  priority order are identical across three consecutive evaluations in one
  session.
- **SC-003**: When persona changes after evaluation, 100% of health scores,
  classifications, coverage, findings, evidence references, recommendation
  identifiers, recommendation content, recommendation priorities, and priority
  order remain unchanged while required persona presentation elements differ
  between Novice and Expert in a structured review.
- **SC-004**: After session reset or reload, zero prior session attributes
  (project, user-selected persona, configuration, results) are recoverable; the
  new session shows Intermediate as the demonstration default, not as a restored
  preference.
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
- Health classification, composite weighting, partial measurement, minimum
  composite coverage, recommendation priority, signal validity, default persona,
  session reset confirmation, persona coaching contract, and methodology
  normalization verification are resolved as Demonstration Policy v1.0 (Sessions
  2026-06-29 Pass 1 and Pass 2). All UD-001–UD-011 decisions are resolved.

## Dependencies

- Approved PM Copilot Constitution v1.0.0 governs privacy, determinism,
  persona safety, methodology neutrality, testability, and accessibility.
- Bundled sample project scenarios and signal catalog content must be available
  locally as part of the demonstration package.
- Deterministic health and recommendation rules are defined in Demonstration
  Policy v1.0; detailed formulas and mapping tables will be specified during
  planning.

## Out of Scope

- Real integrations with Jira, Azure DevOps, MS Project, or other systems of
  record
- Authentication and authorization
- Backend services, external APIs, databases, and cloud storage
- Runtime generative AI for scoring or recommendations
- Multi-user collaboration and role-based access
- Production deployment and organization-wide configuration
- Real project, customer, or employee information

## Resolved Decisions (Clarification Session 2026-06-29)

| ID | Topic | Decision |
|----|-------|----------|
| UD-001 | Health classification thresholds | **Demonstration Policy v1.0** — 0–100 scores; half-up rounding to whole numbers; Healthy 80–100; At Risk 50–79; Critical 0–49; inclusive boundaries. Demonstration-only; not universal DXC standards. |
| UD-002 | Dimension weighting for Composite Health Index | **Equal weights (Demonstration Policy v1.0)** — 25% nominal each when all four eligible; exclude ineligible; re-normalize across eligible only; raw-score composite; single final half-up rounding; fixed, not user-configurable; demonstration-only. |
| UD-003 | Partial versus Measured eligibility rules | **Provisional Partial score; exclude from composite** — provisional score and labelling; coverage and missing signals; provisional classification only; Partial excluded; only Measured contributes; demonstration-only. |
| UD-004 | Minimum composite coverage requirement | **Minimum 2 fully Measured dimensions** — insufficient state below minimum; “Based on X of 4 Measured dimensions” when 2–3; complete when 4; no Partial substitution; demonstration-only. |
| UD-005 | Recommendation priority and ordering | **Urgent / Important / Advisory** — evidence-based date ordering; undated after dated; stable identifier tie-breaker; no dimension-priority order; persona-invariant; demonstration-only. |
| UD-006 | Signal validity and snapshot freshness | **Structural validity + bundled as-of date** — validity criteria; snapshot displayed; snapshot-relative temporal rules; no staleness threshold; invalid evidence excluded and disclosed; demonstration-only. |
| UD-007 | Default persona on session start | **Intermediate pre-selected** — non-blocking; changeable before or after evaluation; presentation depth only; reset/reload clear user selection then re-initialize default; active persona visible; demonstration-only. |
| UD-008 | Reset confirmation behaviour | **Confirm when evaluation results exist** — immediate reset otherwise; Cancel safe default; Reset session clears to project-selection state with Intermediate default; accessible confirmation; no undo; reload exempt; demonstration-only. |
| UD-009 | Invalid or empty sample project handling | **Allow selection; validate immediately; block evaluation when unusable** — Invalid sample data state; no fabrication; recovery actions; distinguish from Partial/Unmeasured missing evidence; demonstration-only. |
| UD-010 | Persona coaching contract | **Structured depth tiers** — analytical invariance; required Novice/Intermediate/Expert presentation elements; Expert collapses with full evidence access; no recalculation on persona change; demonstration-only. |
| UD-011 | Methodology normalization verification | **Canonical mapping in evidence drilldown** — mapping provenance per evidence item; bundled mapped examples per representative source; equivalent terms to same canonical type; failed mappings excluded and visible; demonstration-only. |

## Requirements Traceability

| Requirement | Acceptance Scenario(s) | Success Criteria |
|-------------|------------------------|------------------|
| FR-001 | AS-001, AS-024, AS-044 | SC-001 |
| FR-002 | AS-001, AS-003, AS-004, AS-005 | SC-006 |
| FR-003 | AS-003, AS-013 | SC-006 |
| FR-004 | AS-001, AS-004 | SC-001, SC-006 |
| FR-005 | AS-005, AS-037, AS-052 | SC-006 |
| FR-038 | AS-028, AS-050, AS-051, AS-052, AS-053, AS-054 | SC-005, SC-006 |
| FR-006 | AS-025 | SC-004 |
| FR-007 | AS-026, AS-027, AS-048, AS-049 | SC-004 |
| FR-037 | AS-046, AS-047, AS-048, AS-049 | SC-004, SC-005 |
| FR-008 | AS-020, AS-044, AS-045, AS-055, AS-056 | SC-003 |
| FR-036 | AS-001, AS-044, AS-045, AS-026, AS-027 | SC-004 |
| FR-009 | AS-020, AS-022, AS-044, AS-045, AS-056 | SC-003 |
| FR-010 | AS-020, AS-021, AS-045, AS-055, AS-058 | SC-002, SC-003 |
| FR-039 | AS-055, AS-056, AS-057, AS-058 | SC-003 |
| FR-011 | AS-006 | — |
| FR-012 | AS-007 | — |
| FR-013 | AS-007, AS-042, AS-043, AS-062 | — |
| FR-040 | AS-059, AS-060, AS-061, AS-062, AS-063 | SC-002 |
| FR-014 | AS-001 | SC-001 |
| FR-015 | AS-009, AS-016, AS-059, AS-063 | — |
| FR-016 | AS-009, AS-010, AS-036 | — |
| FR-017 | AS-017, AS-018 | — |
| FR-018 | AS-009, AS-010, AS-011 | — |
| FR-019 | AS-011 | — |
| FR-020 | AS-001, AS-005, AS-012, AS-033, AS-034, AS-035, AS-037, AS-038, AS-039 | SC-002 |
| FR-031 | AS-005, AS-033, AS-034, AS-035, AS-037 | SC-002 |
| FR-032 | AS-010, AS-035, AS-036 | — |
| FR-033 | AS-005, AS-012, AS-037, AS-038, AS-039 | SC-006 |
| FR-035 | AS-042, AS-043 | — |
| FR-021 | AS-001, AS-021, AS-040, AS-041 | SC-002 |
| FR-022 | AS-022, AS-040, AS-041 | — |
| FR-023 | AS-020, AS-022, AS-056 | SC-003 |
| FR-024 | AS-021, AS-040, AS-041 | SC-002 |
| FR-034 | AS-021, AS-040, AS-041 | SC-002 |
| FR-025 | AS-024 | SC-001 |
| FR-026 | AS-025 | SC-004 |
| FR-027 | AS-013, AS-014, AS-015, AS-019 | SC-005 |
| FR-030 | AS-013, AS-014, AS-015, AS-032 | SC-002 |
| FR-028 | AS-030, AS-031, AS-047, AS-057 | SC-005 |
| FR-029 | AS-002, AS-008, AS-009, AS-010, AS-011, AS-012, AS-013, AS-014, AS-015, AS-023, AS-026, AS-028, AS-029, AS-035, AS-036, AS-037, AS-038, AS-043, AS-044, AS-046, AS-050, AS-051, AS-053 | SC-005 |
| BR-001 | AS-001, AS-021, AS-061 | SC-002 |
| BR-002 | AS-001, AS-007, AS-059, AS-060, AS-061, AS-062, AS-063 | SC-002 |
| BR-018 | AS-059, AS-060, AS-061, AS-062, AS-063 | SC-002 |
| BR-013 | AS-042, AS-043 | — |
| BR-003 | AS-005, AS-011, AS-012, AS-035, AS-039 | — |
| BR-004 | AS-010, AS-036 | — |
| BR-005 | AS-022, AS-040, AS-043 | — |
| BR-006 | AS-020, AS-055, AS-058 | SC-003 |
| BR-017 | AS-055, AS-056, AS-057, AS-058 | SC-003 |
| BR-007 | AS-026, AS-027, AS-048, AS-049 | SC-004 |
| BR-014 | AS-044, AS-045, AS-026, AS-027 | SC-004 |
| BR-015 | AS-046, AS-047, AS-048, AS-049 | SC-004, SC-005 |
| BR-016 | AS-028, AS-050, AS-051, AS-052, AS-053, AS-054 | SC-005, SC-006 |
| BR-008 | AS-013, AS-014, AS-015, AS-032, AS-034 | SC-002 |
| BR-009 | AS-005, AS-033, AS-034, AS-035 | SC-002 |
| BR-010 | AS-010, AS-035, AS-036 | — |
| BR-011 | AS-005, AS-012, AS-037, AS-038, AS-039 | SC-006 |
| BR-012 | AS-021, AS-040, AS-041, AS-043 | SC-002 |

*Acceptance scenarios AS-001 through AS-063 are defined in User Scenarios & Testing.
Em dash (—) indicates no direct success criterion mapping for that requirement.*
