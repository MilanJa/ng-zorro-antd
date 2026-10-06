import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'nz-demo-timeline-horizontal',
  imports: [NzDividerModule, NzTimelineModule],
  template: `
    @for (mode of modes; track mode) {
      @if (!$first) {
        <nz-divider />
      }
      <nz-timeline nzOrientation="horizontal" [nzMode]="mode">
        @for (step of steps; track step) {
          <nz-timeline-item>{{ step }}</nz-timeline-item>
        }
      </nz-timeline>
    }
  `
})
export class NzDemoTimelineHorizontalComponent {
  readonly modes = ['start', 'end', 'alternate'] as const;
  readonly steps = ['Init', 'Start', 'Pending', 'Complete'];
}
