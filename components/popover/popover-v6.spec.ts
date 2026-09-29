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

import { NzPopoverModule } from './popover.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzPopoverModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 300px 0 0 200px">
      <button
        id="trigger"
        nz-popover
        nzPopoverTitle="Title"
        nzPopoverContent="Body"
        nzPopoverTrigger="click"
        [nzPopoverVisible]="visible()"
      >
        p
      </button>
    </div>
  `
})
class TestPopoverComponent {
  visible = signal(false);
}

describe('popover under antd v6 css', () => {
  let fixture: ComponentFixture<TestPopoverComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestPopoverComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('opens a v6 popover with title and content blocks, scoped to the theme', async () => {
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = overlay.getContainerElement().querySelector('.ant-popover') as HTMLElement;
    await expectMotionSettled(root);
    // v6's `-container` and v4's `-inner` are the same element in ng-zorro (antd nests them), hence the
    // compound selector.
    const inner = root.querySelector('.ant-popover-container.ant-popover-inner') as HTMLElement;
    expect(inner).not.toBeNull();
    expect(inner.querySelector('.ant-popover-title')?.textContent?.trim()).toBe('Title');
    expect(inner.querySelector('.ant-popover-content')?.textContent?.trim()).toBe('Body');
    expect(getComputedStyle(inner).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(inner).borderRadius).toBe('8px'); // borderRadiusLG
    // The v4 `-inner-content` class stays next to its v6 replacement `-content` while v4 is the default.
    expect(root.querySelector('.ant-popover-inner-content.ant-popover-content')).not.toBeNull();
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    // Positioned above the trigger (default `top` placement) and horizontally centred on it. The host's
    // margin leaves room above the trigger for the title+content box; without it CDK's
    // FlexibleConnectedPositionStrategy falls back to `bottom`. CDK writes the offsets onto `.ant-popover`
    // itself, so without the patch's `.ant-popover { position: relative }` v6's `position: absolute`
    // misplaces the bubble.
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
    expect(overlay.getContainerElement().querySelector('.ant-popover')).toBeNull();
  });
});
