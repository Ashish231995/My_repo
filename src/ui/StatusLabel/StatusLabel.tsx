import type { HealthClassification } from '../../domain/model/enums';
import styles from './StatusLabel.module.css';

const LABELS: Record<HealthClassification, string> = {
  healthy: 'Healthy',
  'at-risk': 'At Risk',
  critical: 'Critical',
};

function HealthIcon({ classification }: { classification: HealthClassification }) {
  const title = `${LABELS[classification]} indicator`;
  switch (classification) {
    case 'healthy':
      return (
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="currentColor" />
        </svg>
      );
    case 'at-risk':
      return (
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
          <polygon points="8,2 14,14 2,14" fill="currentColor" />
        </svg>
      );
    case 'critical':
      return (
        <svg className={styles.icon} viewBox="0 0 16 16" aria-hidden="true">
          <rect x="3" y="3" width="10" height="10" fill="currentColor" />
        </svg>
      );
    default:
      return <span className={styles.icon} aria-hidden="true" />;
  }
}

export interface StatusLabelProps {
  classification: HealthClassification;
}

export function StatusLabel({ classification }: StatusLabelProps) {
  const toneClass =
    classification === 'healthy'
      ? styles.healthy
      : classification === 'at-risk'
        ? styles.atRisk
        : styles.critical;

  return (
    <span className={`${styles.label} ${toneClass}`} role="status" aria-label={LABELS[classification]}>
      <HealthIcon classification={classification} />
      <span>{LABELS[classification]}</span>
    </span>
  );
}
