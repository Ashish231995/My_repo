import { Button } from '../../ui/Button/Button';
import { useSession } from '../../session/sessionContext';
import styles from './ReselectWorkbookButton.module.css';

export function ReselectWorkbookButton() {
  const { state, importController } = useSession();
  const needsReselect = state.importContext?.refreshState === 'needs-reselect';
  const isImportLoading = state.phase === 'import-loading';

  if (state.projectMode !== 'imported' || !needsReselect) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Button
        type="button"
        className={styles.button}
        data-testid="reselect-workbook-button"
        disabled={isImportLoading}
        aria-disabled={isImportLoading}
        onClick={() => {
          void importController.requestReselect();
        }}
      >
        Reselect workbook
      </Button>
    </div>
  );
}
