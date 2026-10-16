/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ESCAPE } from '@angular/cdk/keycodes';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  inject,
  NgZone,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { fromEventOutsideAngular, isNotNil } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NZ_CONFIG_MODULE_NAME } from './image-config';
import { NzImage, NzImagePreviewOptions } from './image-preview-options';
import { NzImagePreviewRef } from './image-preview-ref';
import { NzImageScaleStep, NzImageUrl } from './image.directive';
import {
  NzImagePreviewActions,
  NzImagePreviewActionsContext,
  NzImagePreviewActionsIcons,
  NzImagePreviewImageContext,
  NzImagePreviewImageInfo,
  NzImagePreviewTransform
} from './typings';
import { getClientSize, getFitContentPosition, getOffset } from './utils';

export interface NzImageContainerOperation {
  icon: string;
  type: string;
  rotate?: number;
  /** antd v6 `Footer`'s action type (`ant-image-preview-actions-action-<v6Type>`); absent for `close`, which v6 renders outside the actions group. */
  v6Type?: string;
  onClick(): void;
}

const initialPosition = {
  x: 0,
  y: 0
};

export const NZ_DEFAULT_SCALE_STEP = 0.5;
const NZ_DEFAULT_ZOOM = 1;
const NZ_DEFAULT_ROTATE = 0;

