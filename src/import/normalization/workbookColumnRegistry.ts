import type { WorksheetName } from '../parsing/types.js';

export interface WorkbookColumnRegistryEntry {
  worksheet: WorksheetName;
  column: string;
  mappingKey: string;
  payloadField: string;
}

function entry(
  worksheet: WorksheetName,
  column: string,
  mappingKey: string,
  payloadField: string = column,
): WorkbookColumnRegistryEntry {
  return { worksheet, column, mappingKey, payloadField };
}

export const workbookColumnRegistry: Record<string, WorkbookColumnRegistryEntry> = {
  'Schedule:slipDays': entry('Schedule', 'slipDays', 'milestone-slip', 'slipDays'),
  'Schedule:milestoneDueDate': entry('Schedule', 'milestoneDueDate', 'milestone-slip', 'milestoneDueDate'),
  'Schedule:onTimePercent': entry('Schedule', 'onTimePercent', 'baseline-health', 'onTimePercent'),
  'Delivery:blockerState': entry('Delivery', 'blockerState', 'blocker-open', 'blockerState'),
  'Delivery:changeRatePercent': entry('Delivery', 'changeRatePercent', 'scope-stability', 'changeRatePercent'),
  'Delivery:trendPercent': entry('Delivery', 'trendPercent', 'velocity-trend', 'trendPercent'),
  'Team:engagementScore': entry('Team', 'engagementScore', 'engagement-score', 'engagementScore'),
  'Team:completionPercent': entry('Team', 'completionPercent', 'communication-cadence', 'completionPercent'),
  'Risk:escalationPriority': entry('Risk', 'escalationPriority', 'issue-escalation', 'escalationPriority'),
  'Risk:gapPriority': entry('Risk', 'gapPriority', 'governance-gap', 'gapPriority'),
};

export const DIMENSION_WORKSHEETS: WorksheetName[] = ['Schedule', 'Delivery', 'Team', 'Risk'];

export function registryEntriesForWorksheet(worksheet: WorksheetName): WorkbookColumnRegistryEntry[] {
  return Object.values(workbookColumnRegistry).filter((item) => item.worksheet === worksheet);
}
