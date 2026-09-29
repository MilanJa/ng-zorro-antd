/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ESCAPE, TAB } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { dispatchKeyboardEvent, expectMotionSettled, typeInElement } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzAutocompleteModule } from './autocomplete.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzAutocompleteModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <input id="in" nz-input [nzAutocomplete]="auto" ngModel="a" />
      <nz-autocomplete #auto [nzDataSource]="['aa', 'ab']" />
    </div>
  `
})
class TestAutocompleteComponent {}

describe('auto-complete under antd v6 css', () => {
  let fixture: ComponentFixture<TestAutocompleteComponent>;
  let overlay: OverlayContainer;
  let input: HTMLInputElement;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAutocompleteComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  function enclosingScopeClass(): string {
    return fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective).scopeClass;
  }

  it('opens a themed dropdown, positioned below the input, with v6 styling', async () => {
    input.focus();
    typeInElement('a', input);
    fixture.detectChanges();
    await fixture.whenStable();

    const dropdown = overlay.getContainerElement().querySelector('.ant-select-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();
    await expectMotionSettled(dropdown);

    // Popup scope: `autocomplete-trigger.directive.ts`'s `attachOverlay` passes `panelClass` in the
    // `createOverlayRef` `OverlayConfig`, so the scope class lands on the CDK-generated
    // `.cdk-overlay-pane` wrapper, one level above `.ant-select-dropdown` (the template's own root
    // node) -- there is no per-render class-binding hook on the pane the way
    // `cdkConnectedOverlayPanelClass` gives select. The `--ant-color-primary` custom-property read
    // right after is the proof of inheritance (the scoped override value, which only a scoped
    // ancestor can supply); default-token assertions below do not prove it on their own.
    const pane = dropdown.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(pane.className).toContain(enclosingScopeClass());
    expect(getComputedStyle(dropdown).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    const cs = getComputedStyle(dropdown);
    expect(cs.position).toBe('relative');
    expect(cs.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(cs.borderRadius).toBe('8px');

    const dropdownRect = dropdown.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    expect(dropdownRect.top).toBeGreaterThanOrEqual(inputRect.bottom - 1);

    const options = dropdown.querySelectorAll('.ant-select-item-option');
    expect(options.length).toBe(2);
    const active = dropdown.querySelector('.ant-select-item-option-active') as HTMLElement;
    expect(active).not.toBeNull();
    // optionActiveBg (controlItemBgHover); under the scoped `[nzTheme]` override this derives to
    // 0.035 rather than the documented default 0.04, since `NzThemeDirective` recomputes the full
    // neutral-fill palette from the partial token override instead of reusing the system default.
    expect(getComputedStyle(active).backgroundColor).toBe('rgba(0, 0, 0, 0.035)');
  });

  // `NzAutocompleteTriggerDirective.handleBlur` only marks the control touched -- it never calls
  // `closePanel()` (confirmed in `autocomplete-trigger.directive.ts` and by the existing
  // `autocomplete.spec.ts` blur tests, which assert only the touched state). Escape and Tab are the
  // trigger's real close paths (`handleKeydown`), so those are what removal is asserted against. The
  // panel plays an `animate.leave` exit animation (`autoCompleteAnimationLeave`); like select's own
  // "removes the dropdown after the leave motion" test, this waits past the leave transition rather
  // than re-probing the just-detached element, whose classList still holds the leave classes.
  it('removes the dropdown from the overlay container after Escape closes it', async () => {
    input.focus();
    typeInElement('a', input);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).not.toBeNull();

    dispatchKeyboardEvent(input, 'keydown', ESCAPE);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));

    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).toBeNull();
  });

  it('removes the dropdown from the overlay container after Tab closes it', async () => {
    input.focus();
    typeInElement('a', input);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).not.toBeNull();

    dispatchKeyboardEvent(input, 'keydown', TAB);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));

    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).toBeNull();
  });
});
