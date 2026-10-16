/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostAttributeToken,
  inject,
  Input,
  TemplateRef,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { NzConfigKey, onConfigChangeEventForComponent, WithConfig } from 'ng-zorro-antd/core/config';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NZ_CONFIG_MODULE_NAME } from './image-config';
import { ImageStatusType, NzImageDirective } from './image.directive';
import { NzImagePreviewActionsContext, NzImagePreviewImageContext } from './typings';

const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [role="button"], [tabindex]';

export type NzImageCoverPlacement = 'center' | 'top' | 'bottom';

/** A number, or a string of digits only, is a length in px; any other string is used as written. */
function toCssLength(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return typeof value === 'number' || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/** A bare `nzPreviewCover` attribute (`''`) is the default cover and the string `'false'` is no cover. */
function coerceCover(
  value: string | TemplateRef<void> | boolean | undefined
): string | TemplateRef<void> | boolean | undefined {
  if (value === '') {
    return true;
  }
  return value === 'false' ? false : value;
}

/**
 * antd's inline image: a wrapper element around an `img[nz-image]`, with a loading placeholder and a
 * hover cover over a previewable image (`@rc-component/image` `Image.js`). The bare `img[nz-image]`
 * directive stays the lightweight form with no wrapper.
 */
@Component({
  selector: 'nz-image-wrapper',
  exportAs: 'nzImageWrapper',
  template: `
    <img
      nz-image
      class="ant-image-img"
      [class.ant-image-img-placeholder]="nzPlaceholder === true"
      [style.height]="cssHeight"
      [attr.alt]="nzAlt || null"
      [attr.width]="nzWidth ?? null"
      [attr.height]="nzHeight ?? null"
      [nzSrc]="nzSrc"
      [nzSrcset]="nzSrcset"
      [nzFallback]="nzFallback"
      [nzPlaceholder]="placeholderUrl"
      [nzDisablePreview]="nzDisablePreview"
      [nzScaleStep]="nzScaleStep"
      [nzActionsRender]="nzActionsRender"
      [nzImageRender]="nzImageRender"
    />
    @if (placeholderTemplate && status() === 'loading') {
      <div class="ant-image-placeholder" aria-hidden="true">
        <ng-container [ngTemplateOutlet]="placeholderTemplate" />
      </div>
    }
    @if (showCover) {
      <div
        class="ant-image-cover ant-image-mask"
        [class.ant-image-cover-center]="placement === 'center'"
        [class.ant-image-cover-top]="placement === 'top'"
        [class.ant-image-cover-bottom]="placement === 'bottom'"
      >
        @if (coverTemplate) {
          <ng-container [ngTemplateOutlet]="coverTemplate" />
        } @else if (coverText !== null) {
          {{ coverText }}
        } @else {
          <div class="ant-image-mask-info"><nz-icon nzType="eye" />{{ previewText() }}</div>
        }
      </div>
    }
  `,
  host: {
    class: 'ant-image',
    '[class.ant-image-error]': `status() === 'error'`,
    '[attr.role]': 'role',
    '[attr.tabindex]': 'tabindex',
    '[attr.aria-label]': 'ariaLabel',
    '[style.width]': 'cssWidth',
    '[style.height]': 'cssHeight',
    '(click)': 'onHostClick($event)',
    '(keydown)': 'onHostKeydown($event)'
  },
  imports: [NgTemplateOutlet, NzIconModule, NzImageDirective],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NzImageWrapperComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(NzI18nService);
  private readonly hostElement: HTMLElement = inject(ElementRef).nativeElement;
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;
  /** An `aria-label` the app writes on the element wins over `nzAlt`, as antd's `aria-label ?? alt`. */
  private readonly hostAriaLabel = inject(new HostAttributeToken('aria-label'), { optional: true });

  /** A `role` or `tabindex` the app writes on the element wins over the previewable defaults. */
  private readonly hostRole = inject(new HostAttributeToken('role'), { optional: true });
  private readonly hostTabindex = inject(new HostAttributeToken('tabindex'), { optional: true });

  @Input() nzSrc: string = '';
  @Input() nzSrcset: string = '';
  @Input() nzAlt: string | null | undefined;
  @Input() nzWidth: string | number | null | undefined;
  @Input() nzHeight: string | number | null | undefined;
  @Input() @WithConfig() nzFallback: string | null = null;
  @Input() @WithConfig() nzPlaceholder: string | TemplateRef<void> | boolean | null = false;
  @Input({ transform: booleanAttribute }) @WithConfig() nzDisablePreview: boolean = false;
  @Input() @WithConfig() nzScaleStep: number | null = null;
  @Input({ transform: coerceCover }) nzPreviewCover: string | TemplateRef<void> | boolean | undefined = true;
  @Input() nzPreviewCoverPlacement: NzImageCoverPlacement | undefined = 'center';
  @Input() nzActionsRender: TemplateRef<NzImagePreviewActionsContext> | null | undefined;
  @Input() nzImageRender: TemplateRef<NzImagePreviewImageContext> | undefined;

  private readonly image = viewChild(NzImageDirective);
  protected readonly status = computed<ImageStatusType>(() => this.image()?.imageStatus() ?? 'normal');
  protected readonly previewText = toSignal(
    this.i18n.localeChange.pipe(map(() => this.i18n.getLocaleData('Image.preview', 'Preview') as string)),
    { initialValue: 'Preview' }
  );

  constructor() {
    onConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME, () => this.cdr.markForCheck());
  }

  get previewable(): boolean {
    // The config value is typed `string`, so coerce it as the inner directive's input does.
    return !booleanAttribute(this.nzDisablePreview) && this.status() !== 'error';
  }

  protected get role(): string | null {
    return this.previewable ? (this.hostRole ?? 'button') : this.hostRole;
  }

  protected get tabindex(): string | null {
    return this.previewable ? (this.hostTabindex ?? '0') : this.hostTabindex;
  }

  protected get ariaLabel(): string | null {
    return this.previewable ? (this.hostAriaLabel ?? this.nzAlt) || null : (this.hostAriaLabel ?? null);
  }

  protected get cssWidth(): string | null {
    return toCssLength(this.nzWidth);
  }

  protected get cssHeight(): string | null {
    return toCssLength(this.nzHeight);
  }

  protected get placeholderUrl(): string | null {
    return typeof this.nzPlaceholder === 'string' ? this.nzPlaceholder : null;
  }

  protected get placeholderTemplate(): TemplateRef<void> | null {
    return this.nzPlaceholder instanceof TemplateRef ? this.nzPlaceholder : null;
  }

  protected get showCover(): boolean {
    return this.nzPreviewCover !== false && this.previewable;
  }

  protected get coverTemplate(): TemplateRef<void> | null {
    return this.nzPreviewCover instanceof TemplateRef ? this.nzPreviewCover : null;
  }

  protected get coverText(): string | null {
    return typeof this.nzPreviewCover === 'string' ? this.nzPreviewCover : null;
  }

  protected get placement(): NzImageCoverPlacement {
    return this.nzPreviewCoverPlacement ?? 'center';
  }

  /** The inner image previews on its own click; a click on the cover or the placeholder previews here. */
  protected onHostClick(event: MouseEvent): void {
    const image = this.image();
    if (!image || event.target === image.getElement().nativeElement) {
      return;
    }
    image.onPreview();
  }

  protected onHostKeydown(event: KeyboardEvent): void {
    if (!this.previewable || (event.key !== 'Enter' && event.key !== ' ') || this.isFromInteractiveContent(event)) {
      return;
    }
    event.preventDefault();
    this.image()?.onPreview();
  }

  /** A key press on a control inside the cover (a button, a link) belongs to that control. */
  private isFromInteractiveContent(event: KeyboardEvent): boolean {
    const host = this.hostElement;
    const target = event.target;
    if (!(target instanceof Element) || target === host) {
      return false;
    }
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    return interactive !== null && interactive !== host && host.contains(interactive);
  }
}
