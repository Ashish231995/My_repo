import { describe, expect, it } from 'vitest';
import type { Recommendation } from '../../src/domain/model/evaluation';
import { orderRecommendations } from '../../src/domain/recommendations/orderRecommendations';

describe('orderRecommendations — Demonstration Policy v1.0', () => {
  it('orders Sample B with REC-002 before REC-001 (HD-08)', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'REC-001',
        priority: 'urgent',
        action: 'Resolve and escalate the delivery blocker',
        reason: 'Urgent blocker',
        dimensionId: 'delivery',
        findingIds: ['FND-001'],
        evidenceIds: ['ev-blocker'],
        supportedDueDate: null,
        urgencyInferred: false,
      },
      {
        id: 'REC-002',
        priority: 'urgent',
        action: 'Establish and escalate a milestone recovery plan',
        reason: 'Milestone slip',
        dimensionId: 'schedule',
        findingIds: ['FND-002'],
        evidenceIds: ['ev-slip'],
        supportedDueDate: '2026-06-11',
        urgencyInferred: false,
      },
    ];

    const ordered = orderRecommendations(recommendations);

    expect(ordered.map((r) => r.id)).toEqual(['REC-002', 'REC-001']);
  });

  it('sorts by priority rank urgent → important → advisory', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'REC-007',
        priority: 'advisory',
        action: 'Restore cadence',
        reason: 'Low completion',
        dimensionId: 'team',
        findingIds: ['FND-007'],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
      {
        id: 'REC-005',
        priority: 'important',
        action: 'Close governance gap',
        reason: 'Gap',
        dimensionId: 'risk',
        findingIds: ['FND-005'],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
      {
        id: 'REC-001',
        priority: 'urgent',
        action: 'Resolve blocker',
        reason: 'Blocker',
        dimensionId: 'delivery',
        findingIds: ['FND-001'],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
    ];

    const ordered = orderRecommendations(recommendations);
    expect(ordered.map((r) => r.id)).toEqual(['REC-001', 'REC-005', 'REC-007']);
  });

  it('orders dated recommendations before undated within same priority', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'REC-B',
        priority: 'important',
        action: 'Undated action',
        reason: 'Test',
        dimensionId: 'schedule',
        findingIds: [],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
      {
        id: 'REC-A',
        priority: 'important',
        action: 'Dated action',
        reason: 'Test',
        dimensionId: 'schedule',
        findingIds: [],
        evidenceIds: [],
        supportedDueDate: '2026-06-05',
        urgencyInferred: false,
      },
    ];

    const ordered = orderRecommendations(recommendations);
    expect(ordered[0]?.supportedDueDate).toBe('2026-06-05');
  });

  it('breaks ties with stable id ascending', () => {
    const recommendations: Recommendation[] = [
      {
        id: 'REC-002',
        priority: 'urgent',
        action: 'B',
        reason: 'Test',
        dimensionId: 'schedule',
        findingIds: [],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
      {
        id: 'REC-001',
        priority: 'urgent',
        action: 'A',
        reason: 'Test',
        dimensionId: 'delivery',
        findingIds: [],
        evidenceIds: [],
        supportedDueDate: null,
        urgencyInferred: false,
      },
    ];

    const ordered = orderRecommendations(recommendations);
    expect(ordered.map((r) => r.id)).toEqual(['REC-001', 'REC-002']);
  });
});
