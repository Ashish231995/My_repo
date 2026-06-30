import type { Recommendation } from '../model/evaluation';

const PRIORITY_RANK: Record<Recommendation['priority'], number> = {
  urgent: 0,
  important: 1,
  advisory: 2,
};

export function orderRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return [...recommendations].sort((left, right) => {
    const priorityDiff = PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const leftDated = left.supportedDueDate !== null;
    const rightDated = right.supportedDueDate !== null;
    if (leftDated !== rightDated) {
      return leftDated ? -1 : 1;
    }

    if (left.supportedDueDate && right.supportedDueDate) {
      const dateCompare = left.supportedDueDate.localeCompare(right.supportedDueDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
    }

    return left.id.localeCompare(right.id);
  });
}
