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
import { NzGap } from 'ng-zorro-antd/flex';
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
});
