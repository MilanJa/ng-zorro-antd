/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { kebabCase } from '../bundle-engine';
import { componentTokenNames } from '../generate-styles';

describe('componentTokenNames', () => {
  it('derives Button tokens from the registry and prefixes them with the component name', async () => {
    const names = await componentTokenNames('Button');
    expect(names).toContain('--ant-button-default-bg');
    expect(names).toContain('--ant-button-primary-shadow');
    expect(names.every(n => n.startsWith('--ant-button-'))).toBe(true);
    expect(names).toEqual([...names].sort());
  });

  it('never attributes a global or other component token', async () => {
    const input = await componentTokenNames('Input');
    expect(input).not.toContain('--ant-color-primary');
    expect(input.some(n => n.startsWith('--ant-input-number-'))).toBe(false);
  });

  it('returns an empty list for an unregistered component', async () => {
    // `Affix` has no map entry (plan F); any name genuinely absent from `v6Components` works here.
    expect(await componentTokenNames('Affix')).toEqual([]);
  });
});

describe('kebabCase', () => {
  it('matches antd directory naming', () => {
    expect(kebabCase('Button')).toBe('button');
    expect(kebabCase('DatePicker')).toBe('date-picker');
    expect(kebabCase('QRCode')).toBe('qr-code');
    expect(kebabCase('Mentions')).toBe('mentions');
  });
});
