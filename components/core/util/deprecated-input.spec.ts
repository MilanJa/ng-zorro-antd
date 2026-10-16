/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { vi } from 'vitest';

import { environment } from 'ng-zorro-antd/core/environments';

import { aliasDeprecatedInput } from './deprecated-input';

describe('aliasDeprecatedInput', () => {
  // The logger prints each message once per page, so every test uses its own component name.
  const warningsFor = (component: string): unknown[][] =>
    vi
      .mocked(console.warn)
      .mock.calls.filter(args => args.some(arg => typeof arg === 'string' && arg.includes(`\`${component}\``)));

  it('runs where warnDeprecation prints (environment.isTestMode is false in the browser runner)', () => {
    expect(environment.isTestMode).toBe(false);
  });

  it('maps values through the given mapper', () => {
    const map = aliasDeprecatedInput<'left' | 'right', 'start' | 'end'>('nz-alias-map', 'nzOld', 'nzNew', v =>
      v === 'left' ? 'start' : 'end'
    );
    expect(map('left')).toBe('start');
    expect(map('right')).toBe('end');
  });

  it('is the identity when no mapper is given', () => {
    const value = { a: 1 };
    expect(aliasDeprecatedInput<number>('nz-alias-identity-a', 'nzOld', 'nzNew')(3)).toBe(3);
    expect(aliasDeprecatedInput<{ a: number }>('nz-alias-identity-b', 'nzOld', 'nzNew')(value)).toBe(value);
  });

  it('does not warn until the mapper is first called, then warns exactly once', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const map = aliasDeprecatedInput<string>('nz-alias-once', 'nzOld', 'nzNew');
    expect(warningsFor('nz-alias-once')).toHaveLength(0);
    map('a');
    map('b');
    map('c');
    expect(warningsFor('nz-alias-once')).toHaveLength(1);
  });

  it('maps undefined without warning, and the first defined value still warns once', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const map = aliasDeprecatedInput<string | undefined, string>(
      'nz-alias-undefined',
      'nzOld',
      'nzNew',
      v => v ?? 'dflt'
    );
    expect(map(undefined)).toBe('dflt');
    expect(map(undefined)).toBe('dflt');
    expect(warningsFor('nz-alias-undefined')).toHaveLength(0);
    map('a');
    map(undefined);
    map('b');
    expect(warningsFor('nz-alias-undefined')).toHaveLength(1);
  });

  it('warns once page-wide for the same component and input, even from two instances', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    aliasDeprecatedInput<string>('nz-alias-shared', 'nzOld', 'nzNew')('a');
    aliasDeprecatedInput<string>('nz-alias-shared', 'nzOld', 'nzNew')('b');
    expect(warningsFor('nz-alias-shared')).toHaveLength(1);
  });

  it('names the component, the old and the new input and the removal version', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    aliasDeprecatedInput<string>('nz-alias-text', 'nzDirection', 'nzOrientation')('x');
    const [args] = warningsFor('nz-alias-text');
    expect(args).toContain('deprecated:');
    expect(args).toContain(
      '`nzDirection` on `nz-alias-text` is deprecated, use `nzOrientation` instead. This will be removed in v23.0.0.'
    );
  });
});
