import { Component } from '@angular/core';

import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-vertical-small',
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1" nzOrientation="vertical" nzSize="small">
      <nz-step nzTitle="Finished" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
  `
})
export class NzDemoStepsVerticalSmallComponent {}
