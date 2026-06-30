import { useEffect } from 'react';
import { Button } from '../../ui/Button/Button';
import { Dialog } from '../../ui/Dialog/Dialog';
import styles from './ResetConfirmDialog.module.css';

export interface ResetConfirmDialogProps {
  open: boolean;
  lastFocusedElementId: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetConfirmDialog({
  open,
  lastFocusedElementId,
  onCancel,
  onConfirm,
}: ResetConfirmDialogProps) {
  useEffect(() => {
    if (open || !lastFocusedElementId) {
      return;
    }
    document.getElementById(lastFocusedElementId)?.focus();
  }, [open, lastFocusedElementId]);

  return (
    <Dialog
      id="reset-confirm-dialog"
      data-testid="reset-confirm-dialog"
      open={open}
      title="Reset session?"
      onClose={onCancel}
      className={styles.dialog}
      footer={
        <>
          <Button type="button" data-testid="reset-cancel-button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" data-testid="reset-confirm-button" onClick={onConfirm}>
            Reset session
          </Button>
        </>
      }
    >
      <p>
        This will clear your current demonstration session, including project selection, signal
        configuration, findings, scores, recommendations, and persona coaching view.
      </p>
      <p>No data is stored locally or sent to any external service.</p>
    </Dialog>
  );
}
