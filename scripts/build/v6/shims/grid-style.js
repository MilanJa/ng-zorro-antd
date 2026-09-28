/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Shim for `antd/es/grid/style/index.js`. `antd/es/modal/style/index.js` (`genResponsiveWidthStyle`)
// imports only the plain `getMediaSize` helper (token -> breakpoint-name map) from that module; the
// real module also calls `genStyleHooks('Grid', genGridRowStyle, prepareRowComponentToken)` and
// `genStyleHooks('Grid', ..., prepareColComponentToken)` at module scope for Row/Col, both keyed under
// the same recorded name `Grid` but with two different `getDefaultToken` factories. Our shimmed
// recorder (`cssinjs-utils.js`) assumes one factory per recorded name and throws on the mismatch
// ("conflicting default-token factories for Grid"). Grid is not itself a `v6Components` entry (no
// component here needs its generated styles), so shimming out the two `genStyleHooks` calls entirely
// and keeping only the helper Modal actually needs is safe.
export const getMediaSize = token => ({
  xs: token.screenXSMin,
  sm: token.screenSMMin,
  md: token.screenMDMin,
  lg: token.screenLGMin,
  xl: token.screenXLMin,
  xxl: token.screenXXLMin,
  xxxl: token.screenXXXLMin
});
