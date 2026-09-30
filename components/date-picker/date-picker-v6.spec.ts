/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzDatePickerModule } from './date-picker.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzDatePickerModule],
  template: `<nz-date-picker id="host" [nzOpen]="open()" style="margin-top: 40px" />`
})
class TestDatePickerComponent {
  open = signal(false);
}

describe('date-picker under antd v6 css', () => {
  let fixture: ComponentFixture<TestDatePickerComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestDatePickerComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  // Review focus: the dropdown opens below the input (matching antd/rc-picker's default placement)
  // and is removed from the overlay container after it closes, not merely hidden.
  it('opens a positioned dropdown below the input, whose enter motion settles', async () => {
    const host = document.getElementById('host') as HTMLElement;
    expect(getComputedStyle(host).height).toBe('32px');
    expect(getComputedStyle(host).borderColor).toBe('rgb(217, 217, 217)');
    expect(host.classList.contains('ant-picker-outlined')).toBe(true);

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const dropdown = overlay.getContainerElement().querySelector('.ant-picker-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();
    await expectMotionSettled(dropdown);
    fixture.detectChanges();
    await fixture.whenStable();

    const rect = dropdown.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(hostRect.bottom - 1);
    expect(getComputedStyle(dropdown).position).toBe('relative');

    const panel = dropdown.querySelector('.ant-picker-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    const datePanel = panel.querySelector('.ant-picker-date-panel') as HTMLElement;
    // cellWidth (36px) * 7 + (padding (16px) + paddingXXS (4px) / 2) * 2, default tokens.
    expect(getComputedStyle(datePanel).width).toBe('288px');

    const todayInner = dropdown.querySelector('.ant-picker-cell-today .ant-picker-cell-inner') as HTMLElement;
    expect(todayInner).not.toBeNull();
    expect(getComputedStyle(todayInner, '::before').borderColor).toBe('rgb(22, 119, 255)');
  });

  // The leave animation is `ant-slide-up-leave` (`slideAnimationLeave()`), motion-duration-mid (200ms);
  // wait past it before asserting the dropdown is gone, not merely hidden by a class.
  it('removes the dropdown from the overlay container after the leave motion', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const dropdown = overlay.getContainerElement().querySelector('.ant-picker-dropdown') as HTMLElement;
    await expectMotionSettled(dropdown);

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-picker-dropdown')).toBeNull();
  });
});

@Component({
  imports: [FormsModule, NzDatePickerModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-date-picker id="scoped" [nzOpen]="open()" style="margin-top: 40px" />
    </div>
  `
})
class ScopedDatePickerHostComponent {
  open = signal(false);
}

describe('date-picker dropdown picks up the enclosing theme scope', () => {
  let fixture: ComponentFixture<ScopedDatePickerHostComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ScopedDatePickerHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('adds the scope class to the overlay pane and the scoped token to the dropdown root', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));

    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);

    const dropdown = pane.querySelector('.ant-picker-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();
    expect(getComputedStyle(dropdown).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
  });
});
