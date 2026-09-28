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

import { NzTooltipModule } from './tooltip.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTooltipModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 80px 0 0 200px">
      <button id="trigger" nz-tooltip nzTooltipTitle="Hello" [nzTooltipVisible]="visible()" nzTooltipTrigger="click">
        t
      </button>
    </div>
  `
})
class TestTooltipComponent {
  visible = signal(false);
}

describe('tooltip under antd v6 css', () => {
  let fixture: ComponentFixture<TestTooltipComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestTooltipComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('opens a positioned v6 tooltip whose motion settles, scoped to the enclosing theme', async () => {
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = overlay.getContainerElement().querySelector('.ant-tooltip') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);
    // The brief's verbatim assertion used a descendant selector (`.ant-tooltip-container .ant-tooltip-inner`),
    // but the mapping table merges both classes onto the same div (no separate `-content`/`-container`
    // wrapper), so the compound (no-space) selector is the one that actually matches; substituted here.
    expect(root.querySelector('.ant-tooltip-container.ant-tooltip-inner')?.textContent?.trim()).toBe('Hello');
    const inner = root.querySelector('.ant-tooltip-inner') as HTMLElement;
    expect(getComputedStyle(inner).backgroundColor).toBe('rgba(0, 0, 0, 0.85)'); // colorBgSpotlight
    expect(getComputedStyle(inner).borderRadius).toBe('6px');
    expect(root.getBoundingClientRect().height).toBeGreaterThan(20);
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
    // Positioned above the trigger (default `top` placement) and horizontally centred on it. CDK's
    // FlexibleConnectedPositionStrategy writes the offsets that produce this onto `.ant-tooltip` itself
    // (not onto `.cdk-overlay-pane`); without `style/v6/patch.css`'s `.ant-tooltip { position: relative; }`,
    // v6's own `position: absolute` on that same element misinterprets those offsets and the bubble is
    // mispositioned (verified directly: without the patch this element measures `left: 209.86` / `top: 68`
    // against a trigger at `left: 200` / `top: 80` -- overlapping the trigger instead of sitting centred
    // above it; see fix round 1).
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
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-tooltip')).toBeNull();
  });
});
