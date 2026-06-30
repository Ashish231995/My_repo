import { SAMPLE_PROJECTS } from '../../data/fixtures';
import { toggleSignalGroup } from '../../session/sessionActions';
import { useSession } from '../../session/sessionContext';
import styles from './IntegrationChecklist.module.css';

export function IntegrationChecklist() {
  const { state, dispatch } = useSession();

  if (!state.selectedProjectId) {
    return null;
  }

  const project = SAMPLE_PROJECTS[state.selectedProjectId];
  if (!project) {
    return null;
  }

  const allGroupIds = project.signalGroups.map((group) => group.id);
  const checklistComplete = allGroupIds.every((groupId) =>
    state.enabledSignalGroupIds.includes(groupId),
  );

  return (
    <section
      className={styles.section}
      aria-labelledby="integration-checklist-heading"
      data-testid="integration-checklist"
    >
      <h3 id="integration-checklist-heading" className={styles.heading}>
        Signal evidence checklist
      </h3>
      <p className={styles.intro}>
        Choose which bundled representative signal groups to include in the next evaluation.
      </p>
      <ul className={styles.list}>
        {project.signalGroups.map((group) => {
          const checked = state.enabledSignalGroupIds.includes(group.id);
          return (
            <li key={group.id} className={styles.item} data-testid={`checklist-group-${group.id}`}>
              <input
                id={`checklist-${group.id}`}
                className={styles.checkbox}
                type="checkbox"
                checked={checked}
                onChange={() => dispatch(toggleSignalGroup(group.id))}
                aria-describedby={`checklist-source-${group.id}`}
              />
              <label className={styles.labelBlock} htmlFor={`checklist-${group.id}`}>
                <span className={styles.groupName}>{group.displayName}</span>
                <span id={`checklist-source-${group.id}`} className={styles.sourceLabel}>
                  {group.representativeSourceLabel}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {!checklistComplete ? (
        <p className={styles.warning} data-testid="checklist-incomplete-warning" role="status">
          <span className={styles.warningTitle}>Incomplete signal evidence</span>
          Disabled groups are excluded from scoring. Dimension and composite coverage may show
          Partial or Unmeasured states until representative evidence is re-enabled.
        </p>
      ) : null}
    </section>
  );
}
