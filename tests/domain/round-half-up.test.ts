import { describe, expect, it } from 'vitest';
import { roundHalfUp } from '../../src/domain/utils/roundHalfUp';

describe('roundHalfUp', () => {
  it('rounds 79.5 up to 80', () => {
    expect(roundHalfUp(79.5)).toBe(80);
  });

  it('rounds 49.5 up to 50', () => {
    expect(roundHalfUp(49.5)).toBe(50);
  });
});
