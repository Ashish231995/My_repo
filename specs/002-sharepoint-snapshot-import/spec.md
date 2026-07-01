# Feature Specification: SharePoint-Synced Project Snapshot Import

**Feature Branch**: `002-sharepoint-snapshot-import`

**Created**: 2026-07-01

**Status**: Draft

**Input**: Allow a project manager to evaluate real project health by selecting a
standardized Excel workbook stored in a DXC SharePoint document library that has
been synchronized locally through OneDrive — extending the completed
`001-pm-copilot-demo` baseline without revising its scoring rules, personas, or
privacy model.

**Baseline extension**: This feature **extends** `001-pm-copilot-demo`. All
Demonstration Policy v1.0 rules, canonical signal types, health mappings,
recommendation rules, persona invariants, sample projects A–C, dashboard
behaviour, evidence model, accessibility standards, and completed task history
remain authoritative unless this specification explicitly adds import-specific
requirements.

**Constitution**: Compliant with `.specify/memory/constitution.md` (PM Copilot
v1.0.0). This specification does **not** amend the constitution.

## Clarifications

### Session 2026-07-01

- Q: UD-001 — Worksheet row layout? → A: **Option A** — row 2 is the only permitted snapshot row on every worksheet; **Project** row 2 is mandatory (`templateVersion`, `projectKey`, `asOfDate`); dimension worksheets (`Schedule`, `Delivery`, `Team`, `Risk`) may have absent or empty row 2 (Unmeasured, not structural failure); partially populated dimension row 2 yields Partial or Measured per existing rules; populated contract data in rows 3+ is structurally invalid; provenance uses row 2 when evidence exists.
- Q: UD-002 — Integration checklist for imported projects? → A: **Option C** — checklist applies only to bundled Sample Projects A–C; hidden for imported projects; every valid mapped workbook signal participates in evaluation; switching between bundled and imported modes clears stale evaluation state.
- Q: UD-003 — Template version identification? → A: **Option A** — require `templateVersion` = `1.0` as a required field on the `Project` worksheet; missing, malformed, or unsupported versions block import with clear recovery guidance.

## Purpose and Business Context

Project managers often maintain standardized project health evidence in Excel
workbooks stored in DXC SharePoint libraries. When OneDrive synchronizes those
files locally, a project manager can evaluate current workbook content without
connecting PM Copilot to SharePoint, Microsoft Graph, or Entra ID.

This feature adds a **local file-selection import path** that:

1. Acquires a user-selected `.xlsx` workbook from the synchronized local copy
2. Validates workbook structure against a versioned contract
3. Normalizes valid rows into the **existing** canonical project-signal model
4. Runs the **existing** deterministic evaluation pipeline unchanged
5. Presents results with import provenance and refresh controls

Sample Projects A, B, and C remain available as bundled fallback demonstrations.

## Architectural Separation (mandatory)

The following concerns MUST remain distinct in requirements, acceptance scenarios,
and future planning:

| Stage | Responsibility |
|-------|----------------|
| **Source acquisition** | User-initiated local file selection only; no URL, API, or sync automation |
| **Workbook validation** | Structural and type checks before evaluation; block on invalid |
| **Normalization** | Map validated workbook cells to canonical signals and snapshot metadata |
| **Evaluation** | Reuse approved Demonstration Rule Catalog v1.0 pipeline with no import-specific scoring |

## Workbook Contract v1.0

### Scope

- **Format**: One `.xlsx` workbook per import
- **Worksheets** (exact names, case-sensitive): `Project`, `Schedule`, `Delivery`, `Team`, `Risk`
- **Layout**:
  - Row 1 = contract column headers on every required worksheet.
  - Row 2 = the **only permitted snapshot data row** (provenance row identifier `2`). Populated contract data in rows 3+ is structurally invalid.
  - **`Project` row 2 is mandatory** — must contain `templateVersion`, `projectKey`, and `asOfDate` (and optional columns when present). Missing or empty required `Project` row 2 values block import structurally.
  - **Dimension worksheets** (`Schedule`, `Delivery`, `Team`, `Risk`): worksheet and recognized header columns are mandatory; row 2 may be **absent** or contain **empty canonical cells** without structural failure.
