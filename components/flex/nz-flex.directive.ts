/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Directive, Input, booleanAttribute, inject } from '@angular/core';

import { NzAlign, NzFlex, NzFlexOrientation, NzGap, NzJustify, NzWrap } from './typings';

@Directive({
  selector: '[nz-flex],nz-flex',
  exportAs: 'nzFlex',
  host: {
    class: 'ant-flex',
    '[class.ant-flex-rtl]': `dir() === 'rtl'`,
    '[class.ant-flex-gap-small]': `nzGap === 'small'`,
    '[class.ant-flex-gap-medium]': `nzGap === 'medium'`,
    '[class.ant-flex-gap-middle]': `nzGap === 'middle'`,
    '[class.ant-flex-gap-large]': `nzGap === 'large'`,
    '[class.ant-flex-vertical]': `isVertical`,
    '[class.ant-flex-justify-flex-start]': `nzJustify === 'flex-start'`,
    '[class.ant-flex-justify-center]': `nzJustify === 'center'`,
    '[class.ant-flex-justify-flex-end]': `nzJustify === 'flex-end'`,
    '[class.ant-flex-justify-space-between]': `nzJustify === 'space-between'`,
    '[class.ant-flex-justify-space-around]': `nzJustify === 'space-around'`,
    '[class.ant-flex-justify-space-evenly]': `nzJustify === 'space-evenly'`,
    '[class.ant-flex-justify-start]': `nzJustify === 'start'`,
    '[class.ant-flex-justify-end]': `nzJustify === 'end'`,
    '[class.ant-flex-justify-right]': `nzJustify === 'right'`,
    '[class.ant-flex-justify-left]': `nzJustify === 'left'`,
    '[class.ant-flex-justify-stretch]': `nzJustify === 'stretch'`,
    '[class.ant-flex-justify-normal]': `nzJustify === 'normal'`,
    '[class.ant-flex-align-flex-start]': `nzAlign === 'flex-start'`,
    '[class.ant-flex-align-center]': `nzAlign === 'center'`,
    '[class.ant-flex-align-flex-end]': `nzAlign === 'flex-end'`,
    '[class.ant-flex-align-space-between]': `nzAlign === 'space-between'`,
    '[class.ant-flex-align-space-around]': `nzAlign === 'space-around'`,
    '[class.ant-flex-align-space-evenly]': `nzAlign === 'space-evenly'`,
    '[class.ant-flex-align-start]': `nzAlign === 'start'`,
    '[class.ant-flex-align-end]': `nzAlign === 'end'`,
    '[class.ant-flex-align-right]': `nzAlign === 'right'`,
    '[class.ant-flex-align-left]': `nzAlign === 'left'`,
    '[class.ant-flex-align-stretch]': `nzAlign === 'stretch'`,
    '[class.ant-flex-align-normal]': `nzAlign === 'normal'`,
    '[class.ant-flex-align-baseline]': `nzAlign === 'baseline'`,
    '[class.ant-flex-align-self-start]': `nzAlign === 'self-start'`,
    '[class.ant-flex-align-self-end]': `nzAlign === 'self-end'`,
    '[class.ant-flex-wrap-wrap]': `wrap === 'wrap'`,
    '[class.ant-flex-wrap-wrap-reverse]': `wrap === 'wrap-reverse'`,
    '[class.ant-flex-wrap-nowrap]': `wrap === 'nowrap'`,
    '[style.gap]': `gap`,
    '[style.flex]': `nzFlex`
  }
})
export class NzFlexDirective {
  protected readonly dir = inject(Directionality).valueSignal;

  @Input({ transform: booleanAttribute }) nzVertical: boolean = false;
  /** Layout direction. A valid value takes precedence over `nzVertical`, as antd's `useOrientation` does. */
  @Input() nzOrientation?: NzFlexOrientation;
  @Input() nzJustify: NzJustify = 'normal';
  @Input() nzAlign: NzAlign = 'normal';
  @Input() nzGap: NzGap = 0;
  /** `true` is shorthand for `'wrap'` and `false` for `'nowrap'`. */
  @Input() nzWrap: NzWrap | boolean = 'nowrap';
  @Input() nzFlex: NzFlex = 'unset';

  protected get isVertical(): boolean {
    if (this.nzOrientation === 'horizontal' || this.nzOrientation === 'vertical') {
      return this.nzOrientation === 'vertical';
    }
    return this.nzVertical;
  }

  protected get wrap(): NzWrap {
    if (this.nzWrap === true) {
      return 'wrap';
    }
    if (this.nzWrap === false) {
      return 'nowrap';
    }
    return this.nzWrap;
  }

  // Preset gaps read antd v6's padding tokens with the v4 pixel value as fallback; no v4 stylesheet
  // defines `--ant-padding*`.
  protected get gap(): string {
    switch (this.nzGap) {
      case 'small':
        return 'var(--ant-padding-xs, 8px)';
      case 'medium':
      case 'middle':
        return 'var(--ant-padding, 16px)';
      case 'large':
        return 'var(--ant-padding-lg, 24px)';
      default:
        if (typeof this.nzGap === 'number') {
          return `${this.nzGap}px`;
        }
        return this.nzGap;
    }
  }
}
