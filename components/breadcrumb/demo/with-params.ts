import { Component } from '@angular/core';

import { NzBreadCrumbModule, NzBreadcrumbItem } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'nz-demo-breadcrumb-with-params',
  imports: [NzBreadCrumbModule],
  template: `<nz-breadcrumb [nzItems]="items" [nzParams]="params" />`
})
export class NzDemoBreadcrumbWithParamsComponent {
  readonly items: NzBreadcrumbItem[] = [{ title: 'Users' }, { title: ':id', href: '' }];
  readonly params = { id: 1 };
}