- **Data semantics**: Workbooks contain **normalized aggregate project-health signals**, not raw milestone registers, issue lists, or multi-row evidence tables.
- **Empty / absent dimension evidence**: A dimension worksheet with headers only, no row 2, or an empty row 2 represents **no evidence** and produces an **Unmeasured** dimension — not a structural validation failure.
- **Partial dimension evidence**: A partially populated row 2 on a dimension worksheet produces **Partial** or **Measured** outcomes according to existing canonical coverage rules — never fabricated health values.
- **Scoring rules**: No new health mappings, dimension formulas, composite rules, or recommendation rules may be invented to accommodate workbook columns. Columns MUST map to the nine approved canonical signal types in Demonstration Rule Catalog v1.0.

### Worksheet: `Project` (required)

Provides project identity, template version gate, and authoritative snapshot date for all temporal rules.

| Column | Required | Type | Maps to |
|--------|----------|------|---------|
| `templateVersion` | Yes | Literal `1.0` | Workbook Contract v1.0 gate |
| `projectKey` | Yes | Non-empty text | Project identity |
| `projectName` | No | Text | Display name |
| `asOfDate` | Yes | ISO 8601 calendar date (`YYYY-MM-DD`) | Authoritative snapshot as-of date |
| `snapshotLabel` | No | Text | Optional display label |

Row 2 MUST be present and populated for all required `Project` columns (`templateVersion`, `projectKey`, `asOfDate`).

### Worksheet: `Schedule`

Evidence for Schedule dimension canonical types. Row 1 = required contract headers; row 2 is the only permitted snapshot row and may be absent or empty (Unmeasured Schedule — not structural failure).

| Column | Required for Measured Schedule | Type | Canonical type | Payload field |
|--------|-------------------------------|------|----------------|-----------------|
| `slipDays` | Yes* | Integer number | `schedule.milestone-slip` | `slipDays` |
| `milestoneDueDate` | No | ISO 8601 date | `schedule.milestone-slip` (timing adjunct) | `milestoneDueDate` |
| `onTimePercent` | Yes* | Number 0–100 | `schedule.baseline-health` | `onTimePercent` |

\*Required for a **fully Measured** Schedule dimension; absence yields Partial or Unmeasured per existing rules — never fabricated values.

### Worksheet: `Delivery`

Row 1 = required contract headers; row 2 is the only permitted snapshot row and may be absent or empty (Unmeasured Delivery — not structural failure).

| Column | Required for Measured Delivery | Type | Canonical type | Payload field |
|--------|-------------------------------|------|----------------|-----------------|
| `blockerState` | Yes* | Enum: `none`, `closed`, `advisory`, `important`, `urgent` | `delivery.blocker-open` | `blockerState` |
| `changeRatePercent` | Yes* | Number ≥ 0 | `delivery.scope-stability` | `changeRatePercent` |
| `trendPercent` | Yes* | Number | `delivery.velocity-trend` | `trendPercent` |

### Worksheet: `Team`

Row 1 = required contract headers; row 2 is the only permitted snapshot row and may be absent or empty (Unmeasured Team — not structural failure).

| Column | Required for Measured Team | Type | Canonical type | Payload field |
|--------|---------------------------|------|----------------|-----------------|
| `engagementScore` | Yes* | Number 0–100 | `team.engagement-score` | `engagementScore` |
| `completionPercent` | Yes* | Number 0–100 | `team.communication-cadence` | `completionPercent` |

### Worksheet: `Risk`

Row 1 = required contract headers; row 2 is the only permitted snapshot row and may be absent or empty (Unmeasured Risk — not structural failure).

| Column | Required for Measured Risk | Type | Canonical type | Payload field |
|--------|---------------------------|------|----------------|-----------------|
| `escalationPriority` | Yes* | Enum: `none`, `closed`, `advisory`, `important`, `urgent` | `risk.issue-escalation` | `escalationPriority` |
| `gapPriority` | Yes* | Enum: `none`, `closed`, `advisory`, `important`, `urgent` | `risk.governance-gap` | `gapPriority` |

### Evidence provenance (every imported item)

Each normalized evidence item MUST retain:

- Source workbook filename (not full filesystem path in UI)
- Worksheet name
- Row identifier (**row 2** when evidence exists on a dimension worksheet; always row 2 for `Project` identity fields)
- Source column name
- Canonical signal type
- Mapping outcome (mapped / failed / unsupported)
- Scoring inclusion decision and exclusion reason when applicable

