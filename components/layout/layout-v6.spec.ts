/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { nzCompactAlgorithm, NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzLayoutModule } from './layout.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout id="layout">
      <nz-header id="header">H</nz-header>
      <nz-content id="content">C</nz-content>
      <nz-footer id="footer">F</nz-footer>
    </nz-layout>
  `
})
class LayoutBasicHost {}

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout id="outer">
      <nz-sider id="sider" nzCollapsible nzWidth="200px" [nzTheme]="theme()">
        <div style="height: 50px">m</div>
      </nz-sider>
      <nz-layout>
        <nz-content>c</nz-content>
      </nz-layout>
    </nz-layout>
  `
})
class LayoutSiderHost {
  readonly theme = signal<'light' | 'dark'>('dark');
}

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider id="zero" nzCollapsible [nzCollapsed]="true" [nzCollapsedWidth]="0" [nzReverseArrow]="reverse()">
        <div style="height: 50px">m</div>
      </nz-sider>
      <nz-layout>
        <nz-content>c</nz-content>
      </nz-layout>
    </nz-layout>
  `
})
class LayoutZeroWidthHost {
  readonly reverse = signal(false);
}

@Component({
  imports: [NzLayoutModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ algorithm: compact }">
      <nz-layout id="layout">
        <nz-header id="header">H</nz-header>
        <nz-content id="content">C</nz-content>
        <nz-footer id="footer">F</nz-footer>
      </nz-layout>
    </div>
  `
})
class LayoutCompactHost {
  readonly compact = nzCompactAlgorithm;
}

function el(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

function q(selector: string): HTMLElement {
  return document.querySelector(selector) as HTMLElement;
}

// `.ant-layout-sider` transitions `all var(--ant-motion-duration-mid)` (0.2s by default): wait past it
// before reading a width that a collapse toggle changed.
function siderTransition(): Promise<void> {
  return new Promise(r => setTimeout(r, 250));
}

describe('nz-layout (v6 styles)', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('styles the layout, header, content and footer with the v6 tokens', () => {
    const fixture = TestBed.createComponent(LayoutBasicHost);
    fixture.detectChanges();

    const layout = getComputedStyle(el('layout'));
    // colorBgLayout; v4's `@layout-body-background` is #f0f2f5.
    expect(layout.backgroundColor).toBe('rgb(245, 245, 245)');
    expect(layout.display).toBe('flex');
    expect(layout.flexDirection).toBe('column');

    const header = getComputedStyle(el('header'));
    expect(header.height).toBe('64px');
    expect(header.paddingLeft).toBe('50px');
    expect(header.backgroundColor).toBe('rgb(0, 21, 41)');

    const footer = getComputedStyle(el('footer'));
    expect(footer.paddingTop).toBe('24px');
    expect(footer.paddingLeft).toBe('50px');

    // The hosts are custom elements (inline by default); style/v6/patch.css makes them block.
    expect(getComputedStyle(el('content')).display).toBe('block');
    expect(header.display).toBe('block');
  });

  describe('collapsible sider', () => {
    let fixture: ComponentFixture<LayoutSiderHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(LayoutSiderHost);
      fixture.detectChanges();
    });

    it('lays out a dark sider with the trigger fixed at the bottom', () => {
      expect(getComputedStyle(el('outer')).flexDirection).toBe('row');

      const sider = getComputedStyle(el('sider'));
      expect(sider.backgroundColor).toBe('rgb(0, 21, 41)');
      // `-has-trigger`: padding-bottom is the trigger height.
      expect(sider.paddingBottom).toBe('48px');

      const trigger = getComputedStyle(q('#sider .ant-layout-sider-trigger'));
      expect(trigger.height).toBe('48px');
      expect(trigger.backgroundColor).toBe('rgb(0, 33, 64)');
      expect(trigger.color).toBe('rgb(255, 255, 255)');
      expect(trigger.position).toBe('fixed');
      expect(trigger.width).toBe('200px');
    });

    it('collapses to the collapsed width when the trigger is clicked', async () => {
      q('#sider .ant-layout-sider-trigger').click();
      fixture.detectChanges();
      await siderTransition();

      expect(el('sider').classList).toContain('ant-layout-sider-collapsed');
      expect(el('sider').getBoundingClientRect().width).toBeCloseTo(80, 0);
    });

    it('uses the light sider and trigger colours for nzTheme="light"', () => {
      fixture.componentInstance.theme.set('light');
      fixture.detectChanges();

      expect(getComputedStyle(el('sider')).backgroundColor).toBe('rgb(255, 255, 255)');
      const trigger = getComputedStyle(q('#sider .ant-layout-sider-trigger'));
      // lightTriggerBg = colorBgContainer, lightTriggerColor = colorText.
      expect(trigger.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(trigger.color).toBe('rgba(0, 0, 0, 0.88)');
    });
  });

  describe('zero-width sider', () => {
    let fixture: ComponentFixture<LayoutZeroWidthHost>;

    beforeEach(() => {
      fixture = TestBed.createComponent(LayoutZeroWidthHost);
      fixture.detectChanges();
    });

    it('places the zero-width trigger outside the collapsed sider', () => {
      const sider = el('zero');
      expect(sider.classList).toContain('ant-layout-sider-zero-width');
      expect(sider.getBoundingClientRect().width).toBe(0);

      const trigger = q('#zero .ant-layout-sider-zero-width-trigger');
      expect(trigger.classList).toContain('ant-layout-sider-zero-width-trigger-left');
      const rect = trigger.getBoundingClientRect();
      expect(Math.abs(rect.width - 40)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(rect.height - 40)).toBeLessThanOrEqual(0.5);
      const cs = getComputedStyle(trigger);
      expect(cs.top).toBe('64px');
      expect(cs.borderRadius).toBe('0px 8px 8px 0px');
      expect(cs.backgroundColor).toBe('rgb(0, 21, 41)');
      // `inset-inline-end: calc(var(--ant-layout-zero-trigger-width) * -1)`.
      expect(Math.abs(rect.left - sider.getBoundingClientRect().right)).toBeLessThanOrEqual(0.5);

      expect(getComputedStyle(q('#zero .ant-layout-sider-children')).overflow).toBe('hidden');
    });

    it('moves the trigger to the left of the sider with nzReverseArrow', async () => {
      fixture.componentInstance.reverse.set(true);
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 0));

      const trigger = q('#zero .ant-layout-sider-zero-width-trigger');
      expect(trigger.classList).toContain('ant-layout-sider-zero-width-trigger-right');
      const siderLeft = el('zero').getBoundingClientRect().left;
      expect(Math.abs(trigger.getBoundingClientRect().right - siderLeft)).toBeLessThanOrEqual(0.5);
    });

    it('expands to nzWidth when the zero-width trigger is clicked', async () => {
      q('#zero .ant-layout-sider-zero-width-trigger').click();
      fixture.detectChanges();
      await siderTransition();

      expect(Math.abs(el('zero').getBoundingClientRect().width - 200)).toBeLessThanOrEqual(0.5);
    });
  });

  it('uses the compact header height inside a compact [nzTheme] scope', async () => {
    const fixture = TestBed.createComponent(LayoutCompactHost);
    fixture.detectChanges();
    // the scope's token CSS is written asynchronously
    await new Promise(r => setTimeout(r, 350));

    expect(getComputedStyle(el('header')).height).toBe('56px');
  });
});
