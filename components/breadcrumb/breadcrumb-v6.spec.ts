/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { createKeyboardEvent, dispatchEvent, expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzBreadCrumbModule } from './breadcrumb.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzBreadCrumbModule, NzDropdownModule],
  template: `
    <nz-breadcrumb id="host">
      <nz-breadcrumb-item>Home</nz-breadcrumb-item>
      <nz-breadcrumb-item><a>App</a></nz-breadcrumb-item>
      <nz-breadcrumb-item>Page</nz-breadcrumb-item>
    </nz-breadcrumb>
  `
})
class TestBreadcrumbComponent {}

@Component({
  imports: [FormsModule, NzBreadCrumbModule, NzDropdownModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-breadcrumb id="scoped">
        <nz-breadcrumb-item>Ant Design</nz-breadcrumb-item>
        <nz-breadcrumb-item id="overlayItem" [nzOverlay]="menu"><a>App</a></nz-breadcrumb-item>
      </nz-breadcrumb>
      <nz-dropdown-menu #menu="nzDropdownMenu">
        <ul nz-menu>
          <li nz-menu-item>General</li>
        </ul>
      </nz-dropdown-menu>
    </div>
  `
})
class TestBreadcrumbDropdownComponent {}

@Component({
  imports: [NzBreadCrumbModule, NzDropdownModule],
  template: `
    <nz-breadcrumb>
      <nz-breadcrumb-item>Ant Design</nz-breadcrumb-item>
      <nz-breadcrumb-item id="centred" [nzOverlay]="menu" nzOverlayPlacement="bottomCenter">
        <a>An Application</a>
      </nz-breadcrumb-item>
    </nz-breadcrumb>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>General</li>
        <li nz-menu-item>Layout</li>
      </ul>
    </nz-dropdown-menu>
  `
})
class TestBreadcrumbCentredComponent {}

describe('breadcrumb under antd v6 css', () => {
  let fixture: ComponentFixture<TestBreadcrumbComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestBreadcrumbComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders item colours, the last item colour and the separator margin at v6 token values', () => {
    const host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
    const hostCs = getComputedStyle(host);
    expect(hostCs.fontSize).toBe('14px');
    expect(hostCs.color).toBe('rgba(0, 0, 0, 0.45)');

    const items = host.querySelectorAll('nz-breadcrumb-item');
    expect(items.length).toBe(3);
    items.forEach(item => expect(item.classList.contains('ant-breadcrumb-item')).toBe(true));

    const lastItem = items[items.length - 1] as HTMLElement;
    expect(getComputedStyle(lastItem).color).toBe('rgba(0, 0, 0, 0.88)');

    const separator = host.querySelector('.ant-breadcrumb-separator') as HTMLElement;
    expect(separator).not.toBeNull();
    expect(getComputedStyle(separator).marginInline).toBe('8px');
    // antd v6 renders the separator as a flex item of its own (`<li>` in `ol { display: flex }`), so
    // the whitespace the item template puts around `/` takes no width and the box is one line tall.
    const glyph = document.createElement('span');
    glyph.textContent = '/';
    separator.parentElement!.appendChild(glyph);
    const separatorRect = separator.getBoundingClientRect();
    expect(Math.abs(separatorRect.width - glyph.getBoundingClientRect().width)).toBeLessThanOrEqual(0.5);
    expect(separatorRect.height).toBeCloseTo(22, 0);
    glyph.remove();

    // the last item's separator is hidden (`style/v6/patch.css` mirror of `style/patch.less`'s
    // `nz-breadcrumb-item:last-child .ant-breadcrumb-separator { display: none }`; antd v6 never
    // renders a trailing separator element at all).
    const lastSeparator = lastItem.querySelector('.ant-breadcrumb-separator') as HTMLElement;
    expect(lastSeparator).not.toBeNull();
    expect(getComputedStyle(lastSeparator).display).toBe('none');

    // `.ant-breadcrumb .ant-breadcrumb-item a:hover` sets `background-color` only in the `:hover`
    // state, which a synthetic event does not trigger in Chromium (see `dropdown-v6.spec.ts`'s
    // equivalent note); read the rule from the CSSOM and resolve the custom property it names.
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
          r.selectorText.split(',').some(s => s.trim() === '.ant-breadcrumb .ant-breadcrumb-item a:hover')
      );
    expect(rule).toBeDefined();
    expect((rule as CSSStyleRule).style.backgroundColor).toBe('var(--ant-color-bg-text-hover)');
    const link = host.querySelector('nz-breadcrumb-item:nth-child(2) a') as HTMLElement;
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--ant-color-bg-text-hover)';
    link.appendChild(probe);
    // `--ant-color-bg-text-hover` resolves to `rgba(0, 0, 0, 0.06)` by default (see
    // `components/core/theme/generated/test-css.ts`'s `V6_TOKENS_DEFAULT_CSS`), not the
    // `controlItemBgHover` value of `rgba(0, 0, 0, 0.04)` used elsewhere (e.g. dropdown items).
    expect(getComputedStyle(probe).backgroundColor).toBe('rgba(0, 0, 0, 0.06)');
    probe.remove();
  });
});

describe('breadcrumb overlay item under antd v6 css', () => {
  let fixture: ComponentFixture<TestBreadcrumbDropdownComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestBreadcrumbDropdownComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
  });

  // The dropdown-hosted variant wraps the overlay trigger in `nz-dropdown` (dropdown's own
  // directive, `components/dropdown/dropdown.directive.ts`) with no theme wiring of its own; the
  // default trigger is `hover` (`nzTrigger = 'hover'`), so the open state is reached with a
  // `mouseenter` dispatch, not a click, and settles after the directive's `auditTime(150)` (300 ms
  // leaves headroom for a loaded machine).
  async function waitForOpen(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function waitForClose(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('scopes the dropdown pane to the enclosing [nzTheme] and closes on Escape', async () => {
    const overlayLink = fixture.debugElement.query(By.css('#overlayItem .ant-breadcrumb-overlay-link'))
      .nativeElement as HTMLElement;
    dispatchEvent(overlayLink, new MouseEvent('mouseenter'));
    await waitForOpen();

    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);

    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    const escape = createKeyboardEvent('keydown', ESCAPE, undefined, 'Escape');
    dispatchEvent(document.body, escape);
    await waitForClose();
    expect(overlay.getContainerElement().querySelector('.ant-dropdown')).toBeNull();
  });

  it('centres the overlay under the crumb with nzOverlayPlacement="bottomCenter"', async () => {
    const centred = TestBed.createComponent(TestBreadcrumbCentredComponent);
    centred.detectChanges();
    const link = centred.debugElement.query(By.css('#centred .ant-breadcrumb-overlay-link'))
      .nativeElement as HTMLElement;
    dispatchEvent(link, new MouseEvent('mouseenter'));
    await new Promise(resolve => setTimeout(resolve, 300));
    centred.detectChanges();
    await centred.whenStable();
    centred.detectChanges();
    const root = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
    expect(root.classList).toContain('ant-dropdown-placement-bottom');
    await expectMotionSettled(root);
    const pane = root.closest('.cdk-overlay-pane')!.getBoundingClientRect();
    const trigger = link.getBoundingClientRect();
    expect(Math.abs((pane.left + pane.right) / 2 - (trigger.left + trigger.right) / 2)).toBeLessThan(1);
  });
});
