import { describe, expect, it } from 'vitest';
import { classifyHealth } from '../../src/domain/utils/classifyHealth';

describe('classifyHealth', () => {
  it('classifies 80 as healthy', () => {
    expect(classifyHealth(80)).toBe('healthy');
  });

  it('classifies 50 as at-risk', () => {
    expect(classifyHealth(50)).toBe('at-risk');
  });

  it('classifies 49 as critical', () => {
    expect(classifyHealth(49)).toBe('critical');
  });
});
