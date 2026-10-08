/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgModule } from '@angular/core';

import { NzTagCheckableGroupComponent } from './tag-checkable-group.component';
import { NzTagComponent } from './tag.component';

@NgModule({
  imports: [NzTagComponent, NzTagCheckableGroupComponent],
  exports: [NzTagComponent, NzTagCheckableGroupComponent]
})
export class NzTagModule {}
