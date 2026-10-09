import { Component } from '@angular/core';

import { NzBreadCrumbModule, NzBreadcrumbItem } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'nz-demo-breadcrumb-items',
  imports: [NzBreadCrumbModule],
  template: `<nz-breadcrumb [nzItems]="items" />`
})
export class NzDemoBreadcrumbItemsComponent {
  readonly items: NzBreadcrumbItem[] = [
    { title: 'Home' },
    { title: 'Application Center', href: '' },
    { title: 'Application List', href: '' },
    { title: 'An Application' }
  ];
}
