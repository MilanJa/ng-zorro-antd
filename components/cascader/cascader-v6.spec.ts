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

import { NzCascaderModule } from './cascader.module';
import { NzCascaderOption } from './typings';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

const options: NzCascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [{ value: 'xihu', label: 'West Lake', isLeaf: true }]
      }
    ]
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [{ value: 'zhonghuamen', label: 'Zhonghuamen', isLeaf: true }]
      }
    ]
  }
];

@Component({
  imports: [NzCascaderModule, FormsModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="margin: 80px 0 0 200px; width: 200px">
      <nz-cascader id="trigger" [nzOptions]="options" [nzOpen]="open()" [nzMultiple]="multiple()" />
    </div>
  `
})
class TestCascaderComponent {
  options = options;
  open = signal(false);
  multiple = signal(false);
}

@Component({
  imports: [NzCascaderModule, FormsModule],
  template: `
    <nz-cascader id="plain" [nzOptions]="options" [nzOpen]="open()" [nzMultiple]="multiple()" style="width: 200px" />
  `
})
class PlainCascaderComponent {
  options = options;
  open = signal(false);
  multiple = signal(false);
}

describe('cascader default v6 tokens (unscoped, so alias tokens are not recomputed from an override)', () => {
  let fixture: ComponentFixture<PlainCascaderComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(PlainCascaderComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes .ant-cascader-menu from the --ant-cascader-* tokens', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = overlay.getContainerElement().querySelector('.ant-cascader-dropdown') as HTMLElement;
    await expectMotionSettled(root);
    // `.ant-cascader-menu` sets `min-width: var(--ant-cascader-control-item-width)` (111px) and
    // `height: var(--ant-cascader-dropdown-height)` (180px); with a single, unexpanded column the
    // menus flex row has nothing to grow into beyond that minimum.
    const menu = root.querySelector('.ant-cascader-menu') as HTMLElement;
    expect(menu).not.toBeNull();
    const menuRect = menu.getBoundingClientRect();
    expect(menuRect.width).toBe(111);
    expect(menuRect.height).toBe(180);
  });

  it('gives the active menu item the v6 selected background after its own hover transition settles', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = overlay.getContainerElement().querySelector('.ant-cascader-dropdown') as HTMLElement;
    await expectMotionSettled(root);
    // Clicking a non-leaf option activates it (sets `.ant-cascader-menu-item-active`) and expands its
    // children into a second column.
    (root.querySelector('.ant-cascader-menu-item') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const active = root.querySelector('.ant-cascader-menu-item-active') as HTMLElement;
    expect(active).not.toBeNull();
    // `.ant-cascader-menu-item` sets `transition: all var(--ant-motion-duration-mid)` (0.2s); wait
    // past it before reading the background so the interpolated value is not caught mid-transition.
    await new Promise(r => setTimeout(r, 350));
    // --ant-cascader-option-selected-bg default token (#e6f4ff).
    expect(getComputedStyle(active).backgroundColor).toBe('rgb(230, 244, 255)');
  });

  it('draws the multiple-mode checkbox box on -inner and neutralises the outer element', async () => {
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = overlay.getContainerElement().querySelector('.ant-cascader-dropdown') as HTMLElement;
    await expectMotionSettled(root);
    const outer = root.querySelector('.ant-cascader-checkbox') as HTMLElement;
    const inner = root.querySelector('.ant-cascader-checkbox-inner') as HTMLElement;
    expect(outer).not.toBeNull();
    expect(inner).not.toBeNull();
    const outerCs = getComputedStyle(outer);
    expect(outerCs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(outerCs.borderStyle).toBe('none');
    const innerCs = getComputedStyle(inner);
    expect(innerCs.width).toBe('16px');
    expect(innerCs.height).toBe('16px');
    expect(innerCs.borderColor).toBe('rgb(217, 217, 217)');
    expect(innerCs.backgroundColor).toBe('rgb(255, 255, 255)');
  });
});

describe('cascader dropdown picks up the enclosing theme scope', () => {
  let fixture: ComponentFixture<TestCascaderComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCascaderComponent);
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
    const root = overlay.getContainerElement().querySelector('.ant-cascader-dropdown') as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.classList.contains('ant-select-dropdown')).toBe(true);
    await expectMotionSettled(root);
    // `dropdownPanelClasses` (bound via `[cdkConnectedOverlayPanelClass]`) puts only the theme scope
    // classes on the CDK pane -- `nzMenuClassName`/`nzColumnClassName` stay on the inner elements they
    // are already bound to, so the pane itself carries no user-facing class.
    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
    // Positioned below the trigger (default `bottomLeft` placement).
    const trigger = document.getElementById('trigger')!.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.top).toBeGreaterThanOrEqual(trigger.bottom - 1);
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
    expect(overlay.getContainerElement().querySelector('.ant-cascader-dropdown')).toBeNull();
  });
});
