import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';

import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-customized-progress-dot',
  imports: [NgTemplateOutlet, NzStepsModule, NzPopoverModule],
  template: `
    <nz-steps [nzCurrent]="1" [nzProgressDot]="progressTemplate">
      <nz-step nzTitle="Finished" nzContent="You can hover on the dot." />
      <nz-step nzTitle="In Progress" nzContent="You can hover on the dot." />
      <nz-step nzTitle="Waiting" nzContent="You can hover on the dot." />
      <nz-step nzTitle="Waiting" nzContent="You can hover on the dot." />
    </nz-steps>
    <ng-template #progressTemplate let-dot let-status="status" let-index="index">
      <span nz-popover nzPopoverContent="steps {{ index }} status: {{ status }}" style="margin-left: -100%;">
        <ng-template [ngTemplateOutlet]="dot" />
      </span>
    </ng-template>
  `
})
export class NzDemoStepsCustomizedProgressDotComponent {}
