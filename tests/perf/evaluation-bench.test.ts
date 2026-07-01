import { describe, expect, it } from 'vitest';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { buildEvaluationInput } from '../helpers/evaluation-input';

const EVALUATION_THRESHOLD_MS = 200;
const WARMUP_ITERATIONS = 5;
const BENCHMARK_ITERATIONS = 20;

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

describe('evaluation performance — Sample B (plan.md <200ms target)', () => {
  it('completes deterministic evaluation within threshold after warm-up', () => {
    const input = buildEvaluationInput('sample-b');

    for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration += 1) {
      const output = runEvaluation(input);
      expect(output.ok).toBe(true);
    }

    const durations: number[] = [];
    for (let iteration = 0; iteration < BENCHMARK_ITERATIONS; iteration += 1) {
      const start = performance.now();
      const output = runEvaluation(input);
      const elapsed = performance.now() - start;
      expect(output.ok).toBe(true);
      durations.push(elapsed);
    }

    const medianMs = median(durations);
    const maxMs = Math.max(...durations);

    expect(medianMs).toBeLessThan(EVALUATION_THRESHOLD_MS);
    expect(maxMs).toBeLessThan(EVALUATION_THRESHOLD_MS);

    // Record measured evidence for release gate (T128).
    console.info(
      `[perf] sample-b evaluation: median=${medianMs.toFixed(2)}ms max=${maxMs.toFixed(2)}ms threshold=${EVALUATION_THRESHOLD_MS}ms iterations=${BENCHMARK_ITERATIONS}`,
    );
  });
});
