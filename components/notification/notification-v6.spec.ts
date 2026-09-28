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
});
