/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TemplateRef } from '@angular/core';

export type NzSplitterOrientation = 'horizontal' | 'vertical';
/** @deprecated Use `NzSplitterOrientation` instead. This will be removed in v23.0.0. */
export type NzSplitterLayout = NzSplitterOrientation;
export type NzSplitterShowCollapsibleIcon = boolean | 'auto';
export type NzSplitterCollapsible = boolean | NzSplitterCollapseOption;

export interface NzSplitterCollapseOption {
  start?: boolean;
  end?: boolean;
  /** `'auto'` (default) shows the collapse buttons on hover, `true` always, `false` never. */
  showCollapsibleIcon?: NzSplitterShowCollapsibleIcon;
}

export interface NzSplitterCollapsibleConfig {
  /** Animate `flex-basis` when a panel collapses or expands. */
  motion?: boolean;
  /** Replaces the collapse arrows; a string is an icon type. */
  icon?: { start?: string | TemplateRef<void>; end?: string | TemplateRef<void> };
}

export interface NzSplitterCollapseEvent {
  collapsed: boolean[];
  sizes: number[];
}
