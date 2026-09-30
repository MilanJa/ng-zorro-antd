/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectorRef, Component, inject, input, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NzFormDirective } from './form.directive';
import type { NzFormItemLayout } from './types';

export type NzFormControlStatusType = 'success' | 'error' | 'warning' | 'validating' | '';

/** should add nz-row directive to host, track https://github.com/angular/angular/issues/8785 **/
@Component({
  selector: 'nz-form-item',
  exportAs: 'nzFormItem',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ant-form-item',
    '[class.ant-form-item-has-success]': 'status === "success"',
    '[class.ant-form-item-has-warning]': 'status === "warning"',
    '[class.ant-form-item-has-error]': 'status === "error"',
    '[class.ant-form-item-is-validating]': 'status === "validating"',
    '[class.ant-form-item-has-feedback]': 'hasFeedback && status',
    '[class.ant-form-item-with-help]': 'withHelpClass',
    '[class.ant-form-item-horizontal]': 'nzLayout() === "horizontal"',
    '[class.ant-form-item-vertical]': 'nzLayout() === "vertical"',
    // antd's `Form.js` puts the item in `FormItemPrefixContext` with `inline: true` when the form's
    // own `layout` is `inline`, and `FormItem/index.js` adds `ant-form-item-inline` from that context.
    '[class.ant-form-item-inline]': 'nzFormDirective?.nzLayout === "inline"'
  },
  template: `<ng-content />`
})
export class NzFormItemComponent {
  private cdr = inject(ChangeDetectorRef);
  protected nzFormDirective = inject(NzFormDirective, { skipSelf: true, optional: true });

  readonly nzLayout = input<NzFormItemLayout>();

  status: NzFormControlStatusType = '';
  hasFeedback = false;
  withHelpClass = false;

  constructor() {
    this.nzFormDirective
      ?.getInputObservable('nzLayout')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  setWithHelpViaTips(value: boolean): void {
    this.withHelpClass = value;
    this.cdr.markForCheck();
  }

  setStatus(status: NzFormControlStatusType): void {
    this.status = status;
    this.cdr.markForCheck();
  }

  setHasFeedback(hasFeedback: boolean): void {
    this.hasFeedback = hasFeedback;
    this.cdr.markForCheck();
  }
}
