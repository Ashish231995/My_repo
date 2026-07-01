import type {
  AcquiredWorkbook,
  RefreshWorkbookResult,
  WorkbookAcquisitionPort,
} from '../../src/import/acquisition/types.js';

export class FakeWorkbookAcquisition implements WorkbookAcquisitionPort {
  constructor(
    private readonly selectResult: AcquiredWorkbook | null,
    private readonly refreshResult?: RefreshWorkbookResult,
  ) {}

  async selectWorkbook(): Promise<AcquiredWorkbook | null> {
    return this.selectResult;
  }

  async refresh(_acquired: AcquiredWorkbook): Promise<RefreshWorkbookResult> {
    return (
      this.refreshResult ?? {
        status: 'needs-reselect',
        reason: 'FakeWorkbookAcquisition: refresh not configured',
      }
    );
  }
}

export function createFakeWorkbookAcquisition(
  selectResult: AcquiredWorkbook | null,
  refreshResult?: RefreshWorkbookResult,
): FakeWorkbookAcquisition {
  return new FakeWorkbookAcquisition(selectResult, refreshResult);
}
