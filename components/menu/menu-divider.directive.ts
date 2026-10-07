/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directive, Input, booleanAttribute, inject } from '@angular/core';

import { NzIsMenuInsideDropdownToken } from './menu.token';

@Directive({
  selector: '[nz-menu-divider]',
  exportAs: 'nzMenuDivider',
  host: {
    class: 'ant-dropdown-menu-item-divider',
    '[class.ant-menu-item-divider-dashed]': 'nzDashed && !isMenuInsideDropdown'
  }
})
export class NzMenuDividerDirective {
  protected readonly isMenuInsideDropdown = inject(NzIsMenuInsideDropdownToken, { optional: true }) ?? false;
  @Input({ transform: booleanAttribute }) nzDashed = false;
}
