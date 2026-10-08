/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { InjectionToken } from '@angular/core';

import type { NzTagCheckableGroupComponent } from './tag-checkable-group.component';

/** Lets a checkable `nz-tag` find its group without importing the group component. */
export const NZ_TAG_CHECKABLE_GROUP = new InjectionToken<NzTagCheckableGroupComponent>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'nz-tag-checkable-group' : ''
);
