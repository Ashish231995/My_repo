import { Button } from '../../ui/Button/Button';
import { useSession } from '../../session/sessionContext';
import styles from './RefreshSnapshotButton.module.css';

export function RefreshSnapshotButton() {
  const { state, importController } = useSession();
  const isRefreshing = state.importContext?.refreshState === 'refreshing';
  const isImportLoading = state.phase === 'import-loading';
  const hasWorkbook = state.projectMode === 'imported' && state.importContext?.workbookRef;
  const disabled = !hasWorkbook || isRefreshing || isImportLoading;

  if (state.projectMode !== 'imported') {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Button
        type="button"
        className={styles.button}
        data-testid="refresh-snapshot-button"
        disabled={disabled}
        aria-busy={isRefreshing}
        aria-disabled={disabled}
        onClick={() => {
          void importController.requestRefresh();
        }}
      >
        Refresh snapshot
      </Button>
      {isRefreshing ? (
        <p className={styles.status} role="status" aria-live="polite" data-testid="refresh-loading-status">
          Refreshing workbook snapshot…
        </p>
      ) : null}
    </div>
  );
}
