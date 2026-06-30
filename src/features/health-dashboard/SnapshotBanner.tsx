import type { SnapshotMetadata } from '../../domain/model/evaluation';
import styles from './SnapshotBanner.module.css';

export interface SnapshotBannerProps {
  snapshot: SnapshotMetadata;
}

export function SnapshotBanner({ snapshot }: SnapshotBannerProps) {
  return (
    <div className={styles.banner} data-testid="snapshot-banner" role="status">
      <span className={styles.label}>Bundled snapshot</span>
      <time className={styles.date} dateTime={snapshot.asOfDate}>
        {snapshot.label}
      </time>
      <span className={styles.note}>Representative demo data — not a live enterprise feed</span>
    </div>
  );
}
