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

import { NzTreeSelectModule } from './tree-select.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTreeSelectModule, FormsModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 80px 0 0 200px; width: 200px">
      <nz-tree-select
        id="trigger"
        [nzNodes]="nodes"
        [nzOpen]="open()"
        nzDropdownClassName="user-extra"
        style="width: 100%"
      />
    </div>
  `
})
class TestTreeSelectComponent {
  open = signal(false);
  nodes = [
    {
      title: 'parent 1',
      key: '0',
      children: [{ title: 'leaf 1', key: '0-0', isLeaf: true }]
    }
  ];
}

describe('tree-select under antd v6 css', () => {
  let fixture: ComponentFixture<TestTreeSelectComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTreeSelectComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('opens a positioned v6 dropdown whose motion settles, scoped to the enclosing theme', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = overlay.getContainerElement().querySelector('.ant-select-tree-dropdown') as HTMLElement;
    expect(root).not.toBeNull();
    // v4 styles `ant-tree-select-dropdown` as well, so it stays off the DOM; the patch keys v6's rules
    // onto `ant-select-tree-dropdown` instead.
    expect(root.classList.contains('ant-tree-select-dropdown')).toBe(false);
    await expectMotionSettled(root);
    // The scope class lands on `.cdk-overlay-pane` (createOverlayRef's panelClass mechanism); the
    // popup root inherits the theme's CSS custom properties from it.
    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    // The user's `nzDropdownClassName` stays on the dropdown root only.
    expect(pane.classList).not.toContain('user-extra');
    expect(root.classList).toContain('user-extra');
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
    // Positioned below the trigger (default `bottomLeft` placement).
    const trigger = document.getElementById('trigger')!.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.top).toBeGreaterThanOrEqual(trigger.bottom - 1);
    const node = root.querySelector('.ant-select-tree-node-content-wrapper') as HTMLElement;
    expect(node).not.toBeNull();
    expect(getComputedStyle(node).minHeight).toBe('24px');
    // v6's `.ant-tree-select-dropdown` rules, applied through the re-keyed patch rules: dropdown padding
    // (paddingXS, paddingXS / 2), square tree corners, full-width node highlight, 6px node radius.
    expect(getComputedStyle(root).padding).toBe('8px 4px');
    expect(getComputedStyle(root.querySelector('.ant-select-tree')!).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(node).flexGrow).toBe('1');
    expect(getComputedStyle(node).borderTopLeftRadius).toBe('6px');
    expect(getComputedStyle(node).paddingInlineStart).toBe('8px');
  });

  it('is removed after close', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    // Leave motion: `.ant-slide-up-leave` runs slideUpOut for --ant-motion-duration-mid (0.2s);
    // Angular removes the popup on `animationend`. 500 ms leaves room for the frame it starts on.
    await new Promise(r => setTimeout(r, 500));
    expect(overlay.getContainerElement().querySelector('.ant-select-tree-dropdown')).toBeNull();
  });
});
