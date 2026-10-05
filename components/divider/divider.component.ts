/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  signal
} from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import type { NzSizeLMSType } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-divider',
  exportAs: 'nzDivider',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (nzText) {
      @if (nzType === 'horizontal') {
        <div class="ant-divider-rail ant-divider-rail-start"></div>
      }
      <span class="ant-divider-inner-text">
        <ng-container *nzStringTemplateOutlet="nzText">{{ nzText }}</ng-container>
      </span>
      @if (nzType === 'horizontal') {
        <div class="ant-divider-rail ant-divider-rail-end"></div>
      }
    }
  `,
  host: {
    class: 'ant-divider',
    '[class.ant-divider-horizontal]': `nzType === 'horizontal'`,
    '[class.ant-divider-vertical]': `nzType === 'vertical'`,
    '[class.ant-divider-with-text]': `nzText`,
    '[class.ant-divider-plain]': `nzPlain`,
    '[class.ant-divider-with-text-left]': `nzText && nzOrientation === 'left'`,
    '[class.ant-divider-with-text-right]': `nzText && nzOrientation === 'right'`,
    '[class.ant-divider-with-text-center]': `nzText && nzOrientation === 'center'`,
    '[class.ant-divider-with-text-start]': `nzText && titlePlacement() === 'start'`,
    '[class.ant-divider-with-text-end]': `nzText && titlePlacement() === 'end'`,
    '[class.ant-divider-rail]': `!nzText`,
    '[class.ant-divider-dashed]': `nzDashed || nzVariant === 'dashed'`,
    '[class.ant-divider-dotted]': `nzVariant === 'dotted'`,
    '[class.ant-divider-sm]': `nzSize === 'small'`,
    '[class.ant-divider-md]': `nzSize === 'middle'`
  },
  imports: [NzOutletModule]
})
export class NzDividerComponent {
  @Input() nzText?: string | TemplateRef<void>;
  @Input() nzType: 'horizontal' | 'vertical' = 'horizontal';
  @Input()
  set nzOrientation(value: 'left' | 'right' | 'center') {
    this.orientation.set(value);
  }
  get nzOrientation(): 'left' | 'right' | 'center' {
    return this.orientation();
  }
  @Input() nzVariant: 'dashed' | 'dotted' | 'solid' = 'solid';
  @Input() nzSize: NzSizeLMSType | undefined;
  @Input({ transform: booleanAttribute }) nzDashed = false;
  @Input({ transform: booleanAttribute }) nzPlain = false;

  protected readonly dir = inject(Directionality).valueSignal;
  private readonly orientation = signal<'left' | 'right' | 'center'>('center');
  /**
   * The logical title placement antd v6 derives from a physical `left`/`right` and the direction
   * (`divider/index.js`, `mergedTitlePlacement`): its `-with-text-start|end` classes size the rails.
   */
  protected readonly titlePlacement = computed<'start' | 'end' | 'center'>(() => {
    const orientation = this.orientation();
    if (orientation === 'left') {
      return this.dir() === 'rtl' ? 'end' : 'start';
    }
    if (orientation === 'right') {
      return this.dir() === 'rtl' ? 'start' : 'end';
    }
    return 'center';
  });
}