The UI MUST NOT expose unnecessary raw or sensitive payload values beyond what the
existing evidence drilldown already shows for bundled samples.

### Template identification

Workbook Contract v1.0 is identified by a required `templateVersion` field on the
`Project` worksheet (row 2) with value exactly **`1.0`**.

- **Supported**: `templateVersion` present and equal to `1.0` — import validation may proceed to structural and type checks.
- **Unsupported / invalid**: `templateVersion` missing, blank, malformed, or any value other than `1.0` — import is blocked before evaluation with user-understandable recovery guidance; no fabricated health results.

## Privacy and Trust Messaging

- All workbook bytes and parsed project data remain in **browser memory only** for the active session.
- The application MUST NOT upload workbook content, call Microsoft Graph, call SharePoint REST APIs, accept SharePoint URLs, perform Entra authentication, or write to SharePoint.
- The application MUST NOT use localStorage, sessionStorage, IndexedDB, cookies, analytics, or telemetry for imported project data.
- The application MUST NOT make external runtime network requests.
- Reset or full page reload MUST clear workbook reference, parsed data, and evaluation results with no recoverable imported state.
- The UI MUST clearly state that the source is a **locally synchronized SharePoint snapshot** selected by the user — **not** a live SharePoint connection.

## User Scenarios & Testing

### User Story 1 - Import and evaluate a complete workbook (Priority: P1)

A project manager selects a locally synchronized SharePoint Excel snapshot that
contains all required worksheets and valid values for every canonical signal type.
They receive the same style of health dashboard as bundled samples: composite,
four dimensions, findings, and recommendations — with import provenance shown.

**Why this priority**: Core value proposition — real project evaluation from a
standardized workbook without enterprise API integration.

**Independent Test**: Select a complete valid `.xlsx`, evaluate, and verify four
Measured dimensions, composite eligibility, and provenance banner — without using
sample projects.

**Acceptance Scenarios**:

1. **Given** a new local session, **When** the user chooses **Import SharePoint-synced snapshot** and selects a valid complete `.xlsx` workbook, **Then** the application validates structure, normalizes signals, evaluates health, and shows composite and dimension results with no external network activity.
2. **Given** a successfully imported workbook, **When** the dashboard renders, **Then** it shows imported project identity, source filename, workbook snapshot as-of date, and local file last-modified time.
3. **Given** a complete imported workbook, **When** evaluation completes, **Then** all four dimensions are **Measured** and composite coverage reflects four contributing dimensions per Demonstration Policy v1.0.

---

### User Story 2 - Import incomplete but valid workbook (Priority: P1)

A project manager imports a structurally valid workbook where one or more dimension
worksheets have headers only, no row 2, or empty canonical cells on row 2. Partial
and Unmeasured states appear per existing rules; no scores are fabricated for
missing evidence.

**Why this priority**: Real workbooks are often incomplete; behaviour must match
bundled Sample C semantics.

**Independent Test**: Import workbook with `Team` worksheet present (recognized
headers) but headers only or empty row 2; verify structurally valid import,
Unmeasured Team, valid composite rules, and no invented Team health values.

**Acceptance Scenarios**:

1. **Given** a structurally valid workbook with `Team` headers but no row 2 or an empty row 2 (all canonical cells blank), **When** evaluated, **Then** import passes structural validation, Team is **Unmeasured**, shows no numeric score, and composite follows existing minimum-coverage rules.
2. **Given** a valid workbook with only one of two required Schedule canonical values populated on row 2, **When** evaluated, **Then** Schedule is **Partial** with provisional labelling and is excluded from composite per existing rules.
3. **Given** missing or empty canonical cells on a dimension row 2, **When** evaluated, **Then** the application does not substitute zero, mean, or default health values.
4. **Given** a dimension worksheet with all required canonical values present and valid on row 2, **When** evaluated, **Then** that dimension is **Measured** per existing canonical coverage rules.

---

### User Story 3 - Reject invalid workbook structure (Priority: P1)

A project manager selects a workbook that is not `.xlsx`, is missing required
worksheets or columns, or contains malformed types or dates. Evaluation is blocked
with clear recovery guidance; no fabricated health results appear.

**Why this priority**: Trust and constitution compliance — invalid imports must not
produce scores.

**Independent Test**: Attempt import of corrupt structure; verify blocked
evaluation, validation category message, and recovery to sample projects.

