import type { DimensionId } from '../model/enums';
import type {
  EvaluationInput,
  EvaluationOutput,
  EvidenceItem,
  SampleProjectFixture,
  SnapshotMetadata,
} from '../model/evaluation';
import { assembleEvidence } from '../findings/assembleEvidence';
import { collectDimensionEvidence } from './collectDimensionEvidence';
import { deriveFindings } from '../findings/deriveFindings';
import { normalizeSignal } from '../normalization/normalizeSignal';
import { generateRecommendations } from '../recommendations/generateRecommendations';
import { orderRecommendations } from '../recommendations/orderRecommendations';
import { calculateComposite } from '../scoring/calculateComposite';
import { calculateDimension } from '../scoring/calculateDimension';
import { mapSignalHealth } from '../scoring/signalHealth';
import { validateProject } from '../validation/validateProject';
import type { ProjectValidator } from '../validation/projectValidator';
import { validateSignal } from '../validation/validateSignal';

const DIMENSION_IDS: DimensionId[] = ['schedule', 'delivery', 'team', 'risk'];

export function runEvaluation(input: EvaluationInput): EvaluationOutput {
  const validate: ProjectValidator = input.projectValidator ?? validateProject;
  const load = validate(input.project, input.mappingRegistry);
  if (!load.ok) {
    return { ok: false, error: { message: load.invalid.message } };
  }

  const project = load.project;
  const snapshot: SnapshotMetadata = {
    asOfDate: project.snapshot.asOfDate,
    label: project.snapshot.label ?? `Snapshot as of ${project.snapshot.asOfDate}`,
  };

  const evidenceIndex = new Map<string, EvidenceItem>();
  const allEvidence: EvidenceItem[] = [];

  for (const source of project.sourceSignals) {
    const mapping = normalizeSignal(source, input.mappingRegistry);
    const validation = validateSignal(source, {
      enabledSignalGroupIds: input.enabledSignalGroupIds,
      snapshot: project.snapshot,
      mappingRegistry: input.mappingRegistry,
    });

    let healthValue: number | null = null;
    if (
      mapping.status === 'mapped' &&
      mapping.canonicalType &&
      validation.valid &&
      validation.includedInScoring
    ) {
      healthValue = mapSignalHealth(mapping.canonicalType, source.payload);
    }

    const evidence = assembleEvidence(source, mapping, validation, healthValue, snapshot);
    evidenceIndex.set(evidence.id, evidence);
    allEvidence.push(evidence);
  }

  const dimensions = DIMENSION_IDS.map((dimensionId) => {
    const dimensionDef = input.ruleCatalogs.dimension.dimensions[dimensionId];
    const dimensionEvidence = collectDimensionEvidence(dimensionId, project, allEvidence);
    return calculateDimension(
      dimensionId,
      dimensionEvidence,
      dimensionDef,
      input.ruleCatalogs.dimension,
    );
  });

  const composite = calculateComposite(dimensions);
  const findings = deriveFindings(dimensions, evidenceIndex);
  const recommendations = orderRecommendations(
    generateRecommendations(
      { dimensions, findings, evidenceIndex },
      input.ruleCatalogs.recommendation,
      snapshot.asOfDate,
    ),
  );

  return {
    ok: true,
    result: {
      projectId: project.id,
      snapshot,
      evaluatedAtSnapshotDate: snapshot.asOfDate,
      dimensions,
      composite,
      findings,
      recommendations,
      evidenceIndex,
    },
  };
}
