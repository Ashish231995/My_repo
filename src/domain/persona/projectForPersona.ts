import type { DimensionId, Persona } from '../model/enums';
import type {
  CompositeHealthResult,
  DimensionPresentation,
  DimensionResult,
  EvaluationResult,
  Finding,
  GlossaryEntry,
  PersonaPresentation,
  Recommendation,
  RecommendationPresentation,
} from '../model/evaluation';

const DIMENSION_DISPLAY_NAMES: Record<DimensionId, string> = {
  schedule: 'Schedule Health',
  delivery: 'Delivery & Scope',
  team: 'Team & Communications',
  risk: 'Risk & Governance',
};

const NOVICE_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Canonical signal type',
    definition:
      'A methodology-neutral indicator label used to compare representative sources consistently.',
  },
  {
    term: 'Representative source',
    definition:
      'A bundled demonstration signal label. It does not indicate a live system connection.',
  },
  {
    term: 'Measurement status',
    definition:
      'Shows whether enough valid mapped evidence exists to score a dimension (Measured, Partial, or Unmeasured).',
  },
];

function sectionId(prefix: string, key: string): string {
  return `coach-${prefix}-${key}`;
}

function collapsedForPersona(persona: Persona): boolean {
  return persona === 'expert';
}

function describeEvidenceIds(
  evidenceIndex: EvaluationResult['evidenceIndex'],
  evidenceIds: string[],
): string {
  return evidenceIds
    .map((evidenceId) => {
      const item = evidenceIndex.get(evidenceId);
      if (!item) {
        return evidenceId;
      }
      const type = item.mapping.canonicalType ?? item.mapping.provenance.canonicalSignalType;
      return `${item.sourceTerm} (${type})`;
    })
    .join('; ');
}

function classificationLabel(dimension: DimensionResult): string {
  if (!dimension.classification) {
    return 'not classified';
  }
  if (dimension.classification === 'healthy') {
    return 'Healthy';
  }
  if (dimension.classification === 'at-risk') {
    return 'At Risk';
  }
  return 'Critical';
}

function projectDimension(
  dimension: DimensionResult,
  findings: Finding[],
  persona: Persona,
): DimensionPresentation {
  const displayName = DIMENSION_DISPLAY_NAMES[dimension.dimensionId];
  const dimensionFindings = findings.filter((finding) => finding.dimensionId === dimension.dimensionId);
  const scoringEvidence = dimension.evidence.filter((item) => item.includedInScoring);
  const evidenceLines = scoringEvidence.map(
    (item) =>
      `${item.sourceTerm} maps to ${item.mapping.canonicalType ?? 'unmapped'} with resolved date ${item.resolvedAsOfDate}`,
  );
  const evidenceReferences = scoringEvidence
    .map((item) => `${item.id}: ${item.sourceTerm}`)
    .join('; ');
  const collapsed = collapsedForPersona(persona);
  const prefix = `dimension-${dimension.dimensionId}`;

  const conditionDefinition =
    persona === 'novice'
      ? `${displayName} reflects how representative schedule and delivery signals combine for this dimension. The current measurement status is ${dimension.measurementStatus} with a ${classificationLabel(dimension)} classification when scored.`
      : persona === 'intermediate'
        ? `${displayName} is ${classificationLabel(dimension)} (${dimension.measurementStatus}) with ${Math.round(dimension.coveragePercent)}% required canonical signal coverage.`
        : `${displayName}: ${classificationLabel(dimension)}.`;

  const whyThisMatters =
    persona === 'novice'
      ? `Leaders use ${displayName} to judge delivery confidence before commitments change. A ${classificationLabel(dimension)} result means the bundled representative evidence signals need attention in this area before downstream plans are assumed stable.`
      : persona === 'intermediate'
        ? `${displayName} contributes to the composite view; current signals indicate follow-up is warranted in this area.`
        : `${displayName} — review flagged signals.`;

  const evidenceWalkthrough =
    persona === 'novice'
      ? dimensionFindings.length > 0
        ? `Findings for this dimension: ${dimensionFindings.map((finding) => `${finding.id} (${finding.summary})`).join('; ')}. Representative scoring evidence: ${evidenceLines.join('; ') || 'none included in scoring'}. Open Explain for full provenance without leaving the local session.`
        : `Representative scoring evidence: ${evidenceLines.join('; ') || 'none included in scoring'}. Open Explain to inspect mapping provenance for every included and excluded signal.`
      : persona === 'intermediate'
        ? `Key evidence: ${evidenceLines.join('; ') || 'none included in scoring'}.`
        : evidenceReferences || 'No scoring evidence references.';

  return {
    dimensionId: dimension.dimensionId,
    conditionDefinition,
    whyThisMatters,
    stepByStepGuidance:
      persona === 'novice'
        ? `1. Confirm the measurement status and score shown on the card. 2. Review findings and representative evidence summaries. 3. Open Explain to walk through provenance. 4. Align the recommended actions with this dimension before changing commitments.`
        : null,
    nextSteps:
      persona === 'intermediate'
        ? `Confirm ownership for ${displayName} follow-up and validate the listed representative evidence before the next steering review.`
        : null,
    evidenceWalkthrough,
    evidenceSummary:
      persona === 'intermediate'
        ? evidenceLines.length > 0
          ? evidenceLines.map((line) => `• ${line}`).join('\n')
          : '• No scoring evidence included for this dimension.'
        : null,
    evidenceReferences: persona === 'expert' ? evidenceReferences || null : null,
    glossary: persona === 'novice' ? NOVICE_GLOSSARY : null,
    sections: {
      conditionDefinition: {
        sectionId: sectionId(prefix, 'condition'),
        collapsedByDefault: collapsed,
      },
      whyThisMatters: {
        sectionId: sectionId(prefix, 'why'),
        collapsedByDefault: collapsed,
      },
      evidenceWalkthrough: {
        sectionId: sectionId(prefix, 'evidence'),
        collapsedByDefault: collapsed,
      },
      glossary:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'glossary'), collapsedByDefault: false }
          : null,
      stepByStepGuidance:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'steps'), collapsedByDefault: false }
          : null,
      nextSteps:
        persona === 'intermediate'
          ? { sectionId: sectionId(prefix, 'next'), collapsedByDefault: false }
          : null,
    },
  };
}