**Acceptance Scenarios**:

1. **Given** a non-`.xlsx` file, **When** the user selects it, **Then** the application rejects it before parsing with a user-understandable unsupported-file message.
2. **Given** an `.xlsx` workbook missing the `Project` worksheet or required `projectKey`, `templateVersion`, or `asOfDate` columns, **When** selected, **Then** structural validation fails, evaluation is blocked, and no composite, dimension scores, findings, or recommendations are shown.
3. **Given** a structurally invalid imported workbook, **When** validation fails, **Then** the user can return to Sample Projects A, B, or C without reload.
4. **Given** a workbook with `templateVersion` = `1.0` on `Project` row 2 and all other contract requirements met, **When** selected, **Then** template version validation passes and import may proceed to remaining structural and type checks.
5. **Given** a workbook with `templateVersion` missing, blank, malformed, or not equal to `1.0`, **When** selected, **Then** import is blocked before evaluation with clear recovery guidance naming the required `1.0` value; no fabricated health results are shown.

---

### User Story 4 - Refresh snapshot after local file changes (Priority: P2)

After OneDrive syncs an updated workbook, the project manager refreshes the
in-memory snapshot to recalculate health from the new local file contents.

**Why this priority**: Supports the “synchronized snapshot” story without background
monitoring.

**Independent Test**: Import workbook, change local file content, refresh, verify
updated results replace prior in-memory evaluation.

**Acceptance Scenarios**:

1. **Given** an evaluated imported workbook, **When** the user selects **Refresh snapshot** and the browser still permits reading the same file, **Then** the application rereads the workbook, replaces prior parsed data, and recalculates results.
2. **Given** a refreshed workbook with changed evidence values, **When** evaluation completes, **Then** prior in-memory snapshot data is fully replaced — not merged with stale values.
3. **Given** browser file permission is no longer available on refresh, **When** the user attempts refresh, **Then** the application prompts the user to reselect the workbook through file selection.

---

### User Story 5 - Deterministic repeat evaluation and persona invariance (Priority: P2)

The same unchanged workbook produces identical analytical results on repeat
evaluation. Persona changes affect presentation only.

**Why this priority**: Extends constitution Principles III and V to imported data.

**Independent Test**: Evaluate twice without workbook change; switch personas;
compare scores and recommendation sets.

**Acceptance Scenarios**:

1. **Given** an imported workbook that has not changed, **When** the user evaluates twice without modifying workbook bytes, **Then** dimension scores, composite, findings, and recommendations are identical.
2. **Given** a completed imported evaluation, **When** the user changes persona among Novice, Intermediate, and Expert, **Then** underlying health values, severity, priority ordering, and recommendation set remain identical; only presentation depth may change.

---

### User Story 6 - Privacy reset and sample-project fallback (Priority: P2)

Reset or reload clears all imported workbook context. Sample projects remain
fully operational after import failure or successful import.

**Why this priority**: Constitution Principle II and fallback demonstration paths.

**Independent Test**: Import workbook, reset session, verify no imported metadata
remains; select Sample B and evaluate successfully.

**Acceptance Scenarios**:

1. **Given** an evaluated imported workbook, **When** the user resets the session or reloads the page, **Then** workbook reference, parsed data, and evaluation results are cleared with Intermediate persona default restored.
2. **Given** a failed import validation state, **When** the user selects Sample Project B, **Then** bundled evaluation proceeds normally with golden-compatible behaviour preserved and the integration checklist is visible.
3. **Given** any import attempt, **When** the session is active, **Then** no imported project data is written to persistent browser storage or emitted to external services.
4. **Given** an evaluated imported workbook, **When** the user selects a bundled Sample Project A, B, or C, **Then** import context and prior evaluation results are cleared, the integration checklist is shown, and bundled evaluation may proceed.
5. **Given** a bundled sample project with visible integration checklist, **When** the user imports a valid workbook, **Then** the integration checklist is hidden and every valid mapped workbook signal participates in evaluation.

---

### User Story 7 - Keyboard-accessible import flows (Priority: P3)

Import, refresh, validation recovery, and return to sample projects are operable
via keyboard following the same accessibility standards as the baseline demo.

**Why this priority**: Constitution Principle VIII extension to new flows.

**Independent Test**: Complete import selection, evaluation, refresh prompt, and
recovery using keyboard only.

