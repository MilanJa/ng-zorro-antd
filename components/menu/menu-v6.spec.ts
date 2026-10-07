/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
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
  imports: [NzMenuModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <ul id="horizontalScoped" nz-menu nzMode="horizontal">
        <li nz-submenu nzTitle="Navigation Three" nzIcon="setting">
          <ul>
            <li nz-menu-item>Option 1</li>
            <li nz-menu-item>Option 2</li>
          </ul>
        </li>
      </ul>
    </div>
  `
})
class TestScopedHorizontalComponent {}

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

@Component({
  imports: [NzMenuModule, NzDropdownModule],
  template: `
    <ul id="v6inline" nz-menu nzMode="inline" style="width: 256px" [nzDisabled]="disabled()">
      <li id="extraItem" nz-menu-item nzExtra="⌘P">Option 2</li>
      <li id="slotItem" nz-menu-item nzIcon="user">Profile</li>
      <li nz-menu-divider id="dashed" nzDashed></li>
      <li nz-submenu id="disabledSub" nzTitle="Navigation"
        ><ul
          ><li nz-menu-item>Nested</li></ul
        ></li
      >
    </ul>
    <ul id="v6collapsed" nz-menu nzMode="inline" nzInlineCollapsed>
      <li id="cSlot" nz-menu-item nzIcon="mail">Navigation One</li>
      <li id="cPlain" nz-menu-item>Settings</li>
    </ul>
    <button id="ddExtraTrigger" nz-dropdown [nzDropdownMenu]="ddExtra" nzTrigger="click">Menu</button>
    <nz-dropdown-menu #ddExtra="nzDropdownMenu">
      <ul nz-menu style="width: 200px"
        ><li nz-menu-item nzIcon="user" nzExtra="⌘U">Users</li></ul
      >
    </nz-dropdown-menu>
  `
})
class TestMenuV6InputsComponent {
  readonly disabled = signal(false);
}

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

  it('opens a themed horizontal submenu popup below its title with the v6 gap', async () => {
    const fixture = TestBed.createComponent(TestScopedHorizontalComponent);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#horizontalScoped .ant-menu-submenu-title') as HTMLElement;

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
    expect(getComputedStyle(root).position).toBe('relative');

    // antd v6 (`bottomLeft`): the popup root starts at the title's bottom edge and its
    // `padding-top: paddingXS` (8px) is the gap above the list.
    const sub = root.querySelector('.ant-menu-sub') as HTMLElement;
    const titleRect = title.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    expect(Math.abs(rootRect.top - titleRect.bottom)).toBeLessThanOrEqual(1);
    expect(Math.abs(rootRect.left - titleRect.left)).toBeLessThanOrEqual(1);
    expect(getComputedStyle(root).paddingTop).toBe('8px');
    expect(Math.round(sub.getBoundingClientRect().top - titleRect.bottom)).toBe(8);
    expect(getComputedStyle(sub).backgroundColor).toBe('rgb(255, 255, 255)');
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
    // dropdown's own `auditTime(150)` before it attaches its overlay, with headroom for a loaded machine.
    await settle(fixture, 300);
    const title = overlay.getContainerElement().querySelector('.ant-dropdown-menu-submenu-title') as HTMLElement;
    expect(title).not.toBeNull();

    dispatchFakeEvent(title, 'mouseenter');
    await settle(fixture, 300);
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

  it('lays out nzExtra, the icon slot, the dashed divider and the root nzDisabled with v6 tokens', async () => {
    const fixture = TestBed.createComponent(TestMenuV6InputsComponent);
    fixture.detectChanges();
    await settle(fixture, 0);
    const el = fixture.nativeElement as HTMLElement;
    const content = el.querySelector('#extraItem .ant-menu-title-content') as HTMLElement;
    const extra = el.querySelector('#extraItem .ant-menu-item-extra') as HTMLElement;
    // v6 sets `.ant-menu .ant-menu-title-content-with-extra { display: inline-flex }`, but in inline
    // mode the title content is also a flex item of its `.ant-menu-item` (`flex: auto` from
    // `.ant-menu-inline.ant-menu-root .ant-menu-item > .ant-menu-title-content`), so Chromium
    // blockifies the specified `inline-flex` to the used value `flex` for `getComputedStyle`.
    expect(getComputedStyle(content).display).toBe('flex');
    expect(getComputedStyle(el.querySelector('#extraItem .ant-menu-item-label')!).textOverflow).toBe('ellipsis');
    expect([getComputedStyle(extra).paddingInlineStart, getComputedStyle(extra).color]).toEqual([
      '16px',
      'rgba(0, 0, 0, 0.45)'
    ]);
    // `margin-inline-start: auto` pushes the extra to the end of the title content.
    expect(Math.abs(extra.getBoundingClientRect().right - content.getBoundingClientRect().right)).toBeLessThanOrEqual(
      1
    );
    const slot = el.querySelector('#slotItem > .ant-menu-item-icon') as HTMLElement;
    // Same blockification: the icon is a flex item of its `.ant-menu-item` (the item's own
    // `display: flex` from `.ant-menu-inline.ant-menu-root .ant-menu-item > *`).
    expect([getComputedStyle(slot).display, getComputedStyle(slot).fontSize]).toEqual(['flex', '14px']);
    expect(getComputedStyle(slot.nextElementSibling!).marginInlineStart).toBe('10px');
    expect(getComputedStyle(el.querySelector('#dashed')!).borderTopStyle).toBe('dashed');
    fixture.componentInstance.disabled.set(true);
    await settle(fixture, 0);
    for (const sel of ['#extraItem', '#disabledSub > .ant-menu-submenu-title']) {
      const cs = getComputedStyle(el.querySelector(sel)!);
      expect([cs.color, cs.cursor], sel).toEqual(['rgba(0, 0, 0, 0.25)', 'not-allowed']);
    }
  });

  it('keeps the slot icon and the first letter visible while collapsed and opens the v6 title tooltip', async () => {
    const fixture = TestBed.createComponent(TestMenuV6InputsComponent);
    fixture.detectChanges();
    await settle(fixture, 0);
    const el = fixture.nativeElement as HTMLElement;
    const item = el.querySelector('#cSlot') as HTMLElement;
    const iconRect = item.querySelector(':scope > .ant-menu-item-icon')!.getBoundingClientRect();
    expect([iconRect.width, iconRect.height]).toEqual([16, 16]);
    expect([
      Math.round(iconRect.left - item.getBoundingClientRect().left),
      Math.round(iconRect.top - item.getBoundingClientRect().top)
    ]).toEqual([28, 12]);
    const hidden = getComputedStyle(item.querySelector('.ant-menu-title-content')!);
    expect([hidden.opacity, hidden.width]).toEqual(['0', '0px']);
    const plain = el.querySelector('#cPlain') as HTMLElement;
    const letter = plain.querySelector(':scope > .ant-menu-inline-collapsed-noicon') as HTMLElement;
    expect([letter.textContent, getComputedStyle(letter).fontSize, getComputedStyle(letter).textAlign]).toEqual([
      'S',
      '16px',
      'center'
    ]);
    expect(letter.getBoundingClientRect().width).toBeGreaterThan(0);
    dispatchFakeEvent(plain, 'mouseenter');
    await settle(fixture, 50); // the tooltip positions itself in a microtask after show()
    const tip = overlay
      .getContainerElement()
      .querySelector('.ant-tooltip.ant-menu-inline-collapsed-tooltip') as HTMLElement;
    await expectMotionSettled(tip);
    expect([getComputedStyle(tip).pointerEvents, tip.textContent!.trim()]).toEqual(['none', 'Settings']);
    expect(tip.getBoundingClientRect().left).toBeGreaterThanOrEqual(plain.getBoundingClientRect().right - 1);
  });

  it('lays out a dropdown-hosted item extra and icon with the dropdown v6 tokens', async () => {
    const fixture = TestBed.createComponent(TestMenuV6InputsComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('#ddExtraTrigger') as HTMLElement).click();
    await settle(fixture, 300); // dropdown's own auditTime(150) before it attaches its overlay
    const item = overlay.getContainerElement().querySelector('.ant-dropdown-menu-item') as HTMLElement;
    const icon = getComputedStyle(item.querySelector('.ant-dropdown-menu-item-icon')!);
    const extra = getComputedStyle(item.querySelector('.ant-dropdown-menu-item-extra')!);
    expect([icon.fontSize, icon.marginInlineEnd]).toEqual(['12px', '8px']);
    // Same blockification as the plain-menu case: the dropdown item is itself `display: flex`
    // (dropdown's `style/v6/patch.css`), so the title content's own `inline-flex` is used as `flex`.
    expect(getComputedStyle(item.querySelector('.ant-menu-title-content')!).display).toBe('flex');
    expect([extra.fontSize, extra.color]).toEqual(['12px', 'rgba(0, 0, 0, 0.45)']);
  });
});
