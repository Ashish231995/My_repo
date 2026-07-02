import { PrivacyIndicator } from '../ui/PrivacyIndicator/PrivacyIndicator';
import { ErrorPanel } from '../features/health-dashboard/ErrorPanel';
import { EvaluateButton } from '../features/health-dashboard/EvaluateButton';
import { HealthDashboard } from '../features/health-dashboard/HealthDashboard';
import { ImportProvenanceBanner } from '../features/import-snapshot/ImportProvenanceBanner';
import { AdverseConditionPath } from '../features/invalid-project/AdverseConditionPath';
import { InvalidSampleDataPanel } from '../features/invalid-project/InvalidSampleDataPanel';
import { IntegrationChecklist } from '../features/integration-checklist/IntegrationChecklist';
import { PersonaSelector } from '../features/persona-selector/PersonaSelector';
import { ProjectSelector } from '../features/project-select/ProjectSelector';
import { ResetButton } from '../features/reset-confirm/ResetButton';
import { ResetConfirmDialog } from '../features/reset-confirm/ResetConfirmDialog';
import { useSession } from '../session/sessionContext';
import {
  cancelReset,
  confirmReset,
  evaluate,
  requestReset,
  toggleCoachSection,
  toggleEvidence,
} from '../session/sessionActions';
import styles from './App.module.css';

function focusProjectSelector() {
  document.querySelector<HTMLElement>('[data-testid^="project-option-"]')?.focus();
}

function resultsPlaceholder(state: ReturnType<typeof useSession>['state']): string {
  if (state.phase === 'import-loading') {
    return 'Importing workbook snapshot. Evaluation will be available when loading completes.';
  }
  if (state.projectMode === 'imported' && state.phase === 'project-ready') {
    return 'Imported workbook ready. Run evaluation to view composite health, dimensions, and recommendations.';
  }
  if (state.selectedProjectId) {
    return 'Project loaded. Run evaluation to view composite health, dimensions, and recommendations.';
  }
  return 'Select a sample project or import a SharePoint-synced snapshot to begin the leadership coaching journey.';
}

export default function App() {
  const { state, dispatch } = useSession();
  const importMeta = state.importContext?.normalizedProject?.importMeta;
  const localLastModifiedMs =
    state.importContext?.workbookRef?.lastModifiedMs ??
    importMeta?.localLastModifiedMs ??
    null;

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>
            <h1 className={styles.headerTitle}>PM Copilot Demonstration</h1>
            <p className={styles.headerSubtitle}>
              Leadership health view from bundled representative signals — methodology-neutral and local only.
            </p>
          </div>
          <div className={styles.headerControls}>
            <PrivacyIndicator />
            <PersonaSelector />
            <ResetButton />
          </div>
        </div>
      </header>
      <main className={styles.main} id="main-content">
        <div className={styles.journey}>
          <section className={styles.contextSection} aria-labelledby="journey-context-heading">
            <h2 id="journey-context-heading" className={styles.sectionHeading}>
              Project context
            </h2>
            <ProjectSelector />
            {state.projectMode === 'bundled' && state.selectedProjectId ? (
              <IntegrationChecklist />
            ) : null}
            {state.phase === 'import-loading' ? (
              <p
                className={styles.importLoading}
                role="status"
                aria-live="polite"
                data-testid="import-loading-status"
              >
                Importing workbook snapshot…
              </p>
            ) : null}
            <EvaluateButton />
            <AdverseConditionPath />
          </section>

          {state.phase === 'invalid-project' && state.invalidProject ? (
            <InvalidSampleDataPanel
              context={state.invalidProject}
              onSelectAnother={focusProjectSelector}
              onResetSession={() => dispatch(requestReset())}
            />
          ) : state.phase === 'error' && state.ui.errorMessage ? (
            <ErrorPanel
              message={state.ui.errorMessage}
              onRetry={() => dispatch(evaluate())}
              onReset={() => dispatch(requestReset())}
            />
          ) : state.phase === 'evaluated' && state.evaluation && state.presentation ? (
            <>
              {state.projectMode === 'imported' && importMeta && localLastModifiedMs !== null ? (
                <ImportProvenanceBanner
                  importMeta={importMeta}
                  localLastModifiedMs={localLastModifiedMs}
                />
              ) : null}
              <HealthDashboard
                evaluation={state.evaluation}
                presentation={state.presentation}
                expandedDimensionIds={state.ui.expandedEvidenceIds}
                expandedCoachSections={state.ui.expandedCoachSections}
                onToggleDimensionExplain={(dimensionId) =>
                  dispatch(toggleEvidence(dimensionId))
                }
                onToggleCoachSection={(sectionId) =>
                  dispatch(toggleCoachSection(sectionId))
                }
              />
            </>
          ) : (
            <p className={styles.placeholder} data-testid="results-placeholder">
              {resultsPlaceholder(state)}
            </p>
          )}
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>PM Copilot — local demonstration build</span>
        </div>
      </footer>
      <ResetConfirmDialog
        open={state.ui.resetConfirmOpen}
        lastFocusedElementId={state.ui.lastFocusedElementId}
        onCancel={() => dispatch(cancelReset())}
        onConfirm={() => dispatch(confirmReset())}
      />
    </div>
  );
}
