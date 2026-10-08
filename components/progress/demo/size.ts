import { Component } from '@angular/core';

import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'nz-demo-progress-size',
  imports: [NzProgressModule],
  template: `
    <div class="column">
      <div class="column line">
        <nz-progress [nzPercent]="50" />
        <nz-progress [nzPercent]="50" nzSize="small" />
        <nz-progress [nzPercent]="50" [nzSize]="[300, 20]" />
      </div>
      <div class="row">
        <nz-progress nzType="circle" [nzPercent]="50" [nzSize]="120" />
        <nz-progress nzType="circle" [nzPercent]="50" [nzSize]="60" />
        <nz-progress nzType="circle" [nzPercent]="50" [nzSize]="20" [nzShowInfo]="false" />
      </div>
      <div class="row">
        <nz-progress nzType="dashboard" [nzPercent]="50" [nzSize]="120" />
        <nz-progress nzType="dashboard" [nzPercent]="50" [nzSize]="60" />
        <nz-progress nzType="dashboard" [nzPercent]="50" [nzSize]="20" [nzShowInfo]="false" />
      </div>
      <div class="row">
        <nz-progress [nzSteps]="3" [nzPercent]="50" />
        <nz-progress [nzSteps]="3" [nzPercent]="50" nzSize="small" />
        <nz-progress [nzSteps]="3" [nzPercent]="50" [nzSize]="20" />
        <nz-progress [nzSteps]="3" [nzPercent]="50" [nzSize]="[20, 30]" />
      </div>
    </div>
  `,
  styles: `
    .column {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .line {
      width: 300px;
      gap: 8px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 30px;
    }
  `
})
export class NzDemoProgressSizeComponent {}
