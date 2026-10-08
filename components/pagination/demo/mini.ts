import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'nz-demo-pagination-mini',
  imports: [NzDividerModule, NzFlexModule, NzPaginationModule],
  template: `
    <div nz-flex nzVertical nzGap="medium">
      <nz-divider nzText="Small" nzTitlePlacement="start" />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="small" />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="small" nzShowSizeChanger nzShowQuickJumper />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="small" [nzShowTotal]="totalTemplate" />
      <nz-pagination
        [(nzPageIndex)]="current"
        [nzTotal]="50"
        nzSize="small"
        nzDisabled
        [nzShowTotal]="totalTemplate"
        nzShowSizeChanger
        nzShowQuickJumper
      />

      <nz-divider nzText="Large" nzTitlePlacement="start" />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="large" />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="large" nzShowSizeChanger nzShowQuickJumper />
      <nz-pagination [(nzPageIndex)]="current" [nzTotal]="50" nzSize="large" [nzShowTotal]="totalTemplate" />
      <nz-pagination
        [(nzPageIndex)]="current"
        [nzTotal]="50"
        nzSize="large"
        nzDisabled
        [nzShowTotal]="totalTemplate"
        nzShowSizeChanger
        nzShowQuickJumper
      />
    </div>
    <ng-template #totalTemplate let-total>Total {{ total }} items</ng-template>
  `
})
export class NzDemoPaginationMiniComponent {
  current = 1;
}
