/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { booleanAttribute, Directive, Input } from '@angular/core';

type HandlerSize = 'default' | 'small';

@Directive({
  selector: 'color-handler',
  host: {
    class: 'ant-color-picker-handler',
    '[style.background-color]': 'color',
    '[class.ant-color-picker-handler-sm]': `size === 'small'`,
    // antd's hue/alpha sliders render their handle through antd's own Slider component
    // (`ColorSlider.js`'s `classNames.handle`), not through `@rc-component/color-picker`'s
    // `Handler.js`; this input tells the shared handle element which context it is in.
    '[class.ant-color-picker-slider-handle]': 'slider'
  }
})
export class HandlerDirective {
  @Input() color: string | null = null;
  @Input() size: HandlerSize = 'default';
  @Input({ transform: booleanAttribute }) slider: boolean = false;
}
