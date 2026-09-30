/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { dispatchMouseEvent, expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { NzColorPickerModule } from './color-picker.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzColorPickerModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 80px 0 0 200px">
      <nz-color-picker id="host" nzDefaultValue="#1677ff" />
    </div>
  `
})
class TestColorPickerComponent {}

describe('color-picker under antd v6 css', () => {
  let fixture: ComponentFixture<TestColorPickerComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestColorPickerComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  function getTrigger(): HTMLElement {
    return fixture.nativeElement.querySelector('.ant-color-picker-trigger') as HTMLElement;
  }

  it('renders the closed trigger at controlHeight with the default border and radius', () => {
    const trigger = getTrigger();
    expect(trigger).not.toBeNull();
    const rect = trigger.getBoundingClientRect();
    // `min-width`/`min-height`, not `width`/`height` (v6's `.ant-color-picker-trigger` rule); the box still
    // measures 32px because its only content (the swatch + padding) does not exceed that minimum.
    expect(rect.width).toBe(32);
    expect(rect.height).toBe(32);
    const style2 = getComputedStyle(trigger);
    expect(style2.borderColor).toBe('rgb(217, 217, 217)');
    expect(style2.borderRadius).toBe('6px');
  });

  it('opens a positioned v6 panel whose motion settles, scoped to the enclosing theme, and adds the trigger-active class', async () => {
    const trigger = getTrigger();
    dispatchMouseEvent(trigger, 'click');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger.classList).toContain('ant-color-picker-trigger-active');

    const root = overlay.getContainerElement().querySelector('.ant-popover') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);

    // Both halves of the scoped-theme assertion: the popup root inherits the `nz-theme-N` scope class
    // from the enclosing `[nzTheme]`, and its resolved custom property carries the overridden token.
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    // antd puts ColorPicker's own root class on the popup content (`mergedPopupCls` in
    // antd/es/color-picker/ColorPicker.js), not on the trigger; v6's own `.ant-color-picker
    // .ant-color-picker-inner ...` selectors depend on it being there.
    expect(root.classList).toContain('ant-color-picker');

    const panel = root.querySelector('.ant-color-picker-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(getComputedStyle(root.querySelector('.ant-color-picker-inner-content')!).width).toBe('234px');
    const slider = root.querySelector('.ant-color-picker-slider') as HTMLElement;
    expect(getComputedStyle(slider).height).toBe('8px');

    // Positioned relative to the trigger (bottomLeft is the first placement in `popoverPlacements`).
    const triggerRect = trigger.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.top).toBeGreaterThanOrEqual(triggerRect.bottom - 1);
    expect(Math.abs(rootRect.left - triggerRect.left)).toBeLessThanOrEqual(4);
  });

  it('is removed after clicking outside', async () => {
    const trigger = getTrigger();
    dispatchMouseEvent(trigger, 'click');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(overlay.getContainerElement().querySelector('.ant-popover')).not.toBeNull();

    dispatchMouseEvent(document.body, 'click');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // Leave motion: `.ant-zoom-big-leave` runs antZoomBigOut for --ant-motion-duration-mid (0.2s);
    // Angular removes the popup on `animationend`. 400 ms leaves room for the frame it starts on.
    await new Promise(r => setTimeout(r, 400));

    expect(overlay.getContainerElement().querySelector('.ant-popover')).toBeNull();
  });
});

@Component({
  imports: [NzColorPickerModule, NzInputModule, NzSpaceModule],
  template: `
    <nz-space-compact>
      <input nz-input id="neighbour" />
      <nz-color-picker id="picker" />
    </nz-space-compact>
  `
})
class TestCompactColorPickerComponent {}

describe('color-picker inside nz-space-compact', () => {
  it('does not join the compact group, so its neighbour keeps both first and last item classes', () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    const fixture = TestBed.createComponent(TestCompactColorPickerComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#neighbour') as HTMLElement;
    expect(input.classList).toContain('ant-input-compact-item');
    expect(input.classList).toContain('ant-input-compact-first-item');
    expect(input.classList).toContain('ant-input-compact-last-item');
    const picker = fixture.nativeElement.querySelector('#picker') as HTMLElement;
    expect([...picker.classList].filter(c => c.includes('compact'))).toEqual([]);
  });
});
