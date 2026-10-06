/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Component, signal } from '@angular/core';

import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-panel',
  imports: [NzStepsModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px">
      @for (outlined of [false, true]; track outlined) {
        <nz-steps
          nzType="panel"
          [nzCurrent]="current()"
          [nzSize]="outlined ? 'small' : 'default'"
          [nzVariant]="outlined ? 'outlined' : 'filled'"
          (nzIndexChange)="current.set($event)"
        >
          <nz-step nzTitle="Step 1" nzSubtitle="00:00" nzContent="This is a content." />
          <nz-step nzTitle="Step 2" nzContent="This is a content." nzStatus="error" />
          <nz-step nzTitle="Step 3" nzContent="This is a content." />
        </nz-steps>
      }
    </div>
  `
})
export class NzDemoStepsPanelComponent {
  readonly current = signal(0);
}
