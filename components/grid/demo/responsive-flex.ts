import { Component } from '@angular/core';

import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'nz-demo-grid-responsive-flex',
  imports: [NzGridModule],
  template: `
    <div nz-row>
      @for (col of cols; track $index) {
        <div
          nz-col
          [nzXs]="{ flex: '100%' }"
          [nzSm]="{ flex: '50%' }"
          [nzMd]="{ flex: '40%' }"
          [nzLg]="{ flex: '20%' }"
          [nzXl]="{ flex: '10%' }"
        >
          Col
        </div>
      }
    </div>
  `
})
export class NzDemoGridResponsiveFlexComponent {
  readonly cols = Array.from({ length: 10 });
}
