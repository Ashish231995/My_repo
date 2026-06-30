import { PrivacyIndicator } from '../ui/PrivacyIndicator/PrivacyIndicator';
import { EvaluateButton } from '../features/health-dashboard/EvaluateButton';
import { HealthDashboard } from '../features/health-dashboard/HealthDashboard';
import { IntegrationChecklist } from '../features/integration-checklist/IntegrationChecklist';
import { ProjectSelector } from '../features/project-select/ProjectSelector';
import { useSession } from '../session/sessionContext';
import { toggleEvidence } from '../session/sessionActions';
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

          {state.phase === 'evaluated' && state.evaluation ? (
            <HealthDashboard
              evaluation={state.evaluation}
              expandedDimensionIds={state.ui.expandedEvidenceIds}
              onToggleDimensionExplain={(dimensionId) =>
                dispatch(toggleEvidence(dimensionId))
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
    </div>
  );
}
