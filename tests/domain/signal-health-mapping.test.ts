import { describe, expect, it } from 'vitest';
import { CANONICAL_SIGNAL_TYPES } from '../../src/domain/model/enums';
import { mapSignalHealth } from '../../src/domain/scoring/signalHealth';

describe('mapSignalHealth — Demonstration Rule Catalog v1.0', () => {
  it('covers all nine canonical signal types', () => {
    expect(CANONICAL_SIGNAL_TYPES).toHaveLength(9);
  });

  describe('schedule.milestone-slip', () => {
    it.each([
      [0, 100],
      [1, 85],
      [3, 85],
      [4, 65],
      [7, 65],
      [8, 40],
      [14, 40],
      [15, 20],
    ] as const)('maps slipDays %i to health %i', (slipDays, health) => {
      expect(mapSignalHealth('schedule.milestone-slip', { slipDays })).toBe(health);
    });

    it('rejects missing slipDays', () => {
      expect(mapSignalHealth('schedule.milestone-slip', {})).toBeNull();
    });

    it('rejects non-numeric slipDays', () => {
      expect(mapSignalHealth('schedule.milestone-slip', { slipDays: '8' })).toBeNull();
    });
  });

  describe('schedule.baseline-health', () => {
    it('maps onTimePercent directly with clamping', () => {
      expect(mapSignalHealth('schedule.baseline-health', { onTimePercent: 90 })).toBe(90);
      expect(mapSignalHealth('schedule.baseline-health', { onTimePercent: 0 })).toBe(0);
      expect(mapSignalHealth('schedule.baseline-health', { onTimePercent: 100 })).toBe(100);
    });

    it('rejects out-of-range onTimePercent', () => {
      expect(mapSignalHealth('schedule.baseline-health', { onTimePercent: 101 })).toBeNull();
      expect(mapSignalHealth('schedule.baseline-health', { onTimePercent: -1 })).toBeNull();
    });

    it('rejects missing onTimePercent', () => {
      expect(mapSignalHealth('schedule.baseline-health', {})).toBeNull();
    });
  });

  describe('delivery.blocker-open', () => {
    it.each([
      ['none', 100],
      ['closed', 100],
      ['advisory', 75],
      ['important', 50],
      ['urgent', 20],
    ] as const)('maps blockerState %s to health %i', (blockerState, health) => {
      expect(mapSignalHealth('delivery.blocker-open', { blockerState })).toBe(health);
    });

    it('rejects unsupported blockerState enum value', () => {
      expect(mapSignalHealth('delivery.blocker-open', { blockerState: 'critical' })).toBeNull();
    });
  });

  describe('delivery.scope-stability', () => {
    it.each([
      [0, 95],
      [5, 95],
      [6, 80],
      [10, 80],
      [11, 60],
      [20, 60],
      [21, 35],
    ] as const)('maps changeRatePercent %i to health %i', (changeRatePercent, health) => {
      expect(mapSignalHealth('delivery.scope-stability', { changeRatePercent })).toBe(health);
    });

    it('rejects negative changeRatePercent', () => {
      expect(mapSignalHealth('delivery.scope-stability', { changeRatePercent: -1 })).toBeNull();
    });
  });

  describe('delivery.velocity-trend', () => {
    it.each([
      [10, 95],
      [0, 85],
      [5, 85],
      [-10, 65],
      [-11, 40],
    ] as const)('maps trendPercent %i to health %i', (trendPercent, health) => {
      expect(mapSignalHealth('delivery.velocity-trend', { trendPercent })).toBe(health);
    });
  });

  describe('team.engagement-score', () => {
    it('maps engagementScore with clamping', () => {
      expect(mapSignalHealth('team.engagement-score', { engagementScore: 88 })).toBe(88);
    });
  });

  describe('team.communication-cadence', () => {
    it('maps completionPercent with clamping', () => {
      expect(mapSignalHealth('team.communication-cadence', { completionPercent: 90 })).toBe(90);
    });
  });

  describe('risk.issue-escalation', () => {
    it.each([
      ['none', 100],
      ['closed', 100],
      ['advisory', 75],
      ['important', 50],
      ['urgent', 20],
    ] as const)('maps escalationPriority %s to health %i', (escalationPriority, health) => {
      expect(mapSignalHealth('risk.issue-escalation', { escalationPriority })).toBe(health);
    });

    it('rejects unsupported escalationPriority enum value', () => {
      expect(
        mapSignalHealth('risk.issue-escalation', { escalationPriority: 'severe' }),
      ).toBeNull();
    });
  });

  describe('risk.governance-gap', () => {
    it.each([
      ['none', 100],
      ['closed', 100],
      ['advisory', 75],
      ['important', 50],
      ['urgent', 20],
    ] as const)('maps gapPriority %s to health %i', (gapPriority, health) => {
      expect(mapSignalHealth('risk.governance-gap', { gapPriority })).toBe(health);
    });

    it('rejects unsupported gapPriority enum value', () => {
      expect(mapSignalHealth('risk.governance-gap', { gapPriority: 'severe' })).toBeNull();
    });
  });

  it('equivalent payloads for same canonical type produce identical health (AS-061)', () => {
    const payload = { slipDays: 8 };
    expect(mapSignalHealth('schedule.milestone-slip', payload)).toBe(
      mapSignalHealth('schedule.milestone-slip', { ...payload }),
    );
  });
});
