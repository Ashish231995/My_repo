import { Button } from '../../ui/Button/Button';
import styles from './ErrorPanel.module.css';

export interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
  onReset: () => void;
}

export function ErrorPanel({ message, onRetry, onReset }: ErrorPanelProps) {
  return (
    <section
      className={styles.panel}
      data-testid="error-panel"
      aria-labelledby="evaluation-error-heading"
      role="alert"
    >
      <h2 id="evaluation-error-heading" className={styles.heading}>
        Evaluation could not complete
      </h2>
      <p className={styles.message}>{message}</p>
      <p className={styles.guidance}>
        No health results are shown. Retry the evaluation or reset the session to return to a safe
        starting state.
      </p>
      <div className={styles.actions}>
        <Button type="button" data-testid="error-retry-button" onClick={onRetry}>
          Retry evaluation
        </Button>
        <Button type="button" data-testid="error-reset-button" onClick={onReset}>
          Reset session
        </Button>
      </div>
    </section>
  );
}