function projectComposite(composite: CompositeHealthResult, persona: Persona): PersonaPresentation['composite'] {
  const collapsed = collapsedForPersona(persona);
  const coachingSummary =
    persona === 'novice'
      ? `Composite health summarizes measured dimensions only. ${composite.coverageStatement} Use dimension Explain controls to inspect representative evidence without changing analytical results.`
      : persona === 'intermediate'
        ? `${composite.coverageStatement} Review dimension cards and recommendations for next actions.`
        : composite.coverageStatement;

  return {
    coverageStatement: composite.coverageStatement,
    coachingSummary,
    sections: {
      coachingSummary: {
        sectionId: 'coach-composite-summary',
        collapsedByDefault: collapsed,
      },
    },
  };
}

function projectRecommendation(
  recommendation: Recommendation,
  findings: Finding[],
  evidenceIndex: EvaluationResult['evidenceIndex'],
  persona: Persona,
): RecommendationPresentation {
  const collapsed = collapsedForPersona(persona);
  const prefix = `recommendation-${recommendation.id}`;
  const linkedFindings = recommendation.findingIds
    .map((findingId) => findings.find((finding) => finding.id === findingId))
    .filter((finding): finding is Finding => finding !== undefined);
  const evidenceSummaryText = describeEvidenceIds(evidenceIndex, recommendation.evidenceIds);
  const evidenceReferences = recommendation.evidenceIds.join(', ');

  const coachingRationale =
    persona === 'expert'
      ? recommendation.reason.split('.')[0] ?? recommendation.reason
      : persona === 'novice'
        ? `${recommendation.reason} This guidance is based on the same analytical finding and does not add new urgency.`
        : null;

  return {
    recommendationId: recommendation.id,
    title: recommendation.action,
    coachingRationale,
    whyThisMatters:
      persona === 'novice'
        ? `This recommendation matters because ${recommendation.reason} Addressing it protects delivery confidence while using only the evidence already evaluated in this session. This coaching copy does not add new urgency.`
        : null,
    stepByStepActions:
      persona === 'novice'
        ? `1. Review supporting finding and evidence references. 2. ${recommendation.action}. 3. Confirm accountable owner and timing using evidence-supported dates only. 4. Re-run evaluation after representative signals change in a future demonstration.`
        : null,
    nextSteps:
      persona === 'intermediate'
        ? `Next step: ${recommendation.action} using the evidence references listed below.`
        : null,
    evidenceSummary:
      persona === 'intermediate' || persona === 'novice'
        ? evidenceSummaryText || 'No mapped evidence references.'
        : null,
    evidenceReferences,
    findingsBullets:
      persona === 'expert'
        ? linkedFindings.map((finding) => `${finding.id}: ${finding.summary}`)
        : null,
    glossary: persona === 'novice' ? NOVICE_GLOSSARY : null,
    sections: {
      whyThisMatters:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'why'), collapsedByDefault: false }
          : null,
      coachingRationale:
        coachingRationale !== null
          ? {
              sectionId: sectionId(prefix, 'rationale'),
              collapsedByDefault: collapsed,
            }
          : null,
      evidenceWalkthrough:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'evidence'), collapsedByDefault: false }
          : persona === 'intermediate'
            ? { sectionId: sectionId(prefix, 'evidence'), collapsedByDefault: false }
            : null,
      stepByStepActions:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'steps'), collapsedByDefault: false }
          : null,
      nextSteps:
        persona === 'intermediate'
          ? { sectionId: sectionId(prefix, 'next'), collapsedByDefault: false }
          : null,
      glossary:
        persona === 'novice'
          ? { sectionId: sectionId(prefix, 'glossary'), collapsedByDefault: false }
          : null,
      findingsBullets:
        persona === 'expert'
          ? { sectionId: sectionId(prefix, 'findings'), collapsedByDefault: collapsed }
          : null,
    },
  };
}

export function projectForPersona(
  evaluation: EvaluationResult,
  persona: Persona,
): PersonaPresentation {
  return {
    persona,
    dimensions: evaluation.dimensions.map((dimension) =>
      projectDimension(dimension, evaluation.findings, persona),
    ),
    composite: projectComposite(evaluation.composite, persona),
    recommendations: evaluation.recommendations.map((recommendation) =>
      projectRecommendation(
        recommendation,
        evaluation.findings,
        evaluation.evidenceIndex,
        persona,
      ),
    ),
  };
}
