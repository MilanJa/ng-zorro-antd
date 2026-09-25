/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ApplicationRef, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';

import { expect } from 'vitest';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { nzDarkAlgorithm } from './algorithms';
import { V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from './generated/test-css';
import { renderThemeCss } from './render-theme-css';
import { NzThemeScopeIdService } from './theme-scope-id.service';
import { NZ_THEME_RENDERER, NzThemeDirective } from './theme.directive';
import { NzThemeService } from './theme.service';
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

@Component({
  imports: [NzThemeDirective],
  template: `@if (show()) {
    <div id="target" [nzTheme]="{ token: { colorPrimary: '#000000' } }"></div>
  }`
})
class DestroyBeforeRenderHost {
  show = signal(true);
}

describe('NzThemeDirective destroyed before its first render resolves', () => {
  let fixture: ComponentFixture<DestroyBeforeRenderHost>;

  afterEach(() => {
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('never writes its style element (no leak) when destroyed while the render is still pending', async () => {
    // `renderThemeCss` awaits a lazy chunk import on its first call, so a destroy (e.g. an `@if`/route
    // toggle) can land while that first render is still in flight; stub its timing deterministically
    // instead of relying on real, variable import timing to reproduce the race. Spying directly on
    // `render-theme-css.ts`'s own export (`vi.spyOn(rendererModule, 'renderThemeCss')`) does not work in
    // this build -- its ESM namespace object is not configurable here ("TypeError: Cannot redefine
    // property: renderThemeCss") -- so the directive obtains the renderer through the overridable
    // `NZ_THEME_RENDERER` injection token instead.
    let resolveRender!: (css: string) => void;
    let renders = 0;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NZ_THEME_RENDERER,
          useValue: () => {
            renders++;
            return new Promise<string>(resolve => (resolveRender = resolve));
          }
        }
      ]
    });

    fixture = TestBed.createComponent(DestroyBeforeRenderHost);
    fixture.detectChanges();
    // Let the directive's effect run once and call the (still-pending) mocked `renderThemeCss`. Do not
    // await `whenStable()` here: the directive registers its render as a pending task, so the fixture is
    // not stable until that render settles.
    await new Promise(r => setTimeout(r, 0));
    expect(renders).toBe(1);
    expect(document.querySelectorAll('style[id^="nz-theme-"]').length).toBe(0);

    // Destroy the directive before its pending render settles.
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    // Now let the stale render resolve; its pending task is released even though nothing is written.
    resolveRender('.nz-theme-x{--ant-color-primary:#000000;}');
    await fixture.whenStable();

    expect(document.querySelectorAll('style[id^="nz-theme-"]').length).toBe(0);
  });

  it('keeps the application unstable until its render has been written (server rendering waits)', async () => {
    let resolveRender!: (css: string) => void;
    TestBed.configureTestingModule({
      providers: [
        { provide: NZ_THEME_RENDERER, useValue: () => new Promise<string>(resolve => (resolveRender = resolve)) }
      ]
    });
    const appRef = TestBed.inject(ApplicationRef);

    fixture = TestBed.createComponent(DestroyBeforeRenderHost);
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 0));
    expect(await firstValueFrom(appRef.isStable)).toBe(false);

    const scopeClass = document.getElementById('target')!.className;
    resolveRender(`.${scopeClass}{--ant-color-primary:#000000;}`);
    await appRef.whenStable();

    expect(await firstValueFrom(appRef.isStable)).toBe(true);
    expect(document.getElementById(scopeClass)?.textContent).toContain('--ant-color-primary:#000000;');
  });
});

@Component({
  imports: [NzThemeDirective],
  template: `
    <section id="scoped" [nzTheme]="cfg()" [nzThemeInherit]="inherit()">
      <button id="s" class="ant-btn ant-btn-color-primary ant-btn-variant-solid">S</button>
    </section>
  `
})
class GlobalInheritHostComponent {
  cfg = signal<NzThemeConfig>({});
  inherit = signal(true);
}

