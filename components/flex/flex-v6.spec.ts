/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { nzCompactAlgorithm, NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { NzAlign, NzFlexOrientation, NzGap, NzWrap } from 'ng-zorro-antd/flex';
import { NzFlexModule } from 'ng-zorro-antd/flex/flex.module';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzFlexModule],
  template: `
    <nz-flex id="f" [nzGap]="gap()">
      <span>a</span>
      <span>b</span>
    </nz-flex>
  `
})
class FlexGapHost {
  readonly gap = signal<NzGap>('small');
}

@Component({
  imports: [NzFlexModule],
  template: `<nz-flex id="v" nzVertical>v</nz-flex>`
})
class FlexVerticalHost {}

@Component({
  imports: [NzFlexModule],
  template: `<nz-flex id="empty" />`
})
class FlexEmptyHost {}

@Component({
  imports: [NzFlexModule, BidiModule],
  template: `
    <div dir="rtl">
      <nz-flex id="rtl">x</nz-flex>
    </div>
  `
})
class FlexRtlHost {}

@Component({
  imports: [NzFlexModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ algorithm: compact }">
      <nz-flex id="c" [nzGap]="gap()">x</nz-flex>
    </div>
  `
})
class FlexCompactHost {
  readonly compact = nzCompactAlgorithm;
  readonly gap = signal<NzGap>('small');
}

@Component({
  imports: [NzFlexModule],
  template: `
    <nz-flex id="a" [nzAlign]="align()" style="height: 80px">
      <span style="font-size: 12px">a</span>
      <span style="font-size: 24px">b</span>
    </nz-flex>
  `
})
class FlexAlignHost {
  readonly align = signal<NzAlign>('baseline');
}

@Component({
  imports: [NzFlexModule],
  template: `
    <nz-flex id="o" [nzVertical]="vertical()" [nzOrientation]="orientation()" [nzWrap]="wrap()">
      <span>a</span>
      <span>b</span>
    </nz-flex>
  `
})
class FlexOrientationHost {
  readonly vertical = signal(false);
  readonly orientation = signal<NzFlexOrientation | undefined>(undefined);
  readonly wrap = signal<NzWrap | boolean>(false);
}

function el(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

describe('flex (v6 styles)', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('maps the gap presets to the v6 gap classes and computed values', () => {
    const fixture: ComponentFixture<FlexGapHost> = TestBed.createComponent(FlexGapHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const f = el('f');

    host.gap.set('small');
    fixture.detectChanges();
    expect(getComputedStyle(f).getPropertyValue('gap')).toBe('8px');
    expect(f.classList).toContain('ant-flex-gap-small');
    expect(f.style.gap).toBe('var(--ant-padding-xs, 8px)');

    host.gap.set('middle');
    fixture.detectChanges();
    expect(getComputedStyle(f).getPropertyValue('gap')).toBe('16px');
    expect(f.classList).toContain('ant-flex-gap-middle');

    host.gap.set('large');
    fixture.detectChanges();
    expect(getComputedStyle(f).getPropertyValue('gap')).toBe('24px');
    expect(f.classList).toContain('ant-flex-gap-large');

    host.gap.set(10);
    fixture.detectChanges();
    expect(getComputedStyle(f).getPropertyValue('gap')).toBe('10px');
    expect(f.classList).not.toContain('ant-flex-gap-small');
    expect(f.classList).not.toContain('ant-flex-gap-middle');
    expect(f.classList).not.toContain('ant-flex-gap-large');
  });

  it('sets flex-direction: column for nzVertical', () => {
    TestBed.createComponent(FlexVerticalHost).detectChanges();
    expect(getComputedStyle(el('v')).flexDirection).toBe('column');
  });

  it('hides an empty nz-flex under the v6 :empty rule', () => {
    TestBed.createComponent(FlexEmptyHost).detectChanges();
    expect(getComputedStyle(el('empty')).display).toBe('none');
  });

  it('applies ant-flex-rtl and direction: rtl inside an rtl ancestor', () => {
    TestBed.createComponent(FlexRtlHost).detectChanges();
    const rtl = el('rtl');
    expect(rtl.classList).toContain('ant-flex-rtl');
    expect(getComputedStyle(rtl).direction).toBe('rtl');
  });

  it('uses the compact padding tokens for the gap presets inside a compact [nzTheme] scope', async () => {
    const fixture: ComponentFixture<FlexCompactHost> = TestBed.createComponent(FlexCompactHost);
    fixture.detectChanges();
    // the scope's token CSS is written asynchronously
    await new Promise(r => setTimeout(r, 350));
    const host = fixture.componentInstance;
    const c = el('c');

    host.gap.set('small');
    fixture.detectChanges();
    expect(getComputedStyle(c).getPropertyValue('gap')).toBe('4px');

    host.gap.set('middle');
    fixture.detectChanges();
    expect(getComputedStyle(c).getPropertyValue('gap')).toBe('8px');

    host.gap.set('large');
    fixture.detectChanges();
    expect(getComputedStyle(c).getPropertyValue('gap')).toBe('16px');
  });

  it('maps gap "medium" and its "middle" synonym to the padding token', () => {
    const fixture: ComponentFixture<FlexGapHost> = TestBed.createComponent(FlexGapHost);
    const host = fixture.componentInstance;
    host.gap.set('medium');
    fixture.detectChanges();
    const f = el('f');
    expect(f.classList).toContain('ant-flex-gap-medium');
    expect(getComputedStyle(f).gap).toBe('16px');

    host.gap.set('middle');
    fixture.detectChanges();
    expect(getComputedStyle(f).gap).toBe('16px');
  });

  it('applies the v6 align-items values', () => {
    const fixture: ComponentFixture<FlexAlignHost> = TestBed.createComponent(FlexAlignHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const a = el('a');
    for (const value of ['baseline', 'self-start', 'self-end'] as const) {
      host.align.set(value);
      fixture.detectChanges();
      expect(getComputedStyle(a).alignItems).toBe(value);
    }
    host.align.set('baseline');
    fixture.detectChanges();
    const [small, large] = Array.from(a.children) as HTMLElement[];
    // baseline alignment pushes the smaller text down relative to the larger one
    expect(small.getBoundingClientRect().top).toBeGreaterThan(large.getBoundingClientRect().top);
  });

  it('lets a valid nzOrientation decide the direction and accepts a boolean nzWrap', () => {
    const fixture: ComponentFixture<FlexOrientationHost> = TestBed.createComponent(FlexOrientationHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const o = el('o');
    expect(getComputedStyle(o).flexDirection).toBe('row');

    host.orientation.set('vertical');
    fixture.detectChanges();
    expect(getComputedStyle(o).flexDirection).toBe('column');

    host.vertical.set(true);
    host.orientation.set('horizontal');
    fixture.detectChanges();
    expect(getComputedStyle(o).flexDirection).toBe('row');

    host.orientation.set(undefined);
    fixture.detectChanges();
    expect(getComputedStyle(o).flexDirection).toBe('column');

    host.wrap.set(true);
    fixture.detectChanges();
    expect(getComputedStyle(o).flexWrap).toBe('wrap');
    host.wrap.set(false);
    fixture.detectChanges();
    expect(getComputedStyle(o).flexWrap).toBe('nowrap');
  });
});
