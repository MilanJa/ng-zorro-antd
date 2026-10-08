/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { NgStyleInterface } from './ng-class';

/** Ant Design v6 semantic `classNames` prop: one optional class string per named slot. */
export type NzSemanticClassNames<K extends string> = Partial<Record<K, string>>;

/** Ant Design v6 semantic `styles` prop: one optional style object per named slot. */
export type NzSemanticStyles<K extends string> = Partial<Record<K, NgStyleInterface>>;
