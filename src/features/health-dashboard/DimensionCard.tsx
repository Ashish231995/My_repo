import type { DimensionResult, Finding } from '../../domain/model/evaluation';
import type { HealthClassification, MeasurementStatus } from '../../domain/model/enums';
import { Button } from '../../ui/Button/Button';
import { Card } from '../../ui/Card/Card';
import { StatusLabel } from '../../ui/StatusLabel/StatusLabel';
import { DimensionDetail } from '../dimension-detail/DimensionDetail';
import { DIMENSION_DISPLAY_NAMES } from './dimensionDisplayNames';
import styles from './DimensionCard.module.css';

const MEASUREMENT_LABELS: Record<MeasurementStatus, string> = {
  measured: 'Measured',
  partial: 'Partial',
  unmeasured: 'Unmeasured',
};

function classificationClass(classification: HealthClassification | null): string {
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

export interface DimensionCardProps {
  dimension: DimensionResult;
  findings: Finding[];
  explainOpen: boolean;
  onToggleExplain: () => void;
}

export function DimensionCard({
  dimension,
  findings,
  explainOpen,
  onToggleExplain,
}: DimensionCardProps) {
  const measurementClass =
    dimension.measurementStatus === 'partial'
      ? styles.partial
      : dimension.measurementStatus === 'unmeasured'
        ? styles.unmeasured
        : '';

  const toneClass =
    dimension.measurementStatus === 'unmeasured'
      ? styles.neutral
      : classificationClass(dimension.classification);

  return (
    <Card
      className={`${styles.card} ${toneClass}`}
      data-testid={`dimension-card-${dimension.dimensionId}`}
      aria-labelledby={`dimension-heading-${dimension.dimensionId}`}
    >
      <h3 id={`dimension-heading-${dimension.dimensionId}`} className={styles.heading}>
        {DIMENSION_DISPLAY_NAMES[dimension.dimensionId]}
      </h3>
      <div className={styles.meta}>
        <span
          className={`${styles.measurement} ${measurementClass}`}
          role="status"
          aria-label={`Measurement status: ${MEASUREMENT_LABELS[dimension.measurementStatus]}`}
        >
          <span className={styles.measurementIcon} aria-hidden="true" />
          {MEASUREMENT_LABELS[dimension.measurementStatus]}
        </span>
        {dimension.measurementStatus === 'measured' && dimension.displayScore !== null ? (
          <span className={styles.score} aria-label={`Dimension score ${dimension.displayScore}`}>
            {dimension.displayScore}
          </span>
        ) : null}
        {dimension.classification && dimension.measurementStatus === 'measured' ? (
          <StatusLabel classification={dimension.classification} />
        ) : null}
        {dimension.classification && dimension.measurementStatus === 'partial' ? (
          <span className={styles.provisional} role="status">
            Provisional — {dimension.classification === 'healthy' ? 'Healthy' : dimension.classification === 'at-risk' ? 'At Risk' : 'Critical'}
          </span>
        ) : null}
      </div>

      {dimension.measurementStatus === 'partial' && dimension.displayScore !== null ? (
        <div className={styles.scoreBlock}>
          <span className={styles.provisionalScoreLabel}>Provisional score — Partial evidence</span>
          <span
            className={styles.score}
            aria-label={`Provisional dimension score ${dimension.displayScore}`}
          >
            {dimension.displayScore}
          </span>
        </div>
      ) : null}

      {dimension.measurementStatus === 'unmeasured' ? (
        <p className={styles.noScore} role="status">
          No numeric score — Unmeasured
        </p>
      ) : null}

      {dimension.measurementStatus === 'partial' ? (
        <div className={styles.partialDetails}>
          <p className={styles.coverage}>{dimension.coveragePercent}% evidence coverage</p>
          {dimension.missingRequiredCanonicalTypes.length > 0 ? (
            <p className={styles.missing}>
              Missing required evidence: {dimension.missingRequiredCanonicalTypes.join(', ')}
            </p>
          ) : null}
          <p className={styles.excluded} role="status">
            Excluded from Composite
          </p>
        </div>
      ) : null}

      <p className={styles.explanation}>{dimension.explanation}</p>

      <Button
        type="button"
        className={styles.explainButton}
        data-testid={`explain-dimension-${dimension.dimensionId}`}
        aria-expanded={explainOpen}
        aria-controls={`dimension-detail-${dimension.dimensionId}`}
        onClick={onToggleExplain}
      >
        Explain
      </Button>

      <DimensionDetail
        dimension={dimension}
        findings={findings}
        open={explainOpen}
        onClose={onToggleExplain}
      />
    </Card>
  );
}
