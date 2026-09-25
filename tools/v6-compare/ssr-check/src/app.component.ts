/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';

@Component({
  selector: 'test-root',
  imports: [NzButtonModule, NzThemeDirective],
  template: `
    <button id="global" nz-button nzType="primary">Global</button>
    <section id="scoped" [nzTheme]="{ token: { borderRadius: 0 } }">
      <button id="inner" nz-button nzType="primary">Scoped</button>
    </section>
  `
})
export class AppComponent {}
