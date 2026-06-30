import type { Recommendation, RecommendationPresentation } from '../../domain/model/evaluation';
import type { RecommendationPriority } from '../../domain/model/enums';
import { Card } from '../../ui/Card/Card';
import { CoachSection } from '../../ui/CoachSection/CoachSection';
import styles from './RecommendationCard.module.css';

function PriorityIcon({ priority }: { priority: RecommendationPriority }) {
  if (priority === 'urgent') {
    return (
      <svg className={styles.priorityIcon} viewBox="0 0 12 12" aria-hidden="true">
        <rect x="1" y="1" width="10" height="10" />
      </svg>
    );
  }
  if (priority === 'important') {
    return (
      <svg className={styles.priorityIcon} viewBox="0 0 12 12" aria-hidden="true">
        <polygon points="6,1 11,11 1,11" />
      </svg>
    );
  }
  return <span className={styles.priorityIcon} aria-hidden="true" />;
}

export interface RecommendationCardProps {
  recommendation: Recommendation;
  presentation: RecommendationPresentation;
  expandedCoachSections: Set<string>;
  onToggleCoachSection: (sectionId: string) => void;
}

export function RecommendationCard({
  recommendation,
  presentation,
  expandedCoachSections,
  onToggleCoachSection,
}: RecommendationCardProps) {
  const priorityClass =
    recommendation.priority === 'urgent'
      ? styles.urgent
      : recommendation.priority === 'important'
        ? styles.important
        : styles.advisory;

  const priorityStyle = priorityClass;

  return (
    <Card className={`${styles.card} ${priorityClass}`} data-testid={`recommendation-${recommendation.id}`}>
      <div className={styles.header}>
        <span className={styles.id}>{recommendation.id}</span>
        <span
          className={`${styles.priority} ${priorityStyle}`}
          role="status"
          aria-label={`Priority: ${recommendation.priority}`}
        >
          <PriorityIcon priority={recommendation.priority} />
          {recommendation.priority}
        </span>
      </div>

      <h3
        className={styles.coachingTitle}
        data-testid={`recommendation-action-${recommendation.id}`}
      >
        {recommendation.action}
      </h3>
      <p className={styles.reasonLabel}>Rationale</p>
      <p className={styles.reason} data-testid={`recommendation-reason-${recommendation.id}`}>
        {recommendation.reason}
      </p>
      {recommendation.evidenceIds.length > 0 ? (
        <p className={styles.evidence} data-testid={`recommendation-evidence-${recommendation.id}`}>
          Evidence: {recommendation.evidenceIds.join(', ')}
        </p>
      ) : null}

      <div className={styles.coaching} data-testid={`recommendation-coaching-${recommendation.id}`}>
        {presentation.whyThisMatters && presentation.sections.whyThisMatters ? (
          <CoachSection
            meta={presentation.sections.whyThisMatters}
            title="Why this matters"
            expanded={expandedCoachSections.has(presentation.sections.whyThisMatters.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-why-${recommendation.id}`}
          >
            {presentation.whyThisMatters}
          </CoachSection>
        ) : null}

        {presentation.coachingRationale && presentation.sections.coachingRationale ? (
          <CoachSection
            meta={presentation.sections.coachingRationale}
            title="Coaching rationale"
            expanded={expandedCoachSections.has(presentation.sections.coachingRationale.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-rationale-${recommendation.id}`}
          >
            {presentation.coachingRationale}
          </CoachSection>
        ) : null}

        {presentation.stepByStepActions && presentation.sections.stepByStepActions ? (
          <CoachSection
            meta={presentation.sections.stepByStepActions}
            title="Step-by-step guidance"
            expanded={expandedCoachSections.has(presentation.sections.stepByStepActions.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-steps-${recommendation.id}`}
          >
            {presentation.stepByStepActions}
          </CoachSection>
        ) : null}

        {presentation.nextSteps && presentation.sections.nextSteps ? (
          <CoachSection
            meta={presentation.sections.nextSteps}
            title="Immediate next steps"
            expanded={expandedCoachSections.has(presentation.sections.nextSteps.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-next-${recommendation.id}`}
          >
            {presentation.nextSteps}
          </CoachSection>
        ) : null}

        {presentation.evidenceSummary && presentation.sections.evidenceWalkthrough ? (
          <CoachSection
            meta={presentation.sections.evidenceWalkthrough}
            title="Evidence summary"
            expanded={expandedCoachSections.has(presentation.sections.evidenceWalkthrough.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-evidence-${recommendation.id}`}
          >
            {presentation.evidenceSummary}
          </CoachSection>
        ) : null}

        {presentation.findingsBullets && presentation.sections.findingsBullets ? (
          <CoachSection
            meta={presentation.sections.findingsBullets}
            title="Findings"
            expanded={expandedCoachSections.has(presentation.sections.findingsBullets.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-findings-${recommendation.id}`}
          >
            <ul className={styles.findingsList}>
              {presentation.findingsBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </CoachSection>
        ) : null}

        {presentation.evidenceReferences ? (
          <p className={styles.evidenceRefs} data-testid={`coach-evidence-refs-${recommendation.id}`}>
            Key evidence references: {presentation.evidenceReferences}
          </p>
        ) : null}

        {presentation.glossary && presentation.sections.glossary ? (
          <CoachSection
            meta={presentation.sections.glossary}
            title="Glossary"
            expanded={expandedCoachSections.has(presentation.sections.glossary.sectionId)}
            onToggle={onToggleCoachSection}
            testId={`coach-glossary-${recommendation.id}`}
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
      </div>
    </Card>
  );
}
