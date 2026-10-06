import { Component } from '@angular/core';

import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-simple',
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1">
      <nz-step nzTitle="Finished" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzSubtitle="Left 00:00:08" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
  `
})
export class NzDemoStepsSimpleComponent {}
