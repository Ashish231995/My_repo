import { describe, expect, it } from 'vitest';
import { compareSnapshotDates } from '../../src/domain/utils/compareSnapshotDates';

describe('compareSnapshotDates', () => {
  it('returns calendar-day difference for REC-002 slip window (Sample B)', () => {
    expect(compareSnapshotDates('2026-06-01', '2026-06-11')).toBe(10);
  });

  it('returns negative days when due date is before snapshot', () => {
    expect(compareSnapshotDates('2026-06-11', '2026-06-01')).toBe(-10);
  });

  it('returns 0 for same calendar day', () => {
    expect(compareSnapshotDates('2026-06-01', '2026-06-01')).toBe(0);
  });
});
