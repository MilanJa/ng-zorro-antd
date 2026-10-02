/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { openedShotPlan } from '../capture';

describe('openedShotPlan', () => {
  it('names the first click trigger of a popup directory and the output file', () => {
    expect(openedShotPlan('dropdown', 'basic', { dropdown: '[nz-dropdown]' })).toEqual({
      selector: '[id^="components-dropdown-demo-basic"] [nz-dropdown]',
      file: 'basic-opened.nz.png'
    });
  });
  it('returns null for a directory without a click trigger', () => {
    expect(openedShotPlan('alert', 'basic', {})).toBeNull();
  });
});
