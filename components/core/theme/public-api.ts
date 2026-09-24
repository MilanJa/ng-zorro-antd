/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

// ng-packagr compiles this entry point from a program rooted at this file's import graph rather than
// the library's full `tsconfig` `include` glob, so the ambient `*.mjs` module declarations in
// `antd-engine.d.ts` (never itself imported by anything) need an explicit reference to be picked up; a
// real `import` statement would leak into the emitted `.js`/`.d.ts` output and break ng-packagr's later
// bundling step (it would try, and fail, to resolve that path the same way), so this has to be a
// compiler-only directive. Once this file is part of the program, the ambient declarations apply
// program-wide (they also resolve `render-theme-css.ts`'s own `*.mjs` imports, not just this file's).
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./antd-engine.d.ts" />

export * from './algorithms';
export * from './theme.types';
export * from './theme.service';
export * from './theme.directive';
export type { NzAliasToken, NzComponentTokenMap, NzSeedToken } from './generated/tokens';
export { getDesignToken as getNzDesignToken, renderThemeCss as renderNzThemeCss } from './render-theme-css';
