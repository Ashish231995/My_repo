import type { Persona } from '../../domain/model/enums';
import { useSession } from '../../session/sessionContext';
import { setPersona } from '../../session/sessionActions';
import styles from './PersonaSelector.module.css';

const PERSONA_OPTIONS: { id: Persona; label: string }[] = [
  { id: 'novice', label: 'Novice' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
];

export function PersonaSelector() {
  const { state, dispatch } = useSession();

  return (
    <fieldset className={styles.fieldset} data-testid="persona-selector">
      <legend className={styles.legend}>Coaching persona</legend>
      <div className={styles.options} role="radiogroup" aria-label="Coaching persona">
        {PERSONA_OPTIONS.map((option) => {
          const active = state.persona === option.id;
          return (
            <label key={option.id} className={active ? styles.optionActive : styles.option}>
              <input
                type="radio"
                name="persona"
                value={option.id}
                checked={active}
                onChange={() => dispatch(setPersona(option.id))}
                data-testid={`persona-option-${option.id}`}
              />
              <span>{option.label}</span>
              {active ? (
                <span className={styles.activeBadge} data-testid="persona-active-label" aria-hidden="true">
                  Active
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
