import { render, type RenderOptions } from '@testing-library/react';
import type { WorkbookAcquisitionPort } from '../../src/import/acquisition/types';
import type { WorkbookParserPort } from '../../src/import/parsing/WorkbookParserPort';
import App from '../../src/app/App';
import { SessionProvider } from '../../src/session/sessionContext';

export interface ImportAppDeps {
  acquisition: WorkbookAcquisitionPort;
  parser: WorkbookParserPort;
}

export function renderImportApp(
  importDeps: ImportAppDeps,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(
    <SessionProvider importDeps={importDeps}>
      <App />
    </SessionProvider>,
    options,
  );
}
