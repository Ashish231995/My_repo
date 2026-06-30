import type { CanonicalSignalType, DimensionId } from '../../domain/model/enums';

export interface MappingRegistryEntry {
  mappingKey: string;
  canonicalType: CanonicalSignalType;
  dimensionId: DimensionId;
  representativeSourceLabel: string;
  equivalentKeys?: string[];
}

export type MappingRegistry = Record<string, MappingRegistryEntry>;

export const MAPPING_REGISTRY: MappingRegistry = {
  'milestone-slip': {
    mappingKey: 'milestone-slip',
    canonicalType: 'schedule.milestone-slip',
    dimensionId: 'schedule',
    representativeSourceLabel: 'Representative work-tracker (demo)',
    equivalentKeys: ['milestone-slip-waterfall'],
  },
  'milestone-slip-waterfall': {
    mappingKey: 'milestone-slip-waterfall',
    canonicalType: 'schedule.milestone-slip',
    dimensionId: 'schedule',
    representativeSourceLabel: 'Representative plan tracker (demo)',
    equivalentKeys: ['milestone-slip'],
  },
  'baseline-health': {
    mappingKey: 'baseline-health',
    canonicalType: 'schedule.baseline-health',
    dimensionId: 'schedule',
    representativeSourceLabel: 'Representative work-tracker (demo)',
  },
  'blocker-open': {
    mappingKey: 'blocker-open',
    canonicalType: 'delivery.blocker-open',
    dimensionId: 'delivery',
    representativeSourceLabel: 'Representative work-tracker (demo)',
  },
  'scope-stability': {
    mappingKey: 'scope-stability',
    canonicalType: 'delivery.scope-stability',
    dimensionId: 'delivery',
    representativeSourceLabel: 'Representative work-tracker (demo)',
  },
  'velocity-trend': {
    mappingKey: 'velocity-trend',
    canonicalType: 'delivery.velocity-trend',
    dimensionId: 'delivery',
    representativeSourceLabel: 'Representative work-tracker (demo)',
  },
  'engagement-score': {
    mappingKey: 'engagement-score',
    canonicalType: 'team.engagement-score',
    dimensionId: 'team',
    representativeSourceLabel: 'Representative collaboration survey (demo)',
  },
  'communication-cadence': {
    mappingKey: 'communication-cadence',
    canonicalType: 'team.communication-cadence',
    dimensionId: 'team',
    representativeSourceLabel: 'Representative collaboration survey (demo)',
  },
  'issue-escalation': {
    mappingKey: 'issue-escalation',
    canonicalType: 'risk.issue-escalation',
    dimensionId: 'risk',
    representativeSourceLabel: 'Representative risk register (demo)',
  },
  'governance-gap': {
    mappingKey: 'governance-gap',
    canonicalType: 'risk.governance-gap',
    dimensionId: 'risk',
    representativeSourceLabel: 'Representative risk register (demo)',
  },
};
