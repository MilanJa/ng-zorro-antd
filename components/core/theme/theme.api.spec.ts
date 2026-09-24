/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TestBed } from '@angular/core/testing';

import { getNzDesignToken, NzAliasToken, NzThemeService, renderNzThemeCss } from './public-api';

describe('core/theme public API', () => {
  it('getNzDesignToken returns a typed alias token', () => {
    const token: NzAliasToken = getNzDesignToken({ token: { colorPrimary: '#00b96b' } });
    expect(token.colorPrimary).toBe('#00b96b');
    expect(typeof token.controlHeight).toBe('number');
    expect(getNzDesignToken().colorPrimary).toBe('#1677ff');
  });

  it('renderNzThemeCss renders under the given selector and defaults to :root', async () => {
    expect((await renderNzThemeCss({}, '.my-scope')).startsWith('.my-scope{')).toBe(true);
    expect((await renderNzThemeCss({})).startsWith(':root{')).toBe(true);
  });

  it('renderNzThemeCss does not expose the internal component filter', () => {
    // `config` is required, `selector` has a default; nothing else is part of the public signature.
    expect(renderNzThemeCss.length).toBe(1);
  });

  it('NzThemeService exposes read-only signals', () => {
    const service = TestBed.inject(NzThemeService);
    // @ts-expect-error `config` is a read-only Signal for consumers
    expect(service.config.set).toBeUndefined();
    // @ts-expect-error `token` is a read-only Signal for consumers
    expect(service.token.set).toBeUndefined();
    expect(service.config()).toBeNull();
  });
});