**Acceptance Scenarios**:

1. **Given** the project selection area, **When** a keyboard-only user activates **Import SharePoint-synced snapshot**, **Then** the native file-selection action is reachable and subsequent validation and evaluation controls remain keyboard operable.
2. **Given** an import validation failure panel, **When** the user navigates by keyboard, **Then** recovery actions to select a sample project or reselect a workbook are reachable without pointer input.

---

### Edge Cases

- Workbook selected then immediately cancelled in the file picker — no partial import state
- Empty `.xlsx` or missing required worksheets — structural validation failure
- Missing recognized header columns on any required worksheet — structural validation failure
- `Project` worksheet with headers only or missing/empty required row 2 values (`templateVersion`, `projectKey`, `asOfDate`) — structural validation failure
- Dimension worksheet (`Schedule`, `Delivery`, `Team`, `Risk`) with headers only, no row 2, or empty row 2 — structurally valid; dimension is **Unmeasured**
- Partially populated dimension row 2 — structurally valid; dimension is **Partial** or **Measured** per existing canonical coverage rules
- Populated contract data in rows 3+ on any worksheet — structural validation failure
- Valid types with out-of-range enum values on row 2 — invalid evidence excluded, may yield Partial/Unmeasured
- `asOfDate` present but not a valid calendar date — blocks evaluation (structural/type failure on `Project` row 2)
- `templateVersion` missing, blank, malformed, or not `1.0` — blocks import before evaluation with recovery guidance
- Very large workbook with extra worksheets or columns — ignored if not in contract; missing required contract worksheets or headers still fail validation
- User imports workbook then switches to a sample project — imported state and prior evaluation cleared; bundled path active; integration checklist shown
- User selects bundled sample then imports — prior bundled evaluation cleared; integration checklist hidden for import mode
- User imports while a sample project evaluation is visible — prior evaluation cleared per session rules

## Requirements

### Functional Requirements

**Source acquisition**

- **FR-001**: The project selection area MUST continue to list bundled Sample Projects A, B, and C unchanged.
- **FR-002**: The application MUST offer **Import SharePoint-synced snapshot** as a distinct user action alongside bundled sample selection.
- **FR-003**: Import MUST use an explicit browser file-selection action limited to `.xlsx` workbooks.
- **FR-004**: The application MUST NOT accept SharePoint URLs, folder paths, Graph tokens, or automated sync triggers.

**Validation**

- **FR-005**: The application MUST validate workbook structure against Workbook Contract v1.0 before evaluation: all five required worksheets with recognized header columns; mandatory populated `Project` row 2; row 2 as the only permitted snapshot row on dimension worksheets (absent or empty row 2 is valid); and no populated contract data in rows 3+.
- **FR-006**: Unsupported file types MUST be rejected before parsing.
- **FR-007**: Structural validation MUST block evaluation only for: missing required worksheets; missing recognized header columns on any required worksheet; missing, empty, or invalid required `Project` row 2 values (`templateVersion` not exactly `1.0`, empty `projectKey`, invalid `asOfDate`); or populated contract data in rows 3+. Dimension worksheets with headers only, absent row 2, or empty canonical cells on row 2 MUST NOT be treated as structural failures — they produce **Unmeasured** dimensions at evaluation. Malformed cell values on row 2 are handled per BR-003 (invalid evidence exclusion), not as blanket structural failure of the whole workbook unless `Project` row 2 required fields are affected.
- **FR-008**: Structurally invalid workbooks MUST NOT display fabricated composite scores, dimension scores, classifications, findings, or recommendations.

**Normalization and evaluation**

- **FR-009**: Valid workbook data MUST be parsed entirely in browser memory and normalized into the existing canonical project-signal model without altering approved scoring or recommendation rules.
- **FR-010**: Evaluation of a valid imported snapshot MUST use the existing deterministic evaluation pipeline from `001-pm-copilot-demo`.
- **FR-011**: A valid complete workbook MUST be able to produce all four **Measured** dimensions when all required canonical values are present and valid.
- **FR-012**: A valid incomplete workbook MUST produce **Partial** or **Unmeasured** dimensions according to existing Demonstration Policy v1.0 — never invented health values.
- **FR-013**: Each imported evidence item MUST retain workbook provenance (filename, worksheet, row, column, canonical type, mapping outcome, scoring inclusion).
- **FR-014**: The UI MUST NOT expose unnecessary raw or sensitive payload values beyond existing evidence presentation norms.

