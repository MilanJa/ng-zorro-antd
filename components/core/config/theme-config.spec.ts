/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ApplicationInitStatus, ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { nzDarkAlgorithm, NZ_THEME_STYLE_ID, NzThemeDirective, NzThemeService } from 'ng-zorro-antd/core/theme';

import { hasV6ThemeKeys, Theme } from './config';
import { NzConfigService, provideNzConfig } from './config.service';

describe('NzConfig.theme', () => {
  afterEach(() => {
    document.getElementById(NZ_THEME_STYLE_ID)?.remove();
    document.querySelectorAll('style[rc-util-key$="-dynamic-theme"]').forEach(s => s.remove());
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

  it('clearing a legacy colour with undefined removes its v4 css variable', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(NzConfigService);
    const primary = (): string =>
      getComputedStyle(document.documentElement).getPropertyValue('--ant-primary-color').trim();
    service.set('theme', { primaryColor: '#ff0000' });
    expect(primary()).toBe('rgb(255, 0, 0)');
    service.set('theme', { primaryColor: undefined });
    expect(primary()).toBe('');
  });

  it('a theme with only v6 keys does not write the v4 css-variable style', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    await TestBed.inject(NzConfigService).whenThemeApplied();
    expect(document.querySelectorAll('style[rc-util-key$="-dynamic-theme"]').length).toBe(0);
  });

  it('keeps accepting arbitrary keys on Theme (v4 index signature)', () => {
    const theme: Theme = { primaryColor: '#ff0000', customKey: 'kept' };
    expect(theme['customKey']).toBe('kept');
    expect(hasV6ThemeKeys(theme)).toBe(false);
  });

  it('v6 keys at bootstrap delegate to NzThemeService', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    const service = TestBed.inject(NzConfigService);
    await service.whenThemeApplied();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#00b96b;');
  });

  it('keeps the application unstable until the lazily loaded v6 theme is written', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#0000ff' } } })] });
    const appRef = TestBed.inject(ApplicationRef);
    TestBed.inject(NzConfigService);
    expect(await firstValueFrom(appRef.isStable)).toBe(false);
    await appRef.whenStable();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#0000ff;');
  });

  it('set("theme") with v6 keys re-renders', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    const service = TestBed.inject(NzConfigService);
    await service.whenThemeApplied();
    service.set('theme', { token: { colorPrimary: '#123456' } });
    await service.whenThemeApplied();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#123456;');
  });

  it('whenThemeApplied reflects the latest of two unawaited set("theme") calls', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { token: { colorPrimary: '#00b96b' } } })] });
    const service = TestBed.inject(NzConfigService);
    await service.whenThemeApplied();

    service.set('theme', { token: { colorPrimary: '#111111' } });
    service.set('theme', { token: { colorPrimary: '#222222' } });
    await service.whenThemeApplied();

    const styleContent = document.getElementById(NZ_THEME_STYLE_ID)?.textContent;
    expect(styleContent).toContain('--ant-color-primary:#222222;');
    expect(styleContent).not.toContain('--ant-color-primary:#111111;');
  });
});

@Component({
  imports: [NzThemeDirective],
  template: `<section id="scoped" [nzTheme]="{ token: { borderRadius: 0 } }"></section>`
})
class ScopedUnderGlobalThemeComponent {}

/** Every text written into a `<style id="nz-theme-N">` (scoped theme) element, in order. */
function scopedStyleWrites(records: MutationRecord[]): string[] {
  const writes: string[] = [];
  for (const record of records) {
    const target = record.type === 'characterData' ? record.target.parentElement : record.target;
    if (!(target instanceof HTMLStyleElement) || !/^nz-theme-\d+$/.test(target.id)) {
      continue;
    }
    if (record.type === 'characterData') {
      writes.push((record.target as Text).data);
    } else {
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          writes.push((node as Text).data);
        }
      });
    }
  }
  return writes;
}

describe('NzConfig.theme with a scoped [nzTheme]', () => {
  afterEach(() => {
    document.getElementById(NZ_THEME_STYLE_ID)?.remove();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('requests the global v6 theme during bootstrap, before anything else injects NzConfigService', async () => {
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { algorithm: nzDarkAlgorithm } })] });
    // What bootstrapApplication awaits before creating the root component.
    await TestBed.inject(ApplicationInitStatus).donePromise;
    expect(TestBed.inject(NzThemeService).config()?.algorithm).toBe(nzDarkAlgorithm);
  });

  it('only ever writes the merged global + scoped CSS into the scope style element', async () => {
    const records: MutationRecord[] = [];
    const observer = new MutationObserver(batch => records.push(...batch));
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
    TestBed.configureTestingModule({ providers: [provideNzConfig({ theme: { algorithm: nzDarkAlgorithm } })] });
    // As in bootstrapApplication, components are created once the app initializers have settled.
    await TestBed.inject(ApplicationInitStatus).donePromise;
    const fixture = TestBed.createComponent(ScopedUnderGlobalThemeComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await TestBed.inject(NzConfigService).whenThemeApplied();
    await new Promise(r => setTimeout(r, 0));
    records.push(...observer.takeRecords());
    const writes = scopedStyleWrites(records);
    observer.disconnect();

    expect(writes.length).toBeGreaterThan(0);
    for (const css of writes) {
      // The light default primary would mean the scope rendered over the defaults before the global theme.
      expect(css).not.toContain('--ant-color-primary:#1677ff');
    }
    expect(writes.at(-1)).toContain('--ant-color-primary:#1668dc');
    expect(writes.at(-1)).toContain('--ant-border-radius:0px');
  });
});
