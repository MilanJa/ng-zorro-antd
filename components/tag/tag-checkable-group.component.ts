/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  booleanAttribute,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';

import { NZ_TAG_CHECKABLE_GROUP } from './tag-checkable-group.token';
import { NzTagCheckableValue } from './typings';

/**
 * antd's `Tag.CheckableTagGroup` for projected `nz-tag nzMode="checkable"` children: the model is the
 * one checked `nzValue` or `null` (the default) or, with `nzMultiple`, an array of checked `nzValue`s. A child without
 * `nzValue` is not part of the model.
 */
@Component({
  selector: 'nz-tag-checkable-group',
  exportAs: 'nzTagCheckableGroup',
  template: `<ng-content />`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NzTagCheckableGroupComponent),
      multi: true
    },
    {
      provide: NZ_TAG_CHECKABLE_GROUP,
      useExisting: forwardRef(() => NzTagCheckableGroupComponent)
    }
  ],
  host: {
    class: 'ant-tag-checkable-group',
    '[class.ant-tag-checkable-group-rtl]': `dir() === 'rtl'`
  },
  encapsulation: ViewEncapsulation.None
})
export class NzTagCheckableGroupComponent implements ControlValueAccessor {
  protected readonly dir = inject(Directionality).valueSignal;

  readonly nzDisabled = input(false, { transform: booleanAttribute });
  readonly nzMultiple = input(false, { transform: booleanAttribute });

  private readonly model = signal<NzTagCheckableValue | NzTagCheckableValue[] | null>(null);
  private readonly formDisabled = signal(false);
  /** The group's `nzDisabled` or a disabled form control; child checkable tags inherit it. */
  readonly disabled = computed(() => this.nzDisabled() || this.formDisabled());

  private onChange: OnChangeType = () => {};
  private onTouched: OnTouchedType = () => {};

  isChecked(value: NzTagCheckableValue): boolean {
    const model = this.model();
    return Array.isArray(model) ? model.includes(value) : model === value;
  }

  /** antd's `handleChange` (CheckableTagGroup.tsx). Returns whether the model changed (false: group disabled). */
  toggle(value: NzTagCheckableValue, checked: boolean): boolean {
    if (this.disabled()) {
      return false;
    }
    const model = this.model();
    let next: NzTagCheckableValue | NzTagCheckableValue[] | null;
    if (this.nzMultiple()) {
      const list = Array.isArray(model) ? model : model === null ? [] : [model];
      next = checked ? [...list, value] : list.filter(item => item !== value);
    } else {
      next = checked ? value : null;
    }
    this.model.set(next);
    this.onChange(next);
    this.onTouched();
    return true;
  }

  writeValue(value: NzTagCheckableValue | NzTagCheckableValue[] | null): void {
    this.model.set(value ?? null);
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
