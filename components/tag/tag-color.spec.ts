/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { tagCustomTint } from './tag-color';

describe('tagCustomTint', () => {
  // Expected values are @ant-design/fast-color's own output: toHsl(), l = 0.95, toHexString().
  it.each([
    ['#f50', '#ffeee5'],
    ['#ff5500', '#ffeee5'],
    ['rgb(255, 85, 0)', '#ffeee5'],
    ['#2db7f5', '#e8f6fd'],
    ['#87d068', '#f0f9ec'],
    ['#108ee9', '#e6f4fe'],
    ['#55acee', '#eaf3fa'],
    ['#cd201f', '#fde7e7'],
    ['#3b5999', '#eaeffa'],
    ['#888888', '#f2f2f2']
  ])('%s -> %s', (input, expected) => {
    expect(tagCustomTint(input)).toBe(expected);
  });

  it('returns null for a value that is not a colour', () => {
    expect(tagCustomTint('not-a-colour')).toBeNull();
  });
});
