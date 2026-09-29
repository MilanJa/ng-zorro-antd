/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzPopconfirmModule } from './popconfirm.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzPopconfirmModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 300px 0 0 200px">
      <button id="trigger" nz-popconfirm nzPopconfirmTitle="Sure?" [nzPopconfirmVisible]="visible()">x</button>
    </div>
  `
})
class TestPopconfirmComponent {
  visible = signal(false);
}

describe('popconfirm under antd v6 css', () => {
  let fixture: ComponentFixture<TestPopconfirmComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestPopconfirmComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 popconfirm body inside a popover bubble, scoped to the theme', async () => {
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = overlay.getContainerElement().querySelector('.ant-popconfirm.ant-popover') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);
    expect(
      root.querySelector('.ant-popover-container .ant-popconfirm-message .ant-popconfirm-title')?.textContent?.trim()
    ).toBe('Sure?');
    const icon = root.querySelector('.ant-popconfirm-message-icon .anticon') as HTMLElement;
    expect(getComputedStyle(icon).color).toBe('rgb(250, 173, 20)'); // colorWarning
    // The body carries `ant-popover-content`, so Popover's content padding token reaches popconfirm too.
    const body = root.querySelector('.ant-popconfirm-inner-content.ant-popover-content') as HTMLElement;
    expect(body).not.toBeNull();
    expect(getComputedStyle(body).padding).toBe('0px'); // --ant-popover-inner-content-padding
    const buttons = root.querySelectorAll('.ant-popconfirm-buttons button');
    expect(buttons.length).toBe(2);
    expect(getComputedStyle(root.querySelector('.ant-popconfirm-buttons') as HTMLElement).textAlign).toBe('end');
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    // `NzThemeDirective`'s own scoped CSS (`.nz-theme-N { --ant-color-primary: #00b96b; ... }`) is written
    // asynchronously (it awaits a lazy chunk import), landing after the button's first paint with the
    // *default* `--ant-color-primary` (`:root`'s `#1677ff`). `.ant-btn`'s own v6 rule has
    // `transition: all var(--ant-motion-duration-mid) ...`, so the switch to the scoped `#00b96b` is
    // animated rather than instant: reading `background-color` immediately after `whenStable()` can catch
    // an interpolated in-between colour (confirmed by probing a freshly-inserted sibling button with the
    // exact same classes, which reads the final colour instantly, and by reading `--ant-btn-bg-color`
    // directly, which also already resolves to the final colour while `background-color` itself is still
    // mid-transition). Waiting out the default motion duration (comfortably `> --ant-motion-duration-mid`,
    // 0.2s) lets the transition settle before asserting the visual result.
    await new Promise(r => setTimeout(r, 300));
    expect(getComputedStyle(buttons[1]).backgroundColor).toBe('rgb(0, 185, 107)'); // scoped primary reaches the OK button

    // Positioned above the trigger (default `top` placement, as for Tooltip and Popover). CDK's
    // FlexibleConnectedPositionStrategy writes the offsets that place the bubble onto `.ant-popover`
    // itself (not onto `.cdk-overlay-pane`); without
    // `style/v6/patch.css`'s `.ant-popconfirm.ant-popover { position: relative; }`, v6's own
    // `position: absolute` on that same element misinterprets those offsets and the bubble is
    // mispositioned. The host fixture's inline margin gives the (title+buttons) box enough headroom
    // above the trigger for CDK to actually choose `top` rather than falling back to another placement.
    const trigger = document.getElementById('trigger')!.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.bottom).toBeLessThanOrEqual(trigger.top + 1);
    const rootCentre = rootRect.left + rootRect.width / 2;
    const triggerCentre = trigger.left + trigger.width / 2;
    expect(Math.abs(rootCentre - triggerCentre)).toBeLessThanOrEqual(2);
  });

  it('is removed after close', async () => {
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.visible.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    // Leave motion: `.ant-zoom-big-leave` runs antZoomBigOut for --ant-motion-duration-mid (0.2s);
    // Angular removes the popup on `animationend`. 400 ms leaves room for the frame it starts on.
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-popconfirm')).toBeNull();
  });
});