**Session, refresh, and fallback**

- **FR-015**: The dashboard MUST identify imported projects with source filename, workbook snapshot as-of date, and local file last-modified time.
- **FR-016**: The user MUST be able to **Refresh snapshot** to reread the selected workbook or reselect it when browser permission requires.
- **FR-017**: Refreshing a changed workbook MUST replace the previous in-memory snapshot and recalculate results.
- **FR-018**: Re-evaluating an unchanged workbook MUST produce identical analytical results.
- **FR-019**: Reset or page reload MUST clear workbook reference, parsed data, and evaluation results.
- **FR-020**: Sample Projects A–C MUST remain fully operational before, during, and after import attempts.

**Persona, accessibility, and integration checklist**

- **FR-021**: Persona selection MUST modify presentation only for imported evaluations.
- **FR-022**: Import, refresh, validation recovery, and reset flows MUST be keyboard accessible.
- **FR-023**: The integration checklist enable/disable behaviour MUST apply only when a bundled Sample Project A, B, or C is selected; it MUST be hidden for imported workbook projects. Every valid mapped workbook signal MUST participate in evaluation without per-signal checklist toggles. Switching between bundled and imported project modes MUST clear stale evaluation results and restore the correct checklist visibility for the active mode.

**Privacy**

- **FR-024**: Imported workbook bytes and parsed project data MUST remain in browser memory only for the active session.
- **FR-025**: The application MUST NOT upload, persist, or telemeter imported project data.
- **FR-026**: The UI MUST state that the source is a locally synchronized SharePoint snapshot — not a live SharePoint connection.

### Business Rules (import-specific extensions)

- **BR-001**: Workbook Contract v1.0 column semantics MUST derive from the approved nine canonical signal types; no workbook-only scoring shortcuts.
- **BR-002**: Missing optional evidence MUST NOT be imputed as zero, average, or “healthy default”.
- **BR-003**: Invalid cell values MUST be treated as invalid evidence per baseline Signal Validity policy — excluded from scoring with visible reasons.
- **BR-004**: Imported snapshot `asOfDate` from the `Project` worksheet is authoritative for all temporal and recommendation timing rules.
- **BR-005**: Bundled sample projects and imported workbook projects MUST NOT be evaluated simultaneously; one active project context at a time.
- **BR-006**: Switching between bundled sample selection and imported workbook selection MUST clear prior evaluation results, parsed import state (when leaving import mode), and integration checklist visibility MUST match the active mode (visible for bundled only).

### Validation requirements (Workbook Contract v1.0)

**Structural failures (block import / evaluation):**

- Missing any required worksheet (`Project`, `Schedule`, `Delivery`, `Team`, `Risk`).
- Missing recognized contract header columns on any required worksheet (row 1).
- `Project` row 2 missing or empty for required fields: `templateVersion` (must be exactly `1.0`), `projectKey` (non-empty), or `asOfDate` (valid ISO 8601 calendar date).
- Populated contract data in rows 3+ on any worksheet.

**Not structural failures (proceed to normalization and evaluation):**

- Dimension worksheet with headers only, no row 2, or row 2 with all canonical cells empty → **Unmeasured** dimension.
- Dimension row 2 partially populated → **Partial** or **Measured** per existing canonical coverage rules.
- Empty canonical cells alongside populated canonical cells on the same dimension row 2 → absent evidence for those cells only.

**Provenance:**

- Evidence provenance MUST record row **2** whenever normalized evidence exists on a dimension worksheet; `Project` identity fields always originate from row 2.

### Key Entities

- **ImportedWorkbookReference**: In-memory handle to user-selected file metadata (filename, last modified time) — not a persisted path
- **WorkbookValidationResult**: Structural outcome with user-facing category and messages
- **ImportedSnapshotProject**: Normalized project identity, as-of date, and source signals equivalent to bundled fixture shape
- **ImportProvenance**: Workbook, worksheet, row, and column trace for each evidence item
- **ImportSessionContext**: Active import state distinct from bundled `selectedProjectId` while sharing evaluation result shapes

## Success Criteria

### Measurable Outcomes

