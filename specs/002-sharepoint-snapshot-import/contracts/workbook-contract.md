# Workbook Contract v1.0 — Implementation Contract

**Feature**: `002-sharepoint-snapshot-import`  
**Normative spec**: `../spec.md` §Workbook Contract v1.0  
**Validation module**: `src/import/validation/validateWorkbookContract.ts`

## Version gate

| Field | Worksheet | Row | Rule |
|-------|-----------|-----|------|
| `templateVersion` | `Project` | 2 | Must equal literal `1.0` |

## Required worksheets

Exact names (case-sensitive): `Project`, `Schedule`, `Delivery`, `Team`, `Risk`.

## Row layout

| Worksheet type | Row 1 | Row 2 | Rows 3+ |
|----------------|-------|-------|---------|
| `Project` | Headers | **Mandatory** populated required fields | Must be empty of contract data |
| Dimension sheets | Headers | Optional snapshot row | Must be empty of contract data |

Empty/absent dimension row 2 → **no signals** for that dimension → **Unmeasured** at evaluation (not structural failure).

## Header columns (row 1)

### Project

| Column | Required header | Row 2 required |
|--------|-----------------|----------------|
| `templateVersion` | Yes | Yes (`1.0`) |
| `projectKey` | Yes | Yes (non-empty) |
| `projectName` | Yes | No |
| `asOfDate` | Yes | Yes (ISO `YYYY-MM-DD`) |
| `snapshotLabel` | Yes | No |

### Schedule

`slipDays`, `milestoneDueDate`, `onTimePercent`

### Delivery

`blockerState`, `changeRatePercent`, `trendPercent`

### Team

`engagementScore`, `completionPercent`

### Risk

`escalationPriority`, `gapPriority`

Extra columns on any sheet may be ignored if they do not interfere with header detection.

## Column → mapping registry

| Worksheet | Column | `mappingKey` | Payload fields |
|-----------|--------|--------------|----------------|
| Schedule | `slipDays` | `milestone-slip` | `{ slipDays }` |
| Schedule | `milestoneDueDate` | `milestone-slip` | `{ milestoneDueDate }` (adjunct) |
| Schedule | `onTimePercent` | `baseline-health` | `{ onTimePercent }` |
| Delivery | `blockerState` | `blocker-open` | `{ blockerState }` |
| Delivery | `changeRatePercent` | `scope-stability` | `{ changeRatePercent }` |
| Delivery | `trendPercent` | `velocity-trend` | `{ trendPercent }` |
| Team | `engagementScore` | `engagement-score` | `{ engagementScore }` |
| Team | `completionPercent` | `communication-cadence` | `{ completionPercent }` |
| Risk | `escalationPriority` | `issue-escalation` | `{ escalationPriority }` |
| Risk | `gapPriority` | `governance-gap` | `{ gapPriority }` |

`milestoneDueDate` alone does not satisfy Schedule measurement; paired with `slipDays` per 001 canonical coverage.

## Cell type rules

| Column pattern | Valid values | Invalid handling |
|----------------|--------------|------------------|
| `templateVersion` | `1.0` exactly | Structural failure |
| `asOfDate`, `milestoneDueDate` | ISO calendar date | Structural if `asOfDate` invalid; signal exclude if optional date invalid |
| `slipDays` | Integer | Signal exclude (BR-003) |
| `onTimePercent`, `engagementScore`, `completionPercent` | Number 0–100 | Signal exclude |
| `changeRatePercent` | Number ≥ 0 | Signal exclude |
| `trendPercent` | Number | Signal exclude |
| `blockerState`, `escalationPriority`, `gapPriority` | Enum: `none`, `closed`, `advisory`, `important`, `urgent` | Signal exclude |

## Structural validation algorithm (deterministic order)

1. Reject non-`.xlsx` before parse (`unsupported-file-type`).
2. Parse bytes → `ParsedWorkbook`; on throw → `parse-failure`.
3. For each required worksheet: exists → else `missing-worksheet`.
4. For each worksheet: row 1 contains all required headers → else `missing-header-column`.
5. Scan rows ≥ 3 for non-empty cells in contract columns → `extra-data-rows`.
6. Validate `Project` row 2 required fields → template / identity / date categories.
7. If all pass → `{ ok: true }` and proceed to normalization.

Normalization runs **after** structural success; per-cell type failures become invalid evidence, not workbook-level structural failure (unless `Project` row 2 affected).

## Validation categories → recovery guidance

| Category | User message theme |
|----------|-------------------|
| `unsupported-file-type` | Select a `.xlsx` workbook |
| `unsupported-template-version` | Set `templateVersion` to `1.0` on Project row 2 |
| `missing-worksheet` | Add missing worksheet from contract template |
| `missing-header-column` | Restore template header row |
| `missing-project-row` | Populate Project row 2 |
| `invalid-project-identity` | Provide `projectKey` |
| `invalid-snapshot-date` | Fix `asOfDate` format |
| `extra-data-rows` | Remove data below row 2 |
| `parse-failure` | Reselect file; file may be corrupt |

## Test fixtures

Committed binaries and manifest: **`tests/fixtures/workbooks/README.md`** (cell values, expected outcomes, SHA-256 hashes).

| Fixture file | Purpose |
|--------------|---------|
| `complete-v1.xlsx` | AS-001/003 golden import equivalent |
| `incomplete-team-empty-row2.xlsx` | AS-004 Unmeasured Team |
| `partial-schedule.xlsx` | AS-005 Partial Schedule |
| `all-dimensions-empty-row2.xlsx` | ADR-011 — zero signals, all Unmeasured |
| `invalid-template-version.xlsx` | AS-022 |
| `missing-project-row2.xlsx` | AS-008 |
| `extra-row3-data.xlsx` | AS-008 rows 3+ |
| `invalid-not-xlsx.bin` | AS-007 (extension/MIME check) |

Binary files are committed during implementation; manifest is authoritative for cell content. No runtime workbook-writing dependency.
