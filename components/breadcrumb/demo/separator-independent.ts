import { Component } from '@angular/core';

import { NzBreadCrumbModule, NzBreadcrumbItem } from 'ng-zorro-antd/breadcrumb';

@Component({
  selector: 'nz-demo-breadcrumb-separator-independent',
  imports: [NzBreadCrumbModule],
  template: `
    <nz-breadcrumb [nzSeparator]="null">
      <nz-breadcrumb-item>Location</nz-breadcrumb-item>
      <nz-breadcrumb-separator>:</nz-breadcrumb-separator>
      <nz-breadcrumb-item>
        <a>Application Center</a>
      </nz-breadcrumb-item>
      <nz-breadcrumb-separator>/</nz-breadcrumb-separator>
      <nz-breadcrumb-item>Application List</nz-breadcrumb-item>
      <nz-breadcrumb-separator>/</nz-breadcrumb-separator>
      <nz-breadcrumb-item>An Application</nz-breadcrumb-item>
    </nz-breadcrumb>
    <br />
    <nz-breadcrumb [nzSeparator]="null" [nzItems]="items" />
  `
})
export class NzDemoBreadcrumbSeparatorIndependentComponent {
  readonly items: NzBreadcrumbItem[] = [
    { title: 'Location' },
    { type: 'separator', separator: ':' },
    { href: '', title: 'Application Center' },
    { type: 'separator' },
    { href: '', title: 'Application List' },
    { type: 'separator' },
    { title: 'An Application' }
  ];
}
