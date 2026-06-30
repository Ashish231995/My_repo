import type { SourceSignal, SignalValidationResult, ValidationContext } from '../model/evaluation';
import { mapSignalHealth } from '../scoring/signalHealth';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function invalidResult(
  resolvedAsOfDate: string,
  exclusionReason: string,
): SignalValidationResult {
  return {
    valid: false,
    includedInScoring: false,
    exclusionReason,
    resolvedAsOfDate,
  };
}

export function validateSignal(
  source: SourceSignal,
  context: ValidationContext,
): SignalValidationResult {
  const fallbackAsOfDate = context.snapshot?.asOfDate ?? '';

  if (
    !source.id?.trim() ||
    !source.signalGroupId?.trim() ||
    !source.mappingKey?.trim() ||
    !source.sourceTerm?.trim()
  ) {
    return invalidResult(fallbackAsOfDate, 'Missing required signal identifiers');
  }

  if (!context.snapshot?.asOfDate || !isValidIsoDate(context.snapshot.asOfDate)) {
    return invalidResult(fallbackAsOfDate, 'Missing or invalid project snapshot as-of date');
  }

  let resolvedAsOfDate = context.snapshot.asOfDate;
  if (source.asOfDate !== undefined && source.asOfDate !== null) {
    if (!isValidIsoDate(source.asOfDate)) {
      return invalidResult(context.snapshot.asOfDate, 'Invalid signal asOfDate');
    }
    resolvedAsOfDate = source.asOfDate;
  }

  if (source.forceMappingFailure) {
    return invalidResult(resolvedAsOfDate, 'Mapping forced to fail for adverse testing');
  }

  const registryEntry = context.mappingRegistry[source.mappingKey];
  if (!registryEntry) {
    return invalidResult(resolvedAsOfDate, `Unrecognized mapping key: ${source.mappingKey}`);
  }

  const healthValue = mapSignalHealth(registryEntry.canonicalType, source.payload);
  if (healthValue === null) {
    return invalidResult(resolvedAsOfDate, 'Invalid or missing required payload fields');
  }

  if (!context.enabledSignalGroupIds.has(source.signalGroupId)) {
    return invalidResult(resolvedAsOfDate, 'Signal group disabled');
  }

  return {
    valid: true,
    includedInScoring: true,
    exclusionReason: null,
    resolvedAsOfDate,
  };
}
