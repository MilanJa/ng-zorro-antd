/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { en_US, NzI18nService, provideNzI18n, zh_CN } from 'ng-zorro-antd/i18n';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzImageCoverPlacement } from './image-wrapper.component';
import { NzImageDirective } from './image.directive';
import { NzImageModule } from './image.module';
import { NzImagePreviewActionsContext, NzImagePreviewImageContext } from './typings';

let seq = 0;
const nextSrc = (): string => `https://test.com/wrapper-${++seq}.png`;

@Component({
  imports: [NzImageModule],
  template: `
    <nz-image-wrapper
      [nzSrc]="src()"
      [nzSrcset]="srcset()"
      [nzAlt]="alt()"
      [nzWidth]="width()"
      [nzHeight]="height()"
      [nzFallback]="fallback()"
      [nzPlaceholder]="placeholder()"
      [nzDisablePreview]="disablePreview()"
      [nzScaleStep]="scaleStep()"
      [nzPreviewCover]="cover()"
      [nzPreviewCoverPlacement]="placement()"
      [nzActionsRender]="actionsRender()"
      [nzImageRender]="imageRender()"
    />
    <img id="plain" nz-image [nzSrc]="plainSrc" />
    <ng-template #placeholderTpl><span class="tpl-placeholder">Loading</span></ng-template>
    <ng-template #coverTpl><b class="tpl-cover">Look</b></ng-template>
    <ng-template #actionsTpl><i class="tpl-actions"></i></ng-template>
    <ng-template #imageTpl><i class="tpl-image"></i></ng-template>
  `
})
class TestImageWrapperComponent {
  readonly placeholderTpl = viewChild.required<TemplateRef<void>>('placeholderTpl');
  readonly coverTpl = viewChild.required<TemplateRef<void>>('coverTpl');
  readonly actionsTpl = viewChild.required<TemplateRef<NzImagePreviewActionsContext>>('actionsTpl');
  readonly imageTpl = viewChild.required<TemplateRef<NzImagePreviewImageContext>>('imageTpl');
  readonly src = signal(nextSrc());
  readonly srcset = signal('');
  readonly alt = signal<string | undefined>('A cat');
  readonly width = signal<string | number | undefined>(undefined);
  readonly height = signal<string | number | undefined>(undefined);
  readonly fallback = signal<string | null>(null);
  readonly placeholder = signal<string | TemplateRef<void> | boolean | null>(false);
  readonly disablePreview = signal(false);
  readonly scaleStep = signal<number | null>(null);
  readonly cover = signal<string | TemplateRef<void> | boolean | undefined>(true);
  readonly placement = signal<NzImageCoverPlacement | undefined>('center');
  readonly actionsRender = signal<TemplateRef<NzImagePreviewActionsContext> | null | undefined>(undefined);
  readonly imageRender = signal<TemplateRef<NzImagePreviewImageContext> | undefined>(undefined);
  readonly plainSrc = nextSrc();
}

@Component({
  imports: [NzImageModule],
  template: `
    <nz-image-group>
      <nz-image-wrapper id="first" [nzSrc]="first" />
      <nz-image-wrapper id="second" [nzSrc]="second" />
    </nz-image-group>
  `
})
class TestImageWrapperGroupComponent {
  readonly first = nextSrc();
  readonly second = nextSrc();
}

const hostOf = (fixture: ComponentFixture<unknown>, selector = 'nz-image-wrapper'): HTMLElement =>
  (fixture.nativeElement as HTMLElement).querySelector(selector)!;
const innerOf = (fixture: ComponentFixture<unknown>, selector = 'nz-image-wrapper'): NzImageDirective =>
  fixture.debugElement.query(By.css(`${selector} img`)).injector.get(NzImageDirective);
const coverOf = (fixture: ComponentFixture<unknown>): HTMLElement | null =>
  hostOf(fixture).querySelector(':scope > .ant-image-cover');
const childrenOf = (el: HTMLElement): string[] =>
  Array.from(el.children).map(c => `${c.tagName.toLowerCase()}.${c.className}`);
const keydown = (el: HTMLElement, key: string): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 2; i++) {
    fixture.detectChanges();
    await fixture.whenStable();
  }
  fixture.detectChanges();
}

