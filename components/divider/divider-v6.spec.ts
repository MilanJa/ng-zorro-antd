/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzDividerTitlePlacement } from './divider.component';
import { NzDividerModule } from './divider.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider id="plain" />`
})
class DividerPlainHost {}

@Component({
  imports: [NzDividerModule],
  template: `
    <div style="width: 400px">
      <nz-divider id="t" nzText="Title" [nzOrientation]="o()" [nzVariant]="v()" />
    </div>
  `
})
class DividerTextHost {
  readonly o = signal<'left' | 'right' | 'center'>('center');
  readonly v = signal<'dashed' | 'dotted' | 'solid'>('solid');
}

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider id="vt" nzType="vertical" />`
})
class DividerVerticalHost {}

@Component({
  imports: [NzDividerModule, BidiModule],
  template: `
    <div dir="rtl" style="width: 400px">
      <nz-divider id="r" nzText="T" nzOrientation="left" />
    </div>
  `
})
class DividerRtlHost {}

@Component({
  imports: [NzDividerModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorSplit: '#00b96b' } }">
      <nz-divider id="s" nzText="S" />
    </div>
  `
})
class DividerScopedHost {}

@Component({
  imports: [NzDividerModule],
  template: `
    <div style="width: 400px">
      <nz-divider id="p" nzText="Title" [nzTitlePlacement]="p()" [nzTitleMargin]="m()" />
    </div>
  `
})
class DividerPlacementHost {
  readonly p = signal<NzDividerTitlePlacement>('start');
  readonly m = signal<number | string | undefined>(undefined);
}

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider id="ov" nzOrientation="vertical" />`
})
class DividerOrientationHost {}

@Component({
  imports: [NzDividerModule, BidiModule],
  template: `
    <div dir="rtl" style="width: 400px">
      <nz-divider id="rs" nzText="T" nzTitlePlacement="start" />
    </div>
  `
})
class DividerRtlStartHost {}

function el(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

function rails(root: HTMLElement): { start: HTMLElement; end: HTMLElement } {
  return {
    start: root.querySelector('.ant-divider-rail-start') as HTMLElement,
    end: root.querySelector('.ant-divider-rail-end') as HTMLElement
  };
}

function startRatio(root: HTMLElement): number {
  const { start, end } = rails(root);
  const s = start.getBoundingClientRect().width;
  const e = end.getBoundingClientRect().width;
  return s / (s + e);
}

describe('divider (v6 styles)', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws a plain divider as a rail on the root', () => {
    TestBed.createComponent(DividerPlainHost).detectChanges();
    const plain = el('plain');
    const cs = getComputedStyle(plain);
    expect(cs.borderTopColor).toBe('rgba(5, 5, 5, 0.06)');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.marginTop).toBe('24px');
    expect(plain.classList).toContain('ant-divider-rail');
  });

  it('draws a text divider on the two rails and places the title by the start ratio', () => {
    const fixture: ComponentFixture<DividerTextHost> = TestBed.createComponent(DividerTextHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const t = el('t');
    const cs = getComputedStyle(t);
    expect(cs.marginTop).toBe('16px');
    expect(cs.fontWeight).toBe('500');
    expect(cs.fontSize).toBe('16px');
    expect(cs.borderTopWidth).toBe('0px');
    expect(t.classList).not.toContain('ant-divider-rail');

    const { start, end } = rails(t);
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    for (const rail of [start, end]) {
      expect(getComputedStyle(rail).borderTopStyle).toBe('solid');
      expect(getComputedStyle(rail).borderTopColor).toBe('rgba(5, 5, 5, 0.06)');
    }
    expect(Math.abs(startRatio(t) - 0.5)).toBeLessThan(0.01);
    expect(getComputedStyle(t.querySelector('.ant-divider-inner-text')!).paddingLeft).toBe('16px');

    host.o.set('left');
    fixture.detectChanges();
    expect(t.classList).toContain('ant-divider-with-text-start');
    expect(t.classList).not.toContain('ant-divider-with-text-end');
    // --ant-divider-orientation-margin is 0.05; both rails shrink in proportion to their basis
    expect(Math.abs(startRatio(t) - 0.05)).toBeLessThan(0.01);

    host.o.set('right');
    fixture.detectChanges();
    expect(t.classList).toContain('ant-divider-with-text-end');
    expect(t.classList).not.toContain('ant-divider-with-text-start');
    expect(Math.abs(startRatio(t) - 0.95)).toBeLessThan(0.01);

    host.v.set('dashed');
    fixture.detectChanges();
    expect(getComputedStyle(rails(t).start).borderTopStyle).toBe('dashed');

    host.v.set('dotted');
    fixture.detectChanges();
    expect(getComputedStyle(rails(t).start).borderTopStyle).toBe('dotted');
  });

  it('draws a vertical divider on the inline-start border', () => {
    TestBed.createComponent(DividerVerticalHost).detectChanges();
    const cs = getComputedStyle(el('vt'));
    expect(cs.marginLeft).toBe('8px');
    expect(cs.borderLeftWidth).toBe('1px');
    expect(cs.borderTopWidth).toBe('0px');
  });

  it('rtl: a left-placed title sits on the physical left with rails on both sides', () => {
    TestBed.createComponent(DividerRtlHost).detectChanges();
    const r = el('r');
    expect(r.classList).toContain('ant-divider-with-text-end');
    expect(r.classList).not.toContain('ant-divider-with-text-start');
    const text = r.querySelector('.ant-divider-inner-text') as HTMLElement;
    const offset = text.getBoundingClientRect().left - r.getBoundingClientRect().left;
    expect(offset).toBeLessThan(0.1 * 400);
    const { start, end } = rails(r);
    expect(start.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(end.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('reads the rail colour from an [nzTheme] scope', async () => {
    TestBed.createComponent(DividerScopedHost).detectChanges();
    // the scope's token CSS is written asynchronously
    await new Promise(r => setTimeout(r, 350));
    const s = el('s');
    expect(s.closest('[class*="nz-theme-"]')).not.toBeNull();
    expect(getComputedStyle(s).getPropertyValue('--ant-color-split').trim()).toBe('#00b96b');
    expect(getComputedStyle(rails(s).start).borderTopColor).toBe('rgb(0, 185, 107)');
  });

  it('places the title with nzTitlePlacement exactly as the legacy left/right values do', () => {
    const fixture: ComponentFixture<DividerPlacementHost> = TestBed.createComponent(DividerPlacementHost);
    fixture.detectChanges();
    const p = el('p');
    expect(Math.abs(startRatio(p) - 0.05)).toBeLessThan(0.01);
    fixture.componentInstance.p.set('end');
    fixture.detectChanges();
    expect(Math.abs(startRatio(p) - 0.95)).toBeLessThan(0.01);
    fixture.componentInstance.p.set('center');
    fixture.detectChanges();
    expect(Math.abs(startRatio(p) - 0.5)).toBeLessThan(0.01);
  });

  it('replaces the 5% offset with nzTitleMargin on the placement side', () => {
    const fixture: ComponentFixture<DividerPlacementHost> = TestBed.createComponent(DividerPlacementHost);
    const host = fixture.componentInstance;
    host.m.set(20);
    fixture.detectChanges();
    const p = el('p');
    const text = (): HTMLElement => p.querySelector('.ant-divider-inner-text') as HTMLElement;
    expect(rails(p).start.getBoundingClientRect().width).toBe(0);
    expect(getComputedStyle(text()).paddingLeft).toBe('0px');
    expect(text().getBoundingClientRect().left - p.getBoundingClientRect().left).toBeCloseTo(20, 0);

    host.m.set('2em');
    fixture.detectChanges();
    expect(getComputedStyle(text()).marginLeft).toBe('32px');

    host.m.set('24');
    fixture.detectChanges();
    expect(getComputedStyle(text()).marginLeft).toBe('24px');

    host.p.set('end');
    host.m.set(50);
    fixture.detectChanges();
    expect(rails(p).end.getBoundingClientRect().width).toBe(0);
    expect(getComputedStyle(text()).paddingRight).toBe('0px');
    expect(p.getBoundingClientRect().right - text().getBoundingClientRect().right).toBeCloseTo(50, 0);

    host.p.set('center');
    fixture.detectChanges();
    expect(p.classList).not.toContain('ant-divider-no-default-orientation-margin-end');
    expect(Math.abs(startRatio(p) - 0.5)).toBeLessThan(0.01);
  });

  it('draws nzOrientation="vertical" like the deprecated nzType="vertical"', () => {
    TestBed.createComponent(DividerOrientationHost).detectChanges();
    const cs = getComputedStyle(el('ov'));
    expect(cs.marginLeft).toBe('8px');
    expect(cs.borderLeftWidth).toBe('1px');
    expect(cs.borderTopWidth).toBe('0px');
  });

  it('rtl: nzTitlePlacement="start" sits near the physical right', () => {
    TestBed.createComponent(DividerRtlStartHost).detectChanges();
    const rs = el('rs');
    const text = rs.querySelector('.ant-divider-inner-text') as HTMLElement;
    expect(rs.getBoundingClientRect().right - text.getBoundingClientRect().right).toBeLessThan(0.1 * 400);
  });
});
