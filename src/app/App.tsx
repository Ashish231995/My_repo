import { PrivacyIndicator } from '../ui/PrivacyIndicator/PrivacyIndicator';
import { EvaluateButton } from '../features/health-dashboard/EvaluateButton';
import { HealthDashboard } from '../features/health-dashboard/HealthDashboard';
import { IntegrationChecklist } from '../features/integration-checklist/IntegrationChecklist';
import { PersonaSelector } from '../features/persona-selector/PersonaSelector';
import { ProjectSelector } from '../features/project-select/ProjectSelector';
import { ResetButton } from '../features/reset-confirm/ResetButton';
import { ResetConfirmDialog } from '../features/reset-confirm/ResetConfirmDialog';
import { useSession } from '../session/sessionContext';
import { cancelReset, confirmReset, toggleCoachSection, toggleEvidence } from '../session/sessionActions';
import styles from './App.module.css';

export default function App() {
  const { state, dispatch } = useSession();

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
          <PrivacyIndicator />
          <PersonaSelector />
          <ResetButton />
        </div>
      </header>
      <main className={styles.main} id="main-content">
        <div className={styles.journey}>
          <section className={styles.contextSection} aria-labelledby="journey-context-heading">
            <h2 id="journey-context-heading" className={styles.sectionHeading}>
              Project context
            </h2>
            <ProjectSelector />
            {state.selectedProjectId ? <IntegrationChecklist /> : null}
            <EvaluateButton />
          </section>

          {state.phase === 'evaluated' && state.evaluation && state.presentation ? (
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
          ) : (
            <p className={styles.placeholder} data-testid="results-placeholder">
              {state.selectedProjectId
                ? 'Project loaded. Run evaluation to view composite health, dimensions, and recommendations.'
                : 'Select a sample project to begin the leadership coaching journey.'}
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
