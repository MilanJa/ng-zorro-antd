/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { captureFolderName, viewportWidth } from '../capture';

describe('capture viewport', () => {
  it('keeps the 900 px default and its plain theme folder', () => {
    expect(viewportWidth(null)).toBe(900);
    expect(captureFolderName('v6', 900)).toBe('v6');
    expect(captureFolderName('default', 900)).toBe('default');
  });

  it('writes another width to a suffixed folder next to the theme', () => {
    expect(viewportWidth('375')).toBe(375);
    expect(captureFolderName('v6', 375)).toBe('v6@375');
    expect(captureFolderName('v6-dark', 1280)).toBe('v6-dark@1280');
  });

  it('rejects a width outside 320..2560 or a non-integer', () => {
    expect(() => viewportWidth('200')).toThrow(/--viewport/);
    expect(() => viewportWidth('wide')).toThrow(/--viewport/);
  });
});
