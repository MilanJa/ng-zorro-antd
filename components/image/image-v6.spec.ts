/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzImageModule } from './image.module';
import { NzImagePreviewActionsContext } from './typings';

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

    // The mask is a sibling of `.ant-image-preview-wrap`, both children of `.ant-image-preview-root`
    // (the v4 DOM position), not nested inside `.ant-image-preview` (`root`).
    const previewRoot = root.closest('.ant-image-preview-root') as HTMLElement;
    expect(previewRoot).not.toBeNull();
    const mask = previewRoot.querySelector('.ant-image-preview-mask') as HTMLElement;
    expect(mask).not.toBeNull();
    // colorBgMask default token, read from the v6 CSS rather than hard-coded.
    expect(getComputedStyle(mask).backgroundColor).toBe('rgba(0, 0, 0, 0.45)');
    expect(getComputedStyle(mask).position).toBe('fixed');
    expect(getComputedStyle(mask).zIndex).toBe(getComputedStyle(root).zIndex);

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

@Component({
  imports: [NzImageModule],
  template: `
    <nz-image-group>
      <img id="g1" nz-image [nzSrc]="src" width="40" height="40" />
      <img nz-image [nzSrc]="src" width="40" height="40" />
    </nz-image-group>
  `
})
class TestImageGroupOrderComponent {
  src = DATA_URI;
}

function readToolbarOrder(overlay: OverlayContainer): string[] {
  return Array.from(overlay.getContainerElement().querySelectorAll<HTMLElement>('.ant-image-preview-actions > li'))
    .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
    .map(
      li =>
        /ant-image-preview-actions-action-(\w+)/.exec(li.className)?.[1] ??
        (li.classList.contains('ant-image-preview-close')
          ? 'close'
          : li.classList.contains('ant-image-preview-operations-progress')
            ? 'progress'
            : 'other')
    );
}

