/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Observable } from 'rxjs';

import { NzSafeAny } from 'ng-zorro-antd/core/types';

export type NzTabPosition = 'top' | 'bottom' | 'left' | 'right';
export type NzTabType = 'line' | 'card' | 'editable-card';

/** The `nzKey` of the tab being left and of the tab being entered; `fromKey` is unset while no tab is active. */
export interface NzTabsCanDeactivateKeys {
  fromKey?: string;
  toKey?: string;
}

export type NzTabsCanDeactivateFn = (
  fromIndex: number,
  toIndex: number,
  keys?: NzTabsCanDeactivateKeys
) => Observable<boolean> | Promise<boolean> | boolean;
export type NzTabPositionMode = 'horizontal' | 'vertical';

export interface NzAnimatedInterface {
  inkBar: boolean;
  tabPane: boolean;
}

export class NzTabChangeEvent {
  index?: number;
  /** The `nzKey` of the selected tab, when it has one. */
  key?: string;
  tab: NzSafeAny;
}

export interface NzTabScrollListOffset {
  x: number;
  y: number;
}

export type NzTabScrollListOffsetEvent = NzTabScrollListOffset & { event: Event };

interface NzTabWheelScrollEvent {
  type: 'wheel';
  event: WheelEvent;
}

interface NzTabTouchScrollEvent {
  type: 'touchstart' | 'touchmove' | 'touchend';
  event: TouchEvent;
}

export type NzTabScrollEvent = NzTabTouchScrollEvent | NzTabWheelScrollEvent;
export type NzTabScrollEventHandlerFun<T extends NzTabScrollEvent['event']> = (event: T) => void;

export interface TabTemplateContext {
  visible: boolean;
}

export type NzIndicatorAlign = 'start' | 'end' | 'center';
export interface NzIndicator {
  size?: number | ((origin: number) => number);
  align: NzIndicatorAlign;
}
