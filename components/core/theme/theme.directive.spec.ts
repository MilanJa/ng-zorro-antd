/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from './generated/test-css';
import { renderThemeCss } from './render-theme-css';
import { NzThemeDirective } from './theme.directive';
import type { NzThemeConfig } from './theme.types';

@Component({
  imports: [NzThemeDirective],
  template: `
    <section id="outer" [nzTheme]="outer()">
      <button id="a" class="ant-btn ant-btn-color-primary ant-btn-variant-solid">A</button>
      @if (showInner()) {
        <div [nzTheme]="inner()" [nzThemeInherit]="inherit()">
          <button id="b" class="ant-btn ant-btn-color-primary ant-btn-variant-solid">B</button>
        </div>
      }
    </section>
    <button id="c" class="ant-btn ant-btn-color-primary ant-btn-variant-solid">C</button>
  `
})
class TestHostComponent {
  outer = signal<NzThemeConfig>({ token: { colorPrimary: '#00b96b' } });
  inner = signal<NzThemeConfig>({ token: { borderRadius: 0 } });
  inherit = signal(true);
  showInner = signal(true);
}

const bg = (id: string): string => getComputedStyle(document.getElementById(id)!).backgroundColor;
const radius = (id: string): string => getComputedStyle(document.getElementById(id)!).borderRadius;

describe('NzThemeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let base: HTMLStyleElement;

  beforeAll(async () => {
    // `NzThemeDirective`'s effect fires without being awaited by the test, and the first call to
    // `renderThemeCss` in this spec bundle triggers a real, network-level dynamic import of the lazy
    // `engine-components.ts` chunk. That import is slower than a single `setTimeout(0)` tick, which
    // otherwise makes only the very first test in this file (whichever runs first) flaky. Pre-warm the
    // shared module-level cache in `render-theme-css.ts` once, up front, so every test's wait below is
    // waiting on an already-resolved import.
    await renderThemeCss({}, ':root');
  });

  beforeEach(async () => {
    base = document.createElement('style');
    // `.ant-btn` sets `transition: all ...`, so a real browser animates `background-color` toward each
    // new token value instead of applying it immediately; disable transitions globally here so the
    // assertions below (run right after a style/config change settles) read the final value, not a
    // mid-animation one.
    base.textContent = `${V6_TEMPLATE_CSS}\n${V6_TOKENS_DEFAULT_CSS}\n*,*::before,*::after{transition:none!important;}`;
    document.head.appendChild(base);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
  });

  afterEach(() => {
    base.remove();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('scopes the theme to its host subtree', () => {
    expect(document.getElementById('outer')!.className).toMatch(/nz-theme-\d+/);
    expect(bg('a')).toBe('rgb(0, 185, 107)');
    expect(bg('c')).toBe('rgb(22, 119, 255)');
  });

  it('inherits the parent directive config by default and merges its own', () => {
    expect(bg('b')).toBe('rgb(0, 185, 107)');
    expect(radius('b')).toBe('0px');
    expect(radius('a')).toBe('6px');
  });

  it('does not inherit when nzThemeInherit is false', async () => {
    fixture.componentInstance.inherit.set(false);
    fixture.detectChanges();
    // Matches the wait in `beforeEach`: the directive's effect (and the `renderThemeCss` it awaits
    // inside) settles across more than one microtask, so `whenStable()` plus a macrotask tick is needed
    // for the re-applied, non-inherited style to land before asserting.
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    expect(bg('b')).toBe('rgb(22, 119, 255)');
  });

  it('removes its style element on destroy', async () => {
    const before = document.querySelectorAll('style[id^="nz-theme-"]').length;
    fixture.componentInstance.showInner.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelectorAll('style[id^="nz-theme-"]').length).toBe(before - 1);
  });
});
