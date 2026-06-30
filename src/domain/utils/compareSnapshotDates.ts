/**
 * Calendar-day difference: endDate − startDate in whole days (REC-002 / FR-034).
 * Uses UTC date parts to avoid DST drift.
 */
export function compareSnapshotDates(startDate: string, endDate: string): number {
  const start = parseUtcDate(startDate);
  const end = parseUtcDate(endDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

function parseUtcDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}
