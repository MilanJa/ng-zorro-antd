import { Component } from '@angular/core';

import { NzVariant } from 'ng-zorro-antd/core/types';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'nz-demo-pagination-variant',
  imports: [NzDividerModule, NzFlexModule, NzPaginationModule],
  template: `
    <div nz-flex nzVertical nzGap="medium">
      @for (variant of variants; track variant) {
        <nz-divider [nzText]="variant" nzTitlePlacement="start" />
        <nz-pagination [nzPageIndex]="1" [nzTotal]="500" nzShowQuickJumper [nzVariant]="variant" />
        <nz-pagination [nzPageIndex]="2" [nzTotal]="50" nzSimple [nzVariant]="variant" />
      }
    </div>
  `
})
export class NzDemoPaginationVariantComponent {
  readonly variants: NzVariant[] = ['outlined', 'filled', 'borderless', 'underlined'];
}
