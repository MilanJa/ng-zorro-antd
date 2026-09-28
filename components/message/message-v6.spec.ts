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
    // Deviation from the brief: v6's own template CSS (antd/es/message/style/index.js) puts
    // background/border-radius/box-shadow on `.ant-message-notice` itself, not on the nested
    // `.ant-message-notice-wrapper` the brief's assertion targeted -- `.ant-message-notice-wrapper`
    // only ever gets `display:flex;align-items:center;gap`. Asserting against `notice` (the real
    // v6 rule target) instead, per component-dispatch-context.md's "use the CSS value" rule.
    // See task-14-report.md Step 3.
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
