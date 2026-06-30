import type { Recommendation } from '../../domain/model/evaluation';
import type { RecommendationPriority } from '../../domain/model/enums';
import { Card } from '../../ui/Card/Card';
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
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityClass =
    recommendation.priority === 'urgent'
      ? styles.urgent
      : recommendation.priority === 'important'
        ? styles.important
        : styles.advisory;

  return (
    <Card className={`${styles.card} ${priorityClass}`} data-testid={`recommendation-${recommendation.id}`}>
      <div className={styles.header}>
        <span className={styles.id}>{recommendation.id}</span>
        <span
          className={`${styles.priority} ${priorityClass}`}
          role="status"
          aria-label={`Priority: ${recommendation.priority}`}
        >
          <PriorityIcon priority={recommendation.priority} />
          {recommendation.priority}
        </span>
      </div>
      <p className={styles.action}>{recommendation.action}</p>
      <p className={styles.reasonLabel}>Rationale</p>
      <p className={styles.reason}>{recommendation.reason}</p>
      {recommendation.evidenceIds.length > 0 ? (
        <p className={styles.evidence}>
          Evidence: {recommendation.evidenceIds.join(', ')}
        </p>
      ) : null}
    </Card>
  );
}
