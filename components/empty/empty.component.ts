/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzEmptyI18nInterface, NzI18nService } from 'ng-zorro-antd/i18n';

import { NzEmptyDefaultComponent } from './partial/default';
import { NzEmptySimpleComponent } from './partial/simple';

const NzEmptyDefaultImages = ['default', 'simple'] as const;
type NzEmptyNotFoundImageType = (typeof NzEmptyDefaultImages)[number] | null | string | TemplateRef<void>;

@Component({
  selector: 'nz-empty',
  exportAs: 'nzEmpty',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="ant-empty-image">
      @if (!isImageBuildIn) {
        <ng-container *nzStringTemplateOutlet="nzNotFoundImage">
          <img [src]="nzNotFoundImage" [alt]="isContentString ? nzNotFoundContent : 'empty'" />
        </ng-container>
      } @else {
        @if (nzNotFoundImage === 'simple') {
          <nz-empty-simple />
        } @else {
          <nz-empty-default />
        }
      }
    </div>
    @if (nzNotFoundContent !== null) {
      <p class="ant-empty-description">
        <ng-container *nzStringTemplateOutlet="nzNotFoundContent">
          {{ isContentString ? nzNotFoundContent : locale['description'] }}
        </ng-container>
      </p>
    }

    @if (nzNotFoundFooter) {
      <div class="ant-empty-footer">
        <ng-container *nzStringTemplateOutlet="nzNotFoundFooter">
          {{ nzNotFoundFooter }}
        </ng-container>
      </div>
    }
  `,
  host: {
    class: 'ant-empty',
    // antd's Empty/index.js adds `${prefixCls}-normal` whenever the SIMPLE built-in image is used,
    // regardless of caller (`mergedImage === simpleEmptyImg`). Compiled v4 CSS already styles the
    // literal `ant-empty-normal` (`margin: 32px 0`, dimmer text, a 40px image), so emitting it here
    // unconditionally would newly apply that v4 look to every direct `nzNotFoundImage="simple"` caller
    // that never opted into it before (confirmed by a default-theme capture of the `simple` demo).
    // `nz-empty-simple` is a v4-inert hook: style/v6/patch.css mirrors the same v6 rule onto it so the
    // v6 theme gets the antd-correct sizing/colour without touching v4's existing rendering.
    '[class.nz-empty-simple]': "nzNotFoundImage === 'simple'",
    '[class.nz-empty-rtl]': "dir() === 'rtl'"
  },
  imports: [NzOutletModule, NzEmptyDefaultComponent, NzEmptySimpleComponent]
})
export class NzEmptyComponent implements OnChanges, OnInit {
  private i18n = inject(NzI18nService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected readonly dir = inject(Directionality).valueSignal;

  @Input() nzNotFoundImage: NzEmptyNotFoundImageType = 'default';
  @Input() nzNotFoundContent?: string | TemplateRef<void> | null;
  @Input() nzNotFoundFooter?: string | TemplateRef<void>;

  isContentString = false;
  isImageBuildIn = true;
  locale!: NzEmptyI18nInterface;

  ngOnChanges(changes: SimpleChanges): void {
    const { nzNotFoundContent, nzNotFoundImage } = changes;

    if (nzNotFoundContent) {
      const content = nzNotFoundContent.currentValue;
      this.isContentString = typeof content === 'string';
    }

    if (nzNotFoundImage) {
      const image = nzNotFoundImage.currentValue || 'default';
      this.isImageBuildIn = NzEmptyDefaultImages.findIndex(i => i === image) > -1;
    }
  }

  ngOnInit(): void {
    this.i18n.localeChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.locale = this.i18n.getLocaleData('Empty');
      this.cdr.markForCheck();
    });
  }
}
