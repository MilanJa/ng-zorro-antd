import { Component } from '@angular/core';

import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-vertical',
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1" nzOrientation="vertical">
      <nz-step nzTitle="Finished" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
  `
})
export class NzDemoStepsVerticalComponent {}
