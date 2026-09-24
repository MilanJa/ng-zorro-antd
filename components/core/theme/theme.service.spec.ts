/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { nzDarkAlgorithm } from './algorithms';
import { V6_TEMPLATE_CSS } from './generated/test-css';
import { NZ_THEME_STYLE_ID, NzThemeService } from './theme.service';

function installTemplate(): HTMLStyleElement {
  const style = document.createElement('style');
  style.id = 'v6-template-for-test';
  style.textContent = V6_TEMPLATE_CSS;
  document.head.appendChild(style);
  return style;
}

describe('NzThemeService', () => {
  let service: NzThemeService;
  let template: HTMLStyleElement;

  beforeEach(() => {
    template = installTemplate();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NzThemeService);
  });

  afterEach(() => {
    template.remove();
    document.getElementById(NZ_THEME_STYLE_ID)?.remove();
  });

  it('writes one style element and exposes tokens on :root', async () => {
    await service.set({});
    const styles = document.querySelectorAll(`#${NZ_THEME_STYLE_ID}`);
    expect(styles.length).toBe(1);
    expect(getComputedStyle(document.documentElement).getPropertyValue('--ant-color-primary').trim()).toBe('#1677ff');
    expect(service.token()?.colorPrimary).toBe('#1677ff');
  });

  it('applies to a button and switches at runtime', async () => {
    const btn = document.createElement('button');
    btn.className = 'ant-btn ant-btn-color-primary ant-btn-variant-solid';
    // The antd template sets `transition: all ...` on `.ant-btn`, so a real browser animates
    // `background-color` toward the new token value instead of applying it immediately; disable
    // transitions on this element so the assertion right after `set()` reads the settled value.
    btn.style.transition = 'none';
    document.body.appendChild(btn);
    await service.set({});
    expect(getComputedStyle(btn).backgroundColor).toBe('rgb(22, 119, 255)');
    await service.set({ algorithm: nzDarkAlgorithm });
    expect(getComputedStyle(btn).backgroundColor).toBe('rgb(22, 104, 220)');
    btn.remove();
  });

  it('replaces rather than appends on rapid consecutive calls', async () => {
    await Promise.all([
      service.set({ token: { colorPrimary: '#ff0000' } }),
      service.set({ token: { colorPrimary: '#00b96b' } })
    ]);
    const styles = document.querySelectorAll(`#${NZ_THEME_STYLE_ID}`);
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('--ant-color-primary:#00b96b;');
    expect(styles[0].textContent).not.toContain('#ff0000');
  });

  it('keeps the application unstable until the theme is written (server rendering waits)', async () => {
    const appRef = TestBed.inject(ApplicationRef);
    const done = service.set({ token: { colorPrimary: '#654321' } });
    expect(await firstValueFrom(appRef.isStable)).toBe(false);
    await appRef.whenStable();
    expect(document.getElementById(NZ_THEME_STYLE_ID)?.textContent).toContain('--ant-color-primary:#654321;');
    await done;
  });

  it('uses the injected DOCUMENT only (server-rendering safe)', async () => {
    const detached = document.implementation.createHTMLDocument('ssr');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: detached }] });
    const ssrService = TestBed.inject(NzThemeService);
    await ssrService.set({ token: { colorPrimary: '#123456' } });
    expect(detached.head.querySelector(`#${NZ_THEME_STYLE_ID}`)?.textContent).toContain('#123456');
    expect(document.getElementById(NZ_THEME_STYLE_ID)).toBeNull();
  });
});
