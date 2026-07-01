import styles from './AdverseConditionPath.module.css';
import { INVALID_FIXTURES } from '../../data/fixtures';
import { loadInvalidProject } from '../../session/sessionActions';
import { useSession } from '../../session/sessionContext';
import { Button } from '../../ui/Button/Button';

const INVALID_FIXTURE_ID = 'sample-invalid';

export function AdverseConditionPath() {
  const { dispatch } = useSession();
  const fixture = INVALID_FIXTURES[INVALID_FIXTURE_ID];

  return (
    <section
      className={styles.section}
      aria-labelledby="adverse-condition-heading"
      data-testid="adverse-condition-path"
    >
      <h3 id="adverse-condition-heading" className={styles.heading}>
        Adverse condition (test only)
      </h3>
      <p className={styles.intro}>
        Load bundled invalid sample data through a controlled test path. Invalid fixtures are not
        listed in the normal project picker.
      </p>
      <Button
        type="button"
        className={styles.button}
        data-testid="load-invalid-fixture"
        onClick={() => dispatch(loadInvalidProject(INVALID_FIXTURE_ID))}
      >
        Load {fixture.displayName}
      </Button>
    </section>
  );
}
