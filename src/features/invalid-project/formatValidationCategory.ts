const CATEGORY_LABELS: Record<string, string> = {
  'empty-file': 'Empty file',
  'missing-identity': 'Missing identity',
  'invalid-snapshot': 'Invalid snapshot',
  'unrecognizable-signals': 'Unrecognizable signals',
  'malformed-structure': 'Malformed structure',
};

export function formatValidationCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/-/g, ' ');
}
