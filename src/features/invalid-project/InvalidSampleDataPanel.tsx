import type { InvalidProjectContext } from '../../domain/model/session';
import { Button } from '../../ui/Button/Button';
import { formatValidationCategory } from './formatValidationCategory';
import styles from './InvalidSampleDataPanel.module.css';

export interface InvalidSampleDataPanelProps {
  context: InvalidProjectContext;
  onSelectAnother: () => void;
  onResetSession: () => void;
}

export function InvalidSampleDataPanel({
  context,
  onSelectAnother,
  onResetSession,
}: InvalidSampleDataPanelProps) {
  const categoryLabel = formatValidationCategory(context.category);

  return (
    <section
      className={styles.panel}
      data-testid="invalid-sample-data-panel"
      aria-labelledby="invalid-sample-data-heading"
      role="alert"
    >
      <h2 id="invalid-sample-data-heading" className={styles.heading}>
        Invalid sample data
      </h2>
      <dl className={styles.details}>
        <div>
          <dt>Project</dt>
          <dd>{context.displayName}</dd>
        </div>
        {context.projectKey ? (
          <div>
            <dt>Project key</dt>
            <dd>{context.projectKey}</dd>
          </div>
        ) : null}
        <div>
          <dt>Validation category</dt>
          <dd>{categoryLabel}</dd>
        </div>
        <div>
          <dt>Details</dt>
          <dd>{context.message}</dd>
        </div>
      </dl>
      <p className={styles.guidance}>
        Health evaluation is blocked. No scores, classifications, findings, composite results, or
        recommendations are shown for invalid sample data.
      </p>
      <div className={styles.actions}>
        <Button
          type="button"
          data-testid="invalid-recovery-select-project"
          onClick={onSelectAnother}
        >
          Select another sample project
        </Button>
        <Button type="button" data-testid="invalid-recovery-reset-session" onClick={onResetSession}>
          Reset session
        </Button>
      </div>
    </section>
  );
}
