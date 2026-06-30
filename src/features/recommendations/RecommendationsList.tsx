import type { Recommendation } from '../../domain/model/evaluation';
import { RecommendationCard } from './RecommendationCard';
import styles from './RecommendationsList.module.css';

export interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
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
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </section>
  );
}
