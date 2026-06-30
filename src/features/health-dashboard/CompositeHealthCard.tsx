import type { CompositeHealthResult } from '../../domain/model/evaluation';
import type { HealthClassification } from '../../domain/model/enums';
import { Card } from '../../ui/Card/Card';
import { StatusLabel } from '../../ui/StatusLabel/StatusLabel';
import styles from './CompositeHealthCard.module.css';

function toneClass(classification: HealthClassification | null): string {
  if (classification === 'healthy') {
    return styles.healthy;
  }
  if (classification === 'at-risk') {
    return styles.atRisk;
  }
  if (classification === 'critical') {
    return styles.critical;
  }
  return styles.neutral;
}

export interface CompositeHealthCardProps {
  composite: CompositeHealthResult;
}

export function CompositeHealthCard({ composite }: CompositeHealthCardProps) {
  const hasScore = composite.displayComposite !== null && composite.classification !== null;

  return (
    <Card
      className={`${styles.card} ${hasScore ? toneClass(composite.classification) : styles.neutral}`}
      data-testid="composite-health"
    >
      <h2 className={styles.heading}>Composite health</h2>
      <div className={styles.scoreRow}>
        {hasScore ? (
          <>
            <span className={styles.score} aria-label={`Composite score ${composite.displayComposite}`}>
              {composite.displayComposite}
            </span>
            <StatusLabel classification={composite.classification!} />
          </>
        ) : (
          <span className={styles.scoreUnavailable} role="status">
            Insufficient composite coverage
          </span>
        )}
      </div>
      {composite.insufficientCoverage ? (
        <p className={styles.insufficient} role="status">
          {composite.insufficientCoverage.message} ({composite.insufficientCoverage.measuredCount} of 4
          dimensions Measured)
        </p>
      ) : null}
      <p className={styles.coverage}>{composite.coverageStatement}</p>
    </Card>
  );
}
