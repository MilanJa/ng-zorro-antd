import { Component } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'nz-demo-menu-expand-icon',
  imports: [NzIconModule, NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" style="width: 256px" [nzExpandIcon]="expandIcon">
      <li nz-submenu nzTitle="Navigation One" nzIcon="mail" nzOpen>
        <ul>
          <li nz-menu-item nzSelected>Option 1</li>
          <li nz-menu-item>Option 2</li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item>Option 3</li>
          <li nz-menu-item>Option 4</li>
        </ul>
      </li>
    </ul>
    <ng-template #expandIcon let-open><nz-icon [nzType]="open ? 'minus' : 'plus'" /></ng-template>
  `
})
export class NzDemoMenuExpandIconComponent {}
