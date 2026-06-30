import type { ReactNode } from 'react';
import type { CoachSectionMeta } from '../../domain/model/evaluation';
import styles from './CoachSection.module.css';

export interface CoachSectionProps {
  meta: CoachSectionMeta;
  title: string;
  expanded: boolean;
  onToggle: (sectionId: string) => void;
  children: ReactNode;
  testId?: string;
}

export function CoachSection({
  meta,
  title,
  expanded,
  onToggle,
  children,
  testId,
}: CoachSectionProps) {
  const panelId = `${meta.sectionId}-panel`;
  const isVisible = meta.collapsedByDefault ? expanded : true;

  if (!meta.collapsedByDefault) {
    return (
      <section className={styles.section} data-testid={testId} aria-labelledby={`${meta.sectionId}-heading`}>
        <h4 id={`${meta.sectionId}-heading`} className={styles.heading}>
          {title}
        </h4>
        <div className={styles.body}>{children}</div>
      </section>
    );
  }

  return (
    <section className={styles.section} data-testid={testId}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isVisible}
        aria-controls={panelId}
        onClick={() => onToggle(meta.sectionId)}
        data-testid={`coach-toggle-${meta.sectionId}`}
      >
        {title}
      </button>
      {isVisible ? (
        <div id={panelId} className={styles.body}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
