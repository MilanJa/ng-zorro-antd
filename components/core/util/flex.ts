/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * The CSS `flex` value for a grid column's `flex` (antd `grid/col.tsx` `parseFlex`): a number grows and
 * shrinks by itself from an auto basis, a length with a unit is a fixed basis, any other string is used as is.
 */
export function parseFlex(flex: string | number): string {
  if (typeof flex === 'number') {
    return `${flex} ${flex} auto`;
  }
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }
  return flex;
}
