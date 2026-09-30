/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewChild, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { createKeyboardEvent, createMouseEvent, dispatchEvent, expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzContextMenuService } from './context-menu.service';
import { NzDropdownMenuComponent } from './dropdown-menu.component';
import { NzDropdownModule } from './dropdown.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzDropdownModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <button id="trg" nz-button nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click">Menu</button>
      <nz-dropdown-menu #menu="nzDropdownMenu">
        <ul nz-menu>
          <li nz-menu-item>Item 1</li>
          <li nz-menu-item nzSelected>Item 2</li>
        </ul>
      </nz-dropdown-menu>

      <div id="area" (contextmenu)="menuService.create($event, ctx)">Context area</div>
      <nz-dropdown-menu #ctx="nzDropdownMenu">
        <ul nz-menu>
          <li nz-menu-item>Ctx item 1</li>
        </ul>
      </nz-dropdown-menu>
    </div>

    <div id="unscoped">
      <button id="trg2" nz-button nz-dropdown [nzDropdownMenu]="menu2" nzTrigger="click">Menu</button>
      <nz-dropdown-menu #menu2="nzDropdownMenu">
        <ul nz-menu>
          <li id="hoverItem" nz-menu-item>Hover item</li>
        </ul>
      </nz-dropdown-menu>
    </div>
  `
})
class TestDropdownComponent {
  readonly menuService = inject(NzContextMenuService);
  @ViewChild('ctx', { static: true }) ctx!: NzDropdownMenuComponent;
}

describe('dropdown under antd v6 css', () => {
  let fixture: ComponentFixture<TestDropdownComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestDropdownComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  function enclosingScopeClass(): string {
    return fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective).scopeClass;
  }

  // `NzDropdownDirective`'s visibility pipeline runs the merged mouse/click state through
  // `auditTime(150)` (`dropdown.directive.ts`) before attaching the overlay, a real timer that
  // `whenStable()` alone does not wait out.
  async function waitForOpen(fixture: ComponentFixture<unknown>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  // The overlay is disposed only after the root's `animate.leave` animation finishes
  // (`dropdown-menu.component.ts`'s `animationStateChange$`/`onAnimationEvent`, consumed by
  // `dropdown.directive.ts`), so the pane stays in the DOM (in its leave-animation classes) for a
  // moment after the trigger that closes it.
  async function waitForClose(fixture: ComponentFixture<unknown>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('opens a themed, positioned dropdown whose enter motion settles', async () => {
    const trigger = fixture.debugElement.query(By.css('#trg')).nativeElement as HTMLButtonElement;
    trigger.click();
    await waitForOpen(fixture);

    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);

    // With `createOverlayRef(injector, config)` the `panelClass` passed in the `OverlayConfig`
    // (`dropdown.directive.ts`'s `themeScopeClasses()`) lands on the CDK-generated
    // `.cdk-overlay-pane` wrapper, one level above the template's own `.ant-dropdown` root; the root
    // inherits the scope's CSS custom properties from that ancestor.
    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(pane.className).toContain(enclosingScopeClass());
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    const triggerRect = trigger.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(rootRect.top).toBeGreaterThanOrEqual(triggerRect.bottom - 1);

    const menu = root.querySelector('.ant-dropdown-menu') as HTMLElement;
    const menuCs = getComputedStyle(menu);
    expect(menuCs.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(menuCs.borderRadius).toBe('8px');
    expect(menuCs.padding).toBe('4px');

    const selected = menu.querySelector('.ant-dropdown-menu-item-selected') as HTMLElement;
    expect(selected).not.toBeNull();
    // colorPrimary '#00b96b' -> rgb(0, 185, 107).
    expect(getComputedStyle(selected).color).toBe('rgb(0, 185, 107)');
    const controlItemBgActive = getComputedStyle(root).getPropertyValue('--ant-control-item-bg-active').trim();
    expect(controlItemBgActive).not.toBe('');
    // The custom property can resolve to a hex/rgb literal while `backgroundColor` always reports
    // `rgb(...)`; resolve both through the same cascade (a child of `selected`, so it inherits the
    // property) to compare like for like instead of assuming a string format.
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--ant-control-item-bg-active)';
    selected.appendChild(probe);
    const resolvedControlItemBgActive = getComputedStyle(probe).backgroundColor;
    probe.remove();
    expect(getComputedStyle(selected).backgroundColor).toBe(resolvedControlItemBgActive);

    // A second click on the trigger toggles the dropdown closed.
    trigger.click();
    await waitForClose(fixture);
    expect(overlay.getContainerElement().querySelector('.ant-dropdown')).toBeNull();
  });

  it('closes on Escape', async () => {
    const trigger = fixture.debugElement.query(By.css('#trg')).nativeElement as HTMLButtonElement;
    trigger.click();
    await waitForOpen(fixture);
    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root).not.toBeNull();

    const escape = createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape');
    dispatchEvent(document.body, escape);
    await waitForClose(fixture);

    expect(overlay.getContainerElement().querySelector('.ant-dropdown')).toBeNull();
  });

  it('scopes the imperative context menu from the passed NzDropdownMenuComponent', async () => {
    const area = fixture.debugElement.query(By.css('#area')).nativeElement as HTMLElement;
    const event = createMouseEvent('contextmenu');
    area.dispatchEvent(event);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root).not.toBeNull();

    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(pane.className).toContain(enclosingScopeClass());
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    fixture.componentInstance.menuService.close();
    await waitForClose(fixture);
    expect(overlay.getContainerElement().querySelector('.ant-dropdown')).toBeNull();
  });

  it('uses the default control-item hover background outside any scope', async () => {
    const trigger = fixture.debugElement.query(By.css('#trg2')).nativeElement as HTMLButtonElement;
    trigger.click();
    await waitForOpen(fixture);

    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);
    const item = root.querySelector('#hoverItem') as HTMLElement;
    // `:hover` is a real UA pseudo-class that a synthetic `mouseenter` dispatch does not set in
    // Chromium (see `input-number-v6.spec.ts`'s equivalent note), so it is not reachable from here;
    // instead verify the v6 rule itself resolves `.ant-dropdown-menu-item:hover`'s
    // `background-color` to the default `controlItemBgHover` value.
    const rule = [...document.styleSheets]
      .flatMap(sheet => {
        try {
          return [...sheet.cssRules];
        } catch {
          return [];
        }
      })
      .find(
        r =>
          r instanceof CSSStyleRule &&
          r.selectorText.split(',').some(s => s.trim().endsWith('.ant-dropdown-menu-item:hover'))
      );
    expect(rule).toBeDefined();
    expect((rule as CSSStyleRule).style.backgroundColor).toBe('var(--ant-control-item-bg-hover)');
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--ant-control-item-bg-hover)';
    item.appendChild(probe);
    expect(getComputedStyle(probe).backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
    probe.remove();
  });
});
