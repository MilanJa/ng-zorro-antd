/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TestBed } from '@angular/core/testing';

import { NZ_THEME_STYLE_ID } from 'ng-zorro-antd/core/theme';

import { hasV6ThemeKeys, provideNzConfig } from './config';
import { NzConfigService } from './config.service';

describe('NzConfig.theme', () => {
  afterEach(() => {
    document.getElementById(NZ_THEME_STYLE_ID)?.remove();
    document.querySelectorAll('style[data-rc-util-key$="-dynamic-theme"]').forEach(s => s.remove());
  });

  it('hasV6ThemeKeys detects the antd ThemeConfig fields only', () => {
    expect(hasV6ThemeKeys({ primaryColor: '#f00' })).toBe(false);
    expect(hasV6ThemeKeys({ token: { colorPrimary: '#f00' } })).toBe(true);
    expect(hasV6ThemeKeys({ algorithm: () => ({}) })).toBe(true);
    expect(hasV6ThemeKeys({ components: {} })).toBe(true);
    expect(hasV6ThemeKeys({ cssVar: { prefix: 'x' } })).toBe(true);
  });

  it('legacy keys keep using the v4 css-variable registration and never create #nz-theme', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { primaryColor: '#ff0000' } })] });
    TestBed.inject(NzConfigService);
    await new Promise(r => setTimeout(r, 50));
    expect(document.getElementById(NZ_THEME_STYLE_ID)).toBeNull();
    expect(getComputedStyle(document.documentElement).getPropertyValue('--ant-primary-color').trim()).toBe(
      'rgb(255, 0, 0)'
    );
  });

  it('v6 keys at bootstrap delegate to NzThemeService', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    const service = TestBed.inject(NzConfigService);
    await service.whenThemeApplied();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#00b96b;');
  });

  it('set("theme") with v6 keys re-renders', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    const service = TestBed.inject(NzConfigService);
    await service.whenThemeApplied();
    service.set('theme', { token: { colorPrimary: '#123456' } });
    await service.whenThemeApplied();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#123456;');
  });
});
