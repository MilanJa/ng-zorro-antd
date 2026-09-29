/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzNotificationService } from './notification.service';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

describe('notification under antd v6 css', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), NzNotificationService] });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders a v6 notification with icon, title, description and close button', async () => {
    TestBed.inject(NzNotificationService).success('Title', 'Body', { nzDuration: 0 });
    await Promise.resolve();
    await Promise.resolve();
    const notice = overlay
      .getContainerElement()
      .querySelector('.ant-notification-topRight .ant-notification-notice') as HTMLElement;
    expect(notice).not.toBeNull();
    await expectMotionSettled(notice);
    expect(getComputedStyle(notice).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(notice).width).toBe('384px'); // notification width token
    expect(
      notice
        .querySelector(
          '.ant-notification-notice-wrapper .ant-notification-notice-section .ant-notification-notice-title'
        )
        ?.textContent?.trim()
    ).toBe('Title');
    expect(getComputedStyle(notice.querySelector('.ant-notification-notice-icon') as HTMLElement).color).toBe(
      'rgb(82, 196, 26)'
    );
    expect(getComputedStyle(notice.querySelector('.ant-notification-notice-title') as HTMLElement).fontSize).toBe(
      '16px'
    );
  });

  it('is removed after its duration under v6 CSS', async () => {
    TestBed.inject(NzNotificationService).info('T', 'B', { nzDuration: 100 });
    await Promise.resolve();
    await Promise.resolve();
    expect(overlay.getContainerElement().querySelector('.ant-notification-notice')).not.toBeNull();
    await new Promise(r => setTimeout(r, 100 + 400 + 200)); // duration + leave motion + slack
    expect(overlay.getContainerElement().querySelector('.ant-notification-notice')).toBeNull();
  });

  it('indents the text of a notice with an icon by the icon size plus the wrapper gap', async () => {
    TestBed.inject(NzNotificationService).success('Title', 'Body', { nzDuration: 0 });
    await Promise.resolve();
    await Promise.resolve();
    const notice = overlay.getContainerElement().querySelector('.ant-notification-notice') as HTMLElement;
    await expectMotionSettled(notice);
    const iconEl = notice.querySelector('.ant-notification-notice-icon') as HTMLElement;
    const iconSize = parseFloat(getComputedStyle(iconEl).fontSize); // --ant-notification-icon-font-size
    const icon = iconEl.getBoundingClientRect();
    const title = notice.querySelector('.ant-notification-notice-title')!.getBoundingClientRect();
    expect(iconSize).toBe(24); // antd's iconSize: fontSizeLG x lineHeightLG
    expect(icon.width).toBe(iconSize);
    expect(title.left - icon.left).toBe(iconSize + 12); // icon size + --ant-margin-sm, as v6's flex gap
  });

  it('does not indent the text of a blank notice', async () => {
    TestBed.inject(NzNotificationService).blank('Title', 'Body', { nzDuration: 0 });
    await Promise.resolve();
    await Promise.resolve();
    const notice = overlay.getContainerElement().querySelector('.ant-notification-notice') as HTMLElement;
    await expectMotionSettled(notice);
    const title = notice.querySelector('.ant-notification-notice-title') as HTMLElement;
    expect(getComputedStyle(title).marginInlineStart).toBe('0px');
  });

  it('does not block clicks on the page while a notification is showing', async () => {
    // v6's `.ant-notification` root is a fixed 100vh box and ng-zorro renders all six placement roots
    // even when empty; the patch's `pointer-events: none` keeps the page under them clickable. The
    // hit test at the bottom-left corner, far from the topRight notice, must reach the page button.
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.style.position = 'fixed';
    button.style.left = '0px';
    button.style.bottom = '0px';
    button.style.width = '10px';
    button.style.height = '10px';
    try {
      TestBed.inject(NzNotificationService).success('Title', 'Body', { nzDuration: 0 });
      await Promise.resolve();
      await Promise.resolve();
      const notice = overlay.getContainerElement().querySelector('.ant-notification-notice') as HTMLElement;
      expect(notice).not.toBeNull();
      await expectMotionSettled(notice);
      expect(document.elementFromPoint(5, window.innerHeight - 5)).toBe(button);
    } finally {
      button.remove();
    }
  });
});
