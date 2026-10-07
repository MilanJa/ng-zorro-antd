import { Component } from '@angular/core';

import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'nz-demo-menu-extra',
  imports: [NzFlexModule, NzIconModule, NzMenuModule],
  template: `
    <nz-flex nzVertical nzGap="small" nzAlign="flex-start">
      <ul nz-menu nzMode="inline" style="width: 256px">
        <li nz-submenu nzTitle="Navigation One" nzIcon="mail" nzOpen>
          <ul>
            <li nz-menu-item nzSelected>
              <nz-flex nzJustify="space-between"><span>Option 1</span><nz-icon nzType="down" /></nz-flex>
            </li>
            <li nz-menu-item nzExtra="⌘P">Option 2</li>
            <li nz-menu-item nzDisabled><a href="https://www.baidu.com">Link Option</a></li>
          </ul>
        </li>
      </ul>
      <ul nz-menu nzTheme="dark" style="width: 256px">
        <li nz-menu-item nzExtra="⌘U">Users</li>
        <li nz-menu-item nzExtra="⌘P">Profile</li>
      </ul>
    </nz-flex>
  `
})
export class NzDemoMenuExtraComponent {}
