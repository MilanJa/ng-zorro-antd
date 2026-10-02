/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { openedShotPlan } from '../capture';

describe('openedShotPlan', () => {
  it('names the first click trigger of a popup directory and the output file', () => {
    expect(openedShotPlan('dropdown', 'basic', { dropdown: '[nz-dropdown]' }, {})).toEqual({
      selector: '[id^="components-dropdown-demo-basic"] [nz-dropdown]',
      file: 'basic-opened.nz.png',
      action: 'click'
    });
  });
  it('names the hover trigger of a hover-only popup directory', () => {
    expect(openedShotPlan('breadcrumb', 'dropdown', {}, { breadcrumb: '.ant-breadcrumb-overlay-link' })).toEqual({
      selector: '[id^="components-breadcrumb-demo-dropdown"] .ant-breadcrumb-overlay-link',
      file: 'dropdown-opened.nz.png',
      action: 'hover'
    });
  });
  it('prefers the click trigger when a directory is listed in both maps', () => {
    expect(
      openedShotPlan('dropdown', 'basic', { dropdown: '[nz-dropdown]' }, { dropdown: '.ant-dropdown-trigger' })
    ).toEqual({
      selector: '[id^="components-dropdown-demo-basic"] [nz-dropdown]',
      file: 'basic-opened.nz.png',
      action: 'click'
    });
  });
  it('returns null for a directory without a registered trigger in either map', () => {
    expect(openedShotPlan('alert', 'basic', {}, {})).toBeNull();
  });
});
