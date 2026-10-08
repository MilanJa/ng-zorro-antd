import { Component } from '@angular/core';

import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'nz-demo-progress-info-position',
  imports: [NzProgressModule],
  template: `
    <div class="list">
      <nz-progress
        [nzPercent]="0"
        [nzPercentPosition]="{ align: 'center', type: 'inner' }"
        [nzSize]="[200, 20]"
        nzStrokeColor="#E6F4FF"
      />
      <nz-progress [nzPercent]="10" [nzPercentPosition]="{ align: 'center', type: 'inner' }" [nzSize]="[300, 20]" />
      <nz-progress
        [nzPercent]="50"
        [nzPercentPosition]="{ align: 'start', type: 'inner' }"
        [nzSize]="[300, 20]"
        nzStrokeColor="#B7EB8F"
      />
      <nz-progress
        [nzPercent]="60"
        [nzPercentPosition]="{ align: 'end', type: 'inner' }"
        [nzSize]="[300, 20]"
        nzStrokeColor="#001342"
      />
      <nz-progress [nzPercent]="100" [nzPercentPosition]="{ align: 'center', type: 'inner' }" [nzSize]="[400, 20]" />
      <nz-progress [nzPercent]="60" [nzPercentPosition]="{ align: 'start', type: 'outer' }" />
      <nz-progress [nzPercent]="100" [nzPercentPosition]="{ align: 'start', type: 'outer' }" />
      <nz-progress [nzPercent]="60" [nzPercentPosition]="{ align: 'center', type: 'outer' }" nzSize="small" />
      <nz-progress [nzPercent]="100" [nzPercentPosition]="{ align: 'center', type: 'outer' }" />
    </div>
  `,
  styles: `
    .list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `
})
export class NzDemoProgressInfoPositionComponent {}
