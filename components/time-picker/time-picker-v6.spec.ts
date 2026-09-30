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

import { NzTimePickerModule } from './time-picker.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzTimePickerModule],
  template: `<nz-time-picker id="host" [nzOpen]="open()" [ngModel]="value()" style="margin-top: 40px" />`
})
class TestTimePickerComponent {
  open = signal(false);
  value = signal<Date | null>(new Date(2024, 0, 1, 9, 30, 0));
}

describe('time-picker under antd v6 css', () => {
  let fixture: ComponentFixture<TestTimePickerComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTimePickerComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  // Positioning and leave motion: the dropdown opens below the input and is removed from the
  // overlay container after it closes (shared dropdown root and animation with date-picker,
  // ant-picker prefix).
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

    // timeColumnHeight (224px, --ant-date-picker-time-column-height) is set by the descendant selector
    // `.ant-picker-time-panel .ant-picker-content` (node_modules/antd/es/date-picker/style/panel.js:434-437;
    // ng-zorro renders the bare `.ant-picker-content` wrapper, no `-time-panel-content` class exists), not
    // on the columns themselves; each `&-column` is a `flex: 1 0 auto` child with its own `margin: 4px 0`
    // (paddingXXS, panel.js:442), so a stretched column computes to 224 - 4 - 4 = 216px.
    const content = dropdown.querySelector('.ant-picker-time-panel .ant-picker-content') as HTMLElement;
    expect(getComputedStyle(content).height).toBe('224px');
    const columns = dropdown.querySelectorAll('.ant-picker-time-panel-column');
    expect(columns.length).toBe(3); // hour, minute, second (no use12Hours)
    columns.forEach(column => {
      const cs = getComputedStyle(column as HTMLElement);
      expect(cs.width).toBe('56px'); // --ant-date-picker-time-column-width
      expect(cs.height).toBe('216px'); // stretched height minus the column's own 4px+4px margin
    });

    const selectedInner = dropdown.querySelector(
      '.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner'
    ) as HTMLElement;
    expect(selectedInner).not.toBeNull();
    expect(getComputedStyle(selectedInner).backgroundColor).toBe('rgb(230, 244, 255)');
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
  imports: [FormsModule, NzTimePickerModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-time-picker id="scoped" [nzOpen]="open()" style="margin-top: 40px" />
    </div>
  `
})
class ScopedTimePickerHostComponent {
  open = signal(false);
}

describe('time-picker dropdown picks up the enclosing theme scope', () => {
  let fixture: ComponentFixture<ScopedTimePickerHostComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ScopedTimePickerHostComponent);
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
