/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { dispatchKeyboardEvent, typeInElement } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzMentionModule } from './mention.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzMentionModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-mention id="host" [nzSuggestions]="['a', 'b']">
        <textarea rows="1" nzMentionTrigger ngModel="@"></textarea>
      </nz-mention>
    </div>
  `
})
class TestMentionComponent {}

describe('mention under antd v6 css', () => {
  let fixture: ComponentFixture<TestMentionComponent>;
  let overlay: OverlayContainer;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestMentionComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
    textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  function enclosingScopeClass(): string {
    return fixture.debugElement.query(By.directive(NzThemeDirective)).injector.get(NzThemeDirective).scopeClass;
  }

  it('opens a themed dropdown, positioned below the textarea, with v6 styling', async () => {
    typeInElement('@', textarea);
    fixture.detectChanges();
    await fixture.whenStable();

    const dropdown = overlay.getContainerElement().querySelector('.ant-mentions-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();

    // Popup scope: the overlay is created with `createOverlayRef(injector, config)`, so `panelClass` in
    // the `OverlayConfig` (mention.component.ts's `attachOverlay`) lands on the CDK-generated
    // `.cdk-overlay-pane` wrapper, not on `.ant-mentions-dropdown` itself (the template's own root node,
    // one level below the pane) — there is no per-render class-binding hook on the pane the way
    // `cdkConnectedOverlayPanelClass` gives select. The `backgroundColor`/`borderRadius` assertions below
    // are default-token values that would pass even if the scope never reached the dropdown at all, so
    // they are NOT proof of inheritance; the `--ant-color-primary` custom-property read right after is —
    // it is the scoped override value (`#00b96b`), which only a scoped ancestor can supply. v6's own
    // mention-dropdown CSS never keys any rule off `colorPrimary` (the active/selected item's
    // `.ant-mentions-dropdown-menu-item-active`/`-selected` both use `--ant-control-item-bg-hover`, i.e.
    // `colorFillTertiary`, not a primary-derived token — checked in `antd/es/theme/util/alias.js` and the
    // generated CSS), so there is no visible-effect assertion to add on top of the custom-property read.
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
    const textareaRect = textarea.getBoundingClientRect();
    expect(dropdownRect.top).toBeGreaterThanOrEqual(textareaRect.bottom - 1);

    const root = document.getElementById('host')!;
    expect(root.classList.contains('ant-mentions-outlined')).toBe(true);
    // Blur first: `.ant-mentions-outlined:focus-within` recolours the border while the textarea has
    // focus (`typeInElement` focuses it), and `border-color` transitions over `--ant-motion-duration-mid`
    // (0.2s); wait for that transition to settle before reading the resting, unfocused border colour.
    textarea.blur();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 250));
    expect(getComputedStyle(root).borderColor).toBe('rgb(217, 217, 217)');
  });

  it('removes the dropdown from the overlay container after Escape closes it', async () => {
    typeInElement('@', textarea);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.getContainerElement().querySelector('.ant-mentions-dropdown')).not.toBeNull();

    dispatchKeyboardEvent(textarea, 'keydown', 27 /* ESCAPE */);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlay.getContainerElement().querySelector('.ant-mentions-dropdown')).toBeNull();
  });
});
