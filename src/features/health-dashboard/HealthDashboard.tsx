import type { EvaluationResult, DimensionPresentation, PersonaPresentation } from '../../domain/model/evaluation';
import { RecommendationsList } from '../recommendations/RecommendationsList';
import { CompositeHealthCard } from './CompositeHealthCard';
import { DimensionCard } from './DimensionCard';
import { SnapshotBanner } from './SnapshotBanner';
import { CoachSection } from '../../ui/CoachSection/CoachSection';
import styles from './HealthDashboard.module.css';

const DIMENSION_ORDER = ['schedule', 'delivery', 'team', 'risk'] as const;

export interface HealthDashboardProps {
  evaluation: EvaluationResult;
  presentation: PersonaPresentation;
  expandedDimensionIds: Set<string>;
  expandedCoachSections: Set<string>;
  onToggleDimensionExplain: (dimensionId: string) => void;
  onToggleCoachSection: (sectionId: string) => void;
}

export function HealthDashboard({
  evaluation,
  presentation,
  expandedDimensionIds,
  expandedCoachSections,
  onToggleDimensionExplain,
  onToggleCoachSection,
}: HealthDashboardProps) {
  const dimensions = DIMENSION_ORDER.map((dimensionId) =>
    evaluation.dimensions.find((dimension) => dimension.dimensionId === dimensionId),
  ).filter((dimension): dimension is NonNullable<typeof dimension> => dimension !== undefined);

  function dimensionPresentation(dimensionId: string): DimensionPresentation | undefined {
    return presentation.dimensions.find((dimension) => dimension.dimensionId === dimensionId);
  }

  return (
    <div className={styles.dashboard} data-testid="health-dashboard">
      <SnapshotBanner snapshot={evaluation.snapshot} />
      <section className={styles.summarySection} aria-labelledby="composite-summary-heading">
        <h2 id="composite-summary-heading" className={styles.sectionTitle}>
          Executive summary
        </h2>
        <CompositeHealthCard composite={evaluation.composite} />
        <CoachSection
          meta={presentation.composite.sections.coachingSummary}
          title="Coaching summary"
          expanded={expandedCoachSections.has(presentation.composite.sections.coachingSummary.sectionId)}
          onToggle={onToggleCoachSection}
          testId="composite-coaching-summary"
        >
          {presentation.composite.coachingSummary}
        </CoachSection>
      </section>
      <section aria-labelledby="dimensions-heading">
        <h2 id="dimensions-heading" className={styles.sectionTitle}>
          Dimension health
        </h2>
        <div className={styles.dimensions} data-testid="dimension-grid">
          {dimensions.map((dimension) => {
            const coaching = dimensionPresentation(dimension.dimensionId);
            if (!coaching) {
              return null;
            }
            return (
              <DimensionCard
                key={dimension.dimensionId}
                dimension={dimension}
                presentation={coaching}
                findings={evaluation.findings.filter(
                  (finding) => finding.dimensionId === dimension.dimensionId,
                )}
                explainOpen={expandedDimensionIds.has(dimension.dimensionId)}
                expandedCoachSections={expandedCoachSections}
                onToggleExplain={() => onToggleDimensionExplain(dimension.dimensionId)}
                onToggleCoachSection={onToggleCoachSection}
              />
            );
          })}
        </div>
      </section>
      <section className={styles.recommendationsSection} aria-labelledby="recommendations-heading">
        <RecommendationsList
          recommendations={evaluation.recommendations}
          presentation={presentation}
          expandedCoachSections={expandedCoachSections}
          onToggleCoachSection={onToggleCoachSection}
        />
      </section>
    </div>
  );
}
