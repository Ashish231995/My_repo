# UI States and Component Contracts

**Feature**: `001-pm-copilot-demo`  
**Module roots**: `src/features/`, `src/ui/`

## Component hierarchy

```text
App
├── PrivacyIndicator                 # local-only badge
├── AppHeader
│   ├── PersonaSelector              # FR-008, FR-036
│   └── ResetButton                  # FR-037
├── main (landmark)
│   ├── ProjectSelector              # initial selection
│   ├── IntegrationChecklist         # signal groups
│   ├── EvaluateButton
│   ├── InvalidSampleDataPanel       # invalid project
│   ├── ErrorPanel                   # general error
│   └── EvaluationResults (when evaluated)
│       ├── SnapshotBanner           # as-of date
│       ├── CompositeHealthCard      # CHI + coverage statement
│       ├── DimensionCard ×4         # status, score, labels
│       ├── DimensionDetail          # drilldown modal/panel
│       │   └── EvidenceDrilldown    # mapping provenance
│       └── RecommendationsList
│           └── RecommendationCard   # persona-projected coaching
└── ResetConfirmDialog               # focus trap, Cancel default
```

## Required UX states (FR-029)

| State | Component | Key elements |
|-------|-----------|--------------|
| Initial + Intermediate default | `PersonaSelector`, `ProjectSelector` | AS-044 |
| No project selected | `ProjectSelector` empty prompt | AS-002 |
| Integration incomplete | `IntegrationChecklist` warning | AS-008 |
| Measured dimension | `DimensionCard` qualified classification | AS-009, AS-013–015 |
| Partial dimension | Provisional labels, Excluded from Composite | AS-010 |
| Unmeasured dimension | No numeric score | AS-011 |
| Insufficient composite | `CompositeHealthCard` insufficient mode | AS-012 |
| Healthy / At Risk / Critical | Text + icon + label (not colour alone) | AS-013–015, AS-019 |
| No recommendations | `RecommendationsList` empty state | AS-023 |
| Invalid sample data | `InvalidSampleDataPanel` + recovery actions | AS-028, AS-050–054 |
| Reset confirmation | `ResetConfirmDialog` | AS-046–048 |
| General error | `ErrorPanel` | AS-029 |

## Health communication (FR-027)

Each classification renders:

- Text label ("Healthy", "At Risk", "Critical", "Provisional — …")
- Distinct icon shape per band
- Optional colour as **secondary** cue only

## Persona presentation elements (FR-039)

| Element | Novice | Intermediate | Expert |
|---------|--------|--------------|--------|
| Condition definition | Expanded | Concise | Hidden/collapsed |
| Why this matters | Expanded | Brief | Collapsed |
| Step-by-step actions | Yes | Next steps | No |
| Evidence walkthrough | Expanded | Summary bullets | Key refs only |
| Glossary terms | Yes | No | No |
| Recommendation title | Yes | Yes | Prominent |
| Section default | Expanded | Mixed | Collapsed |

## Accessibility contract

| Requirement | Implementation |
|-------------|----------------|
| Keyboard primary flows | All buttons, checklist, dialog, tabs reachable | AS-030 |
| Focus trap | `ResetConfirmDialog` | AS-047 |
| Focus restore | On Cancel reset | AS-047 |
| Landmarks | `header`, `main`, `footer` | |
| Accessible names | `aria-label` on icon-only controls | |
| Expandable evidence | `button` + `aria-expanded` | AS-057 |
| Responsive | CSS grid/flex breakpoints 320px–1920px | AS-031 |

## CSS architecture

- `src/styles/tokens.css` — colours, spacing, type scale (system font stack)
- `src/styles/global.css` — reset, landmarks
- `*.module.css` per component — no CSS-in-JS

## Icons

Local inline SVG React components in `src/ui/icons/`. No icon font CDN.

## Responsive behaviour

| Viewport | Layout |
|----------|--------|
| Narrow (≥320px) | Single column; cards stack |
| Medium (≥768px) | Two-column dimension grid |
| Wide (≥1024px) | Composite + 2×2 dimension grid |

No chart library.
