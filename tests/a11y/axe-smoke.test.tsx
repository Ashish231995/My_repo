import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import type { DimensionResult } from '../../src/domain/model/evaluation';
import { runEvaluation } from '../../src/domain/evaluation/runEvaluation';
import { projectForPersona } from '../../src/domain/persona/projectForPersona';
import { DimensionCard } from '../../src/features/health-dashboard/DimensionCard';
import { Dialog } from '../../src/ui/Dialog/Dialog';
import { StatusLabel } from '../../src/ui/StatusLabel/StatusLabel';
import { Button } from '../../src/ui/Button/Button';
import { buildEvaluationInput } from '../helpers/evaluation-input';

describe('axe smoke — StatusLabel, DimensionCard, Dialog (SC-005)', () => {
  it('StatusLabel has no axe violations', async () => {
    const { container } = render(<StatusLabel classification="at-risk" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('DimensionCard has no axe violations', async () => {
    const output = runEvaluation(buildEvaluationInput('sample-b'));
    expect(output.ok).toBe(true);
    if (!output.ok) {
      return;
    }

    const dimension = output.result.dimensions.find((item) => item.dimensionId === 'delivery')!;
    const presentation = projectForPersona(output.result, 'intermediate').dimensions.find(
      (item) => item.dimensionId === 'delivery',
    )!;

    const { container } = render(
      <DimensionCard
        dimension={dimension}
        presentation={presentation}
        findings={output.result.findings.filter((finding) => finding.dimensionId === 'delivery')}
        explainOpen={false}
        expandedCoachSections={new Set()}
        onToggleExplain={() => undefined}
        onToggleCoachSection={() => undefined}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('Dialog has no axe violations when open', async () => {
    const { container } = render(
      <Dialog
        open
        title="Reset session"
        onClose={() => undefined}
        footer={
          <>
            <Button type="button">Cancel</Button>
            <Button type="button">Confirm</Button>
          </>
        }
      >
        <p>Confirm reset copy for accessibility smoke.</p>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