@Component({
  selector: 'nz-image-preview',
  exportAs: 'nzImagePreview',
  template: `
    <div class="ant-image-preview-mask"></div>

    <div
      class="ant-image-preview-wrap"
      tabindex="-1"
      (click)="maskClosable && $event.target === $event.currentTarget && onClose()"
    >
      <div class="ant-image-preview" role="dialog" aria-modal="true">
        <div tabindex="0" aria-hidden="true" class="ant-image-preview-focus-trap"></div>
        <div class="ant-image-preview-content">
          <div class="ant-image-preview-body">
            <div
              class="ant-image-preview-img-wrapper"
              #imagePreviewWrapper
              cdkDrag
              [style.transform]="previewImageWrapperTransform()"
              [cdkDragFreeDragPosition]="position"
              (cdkDragEnded)="onDragEnd($event)"
            >
              <!--
                Declared inside the drag wrapper: the img's cdkDragHandle finds this cdkDrag through
                the template's declaration injector, also when a custom nzImageRender stamps it.
              -->
              <ng-template #defaultImage>
                @for (image of images; track image) {
                  @if ($index === index) {
                    <img
                      cdkDragHandle
                      class="ant-image-preview-img"
                      #imgRef
                      [attr.src]="sanitizerResourceUrl(image.src)"
                      [attr.srcset]="image.srcset"
                      [attr.alt]="image.alt"
                      [style.width]="image.width"
                      [style.height]="image.height"
                      [style.transform]="previewImageTransform()"
                    />
                  }
                }
              </ng-template>
              @if (config.nzImageRender; as imageRender) {
                <ng-container *ngTemplateOutlet="imageRender; context: imageContext()" />
              } @else {
                <ng-container *ngTemplateOutlet="defaultImage" />
              }
            </div>
          </div>
        </div>
        <div tabindex="0" aria-hidden="true" class="ant-image-preview-focus-trap"></div>

        <!--
          Painted after .ant-image-preview-content (above): v6's own Preview/index.js creates the
          close button, the switch buttons and the Footer after the body in JSX, so they paint over
          the image without needing a z-index; this element shares the same stacking context (no
          explicit z-index on either side), so DOM order alone decides paint order here too.
        -->
        <div class="ant-image-preview-operations-wrapper ant-image-preview-footer">
          @if (images.length > 1) {
            <div
              class="ant-image-preview-switch-left ant-image-preview-switch ant-image-preview-switch-prev"
              [class.ant-image-preview-switch-left-disabled]="index <= 0"
              [class.ant-image-preview-switch-disabled]="index <= 0"
              (click)="onSwitchLeft($event)"
            >
              <nz-icon nzType="left" nzTheme="outline" />
            </div>
            <div
              class="ant-image-preview-switch-right ant-image-preview-switch ant-image-preview-switch-next"
              [class.ant-image-preview-switch-right-disabled]="index >= images.length - 1"
              [class.ant-image-preview-switch-disabled]="index >= images.length - 1"
              (click)="onSwitchRight($event)"
            >
              <nz-icon nzType="right" nzTheme="outline" />
            </div>
          }

          <ul class="ant-image-preview-operations" [class.ant-image-preview-actions]="config.nzActionsRender !== null">
            @if (images.length > 1) {
              <li class="ant-image-preview-operations-progress">{{ index + 1 }} / {{ images.length }}</li>
            }

            @if (config.nzActionsRender === undefined) {
              @for (option of operations; track option) {
                <ng-container *ngTemplateOutlet="operationItem; context: { $implicit: option }" />
              }
            } @else {
              @for (option of closeOperations; track option) {
                <ng-container *ngTemplateOutlet="operationItem; context: { $implicit: option }" />
              }
              @if (config.nzActionsRender; as actionsRender) {
                <!--
                  One unclassed item after close: the list itself is laid out reversed, so the
                  template's own nodes flow in source order inside this flex row instead.
                -->
                <li style="display: flex; align-items: center; gap: inherit">
                  <ng-container *ngTemplateOutlet="actionsRender; context: actionsContext()" />
                </li>
              }
            }
          </ul>
        </div>
      </div>
    </div>

    <ng-template #operationItem let-option>
      <li
        class="ant-image-preview-operations-operation"
        [class.ant-image-preview-close]="option.type === 'close'"
        [class]="
          option.v6Type ? 'ant-image-preview-actions-action ant-image-preview-actions-action-' + option.v6Type : ''
        "
        [class.ant-image-preview-operations-operation-disabled]="zoomOutDisabled && option.type === 'zoomOut'"
        [class.ant-image-preview-actions-action-disabled]="zoomOutDisabled && option.type === 'zoomOut'"
        (click)="option.onClick()"
      >
        <nz-icon
          class="ant-image-preview-operations-icon"
          [nzType]="option.icon"
          [nzRotate]="option.rotate ?? 0"
          nzTheme="outline"
        />
      </li>
    </ng-template>
    <ng-template #defaultActions>
      @for (option of defaultActionOperations; track option) {
        <ng-container *ngTemplateOutlet="operationItem; context: { $implicit: option }" />
      }
    </ng-template>
    <ng-template #flipYIcon><nz-icon nzType="swap" [nzRotate]="90" nzTheme="outline" /></ng-template>
    <ng-template #flipXIcon><nz-icon nzType="swap" nzTheme="outline" /></ng-template>
    <ng-template #rotateLeftIcon><nz-icon nzType="rotate-left" nzTheme="outline" /></ng-template>
    <ng-template #rotateRightIcon><nz-icon nzType="rotate-right" nzTheme="outline" /></ng-template>
    <ng-template #zoomOutIcon><nz-icon nzType="zoom-out" nzTheme="outline" /></ng-template>
    <ng-template #zoomInIcon><nz-icon nzType="zoom-in" nzTheme="outline" /></ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ant-image-preview-root',
    '[class.ant-image-preview-moving]': 'isDragging()',
    '[style.zIndex]': 'config.nzZIndex'
  },
  imports: [NgTemplateOutlet, NzIconModule, CdkDragHandle, CdkDrag]
})
export class NzImagePreviewComponent implements OnInit {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly nzConfigService = inject(NzConfigService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  public readonly elementRef = inject(ElementRef);
  public readonly config = inject(NzImagePreviewOptions);
  readonly _defaultNzZoom = NZ_DEFAULT_ZOOM;
  readonly _defaultNzScaleStep = NZ_DEFAULT_SCALE_STEP;
  readonly _defaultNzRotate = NZ_DEFAULT_ROTATE;

  readonly isDragging = signal(false);
  images: NzImage[] = [];
  index = 0;
  visible = true;
  scaleStepMap: Map<NzImageUrl, NzImageScaleStep> = new Map<NzImageUrl, NzImageScaleStep>();

  protected readonly previewImageTransform = signal('');
  protected readonly previewImageWrapperTransform = signal('');
  operations: NzImageContainerOperation[] = [
    {
      icon: 'close',
      onClick: () => {
        this.onClose();
      },
      type: 'close'
    },
    {
      icon: 'zoom-in',
      onClick: () => {
        this.onZoomIn();
      },
      type: 'zoomIn',
      v6Type: 'zoomIn'
    },
    {
      icon: 'zoom-out',
      onClick: () => {
        this.onZoomOut();
      },
      type: 'zoomOut',
      v6Type: 'zoomOut'
    },
    {
      icon: 'rotate-right',
      onClick: () => {
        this.onRotateRight();
      },
      type: 'rotateRight',
      v6Type: 'rotateRight'
    },
    {
      icon: 'rotate-left',
      onClick: () => {
        this.onRotateLeft();
      },
      type: 'rotateLeft',
      v6Type: 'rotateLeft'
    },
    {
      icon: 'swap',
      onClick: () => {
        this.onHorizontalFlip();
      },
      type: 'flipHorizontally',
      v6Type: 'flipX'
    },
    {
      icon: 'swap',
      onClick: () => {
        this.onVerticalFlip();
      },
      type: 'flipVertically',
      rotate: 90,
      v6Type: 'flipY'
    }
  ];

  /** The close control, kept in the toolbar when a custom actions template (or `null`) is bound. */
  protected readonly closeOperations = this.operations.filter(option => option.type === 'close');
  /** The six default actions in antd's reading order (flipY … zoomIn), for the actions template's `$implicit`. */
  protected readonly defaultActionOperations = this.operations.filter(option => option.type !== 'close').reverse();
  protected readonly previewActions: NzImagePreviewActions = {
    onFlipY: () => this.runAction(() => this.onVerticalFlip()),
    onFlipX: () => this.runAction(() => this.onHorizontalFlip()),
    onRotateLeft: () => this.runAction(() => this.onRotateLeft()),
    onRotateRight: () => this.runAction(() => this.onRotateRight()),
    onZoomOut: () => this.runAction(() => this.onZoomOut()),
    onZoomIn: () => this.runAction(() => this.onZoomIn()),
    onClose: () => this.onClose(),
    onActive: (offset: number) => this.activate(offset)
  };

  zoomOutDisabled = false;
  position = { ...initialPosition };
  previewRef!: NzImagePreviewRef;
  closeClick = new EventEmitter<void>();

  @ViewChild('imgRef') imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('imagePreviewWrapper', { static: true }) imagePreviewWrapper!: ElementRef<HTMLElement>;
  @ViewChild('defaultImage', { static: true }) private defaultImage!: TemplateRef<void>;
  @ViewChild('defaultActions', { static: true }) private defaultActions!: TemplateRef<void>;
  @ViewChild('flipYIcon', { static: true }) private flipYIcon!: TemplateRef<void>;
  @ViewChild('flipXIcon', { static: true }) private flipXIcon!: TemplateRef<void>;
  @ViewChild('rotateLeftIcon', { static: true }) private rotateLeftIcon!: TemplateRef<void>;
  @ViewChild('rotateRightIcon', { static: true }) private rotateRightIcon!: TemplateRef<void>;
  @ViewChild('zoomOutIcon', { static: true }) private zoomOutIcon!: TemplateRef<void>;
  @ViewChild('zoomInIcon', { static: true }) private zoomInIcon!: TemplateRef<void>;

  private zoom = this.config.nzZoom ?? this._defaultNzZoom;
  private rotate = this.config.nzRotate ?? this._defaultNzRotate;
  private scaleStep = this.config.nzScaleStep ?? this._defaultNzScaleStep;
  private flipHorizontally = this.config.nzFlipHorizontally ?? false;
  private flipVertically = this.config.nzFlipVertically ?? false;

  // Render-slot contexts are rebuilt only when one of their fields changes, so a template outlet
  // sees the same object across change-detection passes.
  private actionIcons: NzImagePreviewActionsIcons | null = null;
  private transformCache: NzImagePreviewTransform | null = null;
  private imageInfoCache: { source: NzImage | undefined; info: NzImagePreviewImageInfo } | null = null;
  private actionsContextCache: NzImagePreviewActionsContext | null = null;
  private imageContextCache: NzImagePreviewImageContext | null = null;

  get maskClosable(): boolean {
    const defaultConfig: NzSafeAny = this.nzConfigService.getConfigForComponent(NZ_CONFIG_MODULE_NAME) || {};
    return this.config.nzMaskClosable ?? defaultConfig.nzMaskClosable ?? true;
  }

  constructor() {
    this.updateZoomOutDisabled();
    this.updatePreviewImageTransform();
    this.updatePreviewImageWrapperTransform();
  }

  ngOnInit(): void {
    merge(
      fromEventOutsideAngular(this.imagePreviewWrapper.nativeElement, 'mousedown').pipe(map(() => true)),
      fromEventOutsideAngular(this.imagePreviewWrapper.nativeElement, 'mouseup').pipe(map(() => false))
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(dragging => this.isDragging.set(dragging));

    fromEventOutsideAngular<WheelEvent>(this.imagePreviewWrapper.nativeElement, 'wheel')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        this.ngZone.run(() => this.wheelZoomEventHandler(event));
      });

    fromEventOutsideAngular<KeyboardEvent>(this.document, 'keydown')
      .pipe(
        filter(event => event.keyCode === ESCAPE),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.onClose();
          this.markForCheck();
        });
      });
  }

  setImages(images: NzImage[], scaleStepMap?: Map<string, number>): void {
    if (scaleStepMap) this.scaleStepMap = scaleStepMap;
    this.images = images;
    this.markForCheck();
  }

  switchTo(index: number): void {
    this.index = index;
    this.markForCheck();
  }

  next(): void {
    if (this.index < this.images.length - 1) {
      this.reset();
      this.index++;
      this.updatePreviewImageTransform();
      this.updatePreviewImageWrapperTransform();
      this.updateZoomOutDisabled();
      this.markForCheck();
    }
  }

  prev(): void {
    if (this.index > 0) {
      this.reset();
      this.index--;
      this.updatePreviewImageTransform();
      this.updatePreviewImageWrapperTransform();
      this.updateZoomOutDisabled();
      this.markForCheck();
    }
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  onClose(): void {
    this.visible = false;
    this.closeClick.emit();
  }

  onZoomIn(): void {
    const zoomStep =
      this.scaleStepMap.get(this.images[this.index].src ?? this.images[this.index].srcset) ?? this.scaleStep;
    this.zoom += zoomStep;
    this.updatePreviewImageTransform();
    this.updateZoomOutDisabled();
  }

  onZoomOut(): void {
    if (this.zoom > 1) {
      const zoomStep =
        this.scaleStepMap.get(this.images[this.index].src ?? this.images[this.index].srcset) ?? this.scaleStep;
      this.zoom -= zoomStep;
      this.updatePreviewImageTransform();
      this.updateZoomOutDisabled();

      if (this.zoom <= 1) {
        this.reCenterImage();
      }
    }
  }

  onRotateRight(): void {
    this.rotate += 90;
    this.updatePreviewImageTransform();
  }

  onRotateLeft(): void {
    this.rotate -= 90;
    this.updatePreviewImageTransform();
  }

  onSwitchLeft(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.prev();
  }

  onSwitchRight(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.next();
  }

  onHorizontalFlip(): void {
    this.flipHorizontally = !this.flipHorizontally;
    this.updatePreviewImageTransform();
  }

  onVerticalFlip(): void {
    this.flipVertically = !this.flipVertically;
    this.updatePreviewImageTransform();
  }

  wheelZoomEventHandler(event: WheelEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.handlerImageTransformationWhileZoomingWithMouse(event, event.deltaY);
    this.handleImageScaleWhileZoomingWithMouse(event.deltaY);

    this.updatePreviewImageWrapperTransform();
    this.updatePreviewImageTransform();

    this.markForCheck();
  }

  onDragEnd(event: CdkDragEnd): void {
    this.isDragging.set(false);
    const image = this.imageRef as ElementRef<HTMLImageElement> | undefined;
    if (!image) {
      // A custom nzImageRender without the default image: no image box to fit, keep the drop position.
      this.position = { ...event.source.getFreeDragPosition() };
      return;
    }
    const width = image.nativeElement.offsetWidth * this.zoom;
    const height = image.nativeElement.offsetHeight * this.zoom;
    const { left, top } = getOffset(image.nativeElement);
    const { width: clientWidth, height: clientHeight } = getClientSize();
    const isRotate = this.rotate % 180 !== 0;
    const fitContentParams = {
      width: isRotate ? height : width,
      height: isRotate ? width : height,
      left,
      top,
      clientWidth,
      clientHeight
    };
    const fitContentPos = getFitContentPosition(fitContentParams);
    if (isNotNil(fitContentPos.x) || isNotNil(fitContentPos.y)) {
      this.position = { ...this.position, ...fitContentPos };
    } else if (!isNotNil(fitContentPos.x) && !isNotNil(fitContentPos.y)) {
      this.position = {
        x: event.source.getFreeDragPosition().x,
        y: event.source.getFreeDragPosition().y
      };
    }
  }

  sanitizerResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  protected actionsContext(): NzImagePreviewActionsContext {
    const transform = this.transformInfo();
    const image = this.imageInfo();
    const cached = this.actionsContextCache;
    if (
      cached &&
      cached.transform === transform &&
      cached.image === image &&
      cached.current === this.index &&
      cached.total === this.images.length
    ) {
      return cached;
    }
    this.actionIcons ??= {
      flipY: this.flipYIcon,
      flipX: this.flipXIcon,
      rotateLeft: this.rotateLeftIcon,
      rotateRight: this.rotateRightIcon,
      zoomOut: this.zoomOutIcon,
      zoomIn: this.zoomInIcon
    };
    this.actionsContextCache = {
      $implicit: this.defaultActions,
      icons: this.actionIcons,
      actions: this.previewActions,
      transform,
      current: this.index,
      total: this.images.length,
      image
    };
    return this.actionsContextCache;
  }

  protected imageContext(): NzImagePreviewImageContext {
    const transform = this.transformInfo();
    const image = this.imageInfo();
    const cached = this.imageContextCache;
    if (cached && cached.transform === transform && cached.image === image && cached.current === this.index) {
      return cached;
    }
    this.imageContextCache = { $implicit: this.defaultImage, transform, current: this.index, image };
    return this.imageContextCache;
  }

  private transformInfo(): NzImagePreviewTransform {
    const next: NzImagePreviewTransform = {
      x: this.position.x,
      y: this.position.y,
      rotate: this.rotate,
      scale: this.zoom,
      flipX: this.flipHorizontally,
      flipY: this.flipVertically
    };
    const cached = this.transformCache;
    if (
      cached &&
      cached.x === next.x &&
      cached.y === next.y &&
      cached.rotate === next.rotate &&
      cached.scale === next.scale &&
      cached.flipX === next.flipX &&
      cached.flipY === next.flipY
    ) {
      return cached;
    }
    this.transformCache = next;
    return next;
  }

  private imageInfo(): NzImagePreviewImageInfo {
    const source: NzImage | undefined = this.images[this.index];
    const cached = this.imageInfoCache;
    if (cached && cached.source === source) {
      return cached.info;
    }
    const info: NzImagePreviewImageInfo = {
      url: source?.src ?? '',
      alt: source?.alt,
      width: source?.width,
      height: source?.height
    };
    this.imageInfoCache = { source, info };
    return info;
  }

  private runAction(action: () => void): void {
    action();
    this.markForCheck();
  }

  private activate(offset: number): void {
    const target = this.index + offset;
    if (!Number.isInteger(target) || target < 0 || target > this.images.length - 1) {
      return;
    }
    this.reset();
    this.index = target;
    this.updatePreviewImageTransform();
    this.updatePreviewImageWrapperTransform();
    this.updateZoomOutDisabled();
    this.markForCheck();
  }

  private updatePreviewImageTransform(): void {
    this.previewImageTransform.set(
      `scale3d(${this.zoom * (this.flipHorizontally ? -1 : 1)}, ${
        this.zoom * (this.flipVertically ? -1 : 1)
      }, 1) rotate(${this.rotate}deg)`
    );
  }

  private updatePreviewImageWrapperTransform(): void {
    this.previewImageWrapperTransform.set(`translate3d(${this.position.x}px, ${this.position.y}px, 0)`);
  }

  private updateZoomOutDisabled(): void {
    this.zoomOutDisabled = this.zoom <= 1;
  }

  private handlerImageTransformationWhileZoomingWithMouse(event: WheelEvent, deltaY: number): void {
    const image = this.imageRef as ElementRef<HTMLImageElement> | undefined;
    if (!image) {
      // A custom nzImageRender without the default image: zoom without anchoring on the cursor.
      return;
    }
    let scaleValue: number;
    const imageElement = image.nativeElement;

    const elementTransform = getComputedStyle(imageElement).transform;
    const matrixValue = elementTransform.match(/matrix.*\((.+)\)/);

    if (matrixValue) {
      scaleValue = +matrixValue[1].split(', ')[0];
    } else {
      scaleValue = this.zoom;
    }

    const x = (event.clientX - imageElement.getBoundingClientRect().x) / scaleValue;
    const y = (event.clientY - imageElement.getBoundingClientRect().y) / scaleValue;
    const halfOfScaleStepValue = deltaY < 0 ? this.scaleStep / 2 : -this.scaleStep / 2;

    this.position.x += -x * halfOfScaleStepValue * 2 + imageElement.offsetWidth * halfOfScaleStepValue;
    this.position.y += -y * halfOfScaleStepValue * 2 + imageElement.offsetHeight * halfOfScaleStepValue;
  }

  private handleImageScaleWhileZoomingWithMouse(deltaY: number): void {
    if (this.isZoomedInWithMouseWheel(deltaY)) {
      this.onZoomIn();
    } else {
      this.onZoomOut();
    }

    if (this.zoom <= 1) {
      this.reCenterImage();
    }
  }

  private isZoomedInWithMouseWheel(delta: number): boolean {
    return delta < 0;
  }

  private reset(): void {
    this.zoom = this.config.nzZoom ?? this._defaultNzZoom;
    this.scaleStep = this.config.nzScaleStep ?? this._defaultNzScaleStep;
    this.rotate = this.config.nzRotate ?? this._defaultNzRotate;
    this.flipHorizontally = false;
    this.flipVertically = false;
    this.reCenterImage();
  }

  private reCenterImage(): void {
    this.position = { ...initialPosition };
  }
}
