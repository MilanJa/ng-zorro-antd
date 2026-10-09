/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { optionalBooleanAttribute } from './convert';

describe('optionalBooleanAttribute', () => {
  it('keeps undefined as unset', () => {
    expect(optionalBooleanAttribute(undefined)).toBeUndefined();
  });

  it('coerces like booleanAttribute', () => {
    expect(optionalBooleanAttribute(true)).toBe(true);
    expect(optionalBooleanAttribute('')).toBe(true);
    expect(optionalBooleanAttribute('true')).toBe(true);
    expect(optionalBooleanAttribute(false)).toBe(false);
    expect(optionalBooleanAttribute('false')).toBe(false);
    expect(optionalBooleanAttribute(null)).toBe(false);
  });
});
