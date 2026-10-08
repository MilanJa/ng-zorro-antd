/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { computed, Directive, inject, input } from '@angular/core';

import { responsiveArray, type ResponsiveLike } from 'ng-zorro-antd/core/services';
import type { NgStyleInterface } from 'ng-zorro-antd/core/types';
import { generateClassName, isNotNil, isNumber, isPlainObject, parseFlex } from 'ng-zorro-antd/core/util';

import { NzRowDirective } from './row.directive';

export type ColSpanType = number | string;

export interface ColSize {
  /** Responsive flex (antd v6 `ColSize.flex`); styled by the v6 stylesheet only. */
  flex?: ColSpanType;
  span?: ColSpanType;
  pull?: ColSpanType;
  push?: ColSpanType;
  offset?: ColSpanType;
  order?: ColSpanType;
}

const CLASS_NAME = 'ant-col';

@Directive({
  selector: '[nz-col],nz-col,nz-form-control,nz-form-label',
  exportAs: 'nzCol',
  host: {
    '[class]': 'hostClass()',
    '[class.ant-col-rtl]': `dir() === 'rtl'`,
    '[style]': 'hostStyle()',
    '[style.flex]': 'flexStyle()'
  }
})
export class NzColDirective {
  private readonly nzRowDirective = inject(NzRowDirective, { host: true, optional: true });
  protected readonly dir = inject(Directionality).valueSignal;

  readonly nzFlex = input<ColSpanType | null>();
  readonly nzSpan = input<ColSpanType | null>();
  readonly nzOrder = input<ColSpanType | null>();
  readonly nzOffset = input<ColSpanType | null>();
  readonly nzPush = input<ColSpanType | null>();
  readonly nzPull = input<ColSpanType | null>();
  readonly nzXs = input<ColSpanType | ColSize | null>();
  readonly nzSm = input<ColSpanType | ColSize | null>();
  readonly nzMd = input<ColSpanType | ColSize | null>();
  readonly nzLg = input<ColSpanType | ColSize | null>();
  readonly nzXl = input<ColSpanType | ColSize | null>();
  readonly nzXXl = input<ColSpanType | ColSize | null>();
  readonly nzXXXl = input<ColSpanType | ColSize | null>();

  private readonly responsiveProps = computed<Partial<ResponsiveLike<ColSpanType | ColSize | null | undefined>>>(
    () => ({
      xs: this.nzXs(),
      sm: this.nzSm(),
      md: this.nzMd(),
      lg: this.nzLg(),
      xl: this.nzXl(),
      xxl: this.nzXXl(),
      xxxl: this.nzXXXl()
    })
  );

  protected readonly responsiveClass = computed(() => this.generateClassList(this.responsiveProps()));

  protected readonly hostClass = computed(() => {
    const span = this.nzSpan();
    const order = this.nzOrder();
    const offset = this.nzOffset();
    const push = this.nzPush();
    const pull = this.nzPull();

    const classList = [CLASS_NAME];

    if (isNotNil(span)) {
      classList.push(this.generateClass(`${span}`));
    }

    if (order) {
      classList.push(this.generateClass(`order-${order}`));
    }

    if (offset) {
      classList.push(this.generateClass(`offset-${offset}`));
    }

    if (push) {
      classList.push(this.generateClass(`push-${push}`));
    }

    if (pull) {
      classList.push(this.generateClass(`pull-${pull}`));
    }

    return classList.concat(this.responsiveClass());
  });

  protected readonly flexStyle = computed(() => {
    const flex = this.nzFlex();
    return isNotNil(flex) ? parseFlex(flex) : flex;
  });

  protected readonly gutterPaddingStyle = computed<NgStyleInterface>(() => {
    if (!this.nzRowDirective) {
      return {};
    }
    const [gutterH] = this.nzRowDirective.gutter();
    const style: NgStyleInterface = {};

    // Horizontal gutter use padding
    if (gutterH) {
      const horizontalGutter = isNumber(gutterH) ? coerceCssPixelValue(gutterH / 2) : `calc(${gutterH} / 2)`;
      style['padding-inline'] = horizontalGutter;
    }

    return style;
  });

  /** antd v6 `col.js`: each breakpoint's `flex` becomes a `--ant-col-<size>-flex` custom property. */
  protected readonly responsiveFlexStyle = computed<NgStyleInterface>(() => {
    const props = this.responsiveProps();
    const style: NgStyleInterface = {};
    responsiveArray.forEach(size => {
      const propSize = props[size];
      if (isPlainObject<ColSize>(propSize)) {
        const { flex } = propSize;
        if (flex || flex === 0) {
          style[`--ant-col-${size}-flex`] = parseFlex(flex);
        }
      }
    });
    return style;
  });

  protected readonly hostStyle = computed<NgStyleInterface>(() => ({
    ...this.gutterPaddingStyle(),
    ...this.responsiveFlexStyle()
  }));

  private generateClassList(props: Partial<ResponsiveLike<ColSpanType | ColSize | null | undefined>>): string[] {
    const classList: string[] = [];

    responsiveArray.forEach(size => {
      let sizeProps: ColSize = {};
      const propSize = props[size];
      if (isNumber(propSize) || typeof propSize === 'string') {
        sizeProps.span = propSize;
      } else if (isPlainObject(propSize)) {
        sizeProps = propSize || {};
      }

      const { span, pull, push, offset, order, flex } = sizeProps;

      if (isNotNil(span)) {
        classList.push(this.generateClass(`${size}-${span}`));
      }

      if (order || order === 0) {
        classList.push(this.generateClass(`${size}-order-${order}`));
      }

      if (offset || offset === 0) {
        classList.push(this.generateClass(`${size}-offset-${offset}`));
      }

      if (push || push === 0) {
        classList.push(this.generateClass(`${size}-push-${push}`));
      }

      if (pull || pull === 0) {
        classList.push(this.generateClass(`${size}-pull-${pull}`));
      }

      if (flex || flex === 0) {
        classList.push(this.generateClass(`${size}-flex`));
      }
    });

    return classList;
  }

  private generateClass(suffix: string): string {
    return generateClassName(CLASS_NAME, suffix);
  }
}
