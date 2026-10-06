import { Component } from '@angular/core';

import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'nz-demo-timeline-position',
  imports: [NzTimelineModule],
  template: `
    <nz-timeline nzMode="custom">
      <nz-timeline-item nzPlacement="start" [nzIcon]="soccerTemplate">Alice 20'</nz-timeline-item>
      <nz-timeline-item nzPlacement="start" [nzIcon]="soccerTemplate">Susan 28'</nz-timeline-item>
      <nz-timeline-item nzPlacement="end" nzColor="red" [nzIcon]="soccerTemplate">Tim 45'</nz-timeline-item>
      <nz-timeline-item nzPlacement="start" [nzIcon]="soccerTemplate">Bob 79'</nz-timeline-item>
    </nz-timeline>
    <ng-template #soccerTemplate>⚽</ng-template>
  `
})
export class NzDemoTimelinePositionComponent {}