- **SC-001**: A project manager can import and evaluate a complete valid workbook and view four Measured dimensions with composite health in one session without external network requests.
- **SC-002**: Re-evaluating the same unchanged workbook twice yields identical dimension scores, composite, findings, and recommendation ordering.
- **SC-003**: Persona changes during an imported evaluation alter presentation only — analytical outputs remain identical.
- **SC-004**: Invalid or unsupported imports are blocked with clear guidance in 100% of defined invalid structure scenarios without fabricated health results.
- **SC-005**: Reset or reload removes all imported workbook context with no recoverable imported project data.
- **SC-006**: Sample Project B bundled evaluation remains available and successful after any import failure or successful import in the same build.
- **SC-007**: Primary import, evaluate, refresh, and recovery flows are completable using keyboard input only.
- **SC-008**: Refresh after a locally changed workbook updates evaluation results to reflect new cell values.

## Assumptions

- Users synchronize SharePoint document libraries through OneDrive on their corporate Windows laptop; PM Copilot reads only the local file the user explicitly selects.
- Workbook Contract v1.0 templates are authored and distributed by the PM/demo team to align with canonical signal columns defined above.
- Microsoft Edge and Chrome remain the supported demonstration browsers from the baseline.
- The existing `001-pm-copilot-demo` evaluation pipeline, rule catalogs, and UI components are reused; this feature adds acquisition, validation, and normalization boundaries only.
- Local file last-modified time is available from the browser file object metadata when permitted.
- Extra worksheets or columns not in the contract may be ignored unless they interfere with required contract detection.

## Out of Scope (Version 1)

- Direct SharePoint URL connectivity, Graph API, SharePoint REST, or Entra authentication
- Automatic SharePoint synchronization or folder-wide scanning
- Multiple simultaneous workbook imports
- Word, PDF, PowerPoint, or email interpretation
- Arbitrary workbook layouts outside Workbook Contract v1.0
- Continuous background file monitoring
- Writing or uploading anything to SharePoint
- Runtime AI interpretation of workbook content
- Revision of Demonstration Rule Catalog v1.0 or constitution

## Resolved Decisions

| ID | Decision | Resolution |
|----|----------|------------|
| UD-001 | Worksheet row layout | **Option A** — row 2 only permitted snapshot row; **Project** row 2 mandatory; dimension row 2 may be absent/empty (Unmeasured, not structural failure); partial dimension row 2 → Partial/Measured; rows 3+ populated → structural failure; provenance row 2 when evidence exists |
| UD-002 | Integration checklist for imports | **Option C** — checklist for bundled Samples A–C only; hidden for imports; all valid mapped signals evaluate; mode switch clears stale evaluation |
| UD-003 | Template version identification | **Option A** — required `templateVersion` = `1.0` on `Project` worksheet; unsupported versions block import |

---

## Acceptance Scenarios (summary index)

| ID | Theme |
|----|-------|
| AS-001 | Complete workbook import and evaluation |
| AS-002 | Import provenance on dashboard |
| AS-003 | Four Measured dimensions from complete workbook |
| AS-004 | Incomplete workbook — Unmeasured dimension (empty/absent dimension row 2) |
| AS-005 | Incomplete workbook — Partial dimension (partially populated row 2) |
| AS-006 | No fabricated values for missing evidence |
| AS-007 | Reject non-xlsx before parsing |
| AS-008 | Block evaluation on structural invalid workbook (missing worksheets/headers, empty Project row 2, rows 3+ data) |
| AS-009 | Recovery to bundled samples after invalid import |
| AS-010 | Refresh snapshot after local file change |
| AS-011 | Replace in-memory data on refresh |
| AS-012 | Reselect workbook when permission lost |
| AS-013 | Deterministic repeat evaluation |
| AS-014 | Persona invariance for imported evaluation |
| AS-015 | Reset clears import context |
| AS-016 | Sample project fallback after import failure |
| AS-017 | No persistence of imported data |
| AS-018 | Keyboard-accessible import and recovery |
| AS-019 | Trust messaging for local snapshot source |
| AS-020 | No runtime network during import flow |
| AS-021 | Supported template version (`1.0`) passes validation gate |
| AS-022 | Unsupported template version blocks import with recovery |
| AS-023 | Mode switch clears evaluation and toggles checklist visibility |

*(Full Given/When/Then detail is captured in User Stories 1–7 above and MUST be expanded into numbered AS blocks during planning traceability.)*
