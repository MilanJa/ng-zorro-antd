/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NzSplitterCollapseOption, NzSplitterCollapsible, NzSplitterShowCollapsibleIcon } from './typings';

/**
 * Get the percentage value of the string. (e.g. '50%' => 0.5)
 * @param str
 */
export function getPercentValue(str: string): number {
  return Number(str.slice(0, -1)) / 100;
}

/**
 * Check if the size is percentage.
 * @param size
 */
export function isPercent(size: string | number | undefined): size is string {
  return typeof size === 'string' && size.endsWith('%');
}

export type NzSplitterMergedCollapse = NzSplitterCollapseOption & {
  showCollapsibleIcon: NzSplitterShowCollapsibleIcon;
};

/**
 * Coerce the panel collapsible option to the NzSplitterMergedCollapse type.
 */
export function coerceCollapsible(collapsible: NzSplitterCollapsible): NzSplitterMergedCollapse {
  if (collapsible && typeof collapsible === 'object') {
    return { ...collapsible, showCollapsibleIcon: collapsible.showCollapsibleIcon ?? 'auto' };
  }

  const mergedCollapsible = !!collapsible;
  return { start: mergedCollapsible, end: mergedCollapsible, showCollapsibleIcon: 'auto' };
}

interface CollapseSide {
  collapsible: boolean;
  showCollapsibleIcon: NzSplitterShowCollapsibleIcon;
}

/** A bar button serves two panels: `true` on either wins, then `'auto'`. */
export function getShowCollapsibleIcon(prev: CollapseSide, next: CollapseSide): NzSplitterShowCollapsibleIcon {
  if (prev.collapsible && next.collapsible) {
    if (prev.showCollapsibleIcon === true || next.showCollapsibleIcon === true) return true;
    if (prev.showCollapsibleIcon === 'auto' || next.showCollapsibleIcon === 'auto') return 'auto';
    return false;
  }
  if (prev.collapsible) return prev.showCollapsibleIcon;
  if (next.collapsible) return next.showCollapsibleIcon;
  return false;
}
