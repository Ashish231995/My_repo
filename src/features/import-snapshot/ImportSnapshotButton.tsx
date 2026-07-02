import { Button } from '../../ui/Button/Button';
import { useSession } from '../../session/sessionContext';
import styles from './ImportSnapshotButton.module.css';

export function ImportSnapshotButton() {
  const { state, importController } = useSession();
  const isLoading = state.phase === 'import-loading';

  return (
    <div className={styles.wrapper}>
      <Button
        type="button"
        className={styles.button}
        data-testid="import-snapshot-button"
        disabled={isLoading}
        aria-busy={isLoading}
        aria-disabled={isLoading}
        onClick={() => {
          void importController.requestImport();
        }}
      >
        Import SharePoint-synced snapshot
      </Button>
    </div>
  );
}
