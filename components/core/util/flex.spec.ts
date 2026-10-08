/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { parseFlex } from './flex';

describe('parseFlex', () => {
  it('turns a number into equal grow and shrink factors with an auto basis', () => {
    expect(parseFlex(1)).toBe('1 1 auto');
    expect(parseFlex(2.5)).toBe('2.5 2.5 auto');
    expect(parseFlex(0)).toBe('0 0 auto');
  });

  it('turns a length with a px, em, rem or % unit into a fixed basis', () => {
    for (const length of ['100px', '1.5em', '2rem', '50%']) {
      expect(parseFlex(length)).toBe(`0 0 ${length}`);
    }
  });

  it('returns any other string unchanged, unitless numbers and auto included', () => {
    for (const value of ['auto', 'none', '1 1 200px', '2', '100', '']) {
      expect(parseFlex(value)).toBe(value);
    }
  });
});
