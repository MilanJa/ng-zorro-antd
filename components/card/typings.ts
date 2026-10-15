/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TemplateRef } from '@angular/core';

import { NzSizeLDSType } from 'ng-zorro-antd/core/types';

/** One head tab of `nz-card [nzTabList]` (antd `CardTabListType`). */
export interface NzCardTabItem {
  key: string;
  label: string | TemplateRef<void>;
  /** An icon type or a template, rendered before the label. */
  icon?: string | TemplateRef<void>;
  disabled?: boolean;
}

/** The part of antd's Card `tabProps` that maps one to one onto `nz-tabs` inputs. */
export interface NzCardTabProps {
  /** Overrides the size derived from the card's `nzSize`. */
  nzSize?: NzSizeLDSType;
  nzType?: 'line' | 'card';
  nzCentered?: boolean;
  nzAnimated?: boolean;
}
