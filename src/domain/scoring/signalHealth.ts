import type { CanonicalSignalType } from '../model/enums';

const PRIORITY_STATES = new Set(['none', 'closed', 'advisory', 'important', 'urgent']);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function mapPriorityField(value: unknown): number | null {
  if (typeof value !== 'string' || !PRIORITY_STATES.has(value)) {
    return null;
  }
  switch (value) {
    case 'none':
    case 'closed':
      return 100;
    case 'advisory':
      return 75;
    case 'important':
      return 50;
    case 'urgent':
      return 20;
    default:
      return null;
  }
}

/**
 * Maps a valid canonical signal payload to a 0–100 health value per signal-health-mapping.md.
 * Returns null when payload is invalid.
 */
export function mapSignalHealth(
  canonicalType: CanonicalSignalType,
  payload: Record<string, unknown>,
): number | null {
  switch (canonicalType) {
    case 'schedule.milestone-slip': {
      const slipDays = payload.slipDays;
      if (!isFiniteNumber(slipDays)) {
        return null;
      }
      if (slipDays <= 0) return 100;
      if (slipDays <= 3) return 85;
      if (slipDays <= 7) return 65;
      if (slipDays <= 14) return 40;
      return 20;
    }
    case 'schedule.baseline-health': {
      const onTimePercent = payload.onTimePercent;
      if (!isFiniteNumber(onTimePercent) || onTimePercent < 0 || onTimePercent > 100) {
        return null;
      }
      return clamp(onTimePercent, 0, 100);
    }
    case 'delivery.blocker-open':
      return mapPriorityField(payload.blockerState);
    case 'delivery.scope-stability': {
      const changeRatePercent = payload.changeRatePercent;
      if (!isFiniteNumber(changeRatePercent) || changeRatePercent < 0) {
        return null;
      }
      if (changeRatePercent <= 5) return 95;
      if (changeRatePercent <= 10) return 80;
      if (changeRatePercent <= 20) return 60;
      return 35;
    }
    case 'delivery.velocity-trend': {
      const trendPercent = payload.trendPercent;
      if (!isFiniteNumber(trendPercent)) {
        return null;
      }
      if (trendPercent >= 10) return 95;
      if (trendPercent >= 0) return 85;
      if (trendPercent >= -10) return 65;
      return 40;
    }
    case 'team.engagement-score': {
      const engagementScore = payload.engagementScore;
      if (!isFiniteNumber(engagementScore) || engagementScore < 0 || engagementScore > 100) {
        return null;
      }
      return clamp(engagementScore, 0, 100);
    }
    case 'team.communication-cadence': {
      const completionPercent = payload.completionPercent;
      if (!isFiniteNumber(completionPercent) || completionPercent < 0 || completionPercent > 100) {
        return null;
      }
      return clamp(completionPercent, 0, 100);
    }
    case 'risk.issue-escalation':
      return mapPriorityField(payload.escalationPriority);
    case 'risk.governance-gap':
      return mapPriorityField(payload.gapPriority);
    default:
      return null;
  }
}
