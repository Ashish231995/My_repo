import { SAMPLE_PROJECT_IDS, SAMPLE_PROJECTS } from '../../data/fixtures';
import { ImportSnapshotButton } from '../import-snapshot/ImportSnapshotButton';
import { selectProject } from '../../session/sessionActions';
import { useSession } from '../../session/sessionContext';
import styles from './ProjectSelector.module.css';

export function ProjectSelector() {
  const { state, dispatch } = useSession();

  return (
    <section aria-labelledby="project-select-heading">
      <fieldset className={styles.fieldset}>
        <legend id="project-select-heading" className={styles.legend}>
          Sample project
        </legend>
        <div className={styles.options} role="radiogroup" aria-labelledby="project-select-heading">
          {SAMPLE_PROJECT_IDS.map((projectId) => {
            const project = SAMPLE_PROJECTS[projectId];
            return (
              <label key={projectId} className={styles.option}>
                <input
                  className={styles.input}
                  type="radio"
                  name="sample-project"
                  value={projectId}
                  checked={state.selectedProjectId === projectId}
                  onChange={() => dispatch(selectProject(projectId))}
                  data-testid={`project-option-${projectId}`}
                />
                <span className={styles.optionLabel}>
                  <span className={styles.projectName}>{project.displayName}</span>
                  <span className={styles.projectKey}>{project.identity.projectKey}</span>
                </span>
              </label>
            );
          })}
        </div>
        <ImportSnapshotButton />
        {state.selectedProjectId === null && state.projectMode !== 'imported' && (
          <p className={styles.prompt} data-testid="project-select-prompt">
            Select a bundled sample project to continue.
          </p>
        )}
      </fieldset>
    </section>
  );
}
