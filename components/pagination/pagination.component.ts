/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReplaySubject } from 'rxjs';

import { NzConfigKey, NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { NZ_FORM_VARIANT } from 'ng-zorro-antd/core/form';
import { NzBreakpointEnum, NzBreakpointService, gridResponsiveMap } from 'ng-zorro-antd/core/services';
import type { NzSizeLDSType, NzVariant } from 'ng-zorro-antd/core/types';
import { NzI18nService, NzPaginationI18nInterface } from 'ng-zorro-antd/i18n';

import { NzPaginationDefaultComponent } from './pagination-default.component';
import { NzPaginationSimpleComponent } from './pagination-simple.component';
import { PaginationItemRenderContext, type NzPaginationAlign, type NzPaginationSize } from './pagination.types';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'pagination';

@Component({
  selector: 'nz-pagination',
  exportAs: 'nzPagination',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (showPagination) {
      @if (nzSimple) {
        <ng-template [ngTemplateOutlet]="simplePagination.template" />
      } @else {
        <ng-template [ngTemplateOutlet]="defaultPagination.template" />
      }
    }

    <nz-pagination-simple
      #simplePagination
      [disabled]="nzDisabled"
      [itemRender]="nzItemRender"
      [locale]="locale"
      [pageSize]="nzPageSize"
      [total]="nzTotal"
      [pageIndex]="nzPageIndex"
      (pageIndexChange)="onPageIndexChange($event)"
    />
    <nz-pagination-default
      #defaultPagination
      [nzSize]="changerSize"
      [itemRender]="nzItemRender"
      [showTotal]="nzShowTotal"
      [disabled]="nzDisabled"
      [locale]="locale"
      [showSizeChanger]="nzShowSizeChanger"
      [showQuickJumper]="nzShowQuickJumper"
      [total]="nzTotal"
      [pageIndex]="nzPageIndex"
      [pageSize]="nzPageSize"
      [pageSizeOptions]="nzPageSizeOptions"
      (pageIndexChange)="onPageIndexChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    />
  `,
  host: {
    class: 'ant-pagination',
    '[class.ant-pagination-simple]': 'nzSimple',
    '[class.ant-pagination-disabled]': 'nzDisabled',
    '[class.ant-pagination-mini]': `!nzSimple && size === 'small'`,
    '[class.ant-pagination-small]': `!nzSimple && size === 'small'`,
    '[class.ant-pagination-large]': `size === 'large'`,
    '[class.ant-pagination-filled]': `variant() === 'filled'`,
    '[class.ant-pagination-borderless]': `variant() === 'borderless'`,
    '[class.ant-pagination-underlined]': `variant() === 'underlined'`,
    '[class.ant-pagination-rtl]': `dir() === 'rtl'`,
    '[class.ant-pagination-start]': 'nzAlign() === "start"',
    '[class.ant-pagination-center]': 'nzAlign() === "center"',
    '[class.ant-pagination-end]': 'nzAlign() === "end"'
  },
  imports: [NgTemplateOutlet, NzPaginationSimpleComponent, NzPaginationDefaultComponent]
})
export class NzPaginationComponent implements OnInit, OnChanges {
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  private readonly i18n = inject(NzI18nService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointService = inject(NzBreakpointService);
  protected readonly nzConfigService = inject(NzConfigService);
  protected readonly dir = inject(Directionality).valueSignal;
  private readonly destroyRef = inject(DestroyRef);
  private readonly el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly platform = inject(Platform);
  private readonly formVariant = inject(NZ_FORM_VARIANT, { optional: true });

  @Output() readonly nzPageSizeChange = new EventEmitter<number>();
  @Output() readonly nzPageIndexChange = new EventEmitter<number>();
  @Input() nzShowTotal: TemplateRef<{ $implicit: number; range: [number, number] }> | null = null;
  @Input() nzItemRender: TemplateRef<PaginationItemRenderContext> | null = null;
  @Input() @WithConfig() nzSize: NzPaginationSize = 'default';
  @Input() @WithConfig() nzPageSizeOptions: number[] = [10, 20, 30, 40];
  @Input({ transform: booleanAttribute }) @WithConfig() nzShowSizeChanger = false;
  @Input({ transform: booleanAttribute }) @WithConfig() nzShowQuickJumper = false;
  @Input({ transform: booleanAttribute }) @WithConfig() nzSimple = false;
  @Input({ transform: booleanAttribute }) nzDisabled = false;
  @Input({ transform: booleanAttribute }) nzResponsive = false;
  @Input({ transform: booleanAttribute }) nzHideOnSinglePage = false;
  @Input({ transform: numberAttribute }) nzTotal = 0;
  @Input({ transform: numberAttribute }) nzPageIndex = 1;
  @Input({ transform: numberAttribute }) nzPageSize = 10;
  readonly nzAlign = input<NzPaginationAlign>('start');
  /**
   * The quick-jumper and simple-pager input variant. antd has no such prop: it reads `useVariant('input')`,
   * which this mirrors with this input, then the enclosing `nz-form`'s variant, then 'outlined'.
   */
  readonly nzVariant = input<NzVariant>();

  showPagination = true;
  locale!: NzPaginationI18nInterface;
  size: NzPaginationSize = 'default';
  /**
   * The size the size-changer `nz-select` gets. 'large' reaches it only under the v6 stylesheet: the
   * default stylesheet has no large pagination, so a large select would stand out next to default pagers.
   */
  protected changerSize: NzSizeLDSType = 'default';
  protected readonly variant = computed<NzVariant>(() => this.nzVariant() || this.formVariant?.() || 'outlined');

  private total$ = new ReplaySubject<number>(1);

  constructor() {
    afterNextRender(() => {
      if (this.size === 'large') {
        this.updateChangerSize();
        this.cdr.markForCheck();
      }
    });
  }

  validatePageIndex(value: number, lastIndex: number): number {
    if (value > lastIndex) {
      return lastIndex;
    } else if (value < 1) {
      return 1;
    } else {
      return value;
    }
  }

  onPageIndexChange(index: number): void {
    const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
    const validIndex = this.validatePageIndex(index, lastIndex);
    if (validIndex !== this.nzPageIndex && !this.nzDisabled) {
      this.nzPageIndex = validIndex;
      this.nzPageIndexChange.emit(this.nzPageIndex);
    }
  }

  onPageSizeChange(size: number): void {
    this.nzPageSize = size;
    this.nzPageSizeChange.emit(size);
    const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
    if (this.nzPageIndex > lastIndex) {
      this.onPageIndexChange(lastIndex);
    }
  }

  onTotalChange(total: number): void {
    const lastIndex = this.getLastIndex(total, this.nzPageSize);
    if (this.nzPageIndex > lastIndex) {
      Promise.resolve().then(() => {
        this.onPageIndexChange(lastIndex);
        this.cdr.markForCheck();
      });
    }
  }

  getLastIndex(total: number, pageSize: number): number {
    const maxPage = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
    return maxPage || 1;
  }

  ngOnInit(): void {
    this.i18n.localeChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.locale = this.i18n.getLocaleData('Pagination');
      this.cdr.markForCheck();
    });

    this.total$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(total => {
      this.onTotalChange(total);
    });

    this.breakpointService
      .subscribe(gridResponsiveMap)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(bp => {
        if (this.nzResponsive) {
          this.size = bp === NzBreakpointEnum.xs ? 'small' : this.nzSize === 'large' ? 'large' : 'default';
          this.updateChangerSize();
          this.cdr.markForCheck();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzHideOnSinglePage, nzTotal, nzPageSize, nzSize } = changes;
    if (nzTotal) {
      this.total$.next(this.nzTotal);
    }
    if (nzHideOnSinglePage || nzTotal || nzPageSize) {
      this.showPagination =
        (this.nzHideOnSinglePage && this.nzTotal > this.nzPageSize) || (this.nzTotal > 0 && !this.nzHideOnSinglePage);
    }

    if (nzSize) {
      this.size = nzSize.currentValue;
      this.updateChangerSize();
    }
  }

  private updateChangerSize(): void {
    if (this.size === 'small') {
      this.changerSize = 'small';
    } else if (this.size === 'large' && this.hasV6Stylesheet()) {
      this.changerSize = 'large';
    } else {
      this.changerSize = 'default';
    }
  }

  /**
   * The v6 tokens define `--ant-pagination-item-size-lg` and the default stylesheet does not (the same kind
   * of probe as the one in `nz-submenu`).
   */
  private hasV6Stylesheet(): boolean {
    return (
      this.platform.isBrowser &&
      this.el.isConnected &&
      getComputedStyle(this.el).getPropertyValue('--ant-pagination-item-size-lg').trim() !== ''
    );
  }
}
