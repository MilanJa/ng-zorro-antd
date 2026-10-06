import { Component, signal } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'nz-demo-timeline-loading',
  imports: [NzButtonModule, NzFlexModule, NzTimelineModule],
  template: `
    <nz-flex nzVertical nzGap="middle" nzAlign="flex-start">
      <nz-timeline [nzReverse]="reverse()">
        <nz-timeline-item>Create a services site 2015-09-01</nz-timeline-item>
        <nz-timeline-item>Solve initial network problems 2015-09-01</nz-timeline-item>
        <nz-timeline-item>Technical testing 2015-09-01</nz-timeline-item>
        <nz-timeline-item nzLoading>Recording...</nz-timeline-item>
      </nz-timeline>
      <button nz-button nzType="primary" (click)="reverse.set(!reverse())">Toggle Reverse</button>
    </nz-flex>
  `
})
export class NzDemoTimelineLoadingComponent {
  readonly reverse = signal(false);
}
