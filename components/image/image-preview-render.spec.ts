/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzImagePreviewRef } from './image-preview-ref';
import { NzImageModule } from './image.module';
import { NzImageService } from './image.service';
import { NzImagePreviewActionsContext, NzImagePreviewImageContext } from './typings';

const SRC1 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const SRC2 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

type ActionsTpl = TemplateRef<NzImagePreviewActionsContext>;
type ImageTpl = TemplateRef<NzImagePreviewImageContext>;

@Component({
  imports: [NgTemplateOutlet, NzImageModule],
  template: `
    <img id="single" nz-image [nzSrc]="src1" [nzActionsRender]="actionsRender()" [nzImageRender]="imageRender()" />
    <nz-image-group [nzActionsRender]="groupActionsRender()" [nzImageRender]="groupImageRender()">
      <img id="grouped" nz-image [nzSrc]="src1" [nzActionsRender]="memberActionsRender()" />
      <img nz-image [nzSrc]="src2" />
    </nz-image-group>

    <ng-template
      #customActions
      let-actions="actions"
      let-transform="transform"
      let-current="current"
      let-total="total"
      let-image="image"
      let-icons="icons"
    >
      <button type="button" class="custom-zoom-in" (click)="actions.onZoomIn()">in</button>
      <button type="button" class="custom-next" (click)="actions.onActive(1)">next</button>
      <button type="button" class="custom-close" (click)="actions.onClose()">close</button>
      <span class="custom-scale">{{ transform.scale }}</span>
      <span class="custom-count">{{ current }}/{{ total }}</span>
      <span class="custom-url">{{ image.url }}</span>
      <span class="custom-icon"><ng-container *ngTemplateOutlet="icons.zoomIn" /></span>
    </ng-template>
    <ng-template #defaultActionsOnly let-defaultActions>
      <ng-container *ngTemplateOutlet="defaultActions" />
    </ng-template>
    <ng-template #memberActions><span class="member-actions">member</span></ng-template>
    <ng-template #customImage let-transform="transform" let-current="current" let-image="image">
      <video
        class="custom-video"
        [attr.data-url]="image.url"
        [attr.data-current]="current"
        [attr.data-scale]="transform.scale"
        [attr.data-x]="transform.x"
        [style.transform]="'rotate(' + transform.rotate + 'deg)'"
      ></video>
    </ng-template>
    <ng-template #defaultImageOnly let-defaultImage>
      <ng-container *ngTemplateOutlet="defaultImage" />
    </ng-template>
  `
})
class TestImagePreviewRenderComponent {
  private readonly imageService = inject(NzImageService);
  readonly src1 = SRC1;
  readonly src2 = SRC2;
  readonly customActions = viewChild.required<ActionsTpl>('customActions');
  readonly defaultActionsOnly = viewChild.required<ActionsTpl>('defaultActionsOnly');
  readonly memberActions = viewChild.required<ActionsTpl>('memberActions');
  readonly customImage = viewChild.required<ImageTpl>('customImage');
  readonly defaultImageOnly = viewChild.required<ImageTpl>('defaultImageOnly');
  readonly actionsRender = signal<ActionsTpl | null | undefined>(undefined);
  readonly imageRender = signal<ImageTpl | undefined>(undefined);
  readonly groupActionsRender = signal<ActionsTpl | null | undefined>(undefined);
  readonly groupImageRender = signal<ImageTpl | undefined>(undefined);
  readonly memberActionsRender = signal<ActionsTpl | null | undefined>(undefined);

  openByService(imageRender: ImageTpl): NzImagePreviewRef {
    return this.imageService.preview([{ src: SRC1 }], { nzImageRender: imageRender, nzActionsRender: null });
  }
}

