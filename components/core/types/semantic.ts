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

/**
 * Key beside index. Where a component gains a string key next to an existing index API (`nzActiveKey` beside
 * `nzSelectedIndex`), a bound key wins; binding both warns once per app in dev mode (the logger dedupes by message), and the index API
 * keeps its current semantics untouched.
 *
 * Controlled key. A bound `nz<Name>Key` input is strictly controlled: a user pick emits the change output,
 * and the component shows the picked key only after the parent writes it back. When the key input is not
 * bound the pick shows at once, and the `nzDefault<Name>Key` input seeds the internal value. Programmatic key
 * changes never emit.
 */

/** Ant Design v6 semantic `classNames` prop: one optional class string per named slot. */
export type NzSemanticClassNames<K extends string> = Partial<Record<K, string>>;

/** Ant Design v6 semantic `styles` prop: one optional style object per named slot. */
export type NzSemanticStyles<K extends string> = Partial<Record<K, NgStyleInterface>>;
