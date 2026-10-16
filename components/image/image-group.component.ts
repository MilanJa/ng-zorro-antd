/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, Input, TemplateRef, ViewEncapsulation } from '@angular/core';

import { NzImageDirective } from './image.directive';
import { NzImagePreviewActionsContext, NzImagePreviewImageContext } from './typings';

@Component({
  selector: 'nz-image-group',
  exportAs: 'nzImageGroup',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None
})
export class NzImageGroupComponent {
  @Input() nzScaleStep: number | null = null;
  /** Custom preview actions for every image inside, over an image's own value; `null` renders none. */
  @Input() nzActionsRender: TemplateRef<NzImagePreviewActionsContext> | null | undefined = undefined;
  /** Custom preview content for every image inside, over an image's own value. */
  @Input() nzImageRender: TemplateRef<NzImagePreviewImageContext> | undefined = undefined;

  images: NzImageDirective[] = [];

  addImage(image: NzImageDirective): void {
    this.images.push(image);
  }
}
