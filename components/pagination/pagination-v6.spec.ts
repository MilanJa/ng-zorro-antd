/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzPaginationModule } from './pagination.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzPaginationModule],
  template: `<nz-pagination id="host" [nzPageIndex]="2" [nzTotal]="50" nzShowSizeChanger />`
})
class TestPaginationComponent {}

@Component({
  imports: [FormsModule, NzPaginationModule],
  template: `<nz-pagination id="host" nzSize="small" [nzPageIndex]="2" [nzTotal]="50" />`
})
class SmallPaginationComponent {}

@Component({
  imports: [FormsModule, NzPaginationModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-pagination id="host" [nzPageIndex]="2" [nzTotal]="500" nzShowSizeChanger />
    </div>
  `
})
class ScopedPaginationComponent {}

describe('pagination under antd v6 css', () => {
  let fixture: ComponentFixture<TestPaginationComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestPaginationComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders v6 pager items with the active item outlined in the primary colour', () => {
    const items = document.querySelectorAll('#host .ant-pagination-item');
    expect(items.length).toBe(5);
    const active = document.querySelector('#host .ant-pagination-item-active') as HTMLElement;
    const cs = getComputedStyle(active);
    expect(cs.height).toBe('32px'); // itemSize = controlHeight
    expect(cs.borderRadius).toBe('6px');
    expect(cs.borderColor).toBe('rgb(22, 119, 255)');
    expect(cs.backgroundColor).toBe('rgb(255, 255, 255)'); // itemActiveBg = colorBgContainer
    const prev = document.querySelector('#host .ant-pagination-prev .ant-pagination-item-link') as HTMLElement;
    expect(getComputedStyle(prev).borderRadius).toBe('6px');
  });
});

describe('small pagination under antd v6 css', () => {
  let fixture: ComponentFixture<SmallPaginationComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(SmallPaginationComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the small size with the v6 controlHeightSM item height', () => {
    const host = document.getElementById('host') as HTMLElement;
    expect(host.classList.contains('ant-pagination-small')).toBe(true);
    const active = document.querySelector('#host .ant-pagination-item-active') as HTMLElement;
    expect(getComputedStyle(active).height).toBe('24px'); // controlHeightSM
  });
});

describe('pagination size changer dropdown under antd v6 css', () => {
  let fixture: ComponentFixture<ScopedPaginationComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ScopedPaginationComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('opens a dropdown that carries the enclosing theme scope, positioned below the selector', async () => {
    const selector = document.querySelector('#host .ant-pagination-options .ant-select-selector') as HTMLElement;
    expect(selector).not.toBeNull();
    selector.click();
    fixture.detectChanges();
    await fixture.whenStable();
    // CDK's FlexibleConnectedPositionStrategy queues the pane's initial position/offset
    // calculation on a macrotask after attach; this flushes it before the pane is queried.
    await new Promise(resolve => setTimeout(resolve, 0));

    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);

    const dropdown = pane.querySelector('.ant-select-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();
    await expectMotionSettled(dropdown);
    // .ant-select-item's background-color transition (`var(--ant-motion-duration-slow)`, 0.3s by
    // default) can still be interpolating right after the enter motion settles; wait past it
    // before reading any colour off the pane.
    await new Promise(resolve => setTimeout(resolve, 350));

    expect(getComputedStyle(dropdown).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    const selectorRect = selector.getBoundingClientRect();
    const paneRect = pane.getBoundingClientRect();
    expect(paneRect.top).toBeGreaterThanOrEqual(selectorRect.bottom - 1);

    selector.click();
    fixture.detectChanges();
    await fixture.whenStable();
    // Past the select dropdown's slideUpOut leave animation (rc-motion's default
    // `--ant-motion-duration-mid`, 0.2s) so the pane is fully detached before asserting it's gone.
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).toBeNull();
  });
});

@Component({
  imports: [FormsModule, NzPaginationModule],
  template: `
    <nz-pagination id="large" nzSize="large" [nzPageIndex]="2" [nzTotal]="50" nzShowSizeChanger nzShowQuickJumper />
  `
})
class LargePaginationComponent {}

@Component({
  imports: [FormsModule, NzPaginationModule],
  template: `
    <nz-pagination id="filled" nzVariant="filled" [nzTotal]="50" nzShowQuickJumper />
    <nz-pagination id="underlined" nzVariant="underlined" [nzTotal]="50" nzShowQuickJumper />
    <nz-pagination id="simple-filled" nzVariant="filled" nzSimple [nzTotal]="50" />
  `
})
class VariantPaginationComponent {}

describe('large pagination under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes the pagers and the size changer together', async () => {
    const fixture = TestBed.createComponent(LargePaginationComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const host = document.getElementById('large') as HTMLElement;
    expect(host.classList).toContain('ant-pagination-large');
    const active = host.querySelector('.ant-pagination-item-active') as HTMLElement;
    expect(getComputedStyle(active).height).toBe('40px'); // itemSizeLG
    const select = host.querySelector('nz-select') as HTMLElement;
    expect(select.classList).toContain('ant-select-lg');
    expect(select.getBoundingClientRect().height).toBeCloseTo(40, 0); // controlHeightLG
  });
});

describe('pagination nzVariant under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    TestBed.createComponent(VariantPaginationComponent).detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('fills the quick-jumper and simple-pager inputs', () => {
    const jumper = getComputedStyle(document.querySelector('#filled .ant-pagination-options-quick-jumper input')!);
    expect(jumper.backgroundColor).toBe('rgba(0, 0, 0, 0.04)'); // colorFillTertiary
    expect(jumper.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    const simple = getComputedStyle(document.querySelector('#simple-filled .ant-pagination-simple-pager input')!);
    expect(simple.backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
  });

  it('underlines the quick-jumper input', () => {
    const jumper = getComputedStyle(document.querySelector('#underlined .ant-pagination-options-quick-jumper input')!);
    // `border-width: lineWidth 0; border-style: solid none`: only the bottom edge is coloured, the top edge
    // keeps its width but is transparent, and the sides draw nothing.
    expect(jumper.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(jumper.borderBottomWidth).toBe('1px');
    expect(jumper.borderBottomColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(jumper.borderLeftWidth).toBe('0px');
    expect(jumper.borderRadius).toBe('0px');
  });
});
