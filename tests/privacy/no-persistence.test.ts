import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderApp } from '../helpers/render-app';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const BANNED_RUNTIME_PATTERNS = [
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bdocument\.cookie\b/,
  /\bfetch\s*\(/,
];

function collectSourceFiles(directory: string, files: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      collectSourceFiles(path, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

describe('privacy source audit (T113)', () => {
  it('finds no prohibited persistence or network APIs under src/', () => {
    const srcRoot = join(process.cwd(), 'src');
    const violations: string[] = [];

    for (const file of collectSourceFiles(srcRoot)) {
      const content = readFileSync(file, 'utf8');
      for (const pattern of BANNED_RUNTIME_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file} matches ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

describe('no persistence during evaluation journey (AS-025, FR-026)', () => {
  const storageSpies = {
    localSet: vi.fn(),
    localGet: vi.fn(),
    localRemove: vi.fn(),
    localClear: vi.fn(),
    sessionSet: vi.fn(),
    sessionGet: vi.fn(),
  };

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(storageSpies.localSet);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(storageSpies.localGet);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(storageSpies.localRemove);
    vi.spyOn(Storage.prototype, 'clear').mockImplementation(storageSpies.localClear);
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(storageSpies.sessionSet);
    vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(storageSpies.sessionGet);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not call storage or cookie APIs through the full Sample B journey', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByTestId('project-option-sample-b'));
    await user.click(screen.getByTestId('persona-option-expert'));
    await user.click(screen.getByTestId('evaluate-button'));

    expect(screen.getByTestId('health-dashboard')).toBeInTheDocument();

    for (const spy of Object.values(storageSpies)) {
      expect(spy).not.toHaveBeenCalled();
    }
  });
});
