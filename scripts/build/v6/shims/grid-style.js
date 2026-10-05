/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Shim for `antd/es/grid/style/index.js`, resolved only for importers under `antd/es/modal/style/`.
// `antd/es/modal/style/index.js` (`genResponsiveWidthStyle`) imports only the plain `getMediaSize`
// helper (token -> breakpoint-name map) from that module; the real module also calls
// `genStyleHooks('Grid', ...)` twice at module scope for Row/Col, which would record a `Grid` entry in
// every engine that maps Modal. Bundles that map Row/Col import the real module directly
// (`STYLE_MODULE_NAMED_EXPORTS` in `bundle-engine.ts`), and the recorder merges its two factories.
export const getMediaSize = token => ({
  xs: token.screenXSMin,
  sm: token.screenSMMin,
  md: token.screenMDMin,
  lg: token.screenLGMin,
  xl: token.screenXLMin,
  xxl: token.screenXXLMin,
  xxxl: token.screenXXXLMin
});
