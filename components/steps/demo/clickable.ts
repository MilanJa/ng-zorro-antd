import { Component, signal } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-clickable',
  imports: [NzDividerModule, NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="index()" (nzIndexChange)="onIndexChange($event)">
      <nz-step nzTitle="Finished" [nzDisabled]="disable" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
    <nz-divider />
    <nz-steps nzOrientation="vertical" [nzCurrent]="index()" (nzIndexChange)="onIndexChange($event)">
      <nz-step nzTitle="Finished" nzContent="This is a description." />
      <nz-step nzTitle="In Progress" nzContent="This is a description." />
      <nz-step nzTitle="Waiting" nzContent="This is a description." />
    </nz-steps>
  `
})
export class NzDemoStepsClickableComponent {
  readonly index = signal(0);
  disable = false;

  onIndexChange(index: number): void {
    this.index.set(index);
  }
}
