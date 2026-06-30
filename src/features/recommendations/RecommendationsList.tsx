import type { PersonaPresentation, Recommendation } from '../../domain/model/evaluation';
import { RecommendationCard } from './RecommendationCard';
import styles from './RecommendationsList.module.css';

export interface RecommendationsListProps {
  recommendations: Recommendation[];
  presentation: PersonaPresentation;
  expandedCoachSections: Set<string>;
  onToggleCoachSection: (sectionId: string) => void;
}

export function RecommendationsList({
  recommendations,
  presentation,
  expandedCoachSections,
  onToggleCoachSection,
}: RecommendationsListProps) {
  return (
    <section aria-labelledby="recommendations-heading" data-testid="recommendations-list">
      <h2 id="recommendations-heading" className={styles.heading}>
        Recommended actions
      </h2>
      {recommendations.length === 0 ? (
        <p className={styles.empty} data-testid="recommendations-empty">
          No recommendations — current signals do not indicate mandatory coaching actions.
        </p>
      ) : (
        <div className={styles.list}>
          {recommendations.map((recommendation) => {
            const recommendationPresentation = presentation.recommendations.find(
              (item) => item.recommendationId === recommendation.id,
            );
            if (!recommendationPresentation) {
              return null;
            }
            return (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                presentation={recommendationPresentation}
                expandedCoachSections={expandedCoachSections}
                onToggleCoachSection={onToggleCoachSection}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
