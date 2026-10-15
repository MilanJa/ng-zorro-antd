/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { NgStyleInterface } from './ng-class';

/**
 * Render-slot convention. An input that replaces an antd render callback (`itemRender`, and the
 * like) is a `TemplateRef<Ctx>`. `Ctx.$implicit` is the default rendering as a `TemplateRef<void>`, so
 * `<ng-container [ngTemplateOutlet]="ctx.$implicit" />` inside the slot reproduces the default output; the
 * remaining fields of `Ctx` mirror the arguments antd passes to its callback. The context interface lives in
 * the component's own `typings.ts`, not here: it has no shared shape beyond `$implicit`.
 */

/** Ant Design v6 semantic `classNames` prop: one optional class string per named slot. */
export type NzSemanticClassNames<K extends string> = Partial<Record<K, string>>;

/** Ant Design v6 semantic `styles` prop: one optional style object per named slot. */
export type NzSemanticStyles<K extends string> = Partial<Record<K, NgStyleInterface>>;
