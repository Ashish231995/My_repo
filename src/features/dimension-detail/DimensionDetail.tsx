import type { DimensionPresentation, DimensionResult, Finding } from '../../domain/model/evaluation';
import type { MeasurementStatus } from '../../domain/model/enums';
import { Button } from '../../ui/Button/Button';
import { Dialog } from '../../ui/Dialog/Dialog';
import { CoachSection } from '../../ui/CoachSection/CoachSection';
import { StatusLabel } from '../../ui/StatusLabel/StatusLabel';
import { DIMENSION_DISPLAY_NAMES } from '../health-dashboard/dimensionDisplayNames';
import { EvidenceDrilldown } from './EvidenceDrilldown';
import styles from './DimensionDetail.module.css';

const MEASUREMENT_LABELS: Record<MeasurementStatus, string> = {
  measured: 'Measured',
  partial: 'Partial',
  unmeasured: 'Unmeasured',
};

export interface DimensionDetailProps {
  dimension: DimensionResult;
  presentation: DimensionPresentation;
  findings: Finding[];
  open: boolean;
  expandedCoachSections: Set<string>;
  onClose: () => void;
  onToggleCoachSection: (sectionId: string) => void;
}

export function DimensionDetail({
  dimension,
  presentation,
  findings,
  open,
  expandedCoachSections,
  onClose,
  onToggleCoachSection,
}: DimensionDetailProps) {
  const title = `${DIMENSION_DISPLAY_NAMES[dimension.dimensionId]} — Explanation`;

  return (
    <Dialog
      id={`dimension-detail-${dimension.dimensionId}`}
      open={open}
      title={title}
      onClose={onClose}
      className={styles.dialog}
      footer={
        <Button type="button" onClick={onClose} data-testid={`close-dimension-detail-${dimension.dimensionId}`}>
          Close
        </Button>
      }
    >
      <div className={styles.detail} data-testid={`dimension-detail-content-${dimension.dimensionId}`}>
        <div className={styles.summary}>
          <span
            role="status"
            aria-label={`Measurement status: ${MEASUREMENT_LABELS[dimension.measurementStatus]}`}
          >
            {MEASUREMENT_LABELS[dimension.measurementStatus]}
          </span>
          {dimension.displayScore !== null ? (
            <span aria-label={`Dimension score ${dimension.displayScore}`}>
              Score: {dimension.displayScore}
            </span>
          ) : null}
          <span>{Math.round(dimension.coveragePercent)}% evidence coverage</span>
          {dimension.classification && dimension.measurementStatus !== 'unmeasured' ? (
            <StatusLabel classification={dimension.classification} />
          ) : null}
        </div>

        {dimension.trend ? (
          <p className={styles.trend} data-testid="dimension-trend" role="status">
            Trend: {dimension.trend.label}
          </p>
        ) : null}

        <p className={styles.explanation}>{dimension.explanation}</p>

        <section
          className={styles.coaching}
          aria-label="Persona coaching"
          data-testid={`dimension-detail-coaching-${dimension.dimensionId}`}
        >
          <CoachSection
            meta={presentation.sections.conditionDefinition}
            title="Condition definition"
            expanded={expandedCoachSections.has(presentation.sections.conditionDefinition.sectionId)}
            onToggle={onToggleCoachSection}
          >
            {presentation.conditionDefinition}
          </CoachSection>
          <CoachSection
            meta={presentation.sections.whyThisMatters}
            title="Why this matters"
            expanded={expandedCoachSections.has(presentation.sections.whyThisMatters.sectionId)}
            onToggle={onToggleCoachSection}
          >
            {presentation.whyThisMatters}
          </CoachSection>
          {presentation.stepByStepGuidance && presentation.sections.stepByStepGuidance ? (
            <CoachSection
              meta={presentation.sections.stepByStepGuidance}
              title="Step-by-step guidance"
              expanded={expandedCoachSections.has(presentation.sections.stepByStepGuidance.sectionId)}
              onToggle={onToggleCoachSection}
              testId={`dimension-coach-steps-${dimension.dimensionId}`}
            >
              {presentation.stepByStepGuidance}
            </CoachSection>
          ) : null}
          {presentation.nextSteps && presentation.sections.nextSteps ? (
            <CoachSection
              meta={presentation.sections.nextSteps}
              title="Immediate next steps"
              expanded={expandedCoachSections.has(presentation.sections.nextSteps.sectionId)}
              onToggle={onToggleCoachSection}
            >
              {presentation.nextSteps}
            </CoachSection>
          ) : null}
          <CoachSection
            meta={presentation.sections.evidenceWalkthrough}
            title="Evidence walkthrough"
            expanded={expandedCoachSections.has(presentation.sections.evidenceWalkthrough.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`dimension-coach-evidence-${dimension.dimensionId}`}
          >
            {presentation.evidenceWalkthrough}
            {presentation.evidenceSummary ? (
              <>
                {'\n'}
                {presentation.evidenceSummary}
              </>
            ) : null}
            {presentation.evidenceReferences ? (
              <>
                {'\n'}
                Key references: {presentation.evidenceReferences}
              </>
            ) : null}
          </CoachSection>
          {presentation.glossary && presentation.sections.glossary ? (
            <CoachSection
              meta={presentation.sections.glossary}
              title="Glossary"
              expanded={expandedCoachSections.has(presentation.sections.glossary.sectionId)}
              onToggle={onToggleCoachSection}
              testId={`dimension-coach-glossary-${dimension.dimensionId}`}
            >
              <dl className={styles.glossary}>
                {presentation.glossary.map((entry) => (
                  <div key={entry.term}>
                    <dt>{entry.term}</dt>
                    <dd>{entry.definition}</dd>
                  </div>
                ))}
              </dl>
            </CoachSection>
          ) : null}
        </section>

        <section aria-labelledby={`findings-heading-${dimension.dimensionId}`}>
          <h3 id={`findings-heading-${dimension.dimensionId}`} className={styles.sectionHeading}>
            Findings
          </h3>
          {findings.length === 0 ? (
            <p className={styles.muted} role="status">
              No findings for this dimension.
            </p>
          ) : (
            <ul className={styles.findings} data-testid="dimension-findings">
              {findings.map((finding) => (
                <li key={finding.id}>
                  <strong>{finding.id}</strong> — {finding.summary}
                </li>
              ))}
            </ul>
          )}
        </section>

        <EvidenceDrilldown evidence={dimension.evidence} />
      </div>
    </Dialog>
  );
}
