import { Button } from '../../ui/Button/Button';
import { evaluate } from '../../session/sessionActions';
import { useSession } from '../../session/sessionContext';
import styles from './EvaluateButton.module.css';

export function EvaluateButton() {
  const { state, dispatch } = useSession();
  const isImportLoading = state.phase === 'import-loading';
  const isRefreshing = state.importContext?.refreshState === 'refreshing';
  const needsReselect = state.importContext?.refreshState === 'needs-reselect';
  const canEvaluate =
    !isImportLoading &&
    !isRefreshing &&
    !needsReselect &&
    state.phase !== 'import-invalid' &&
    (state.phase === 'project-ready' ||
      state.phase === 'evaluated' ||
      state.phase === 'error');

  return (
    <div className={styles.wrapper}>
      <Button
        type="button"
        className={styles.primaryButton}
        disabled={!canEvaluate}
        onClick={() => dispatch(evaluate())}
        data-testid="evaluate-button"
        aria-disabled={!canEvaluate}
      >
        Evaluate health
      </Button>
    </div>
  );
}
