import type { WorksheetName } from './types.js';

export const CONTRACT_SHEET_HEADERS: Record<WorksheetName, readonly string[]> = {
  Project: ['templateVersion', 'projectKey', 'projectName', 'asOfDate', 'snapshotLabel'],
  Schedule: ['slipDays', 'milestoneDueDate', 'onTimePercent'],
  Delivery: ['blockerState', 'changeRatePercent', 'trendPercent'],
  Team: ['engagementScore', 'completionPercent'],
  Risk: ['escalationPriority', 'gapPriority'],
};

export const REQUIRED_WORKSHEETS: WorksheetName[] = [
  'Project',
  'Schedule',
  'Delivery',
  'Team',
  'Risk',
];
