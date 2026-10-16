/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  booleanAttribute,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NzConfigKey, NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { nzThemeScopeClasses } from 'ng-zorro-antd/core/theme';

import { NzImageGroupComponent } from './image-group.component';
import { NzImagePreviewOptions } from './image-preview-options';
import { NZ_DEFAULT_SCALE_STEP } from './image-preview.component';
import { NzImageService } from './image.service';
import { NzImagePreviewActionsContext, NzImagePreviewImageContext } from './typings';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'image';

export type ImageStatusType = 'error' | 'loading' | 'normal';
export type NzImageUrl = string;
export type NzImageScaleStep = number;

/** Only the bound slots enter the preview options, so an image without them previews with today's options. */
function renderSlotOptions(
  actionsRender: TemplateRef<NzImagePreviewActionsContext> | null | undefined,
  imageRender: TemplateRef<NzImagePreviewImageContext> | undefined
): Pick<NzImagePreviewOptions, 'nzActionsRender' | 'nzImageRender'> {
  return {
    ...(actionsRender !== undefined ? { nzActionsRender: actionsRender } : {}),
    ...(imageRender ? { nzImageRender: imageRender } : {})
  };
}

@Directive({
  selector: 'img[nz-image]',
  exportAs: 'nzImage',
  host: {
    '(click)': 'onPreview()'
  }
})
export class NzImageDirective implements OnInit, OnChanges {
  private document: Document = inject(DOCUMENT);
  public nzConfigService = inject(NzConfigService);
  private elementRef = inject(ElementRef);
  private nzImageService = inject(NzImageService);
  protected readonly dir = inject(Directionality).valueSignal;
  private destroyRef = inject(DestroyRef);
  private readonly themeScopeClasses = nzThemeScopeClasses();
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  @Input() nzSrc = '';
  @Input() nzSrcset = '';
  @Input({ transform: booleanAttribute }) @WithConfig() nzDisablePreview: boolean = false;
  @Input() @WithConfig() nzFallback: string | null = null;
  @Input() @WithConfig() nzPlaceholder: string | null = null;
  @Input() @WithConfig() nzScaleStep: number | null = null;
  /** Custom preview actions; `null` renders none. A parent `nz-image-group`'s value wins. */
  @Input() nzActionsRender: TemplateRef<NzImagePreviewActionsContext> | null | undefined = undefined;
  /** Custom preview content in place of the previewed image. A parent `nz-image-group`'s value wins. */
  @Input() nzImageRender: TemplateRef<NzImagePreviewImageContext> | undefined = undefined;

  backLoadImage!: HTMLImageElement;
  status: ImageStatusType = 'normal';
  private backLoadDestroy$ = new Subject<void>();

  private parentGroup = inject(NzImageGroupComponent, { optional: true });

  get previewable(): boolean {
    return !this.nzDisablePreview && this.status !== 'error';
  }
  ngOnInit(): void {
    this.backLoad();
    if (this.parentGroup) {
      this.parentGroup.addImage(this);
    }
  }

  onPreview(): void {
    if (!this.previewable) {
      return;
    }

    if (this.parentGroup) {
      // preview inside image group
      const previewAbleImages = this.parentGroup.images.filter(e => e.previewable);
      const previewImages = previewAbleImages.map(e => ({ src: e.nzSrc, srcset: e.nzSrcset }));
      const previewIndex = previewAbleImages.findIndex(el => this === el);
      const scaleStepMap = new Map<NzImageUrl, NzImageScaleStep>();
      previewAbleImages.forEach(imageDirective => {
        scaleStepMap.set(
          imageDirective.nzSrc ?? imageDirective.nzSrcset,
          imageDirective.nzScaleStep ?? this.parentGroup!.nzScaleStep ?? this.nzScaleStep ?? NZ_DEFAULT_SCALE_STEP
        );
      });
      const previewRef = this.nzImageService.previewWithScope(
        previewImages,
        {
          nzDirection: this.dir(),
          ...renderSlotOptions(
            this.parentGroup.nzActionsRender !== undefined ? this.parentGroup.nzActionsRender : this.nzActionsRender,
            this.parentGroup.nzImageRender ?? this.nzImageRender
          )
        },
        scaleStepMap,
        this.themeScopeClasses()
      );
      previewRef.switchTo(previewIndex);
    } else {
      // preview not inside image group
      const previewImages = [{ src: this.nzSrc, srcset: this.nzSrcset }];
      this.nzImageService.previewWithScope(
        previewImages,
        {
          nzDirection: this.dir(),
          nzScaleStep: this.nzScaleStep ?? NZ_DEFAULT_SCALE_STEP,
          ...renderSlotOptions(this.nzActionsRender, this.nzImageRender)
        },
        undefined,
        this.themeScopeClasses()
      );
    }
  }

  getElement(): ElementRef<HTMLImageElement> {
    return this.elementRef;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzSrc } = changes;
    if (nzSrc) {
      this.getElement().nativeElement.src = nzSrc.currentValue;
      this.backLoad();
    }
  }

  /**
   * use internal Image object handle fallback & placeholder
   *
   * @private
   */
  private backLoad(): void {
    this.backLoadImage = this.document.createElement('img');
    this.backLoadImage.src = this.nzSrc;
    this.backLoadImage.srcset = this.nzSrcset;
    this.status = 'loading';

    // unsubscribe last backLoad
    this.backLoadDestroy$.next();
    this.backLoadDestroy$.complete();
    this.backLoadDestroy$ = new Subject();
    if (this.backLoadImage.complete) {
      this.status = 'normal';
      this.getElement().nativeElement.src = this.nzSrc;
      this.getElement().nativeElement.srcset = this.nzSrcset;
    } else {
      if (this.nzPlaceholder) {
        this.getElement().nativeElement.src = this.nzPlaceholder;
        this.getElement().nativeElement.srcset = '';
      } else {
        this.getElement().nativeElement.src = this.nzSrc;
        this.getElement().nativeElement.srcset = this.nzSrcset;
      }

      // The `nz-image` directive can be destroyed before the `load` or `error` event is dispatched,
      // so there's no sense to keep capturing `this`.
      fromEvent(this.backLoadImage, 'load')
        .pipe(takeUntil(this.backLoadDestroy$), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.status = 'normal';
          this.getElement().nativeElement.src = this.nzSrc;
          this.getElement().nativeElement.srcset = this.nzSrcset;
        });

      fromEvent(this.backLoadImage, 'error')
        .pipe(takeUntil(this.backLoadDestroy$), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.status = 'error';
          if (this.nzFallback) {
            this.getElement().nativeElement.src = this.nzFallback;
            this.getElement().nativeElement.srcset = '';
          }
        });
    }
  }
}
