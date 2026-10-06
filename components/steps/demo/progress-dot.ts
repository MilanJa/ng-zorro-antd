import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-progress-dot',
  imports: [NzDividerModule, NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1" nzType="dot">
      <nz-step nzTitle="Finished" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
    <nz-divider />
    <nz-steps [nzCurrent]="1" nzType="dot" nzOrientation="vertical">
      <nz-step nzTitle="Finished" nzContent="This is a description. This is a description." />
      <nz-step nzTitle="Finished" nzContent="This is a description. This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description. This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
  `
})
export class NzDemoStepsProgressDotComponent {}
