import { PrivacyIndicator } from '../ui/PrivacyIndicator/PrivacyIndicator';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>PM Copilot Demonstration</h1>
        <PrivacyIndicator />
      </header>
      <main className={styles.main} id="main-content">
        <p className={styles.placeholder}>
          Select a sample project to begin the coaching journey (Phase 1 shell).
        </p>
      </main>
      <footer className={styles.footer}>
        <span>PM Copilot — local demonstration build</span>
      </footer>
    </div>
  );
}