const sorted = (el: Element): string[] => [...el.classList].sort();
const overlayElement = (): HTMLElement => TestBed.inject(OverlayContainer).getContainerElement();
const previewRoot = (): HTMLElement | null => overlayElement().querySelector('.ant-image-preview-root');
const toolbar = (): HTMLElement => previewRoot()!.querySelector('.ant-image-preview-footer > ul')!;
const wrapper = (): HTMLElement => previewRoot()!.querySelector('.ant-image-preview-img-wrapper')!;
const actionType = (el: Element): string =>
  /ant-image-preview-actions-action-(\w+)/.exec(el.className)?.[1] ??
  (el.classList.contains('ant-image-preview-close') ? 'close' : el.tagName.toLowerCase());

/** Presses on the target and moves; the caller releases, as a drop snaps the preview back into view. */
const dragFrom = (target: HTMLElement, dx: number): (() => void) => {
  const init = (x: number): MouseEventInit => ({
    clientX: x,
    clientY: 20,
    button: 0,
    buttons: 1,
    detail: 1,
    bubbles: true,
    cancelable: true
  });
  target.dispatchEvent(new MouseEvent('mousedown', init(10)));
  document.dispatchEvent(new MouseEvent('mousemove', init(10 + dx / 2)));
  document.dispatchEvent(new MouseEvent('mousemove', init(10 + dx)));
  return () => document.dispatchEvent(new MouseEvent('mouseup', init(10 + dx)));
};

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) {
    fixture.detectChanges();
    await fixture.whenStable();
  }
}

async function open(fixture: ComponentFixture<unknown>, selector: string): Promise<HTMLElement> {
  (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector)!.click();
  await settle(fixture);
  return previewRoot()!;
}

async function close(fixture: ComponentFixture<unknown>, trigger: HTMLElement): Promise<void> {
  trigger.click();
  await settle(fixture);
  previewRoot()!.dispatchEvent(new AnimationEvent('animationend', { animationName: 'antFadeOut' }));
  await settle(fixture);
}

