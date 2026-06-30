import type { EvidenceItem } from '../../domain/model/evaluation';
import styles from './EvidenceDrilldown.module.css';

export interface EvidenceDrilldownProps {
  evidence: EvidenceItem[];
}

function inclusionLabel(item: EvidenceItem): string {
  return item.includedInScoring ? 'Included in scoring' : 'Excluded from scoring';
}

export function EvidenceDrilldown({ evidence }: EvidenceDrilldownProps) {
  if (evidence.length === 0) {
    return (
      <p className={styles.empty} role="status">
        No representative evidence recorded for this dimension.
      </p>
    );
  }

  return (
    <div className={styles.drilldown} data-testid="evidence-drilldown">
      <h4 className={styles.heading}>Evidence provenance</h4>
      <ul className={styles.list}>
        {evidence.map((item) => {
          const provenance = item.mapping.provenance;
          const isFailed = item.mapping.status === 'failed';

          return (
            <li
              key={item.id}
              className={`${styles.item} ${isFailed ? styles.failed : ''}`}
              data-testid={`evidence-row-${item.id}`}
            >
              <p className={styles.sourceLabel}>
                <span className={styles.label}>Representative source:</span>{' '}
                {provenance.representativeSourceLabel}
              </p>
              <p>
                <span className={styles.label}>Original source term:</span> {item.sourceTerm}
                {item.sourceField ? (
                  <>
                    {' '}
                    <span className={styles.field}>(field: {item.sourceField})</span>
                  </>
                ) : null}
              </p>
              <p>
                <span className={styles.label}>Canonical signal type:</span>{' '}
                {item.mapping.canonicalType ?? provenance.canonicalSignalType}
              </p>
              <p>
                <span className={styles.label}>Mapping status:</span> {item.mapping.status}
              </p>
              <p>
                <span className={styles.label}>Scoring:</span> {inclusionLabel(item)}
              </p>
              {item.exclusionReason ? (
                <p>
                  <span className={styles.label}>Exclusion reason:</span> {item.exclusionReason}
                </p>
              ) : null}
              <p>
                <span className={styles.label}>Resolved evidence date:</span> {item.resolvedAsOfDate}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