describe('NzThemeDirective global inheritance', () => {
  let fixture: ComponentFixture<GlobalInheritHostComponent>;
  let base: HTMLStyleElement;

  beforeEach(async () => {
    base = document.createElement('style');
    base.textContent = `${V6_TEMPLATE_CSS}\n${V6_TOKENS_DEFAULT_CSS}\n*,*::before,*::after{transition:none!important;}`;
    document.head.appendChild(base);
    fixture = TestBed.createComponent(GlobalInheritHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
  });

  afterEach(async () => {
    base.remove();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
    document.getElementById('nz-theme')?.remove();
    await TestBed.inject(NzThemeService).set({});
  });

  it('inherits the global theme by default', async () => {
    await TestBed.inject(NzThemeService).set({ algorithm: nzDarkAlgorithm });
    fixture.componentInstance.cfg.set({ token: { borderRadius: 0 } });
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    expect(getComputedStyle(document.getElementById('s')!).backgroundColor).toBe('rgb(22, 104, 220)'); // dark primary
    expect(getComputedStyle(document.getElementById('s')!).borderRadius).toBe('0px');
  });

  it('starts from the defaults when nzThemeInherit is false', async () => {
    await TestBed.inject(NzThemeService).set({ algorithm: nzDarkAlgorithm });
    fixture.componentInstance.inherit.set(false);
    fixture.componentInstance.cfg.set({ token: { borderRadius: 0 } });
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    expect(getComputedStyle(document.getElementById('s')!).backgroundColor).toBe('rgb(22, 119, 255)'); // light primary
  });

  it('re-renders when the global theme changes after the scope rendered', async () => {
    expect(getComputedStyle(document.getElementById('s')!).backgroundColor).toBe('rgb(22, 119, 255)'); // light primary
    await TestBed.inject(NzThemeService).set({ algorithm: nzDarkAlgorithm });
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    expect(getComputedStyle(document.getElementById('s')!).backgroundColor).toBe('rgb(22, 104, 220)'); // dark primary
  });
});

@Component({
  imports: [NzButtonModule, NzThemeDirective],
  template: `
    <button
      id="host-root"
      nz-button
      nzType="primary"
      [nzTheme]="{ components: { Button: { colorPrimary: '#ff4d4f', algorithm: true } } }"
    >
      Red
    </button>
  `
})
class HostRootButtonComponent {}

describe('NzThemeDirective on a component host', () => {
  let base: HTMLStyleElement;

  beforeEach(() => {
    base = document.createElement('style');
    base.textContent = `${V6_TEMPLATE_CSS}\n${V6_TOKENS_DEFAULT_CSS}\n*,*::before,*::after{transition:none!important;}`;
    document.head.appendChild(base);
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => {
    base.remove();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('styles the host itself and keeps the component classes next to the scope class', async () => {
    const fixture = TestBed.createComponent(HostRootButtonComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const button = document.getElementById('host-root')!;
    const directive = fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective);
    expect(getComputedStyle(button).backgroundColor).toBe('rgb(255, 77, 79)');
    expect(button.classList).toContain('ant-btn');
    expect(button.classList).toContain('ant-btn-color-primary');
    expect(button.classList).toContain(directive.scopeClass);
  });
});

@Component({
  imports: [NzThemeDirective],
  template: `
    <section id="outer-c" [nzTheme]="{ components: { Button: { colorPrimary: '#ff4d4f', algorithm: true } } }">
      <div [nzTheme]="{ components: { Button: { borderRadius: 0 } } }">
        <button id="merged" class="ant-btn ant-btn-color-primary ant-btn-variant-solid">M</button>
      </div>
    </section>
  `
})
class ComponentsMergeHostComponent {}

describe('NzThemeDirective components merge', () => {
  let base: HTMLStyleElement;

  beforeEach(() => {
    base = document.createElement('style');
    base.textContent = `${V6_TEMPLATE_CSS}\n${V6_TOKENS_DEFAULT_CSS}\n*,*::before,*::after{transition:none!important;}`;
    document.head.appendChild(base);
  });

  afterEach(() => {
    base.remove();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('merges inherited component tokens per component, like antd', async () => {
    const fixture = TestBed.createComponent(ComponentsMergeHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const [, inner] = fixture.debugElement
      .queryAll(By.directive(NzThemeDirective))
      .map(de => de.injector.get(NzThemeDirective));
    expect(inner.effectiveConfig().components).toEqual({
      Button: { colorPrimary: '#ff4d4f', algorithm: true, borderRadius: 0 }
    });
    expect(bg('merged')).toBe('rgb(255, 77, 79)');
    expect(radius('merged')).toBe('0px');
  });
});

describe('NzThemeScopeIdService', () => {
  it('numbers scopes per application instance', () => {
    const first = TestBed.inject(NzThemeScopeIdService);
    expect([first.next(), first.next()]).toEqual([1, 2]);
    TestBed.resetTestingModule();
    expect(TestBed.inject(NzThemeScopeIdService).next()).toBe(1);
  });

  it('gives the first [nzTheme] of an application the id 1', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: NZ_THEME_RENDERER, useValue: async () => '' }] });
    const fixture = TestBed.createComponent(DestroyBeforeRenderHost);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.getElementById('target')!.className).toBe('nz-theme-1');
    fixture.destroy();
  });
});
