import { Button } from '../../ui/Button/Button';
import { useSession } from '../../session/sessionContext';
import { requestReset } from '../../session/sessionActions';
import styles from './ResetButton.module.css';

const RESET_BUTTON_ID = 'reset-session-button';

export function ResetButton() {
  const { dispatch } = useSession();

  return (
    <Button
      id={RESET_BUTTON_ID}
      type="button"
      className={styles.button}
      data-testid="reset-button"
      onClick={() => dispatch(requestReset(RESET_BUTTON_ID))}
    >
      Reset
    </Button>
  );
}

export { RESET_BUTTON_ID };
