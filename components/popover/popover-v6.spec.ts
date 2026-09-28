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
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
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
    // The brief's verbatim assertion used a child-combinator selector (`.ant-popover-container >
    // .ant-popover-inner`), but the mapping table merges both classes onto the same div (exactly as
    // Task 8 did for `.ant-tooltip-container`/`.ant-tooltip-inner`), so the compound (no-combinator)
    // selector is the one that actually matches; substituted here for the same reason.
    const inner = root.querySelector('.ant-popover-container.ant-popover-inner') as HTMLElement;
    expect(inner).not.toBeNull();
    expect(inner.querySelector('.ant-popover-title')?.textContent?.trim()).toBe('Title');
    expect(inner.querySelector('.ant-popover-content')?.textContent?.trim()).toBe('Body');
    expect(getComputedStyle(inner).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(inner).borderRadius).toBe('8px'); // borderRadiusLG
    // The brief's verbatim assertion expected `.ant-popover-inner-content` to be gone entirely, but the
    // mapping table's own concrete instruction keeps it as a v4-compat class alongside `.ant-popover-content`
    // on the same element (dual v4/v6 rendering, global-constraints.md) until v6 becomes the default; asserting
    // it is absent would contradict that. Substituted: assert the v4 class and its v6 replacement coexist on
    // the same content-block element instead.
    expect(root.querySelector('.ant-popover-inner-content.ant-popover-content')).not.toBeNull();
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    // Positioned above the trigger (default `top` placement, `@Input('nzPopoverPlacement') ... = 'top'`,
    // popover.ts, same default as Tooltip) and horizontally centred on it. The brief's host fixture is
    // verbatim except for this inline margin: without enough room above the trigger for the CDK
    // FlexibleConnectedPositionStrategy to fit the (taller than Tooltip's) title+content box, it falls back
    // to a different position entirely -- exactly the fixture problem Task 8 found and fixed for Tooltip
    // (there the fallback was `right`; here, with a shorter available width for the wider popover box, it is
    // `bottom`). Given enough headroom, `top` -- the actual default -- is used, so the margin here is sized
    // for the popover's own dimensions rather than reused verbatim from Tooltip's fixture. As with Tooltip,
    // CDK writes the offsets that produce this onto `.ant-popover` itself (not onto `.cdk-overlay-pane`);
    // without `style/v6/patch.css`'s `.ant-popover { position: relative; }`, v6's own `position: absolute` on
    // that same element misinterprets those offsets and the bubble is mispositioned.
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
    expect(overlay.getContainerElement().querySelector('.ant-popover')).toBeNull();
  });
});
