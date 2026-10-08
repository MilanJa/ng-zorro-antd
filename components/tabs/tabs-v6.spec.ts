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

import { NzTabsModule } from './tabs.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs id="host" [nzSelectedIndex]="idx()" [nzType]="type()">
      <nz-tab nzTitle="Tab 1"><p>one</p></nz-tab>
      <nz-tab nzTitle="Tab 2"><p>two</p></nz-tab>
    </nz-tabs>
  `
})
class TestTabsComponent {
  idx = signal(0);
  type = signal<'line' | 'card'>('line');
}

@Component({
  imports: [NzTabsModule, FormsModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }" style="width: 300px">
      <nz-tabs id="overflow-host" style="width: 300px" [(nzSelectedIndex)]="idx">
        @for (tab of tabs; track tab) {
          <nz-tab [nzTitle]="tab"
            ><p>{{ tab }}</p></nz-tab
          >
        }
      </nz-tabs>
    </div>
  `
})
class TestOverflowTabsComponent {
  tabs = Array.from({ length: 30 }, (_, i) => `Tab ${i}`);
  idx = 0;
}

describe('tabs under antd v6 css', () => {
  let fixture: ComponentFixture<TestTabsComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTabsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes the tab per the horizontal item padding/font-size tokens', () => {
    const tab = fixture.nativeElement.querySelector('.ant-tabs-tab') as HTMLElement;
    const style = getComputedStyle(tab);
    expect(style.padding).toBe('12px 0px');
    expect(style.fontSize).toBe('14px');
  });

  it('colours the active tab button and ink bar from the primary token', async () => {
    const activeBtn = fixture.nativeElement.querySelector('.ant-tabs-tab-active .ant-tabs-tab-btn') as HTMLElement;
    const activeStyle = getComputedStyle(activeBtn);
    expect(activeStyle.color).toBe('rgb(22, 119, 255)');

    const inkBar = fixture.nativeElement.querySelector('.ant-tabs-ink-bar') as HTMLElement;
    const inkBarStyle = getComputedStyle(inkBar);
    expect(inkBarStyle.height).toBe('2px');
    expect(inkBarStyle.backgroundColor).toBe('rgb(22, 119, 255)');

    const nav = fixture.nativeElement.querySelector('.ant-tabs-nav') as HTMLElement;
    expect(getComputedStyle(nav).marginBottom).toBe('16px');

    const inkBarLeftBefore = inkBar.getBoundingClientRect().left;
    fixture.componentInstance.idx.set(1);
    fixture.detectChanges();
    // `ant-tabs-ink-bar-animated`'s `transition: width .3s, left .3s` (`style/v6/patch.css`-free,
    // styled directly by the generated v6 CSS); wait past it before reading the settled position.
    await new Promise(r => setTimeout(r, 350));
    fixture.detectChanges();
    const inkBarLeftAfter = inkBar.getBoundingClientRect().left;
    expect(inkBarLeftAfter).toBeGreaterThan(inkBarLeftBefore);

    const panes = fixture.nativeElement.querySelectorAll('.ant-tabs-tabpane, [role="tabpanel"]');
    const secondPane = panes[1] as HTMLElement;
    expect(secondPane.classList.contains('ant-tabs-tabpane-active')).toBe(true);
    expect(secondPane.classList.contains('ant-tabs-content-active')).toBe(true);
  });

  it('colours card tabs from the card background tokens', () => {
    fixture.componentInstance.type.set('card');
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('.ant-tabs-tab') as NodeListOf<HTMLElement>;
    expect(getComputedStyle(tabs[0]).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(tabs[1]).backgroundColor).toBe('rgba(0, 0, 0, 0.02)');
    expect(getComputedStyle(tabs[0]).borderRadius).toBe('8px 8px 0px 0px');
  });
});

describe('tabs overflow dropdown under antd v6 css', () => {
  let fixture: ComponentFixture<TestOverflowTabsComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestOverflowTabsComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('opens a theme-scoped dropdown pane with the tabs dropdown menu items', async () => {
    fixture.detectChanges();
    // The nav bar measures overflow via `NzResizeObserver` after `ngAfterViewInit`'s
    // `requestAnimationFrame(realign)`, `auditTime(16, …)`-debounced; `whenStable` alone does not
    // wait for either.
    await new Promise(r => setTimeout(r, 300));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const moreButton = fixture.nativeElement.querySelector('.ant-tabs-nav-more') as HTMLElement;
    expect(moreButton).not.toBeNull();
    // `nz-dropdown`'s default trigger is `hover` (`dropdown.directive.ts`'s `nzTrigger`), not
    // `click`; the nav-more button never overrides it, so opening it means a real `mouseenter`,
    // debounced by the directive's own `auditTime(150)`.
    moreButton.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 200));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const pane = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(pane).not.toBeNull();
    await expectMotionSettled(pane);

    // `createOverlayRef(..., { panelClass })` puts the scope class on `.cdk-overlay-pane`, the
    // overlay-host element wrapping the popup root; the popup root inside inherits the CSS
    // custom properties from it.
    const overlayPane = pane.closest('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPane).not.toBeNull();
    expect(overlayPane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(pane).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    const items = overlay.getContainerElement().querySelectorAll('.ant-tabs-dropdown-menu-item');
    expect(items.length).toBeGreaterThan(0);
  });
});

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs id="icon-host">
      <nz-tab nzTitle="Tab 1" nzIcon="apple"><p>one</p></nz-tab>
    </nz-tabs>
  `
})
class TestTabsIconV6Component {}

describe('tabs nzIcon under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    TestBed.createComponent(TestTabsIconV6Component).detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('separates the icon slot from the label by marginSM', () => {
    const icon = document.querySelector('#icon-host .ant-tabs-tab-icon') as HTMLElement;
    const label = icon.nextElementSibling as HTMLElement;
    expect(getComputedStyle(icon).marginRight).toBe('12px'); // marginSM
    expect(Math.round(label.getBoundingClientRect().left - icon.getBoundingClientRect().right)).toBe(12);
  });
});
