/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzImageModule } from './image.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

const DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

@Component({
  imports: [FormsModule, NzImageModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <img id="img" nz-image [nzSrc]="src" width="40" height="40" />
    </div>
  `
})
class TestImageComponent {
  src = DATA_URI;
}

describe('image preview under antd v6 css', () => {
  let fixture: ComponentFixture<TestImageComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestImageComponent);
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

  it('opens a themed preview whose enter motion settles', async () => {
    const trigger = fixture.debugElement.query(By.css('#img')).nativeElement as HTMLImageElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = overlay.getContainerElement().querySelector('.ant-image-preview') as HTMLElement;
    expect(root).not.toBeNull();
    await expectMotionSettled(root);

    // `createOverlayRef(injector, config)`'s `panelClass` (image.service.ts's `createOverlay`,
    // fed the directive's `nzThemeScopeClasses()`) lands on the CDK-generated `.cdk-overlay-pane`
    // wrapper, one level above the template's own `.ant-image-preview-root`/`.ant-image-preview`;
    // the preview root inherits the scope's CSS custom properties from that ancestor.
    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/\bnz-theme-\d+\b/);
    expect(pane.className).toContain(enclosingScopeClass());
    expect(getComputedStyle(root).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

    // colorBgMask default token, read from the v6 CSS rather than hard-coded.
    const mask = root.querySelector('.ant-image-preview-mask') as HTMLElement;
    expect(mask).not.toBeNull();
    expect(getComputedStyle(mask).backgroundColor).toBe('rgba(0, 0, 0, 0.45)');

    const footer = root.querySelector('.ant-image-preview-footer') as HTMLElement;
    expect(footer).not.toBeNull();
    expect(getComputedStyle(footer).display).toBe('flex');

    const actions = root.querySelectorAll('.ant-image-preview-actions-action');
    expect(actions.length).toBe(6);
    // `--ant-image-preview-operation-size` (fontSize) and `--ant-padding-sm` (padding), the v6
    // action button's own tokens, read as their resolved `getComputedStyle` values.
    const action = actions[0] as HTMLElement;
    expect(getComputedStyle(action).fontSize).toBe('18px');
    expect(getComputedStyle(action).padding).toBe('12px');
  });

  it('removes the preview after the close button is clicked and the fade leave animation ends', async () => {
    const trigger = fixture.debugElement.query(By.css('#img')).nativeElement as HTMLImageElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = overlay.getContainerElement().querySelector('.ant-image-preview') as HTMLElement;
    await expectMotionSettled(root);

    const close = root.querySelector('.ant-image-preview-close') as HTMLElement;
    expect(close).not.toBeNull();
    close.click();
    fixture.detectChanges();

    // `NzImagePreviewRef.close()` removes the overlay once the v4 `antFadeOut` keyframe
    // animation (`ant-image-preview-fade-motion-leave`, 0.3s -- image-preview-ref.ts) fires its
    // `animationend` on the component's HOST (`.ant-image-preview-root`, not the inner
    // `.ant-image-preview`); the test environment does not run the real keyframe, so the event
    // is dispatched the same way image.spec.ts's own close test does.
    const previewRoot = overlay.getContainerElement().querySelector('.ant-image-preview-root') as HTMLElement;
    previewRoot.dispatchEvent(new AnimationEvent('animationend', { animationName: 'antFadeOut' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(overlay.getContainerElement().querySelector('.ant-image-preview-root')).toBeNull();
  });

  it('does not scope the pane when the trigger is outside any [nzTheme]', async () => {
    @Component({
      imports: [NzImageModule],
      template: `<img id="img2" nz-image [nzSrc]="src" width="40" height="40" />`
    })
    class UnscopedTestComponent {
      src = DATA_URI;
    }

    const unscopedFixture = TestBed.createComponent(UnscopedTestComponent);
    unscopedFixture.detectChanges();
    const trigger = unscopedFixture.debugElement.query(By.css('#img2')).nativeElement as HTMLImageElement;
    trigger.click();
    unscopedFixture.detectChanges();
    await unscopedFixture.whenStable();

    const root = overlay.getContainerElement().querySelector('.ant-image-preview') as HTMLElement;
    const pane = root.closest('.cdk-overlay-pane') as HTMLElement;
    expect(pane.className).not.toMatch(/\bnz-theme-\d+\b/);
  });
});