describe('image preview toolbar order under antd v6 css', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('reads the actions left to right in antd order, close at the trailing end', async () => {
    const fixture = TestBed.createComponent(TestImageComponent);
    fixture.detectChanges();
    (fixture.debugElement.query(By.css('#img')).nativeElement as HTMLImageElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(readToolbarOrder(overlay)).toEqual([
      'flipY',
      'flipX',
      'rotateLeft',
      'rotateRight',
      'zoomOut',
      'zoomIn',
      'close'
    ]);
  });

  it('keeps the group progress counter at the leading end', async () => {
    const fixture: ComponentFixture<TestImageGroupOrderComponent> =
      TestBed.createComponent(TestImageGroupOrderComponent);
    fixture.detectChanges();
    (fixture.debugElement.query(By.css('#g1')).nativeElement as HTMLImageElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(readToolbarOrder(overlay)).toEqual([
      'progress',
      'flipY',
      'flipX',
      'rotateLeft',
      'rotateRight',
      'zoomOut',
      'zoomIn',
      'close'
    ]);

    const progress = overlay
      .getContainerElement()
      .querySelector<HTMLElement>('.ant-image-preview-operations-progress')!;
    expect(getComputedStyle(progress).whiteSpace).toBe('nowrap');
  });

  it('places the switches at the viewport sides, clear of the toolbar', async () => {
    const fixture = TestBed.createComponent(TestImageGroupOrderComponent);
    fixture.detectChanges();
    (fixture.debugElement.query(By.css('#g1')).nativeElement as HTMLImageElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = overlay.getContainerElement();
    const next = root.querySelector<HTMLElement>('.ant-image-preview-switch-next')!.getBoundingClientRect();
    const closeBox = root.querySelector<HTMLElement>('.ant-image-preview-close')!.getBoundingClientRect();
    const intersects =
      next.left < closeBox.right &&
      next.right > closeBox.left &&
      next.top < closeBox.bottom &&
      next.bottom > closeBox.top;
    expect(intersects).toBe(false);
    expect(Math.abs((next.top + next.bottom) / 2 - window.innerHeight / 2)).toBeLessThanOrEqual(2);
    expect(window.innerWidth - next.right).toBeLessThan(window.innerWidth / 4);
  });
});

const VALID_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

@Component({
  imports: [NzImageModule],
  template: `
    <img id="slot" nz-image [nzSrc]="src" width="40" height="40" [nzActionsRender]="actionsRender()" />
    <ng-template #tpl let-actions="actions">
      <button type="button" class="custom-zoom-in" (click)="actions.onZoomIn()">in</button>
    </ng-template>
  `
})
class TestImageActionsRenderV6Component {
  src = VALID_GIF;
  readonly tpl = viewChild.required<TemplateRef<NzImagePreviewActionsContext>>('tpl');
  readonly actionsRender = signal<TemplateRef<NzImagePreviewActionsContext> | null | undefined>(undefined);
}

describe('image preview render slots under antd v6 css', () => {
  let fixture: ComponentFixture<TestImageActionsRenderV6Component>;
  let overlay: OverlayContainer;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestImageActionsRenderV6Component);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  async function openPreview(): Promise<HTMLElement> {
    fixture.detectChanges();
    await fixture.whenStable();
    (fixture.debugElement.query(By.css('#slot')).nativeElement as HTMLImageElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return overlay.getContainerElement().querySelector('.ant-image-preview-footer') as HTMLElement;
  }

  it('lays a custom actions template out inside the pill, before the trailing close control', async () => {
    fixture.componentInstance.actionsRender.set(fixture.componentInstance.tpl());
    const footer = await openPreview();
    const pill = footer.querySelector('.ant-image-preview-actions') as HTMLElement;
    expect(getComputedStyle(pill).backgroundColor).toBe('rgba(0, 0, 0, 0.1)');
    const button = pill.querySelector('.custom-zoom-in') as HTMLElement;
    const p = pill.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    expect(b.left >= p.left && b.right <= p.right && b.top >= p.top && b.bottom <= p.bottom).toBe(true);
    const close = pill.querySelector('.ant-image-preview-close') as HTMLElement;
    expect(close.getBoundingClientRect().left).toBeGreaterThan(b.left);
  });

  it('draws no pill for nzActionsRender null and keeps the close control visible', async () => {
    fixture.componentInstance.actionsRender.set(null);
    const footer = await openPreview();
    const list = footer.querySelector(':scope > ul') as HTMLElement;
    expect(footer.querySelector('.ant-image-preview-actions')).toBeNull();
    expect(getComputedStyle(list).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    const close = list.querySelector('.ant-image-preview-close') as HTMLElement;
    expect(close.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(close.getBoundingClientRect().height).toBeGreaterThan(0);
  });
});

@Component({
  imports: [NzImageModule],
  template: `
    <nz-image-wrapper id="center" [nzSrc]="src" [nzWidth]="100" [nzHeight]="100" />
    <nz-image-wrapper
      id="top"
      [nzSrc]="src"
      [nzWidth]="100"
      [nzHeight]="100"
      nzPreviewCover="top"
      nzPreviewCoverPlacement="top"
    />
    <nz-image-wrapper
      id="bottom"
      [nzSrc]="src"
      [nzWidth]="100"
      [nzHeight]="100"
      nzPreviewCover="bottom"
      nzPreviewCoverPlacement="bottom"
    />
    <nz-image-wrapper id="ph" [nzSrc]="src" [nzWidth]="100" [nzHeight]="100" [nzPlaceholder]="true" />
  `
})
class TestImageWrapperV6Component {
  src = DATA_URI;
}

describe('nz-image-wrapper under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => style.remove());

  it("lays out the wrapper, the image and the cover with antd's rules", async () => {
    const fixture = TestBed.createComponent(TestImageWrapperV6Component);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const byId = (id: string): HTMLElement => (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)!;
    const coverIn = (host: HTMLElement): HTMLElement => host.querySelector(':scope > .ant-image-cover')!;

    const center = byId('center');
    expect(getComputedStyle(center).position).toBe('relative');
    expect(getComputedStyle(center).display).toBe('inline-block');
    const box = center.getBoundingClientRect();
    expect(box.width).toBe(100);
    expect(box.height).toBe(100);
    expect(center.querySelector('img')!.getBoundingClientRect().width).toBe(100);

    const cover = coverIn(center);
    const coverStyle = getComputedStyle(cover);
    expect(coverStyle.position).toBe('absolute');
    expect(coverStyle.opacity).toBe('0');
    expect(coverStyle.backgroundColor).toBe('rgba(0, 0, 0, 0.3)');
    expect(coverStyle.color).toBe('rgb(255, 255, 255)');
    const coverBox = cover.getBoundingClientRect();
    expect([coverBox.left, coverBox.top, coverBox.width, coverBox.height]).toEqual([
      box.left,
      box.top,
      box.width,
      box.height
    ]);

    const top = byId('top');
    const topCover = coverIn(top).getBoundingClientRect();
    expect(topCover.top).toBe(top.getBoundingClientRect().top);
    expect(topCover.height).toBeLessThan(100);

    const bottom = byId('bottom');
    const bottomCover = coverIn(bottom).getBoundingClientRect();
    expect(bottomCover.bottom).toBe(bottom.getBoundingClientRect().bottom);
    expect(bottomCover.height).toBeLessThan(100);

    const placeholderImg = byId('ph').querySelector('img')!;
    expect(getComputedStyle(placeholderImg).backgroundImage).toContain('data:image/svg+xml');
  });
});
