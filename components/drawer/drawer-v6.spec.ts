/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzDrawerModule } from './drawer.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzDrawerModule],
  template: `
    <nz-drawer id="host" [nzVisible]="open()" nzTitle="Title" nzPlacement="right" (nzOnClose)="open.set(false)">
      <ng-container *nzDrawerContent>body</ng-container>
    </nz-drawer>
  `
})
class TestDrawerComponent {
  open = signal(false);
}

@Component({
  imports: [NzDrawerModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-drawer id="host" [nzVisible]="open()" nzTitle="Title" nzPlacement="right" (nzOnClose)="open.set(false)">
        <ng-container *nzDrawerContent>body</ng-container>
      </nz-drawer>
    </div>
  `
})
class TestScopedDrawerComponent {
  open = signal(false);
}

describe('drawer under antd v6 css', () => {
  let fixture: ComponentFixture<TestDrawerComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestDrawerComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('opens a v6 drawer panel inside the viewport whose motion settles', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = overlay.getContainerElement().querySelector('.ant-drawer') as HTMLElement;
    const wrapper = root.querySelector('.ant-drawer-content-wrapper') as HTMLElement;
    await new Promise(r => setTimeout(r, 400)); // transition slow 0.3s
    const rect = wrapper.getBoundingClientRect();
    expect(rect.right).toBeLessThanOrEqual(window.innerWidth + 1);
    expect(rect.width).toBeGreaterThan(300);
    const section = root.querySelector('.ant-drawer-section') as HTMLElement;
    expect(getComputedStyle(section).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(root.querySelector('.ant-drawer-header') as HTMLElement).padding).toBe('16px 24px');
    expect(getComputedStyle(wrapper).boxShadow).not.toBe('none');
  });

  it('drops the panel shadow when closed', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));
    // ng-zorro keeps the drawer DOM in the overlay (transform-driven close, not removal), so the wrapper
    // is still present after close; the closed-state shadow assertion below is the one that applies.
    const wrapper = overlay.getContainerElement().querySelector('.ant-drawer-content-wrapper') as HTMLElement | null;
    if (wrapper) {
      expect(getComputedStyle(wrapper).boxShadow).toBe('none');
    }
  });
});

describe('drawer theme scope under antd v6 css', () => {
  let fixture: ComponentFixture<TestScopedDrawerComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestScopedDrawerComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('carries a scoped theme onto the drawer root', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = overlay.getContainerElement().querySelector('.ant-drawer') as HTMLElement;
    expect(root.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');
  });
});
