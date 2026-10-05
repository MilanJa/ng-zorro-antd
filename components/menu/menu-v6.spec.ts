/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { dispatchFakeEvent, expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzMenuModule } from './menu.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzMenuModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <ul id="vertical" nz-menu nzMode="vertical" style="width: 240px">
        <li nz-submenu nzTitle="Navigation One" nzIcon="mail">
          <ul>
            <li nz-menu-item>Option 1</li>
            <li nz-menu-item>Option 2</li>
          </ul>
        </li>
      </ul>
    </div>
  `
})
class TestScopedVerticalComponent {}

@Component({
  imports: [NzMenuModule, NzIconModule, NzDropdownModule],
  template: `
    <ul id="inline" nz-menu nzMode="inline" style="width: 256px">
      <li nz-submenu nzTitle="Navigation One" nzIcon="mail" nzOpen>
        <ul>
          <li id="selected" nz-menu-item nzSelected>Option 1</li>
          <li nz-menu-item>Option 2</li>
        </ul>
      </li>
      <li nz-menu-divider id="divider"></li>
      <li id="plain" nz-menu-item>Option 3</li>
    </ul>

    <ul id="horizontal" nz-menu nzMode="horizontal">
      <li id="hselected" nz-menu-item nzSelected>Navigation One</li>
      <li nz-menu-item>Navigation Two</li>
    </ul>

    <ul id="dark" nz-menu nzMode="inline" nzTheme="dark" style="width: 256px">
      <li id="darkItem" nz-menu-item>Option 1</li>
    </ul>

    <ul id="collapsed" nz-menu nzMode="inline" nzInlineCollapsed>
      <li id="collapsedItem" nz-menu-item>
        <nz-icon nzType="mail" />
        <span id="collapsedText">Navigation One</span>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item>Option 5</li>
        </ul>
      </li>
    </ul>

    <button id="ddTrigger" nz-dropdown [nzDropdownMenu]="ddMenu" nzTrigger="click">Menu</button>
    <nz-dropdown-menu #ddMenu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>Item 1</li>
        <li nz-submenu nzTitle="More">
          <ul>
            <li nz-menu-item>Nested</li>
          </ul>
        </li>
      </ul>
    </nz-dropdown-menu>
  `
})
class TestMenuStylesComponent {}

describe('menu under antd v6 css', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  // `NzSubmenuService` runs the title/overlay mouse state through `auditTime(150)` before it opens
  // or closes the submenu; the overlay then attaches (or detaches after its `animate.leave`).
  async function settle(fixture: ComponentFixture<unknown>, ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function popupRoots(): HTMLElement[] {
    return [...overlay.getContainerElement().querySelectorAll<HTMLElement>('.ant-menu-submenu-popup')];
  }

  it('opens a themed vertical submenu popup next to its title and removes it on mouseleave', async () => {
    const fixture = TestBed.createComponent(TestScopedVerticalComponent);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#vertical .ant-menu-submenu-title') as HTMLElement;

    dispatchFakeEvent(title, 'mouseenter');
    // auditTime(150) before the submenu opens, with headroom for a loaded machine.
    await settle(fixture, 300);

    const root = popupRoots()[0];
    expect(root).toBeDefined();
    await expectMotionSettled(root);

    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    const scope = fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective).scopeClass;
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(pane.className).toContain(scope);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    // v6 sets `.ant-menu-submenu-popup { position: absolute }`, which would collapse the CDK pane.
    expect(getComputedStyle(root).position).toBe('relative');
    expect(pane.getBoundingClientRect().width).toBeGreaterThan(0);

    const sub = root.querySelector('.ant-menu-sub') as HTMLElement;
    const subCs = getComputedStyle(sub);
    expect(subCs.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(subCs.borderRadius).toBe('8px');
    expect(subCs.boxShadow).not.toBe('none');

    // Placed to the right of the title (`rightTop`), with antd's `paddingXS` (8px) gap that v6 puts on
    // `.ant-menu-submenu-placement-rightTop`.
    const titleRect = title.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const subRect = sub.getBoundingClientRect();
    expect(rootRect.left).toBeGreaterThanOrEqual(titleRect.right - 1);
    expect(Math.round(subRect.left - titleRect.right)).toBe(8);

    dispatchFakeEvent(title, 'mouseleave');
    // auditTime(150), then the zoom-big leave motion (`--ant-motion-duration-mid`, 0.2s).
    await settle(fixture, 200);
    await settle(fixture, 400);
    expect(popupRoots().length).toBe(0);
  });

  it('paints inline, horizontal, dark and collapsed menus with the default v6 tokens', async () => {
    const fixture = TestBed.createComponent(TestMenuStylesComponent);
    fixture.detectChanges();
    await settle(fixture, 0);
    const el = fixture.nativeElement as HTMLElement;

    const selected = el.querySelector('#selected') as HTMLElement;
    const selectedCs = getComputedStyle(selected);
    expect(selectedCs.backgroundColor).toBe('rgb(230, 244, 255)');
    expect(selectedCs.color).toBe('rgb(22, 119, 255)');
    expect(selectedCs.height).toBe('40px');
    expect(selectedCs.marginInline).toBe('4px');
    expect(selectedCs.borderRadius).toBe('8px');
    expect(getComputedStyle(el.querySelector('#inline .ant-menu-sub.ant-menu-inline')!).backgroundColor).toBe(
      'rgba(0, 0, 0, 0.02)'
    );

    // `nz-menu-divider` renders dropdown's divider class in a plain menu too; antd's
    // `.ant-menu .ant-menu-item-divider` is mirrored onto it.
    const dividerCs = getComputedStyle(el.querySelector('#divider')!);
    expect(dividerCs.borderTopWidth).toBe('1px');
    expect(dividerCs.borderTopStyle).toBe('solid');
    expect(dividerCs.borderTopColor).toBe('rgba(5, 5, 5, 0.06)');

    expect(getComputedStyle(el.querySelector('#horizontal')!).lineHeight).toBe('46px');
    const activeBar = getComputedStyle(el.querySelector('#hselected')!, '::after');
    expect(activeBar.borderBottomColor).toBe('rgb(22, 119, 255)');
    expect(activeBar.borderBottomWidth).toBe('2px');

    expect(getComputedStyle(el.querySelector('#dark')!).backgroundColor).toBe('rgb(0, 21, 41)');
    expect(getComputedStyle(el.querySelector('#darkItem')!).color).toBe('rgba(255, 255, 255, 0.65)');

    const collapsed = el.querySelector('#collapsed') as HTMLElement;
    expect(getComputedStyle(collapsed).width).toBe('80px');
    const icon = el.querySelector('#collapsedItem .anticon') as HTMLElement;
    expect(getComputedStyle(icon).fontSize).toBe('16px');
    // ng-zorro projects the item icon inside `.ant-menu-title-content`, which v6 collapses to
    // `width: 0; opacity: 0`; the icon stays visible, centred in the 72x40 item as antd's flex-item
    // icon is (28px inline padding, 12px above and below), and only the label after it is hidden.
    const iconRect = icon.getBoundingClientRect();
    const itemRect = el.querySelector('#collapsedItem')!.getBoundingClientRect();
    expect(iconRect.width).toBe(16);
    expect(iconRect.height).toBe(16);
    expect(Math.round(iconRect.left - itemRect.left)).toBe(28);
    expect(Math.round(iconRect.top - itemRect.top)).toBe(12);
    const text = getComputedStyle(el.querySelector('#collapsedText')!);
    expect(text.opacity).toBe('0');
    expect(text.width).toBe('0px');
  });

  it('keeps the dropdown-hosted nested submenu popup flush with its title', async () => {
    const fixture = TestBed.createComponent(TestMenuStylesComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#ddTrigger') as HTMLElement).click();
    // dropdown's own `auditTime(150)` before it attaches its overlay.
    await settle(fixture, 200);
    const title = overlay.getContainerElement().querySelector('.ant-dropdown-menu-submenu-title') as HTMLElement;
    expect(title).not.toBeNull();

    dispatchFakeEvent(title, 'mouseenter');
    await settle(fixture, 200);
    const root = popupRoots()[0];
    expect(root).toBeDefined();
    await expectMotionSettled(root);

    expect(getComputedStyle(root).position).toBe('relative');
    const sub = root.querySelector('.ant-dropdown-menu-sub') as HTMLElement;
    expect(sub).not.toBeNull();
    // The menu-hosted placement gap is not applied to dropdown's menu vocabulary.
    expect(getComputedStyle(root).paddingLeft).toBe('0px');
    expect(Math.abs(sub.getBoundingClientRect().left - title.getBoundingClientRect().right)).toBeLessThanOrEqual(1);
  });
});
