import type { ImportSessionMetadata } from '../../import/types';
import styles from './ImportProvenanceBanner.module.css';

export interface ImportProvenanceBannerProps {
  importMeta: ImportSessionMetadata;
  localLastModifiedMs: number;
}

function formatLocalLastModified(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ImportProvenanceBanner({
  importMeta,
  localLastModifiedMs,
}: ImportProvenanceBannerProps) {
  return (
    <div className={styles.banner} data-testid="import-provenance-banner" role="status">
      <span className={styles.label}>Imported snapshot</span>
      <span className={styles.field}>
        <span className={styles.fieldLabel}>Source file:</span> {importMeta.filename}
      </span>
      <span className={styles.field}>
        <span className={styles.fieldLabel}>Workbook as-of:</span>{' '}
        <time dateTime={importMeta.workbookAsOfDate}>{importMeta.workbookAsOfDate}</time>
      </span>
      <span className={styles.field}>
        <span className={styles.fieldLabel}>Local last modified:</span>{' '}
        <time dateTime={new Date(localLastModifiedMs).toISOString()}>
          {formatLocalLastModified(localLastModifiedMs)}
        </time>
      </span>
      <span className={styles.trust}>{importMeta.trustLabel}</span>
    </div>
  );
}
