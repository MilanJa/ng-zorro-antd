/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzMessageService } from './message.service';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

describe('message under antd v6 css', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), NzMessageService] });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders a v6 toast with icon, title and elevated background', async () => {
    TestBed.inject(NzMessageService).success('Saved', { nzDuration: 0 });
    await Promise.resolve();
    await Promise.resolve();
    const notice = overlay.getContainerElement().querySelector('.ant-message .ant-message-notice') as HTMLElement;
    expect(notice).not.toBeNull();
    await expectMotionSettled(notice);
    // v6 puts background, radius and shadow on `.ant-message-notice` itself; `-notice-wrapper` only
    // gets the flex row.
    expect(getComputedStyle(notice).backgroundColor).toBe('rgb(255, 255, 255)'); // colorBgElevated
    expect(getComputedStyle(notice).borderRadius).toBe('8px');
    expect(getComputedStyle(notice.querySelector('.ant-message-notice-icon') as HTMLElement).color).toBe(
      'rgb(82, 196, 26)'
    );
    expect(notice.querySelector('.ant-message-notice-title')?.textContent?.trim()).toBe('Saved');
  });

  it('is removed after its duration under v6 CSS', async () => {
    TestBed.inject(NzMessageService).info('Bye', { nzDuration: 100 });
    await Promise.resolve();
    await Promise.resolve();
    expect(overlay.getContainerElement().querySelector('.ant-message-notice')).not.toBeNull();
    await new Promise(r => setTimeout(r, 100 + 400 + 200)); // duration + leave motion + slack
    expect(overlay.getContainerElement().querySelector('.ant-message-notice')).toBeNull();
  });
});
