/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSliderModule } from './slider.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzSliderModule],
  template: `<nz-slider id="host" [ngModel]="30" [nzMarks]="marks" style="width: 200px" />`
})
class TestSliderComponent {
  readonly marks = { 0: '0', 30: '30' };
}

describe('slider under antd v6 css', () => {
  let fixture: ComponentFixture<TestSliderComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestSliderComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the rail, track and handle with v6 tokens', () => {
    const host = document.getElementById('host')!;
    const rail = host.querySelector('.ant-slider-rail') as HTMLElement;
    const track = host.querySelector('.ant-slider-track') as HTMLElement;
    const handle = host.querySelector('.ant-slider-handle') as HTMLElement;

    // railBg: `rgba(0, 0, 0, 0.04)`, rail-size token 4px.
    const railCs = getComputedStyle(rail);
    expect(railCs.height).toBe('4px');
    expect(railCs.backgroundColor).toBe('rgba(0, 0, 0, 0.04)');

    // trackBg: colorPrimaryBorder `#91caff` = `rgb(145, 202, 255)`.
    const trackCs = getComputedStyle(track);
    expect(trackCs.backgroundColor).toBe('rgb(145, 202, 255)');

    // handleSize 10px, handleLineWidth 2px drawn as a box-shadow ring on `::after` in the handle's own color.
    const handleCs = getComputedStyle(handle);
    expect(handleCs.width).toBe('10px');
    const afterCs = getComputedStyle(handle, '::after');
    expect(afterCs.boxShadow).toContain('rgb(145, 202, 255)');
  });

  it('colours the active mark text with v6 colorText', () => {
    const host = document.getElementById('host')!;
    const activeMark = host.querySelector('.ant-slider-mark-text-active') as HTMLElement;
    expect(activeMark).not.toBeNull();
    expect(getComputedStyle(activeMark).color).toBe('rgba(0, 0, 0, 0.88)');
  });
});

@Component({
  imports: [FormsModule, NzSliderModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-slider id="scoped" [ngModel]="value()" nzTooltipVisible="always" style="width: 200px; margin-top: 40px" />
    </div>
  `
})
class ScopedSliderHostComponent {
  value = signal(30);
}

describe('slider handle tooltip inherits the enclosing theme scope', () => {
  let fixture: ComponentFixture<ScopedSliderHostComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ScopedSliderHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  function enclosingScopeClass(): string {
    return fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective).scopeClass;
  }

  it("carries the enclosing [nzTheme] scope class on the handle's tooltip root (NzTooltipDirective's own popup, wired in plan B)", async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const tooltip = overlay.getContainerElement().querySelector('.ant-tooltip') as HTMLElement;
    expect(tooltip).not.toBeNull();
    expect(tooltip.className).toMatch(/\bnz-theme-\d+\b/);
    expect(tooltip.className).toContain(enclosingScopeClass());
    expect(getComputedStyle(tooltip).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
  });
});