describe('nz-image-wrapper', () => {
  let overlay: OverlayContainer;
  const previewRoots = (): NodeListOf<Element> =>
    overlay.getContainerElement().querySelectorAll('.ant-image-preview-root');

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), provideNzI18n(en_US)] });
    overlay = TestBed.inject(OverlayContainer);
  });

  afterEach(() => overlay.ngOnDestroy());

  it("renders antd's wrapper DOM with antd v4's mask classes on the cover (no v6 stylesheet)", async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    const host = hostOf(fixture);
    expect(host.className).toBe('ant-image');
    expect(host.style.cssText).toBe('');
    expect(host.getAttribute('role')).toBe('button');
    expect(host.getAttribute('tabindex')).toBe('0');
    expect(host.getAttribute('aria-label')).toBe('A cat');
    expect(childrenOf(host)).toEqual([
      'img.ant-image-img',
      'div.ant-image-cover ant-image-mask ant-image-cover-center'
    ]);
    const img = host.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('A cat');
    expect(img.getAttribute('width')).toBeNull();
    expect(img.style.cssText).toBe('');
    const info = coverOf(fixture)!.querySelector(':scope > div')!;
    expect(info.className).toBe('ant-image-mask-info');
    expect(info.querySelector('nz-icon')!.getAttribute('nzType')).toBe('eye');
    expect(info.textContent!.trim()).toBe('Preview');
  });

  it('leaves a plain img[nz-image] classless next to it', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    const plain = (fixture.nativeElement as HTMLElement).querySelector('#plain') as HTMLImageElement;
    expect(plain.className).toBe('');
    expect(plain.parentElement).toBe(fixture.nativeElement);
    expect(plain.getAttribute('role')).toBeNull();
  });

  it('forwards every image input to the inner img[nz-image]', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    const host = fixture.componentInstance;
    host.srcset.set('https://test.com/a.png 1x, https://test.com/b.png 2x');
    host.fallback.set('https://test.com/fallback.png');
    host.scaleStep.set(0.25);
    await settle(fixture);
    host.actionsRender.set(host.actionsTpl());
    host.imageRender.set(host.imageTpl());
    await settle(fixture);
    const inner = innerOf(fixture);
    expect(inner.nzSrc).toBe(host.src());
    expect(inner.nzSrcset).toBe('https://test.com/a.png 1x, https://test.com/b.png 2x');
    expect(inner.nzFallback).toBe('https://test.com/fallback.png');
    expect(inner.nzScaleStep).toBe(0.25);
    expect(inner.nzDisablePreview).toBe(false);
    expect(inner.nzPlaceholder).toBeNull();
    expect(inner.nzActionsRender).toBe(host.actionsTpl());
    expect(inner.nzImageRender).toBe(host.imageTpl());

    host.actionsRender.set(null);
    await settle(fixture);
    expect(inner.nzActionsRender).toBeNull();
  });

  it('sizes the host and the image from nzWidth and nzHeight', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    const host = fixture.componentInstance;
    host.width.set(100);
    host.height.set('80');
    await settle(fixture);
    const el = hostOf(fixture);
    const img = el.querySelector('img')!;
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('80px');
    expect(img.getAttribute('width')).toBe('100');
    expect(img.getAttribute('height')).toBe('80');
    expect(img.style.height).toBe('80px');

    host.width.set('50%');
    host.height.set(undefined);
    await settle(fixture);
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('');
    expect(img.getAttribute('height')).toBeNull();
  });

  it('nzPlaceholder as a URL is swapped into the image while it loads, as on the directive', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    fixture.componentInstance.placeholder.set('https://test.com/placeholder.png');
    await settle(fixture);
    const img = hostOf(fixture).querySelector('img')!;
    expect(innerOf(fixture).nzPlaceholder).toBe('https://test.com/placeholder.png');
    expect(img.src).toBe('https://test.com/placeholder.png');
    expect(img.className).toBe('ant-image-img');
    expect(hostOf(fixture).querySelector('.ant-image-placeholder')).toBeNull();
  });

  it("nzPlaceholder true gives the image antd's placeholder class and no overlay", async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    fixture.componentInstance.placeholder.set(true);
    await settle(fixture);
    expect(hostOf(fixture).querySelector('img')!.className).toBe('ant-image-img ant-image-img-placeholder');
    expect(innerOf(fixture).nzPlaceholder).toBeNull();
    expect(hostOf(fixture).querySelector('.ant-image-placeholder')).toBeNull();
  });

  it('nzPlaceholder as a template renders the overlay while loading only', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    host.src.set(nextSrc());
    host.placeholder.set(host.placeholderTpl());
    await settle(fixture);
    const overlayEl = hostOf(fixture).querySelector(':scope > .ant-image-placeholder') as HTMLElement;
    expect(overlayEl).not.toBeNull();
    expect(overlayEl.getAttribute('aria-hidden')).toBe('true');
    expect(overlayEl.querySelector('.tpl-placeholder')!.textContent).toBe('Loading');
    expect(innerOf(fixture).nzPlaceholder).toBeNull();

    innerOf(fixture).backLoadImage.dispatchEvent(new Event('load'));
    await settle(fixture);
    expect(hostOf(fixture).querySelector('.ant-image-placeholder')).toBeNull();
  });

  it('renders a string, a template or no cover, and undefined restores the default cover', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    const host = fixture.componentInstance;
    host.cover.set('Zoom');
    await settle(fixture);
    expect(coverOf(fixture)!.textContent!.trim()).toBe('Zoom');
    expect(coverOf(fixture)!.querySelector('.ant-image-mask-info')).toBeNull();

    host.cover.set(host.coverTpl());
    await settle(fixture);
    expect(coverOf(fixture)!.querySelector('.tpl-cover')!.textContent).toBe('Look');

    host.cover.set(false);
    await settle(fixture);
    expect(coverOf(fixture)).toBeNull();
    expect(childrenOf(hostOf(fixture))).toEqual(['img.ant-image-img']);

    host.cover.set(undefined);
    await settle(fixture);
    expect(coverOf(fixture)!.querySelector('.ant-image-mask-info')).not.toBeNull();
  });

  it('places the cover by nzPreviewCoverPlacement, undefined meaning center', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    const host = fixture.componentInstance;
    host.placement.set('top');
    await settle(fixture);
    expect(coverOf(fixture)!.className).toBe('ant-image-cover ant-image-mask ant-image-cover-top');

    host.placement.set('bottom');
    await settle(fixture);
    expect(coverOf(fixture)!.className).toBe('ant-image-cover ant-image-mask ant-image-cover-bottom');

    host.placement.set(undefined);
    await settle(fixture);
    expect(coverOf(fixture)!.className).toBe('ant-image-cover ant-image-mask ant-image-cover-center');
  });

  it('localizes the default cover text', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    TestBed.inject(NzI18nService).setLocale(zh_CN);
    await settle(fixture);
    expect(coverOf(fixture)!.textContent!.trim()).toBe('预览');
  });

  it('without preview: no role, no tab stop, no cover, and Enter or a click opens nothing', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    fixture.componentInstance.disablePreview.set(true);
    await settle(fixture);
    const host = hostOf(fixture);
    expect(host.className).toBe('ant-image');
    expect(host.getAttribute('role')).toBeNull();
    expect(host.getAttribute('tabindex')).toBeNull();
    expect(host.getAttribute('aria-label')).toBeNull();
    expect(coverOf(fixture)).toBeNull();
    expect(innerOf(fixture).nzDisablePreview).toBe(true);

    expect(keydown(host, 'Enter').defaultPrevented).toBe(false);
    host.querySelector('img')!.click();
    host.click();
    await settle(fixture);
    expect(previewRoots().length).toBe(0);
  });

  it('with preview: the cover is present and Enter opens the preview', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    expect(coverOf(fixture)!.classList).toContain('ant-image-mask');
    const event = keydown(hostOf(fixture), 'Enter');
    await settle(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(previewRoots().length).toBe(1);
  });

  it('Space opens the preview and is prevented', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    const event = keydown(hostOf(fixture), ' ');
    await settle(fixture);
    expect(event.defaultPrevented).toBe(true);
    expect(previewRoots().length).toBe(1);
  });

  it('a click on the cover opens one preview', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    coverOf(fixture)!.click();
    await settle(fixture);
    expect(previewRoots().length).toBe(1);
  });

  it('a click on the image opens one preview, not two', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    hostOf(fixture).querySelector('img')!.click();
    await settle(fixture);
    expect(previewRoots().length).toBe(1);
  });

  it('marks a failed image with ant-image-error and stops previewing', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperComponent);
    await settle(fixture);
    innerOf(fixture).backLoadImage.dispatchEvent(new Event('error'));
    await settle(fixture);
    const host = hostOf(fixture);
    expect(host.className).toBe('ant-image ant-image-error');
    expect(host.getAttribute('role')).toBeNull();
    expect(coverOf(fixture)).toBeNull();
  });

  it('joins an nz-image-group through its inner image', async () => {
    const fixture = TestBed.createComponent(TestImageWrapperGroupComponent);
    await settle(fixture);
    keydown(hostOf(fixture, '#second'), 'Enter');
    await settle(fixture);
    expect(previewRoots().length).toBe(1);
    const previewImg = overlay.getContainerElement().querySelector('.ant-image-preview-img') as HTMLImageElement;
    expect(previewImg.getAttribute('src')).toBe(fixture.componentInstance.second);
  });
});
