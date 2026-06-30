import styles from './PrivacyIndicator.module.css';

export function PrivacyIndicator() {
  return (
    <div className={styles.badge} role="status" aria-live="polite">
      Local session only — no network or persistence
    </div>
  );
}
