import type { DimensionResult, Finding } from '../../domain/model/evaluation';
import type { MeasurementStatus } from '../../domain/model/enums';
import { Button } from '../../ui/Button/Button';
import { Dialog } from '../../ui/Dialog/Dialog';
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
  findings: Finding[];
  open: boolean;
  onClose: () => void;
}

export function DimensionDetail({ dimension, findings, open, onClose }: DimensionDetailProps) {
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
