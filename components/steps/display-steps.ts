/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

export type NzStepDisplayRole = 'visible' | 'ellipsis' | 'hidden';
/** `at` is the step rendered as the ellipsis item: the first hidden one between `prev` and `next`. */
export interface NzStepsEllipsisRange {
  at: number;
  prev: number;
  next: number;
}
export interface NzStepsDisplayPlan {
  canApply: boolean;
  roles: NzStepDisplayRole[];
  ellipses: NzStepsEllipsisRange[];
}
/**
 * antd `useDisplaySteps.ts` `getCollapsedIndexes`: first, last and current are kept; the remaining slots
 * go to current-left, current-right, first-right, last-left at growing distances. `null` marks a gap.
 */
export function getCollapsedIndexes(total: number, currentIndex: number, maxCount: number): Array<number | null> {
  const safeCurrent = Math.min(Math.max(currentIndex, 0), total - 1);
  const targetCount = Math.min(maxCount, total);
  const indexes = new Set([0, safeCurrent, total - 1]);
  for (let distance = 1; indexes.size < targetCount && distance < total; distance += 1) {
    for (const index of [safeCurrent - distance, safeCurrent + distance, distance, total - 1 - distance]) {
      if (indexes.size >= targetCount) break;
      if (index >= 0 && index < total) indexes.add(index);
    }
  }
  return Array.from(indexes)
    .sort((a, b) => a - b)
    .flatMap((index, order, sorted) => (order > 0 && index - sorted[order - 1] > 1 ? [null, index] : [index]));
}
/** antd `canApplyMaxCount`: `maxCount >= 3` and more steps than `maxCount`. */
export function planDisplaySteps(total: number, current: number, maxCount: number | undefined): NzStepsDisplayPlan {
  const canApply = maxCount !== undefined && maxCount >= 3 && total > maxCount;
  const roles: NzStepDisplayRole[] = new Array(total).fill('visible');
  const ellipses: NzStepsEllipsisRange[] = [];
  if (!canApply) return { canApply, roles, ellipses };
  const indexes = getCollapsedIndexes(total, current, maxCount);
  roles.fill('hidden');
  indexes.forEach((index, order) => {
    if (index !== null) {
      roles[index] = 'visible';
      return;
    }
    const prev = indexes[order - 1] as number;
    const next = indexes[order + 1] as number;
    roles[prev + 1] = 'ellipsis';
    ellipses.push({ at: prev + 1, prev, next });
  });
  return { canApply, roles, ellipses };
}