describe('image preview render slots', () => {
  let fixture: ComponentFixture<TestImagePreviewRenderComponent>;
  let host: TestImagePreviewRenderComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestImagePreviewRenderComponent);
    host = fixture.componentInstance;
    await settle(fixture);
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  // The CDK writes its own drag styles onto the handle img and the drag wrapper, so the v4 safety
  // check pins the exact class sets and the two transforms rather than the whole style attribute.
  it('keeps the default toolbar and image DOM when no render slot is bound', async () => {
    await open(fixture, '#single');
    const ul = toolbar();
    expect(ul.className).toBe('ant-image-preview-operations ant-image-preview-actions');
    expect(Array.from(ul.children).map(sorted)).toEqual([
      ['ant-image-preview-close', 'ant-image-preview-operations-operation'],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-zoomIn',
        'ant-image-preview-operations-operation'
      ],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-disabled',
        'ant-image-preview-actions-action-zoomOut',
        'ant-image-preview-operations-operation',
        'ant-image-preview-operations-operation-disabled'
      ],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-rotateRight',
        'ant-image-preview-operations-operation'
      ],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-rotateLeft',
        'ant-image-preview-operations-operation'
      ],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-flipX',
        'ant-image-preview-operations-operation'
      ],
      [
        'ant-image-preview-actions-action',
        'ant-image-preview-actions-action-flipY',
        'ant-image-preview-operations-operation'
      ]
    ]);
    expect(Array.from(wrapper().children).map(c => [c.tagName, ...sorted(c)])).toEqual([
      ['IMG', 'ant-image-preview-img', 'cdk-drag-handle']
    ]);
    expect(wrapper().querySelector('img')!.style.transform).toBe('scale3d(1, 1, 1) rotate(0deg)');
    // The component's own translate3d, then the one the CDK drag appends for its own free-drag position.
    expect(wrapper().style.transform).toBe('translate3d(0px, 0px, 0px) translate3d(0px, 0px, 0px)');
  });

  it('renders no actions container for nzActionsRender null, and close still closes', async () => {
    host.actionsRender.set(null);
    await settle(fixture);
    const root = await open(fixture, '#single');
    expect(root.querySelector('.ant-image-preview-actions')).toBeNull();
    expect(root.querySelector('.ant-image-preview-actions-action')).toBeNull();
    const ul = toolbar();
    expect(ul.className).toBe('ant-image-preview-operations');
    expect(Array.from(ul.children).map(sorted)).toEqual([
      ['ant-image-preview-close', 'ant-image-preview-operations-operation']
    ]);

    await close(fixture, ul.querySelector<HTMLElement>('.ant-image-preview-close')!);
    expect(previewRoot()).toBeNull();
  });

  it('renders a custom actions template after the close control; its actions drive the transform', async () => {
    host.actionsRender.set(host.customActions());
    await settle(fixture);
    await open(fixture, '#single');
    const ul = toolbar();
    expect(ul.className).toBe('ant-image-preview-operations ant-image-preview-actions');
    const items = Array.from(ul.children);
    expect(items.map(actionType)).toEqual(['close', 'li']);
    const slot = items[1] as HTMLElement;
    expect(slot.className).toBe('');
    expect(getComputedStyle(slot).display).toBe('flex');
    expect(getComputedStyle(slot).alignItems).toBe('center');
    expect(getComputedStyle(slot).columnGap).toBe(getComputedStyle(ul).columnGap);
    expect(slot.style.cssText).toBe('display: flex; align-items: center; gap: inherit;');
    expect(ul.querySelector('.ant-image-preview-actions-action')).toBeNull();
    expect(slot.querySelector('.custom-scale')!.textContent).toBe('1');
    expect(slot.querySelector('.custom-count')!.textContent).toBe('0/1');
    expect(slot.querySelector('.custom-url')!.textContent).toBe(SRC1);
    expect(slot.querySelector('.custom-icon .anticon-zoom-in')).not.toBeNull();

    slot.querySelector<HTMLElement>('.custom-zoom-in')!.click();
    await settle(fixture);
    expect(slot.querySelector('.custom-scale')!.textContent).toBe('1.5');
    expect(wrapper().querySelector('img')!.style.transform).toBe('scale3d(1.5, 1.5, 1) rotate(0deg)');

    await close(fixture, slot.querySelector<HTMLElement>('.custom-close')!);
    expect(previewRoot()).toBeNull();
  });

  it('stamps the default actions in antd order from the actions template $implicit', async () => {
    host.actionsRender.set(host.defaultActionsOnly());
    await settle(fixture);
    await open(fixture, '#single');
    const [closeItem, slot] = Array.from(toolbar().children);
    expect(actionType(closeItem)).toBe('close');
    expect(Array.from(slot.children).map(actionType)).toEqual([
      'flipY',
      'flipX',
      'rotateLeft',
      'rotateRight',
      'zoomOut',
      'zoomIn'
    ]);

    slot.querySelector<HTMLElement>('.ant-image-preview-actions-action-zoomIn')!.click();
    await settle(fixture);
    expect(wrapper().querySelector('img')!.style.transform).toBe('scale3d(1.5, 1.5, 1) rotate(0deg)');
  });

  it('switches images through actions.onActive and reports current/total/image', async () => {
    host.groupActionsRender.set(host.customActions());
    await settle(fixture);
    await open(fixture, '#grouped');
    const count = (): string => toolbar().querySelector('.custom-count')!.textContent!;
    const url = (): string => toolbar().querySelector('.custom-url')!.textContent!;
    expect(count()).toBe('0/2');
    expect(url()).toBe(SRC1);

    toolbar().querySelector<HTMLElement>('.custom-next')!.click();
    await settle(fixture);
    expect(count()).toBe('1/2');
    expect(url()).toBe(SRC2);

    toolbar().querySelector<HTMLElement>('.custom-next')!.click();
    await settle(fixture);
    expect(count()).toBe('1/2');
  });

  it('prefers the group value over a grouped image value, and the image value when the group has none', async () => {
    host.memberActionsRender.set(host.memberActions());
    await settle(fixture);
    await open(fixture, '#grouped');
    expect(toolbar().querySelector('.member-actions')).not.toBeNull();
    await close(fixture, toolbar().querySelector<HTMLElement>('.ant-image-preview-close')!);

    host.groupActionsRender.set(host.customActions());
    await settle(fixture);
    await open(fixture, '#grouped');
    expect(toolbar().querySelector('.custom-zoom-in')).not.toBeNull();
    expect(toolbar().querySelector('.member-actions')).toBeNull();
    await close(fixture, toolbar().querySelector<HTMLElement>('.ant-image-preview-close')!);

    host.groupActionsRender.set(null);
    await settle(fixture);
    await open(fixture, '#grouped');
    expect(toolbar().className).toBe('ant-image-preview-operations');
    expect(toolbar().querySelector('.member-actions')).toBeNull();
  });

  it('renders a custom image template in place of the img, with transform/current/image context', async () => {
    host.imageRender.set(host.customImage());
    await settle(fixture);
    await open(fixture, '#single');
    expect(Array.from(wrapper().children).map(c => c.tagName)).toEqual(['VIDEO']);
    const video = wrapper().querySelector<HTMLVideoElement>('video.custom-video')!;
    expect(video.dataset['url']).toBe(SRC1);
    expect(video.dataset['current']).toBe('0');

    toolbar().querySelector<HTMLElement>('.ant-image-preview-actions-action-rotateRight')!.click();
    await settle(fixture);
    expect(video.style.transform).toBe('rotate(90deg)');

    // No img to anchor on: the wheel still zooms (and must not throw).
    wrapper().dispatchEvent(
      new WheelEvent('wheel', { deltaY: -1, clientX: 10, clientY: 10, bubbles: true, cancelable: true })
    );
    await settle(fixture);
    expect(video.dataset['scale']).toBe('1.5');
  });

  it('stamps the default image, still the drag handle, from the image template $implicit', async () => {
    host.imageRender.set(host.defaultImageOnly());
    await settle(fixture);
    await open(fixture, '#single');
    expect(Array.from(wrapper().children).map(c => [c.tagName, ...sorted(c)])).toEqual([
      ['IMG', 'ant-image-preview-img', 'cdk-drag-handle']
    ]);
  });

  it('the default image is the drag handle: dragging it moves the wrapper, dragging the wrapper does not', async () => {
    await open(fixture, '#single');
    const before = wrapper().style.transform;
    const releaseWrapperDrag = dragFrom(wrapper(), 60);
    expect(wrapper().style.transform).toBe(before);
    releaseWrapperDrag();
    await settle(fixture);

    const releaseImageDrag = dragFrom(wrapper().querySelector('img')!, 60);
    expect(wrapper().style.transform).toContain('translate3d(60px, 0px, 0px)');
    releaseImageDrag();
    await settle(fixture);
  });

  it('takes both slots from NzImageService options; drag end without an img keeps the drop position', async () => {
    const ref = host.openByService(host.customImage());
    await settle(fixture);
    expect(previewRoot()!.querySelector('.ant-image-preview-actions')).toBeNull();
    const video = wrapper().querySelector<HTMLVideoElement>('video.custom-video')!;
    expect(video).not.toBeNull();

    ref.previewInstance.onDragEnd({ source: { getFreeDragPosition: () => ({ x: 5, y: 6 }) } } as NzSafeAny);
    ref.previewInstance.markForCheck();
    await settle(fixture);
    expect(video.dataset['x']).toBe('5');
  });

  it('falls back to the default toolbar when nzActionsRender is set back to undefined', async () => {
    host.actionsRender.set(host.customActions());
    await settle(fixture);
    await open(fixture, '#single');
    expect(toolbar().querySelector('.custom-zoom-in')).not.toBeNull();
    await close(fixture, toolbar().querySelector<HTMLElement>('.ant-image-preview-close')!);

    host.actionsRender.set(undefined);
    await settle(fixture);
    await open(fixture, '#single');
    expect(toolbar().children.length).toBe(7);
    expect(toolbar().querySelector('.custom-zoom-in')).toBeNull();
  });
});
