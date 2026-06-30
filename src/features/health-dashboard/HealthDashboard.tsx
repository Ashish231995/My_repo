import type { EvaluationResult } from '../../domain/model/evaluation';
import { RecommendationsList } from '../recommendations/RecommendationsList';
import { CompositeHealthCard } from './CompositeHealthCard';
import { DimensionCard } from './DimensionCard';
import { SnapshotBanner } from './SnapshotBanner';
import styles from './HealthDashboard.module.css';

const DIMENSION_ORDER = ['schedule', 'delivery', 'team', 'risk'] as const;

export interface HealthDashboardProps {
  evaluation: EvaluationResult;
}

export function HealthDashboard({ evaluation }: HealthDashboardProps) {
  const dimensions = DIMENSION_ORDER.map((dimensionId) =>
    evaluation.dimensions.find((dimension) => dimension.dimensionId === dimensionId),
  ).filter((dimension): dimension is NonNullable<typeof dimension> => dimension !== undefined);

  return (
    <div className={styles.dashboard} data-testid="health-dashboard">
      <SnapshotBanner snapshot={evaluation.snapshot} />
      <section className={styles.summarySection} aria-labelledby="composite-summary-heading">
        <h2 id="composite-summary-heading" className={styles.sectionTitle}>
          Executive summary
        </h2>
        <CompositeHealthCard composite={evaluation.composite} />
      </section>
      <section aria-labelledby="dimensions-heading">
        <h2 id="dimensions-heading" className={styles.sectionTitle}>
          Dimension health
        </h2>
        <div className={styles.dimensions} data-testid="dimension-grid">
          {dimensions.map((dimension) => (
            <DimensionCard key={dimension.dimensionId} dimension={dimension} />
          ))}
        </div>
      </section>
      <section className={styles.recommendationsSection} aria-labelledby="recommendations-heading">
        <RecommendationsList recommendations={evaluation.recommendations} />
      </section>
    </div>
  );
}
