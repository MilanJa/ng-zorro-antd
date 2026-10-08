import { Component } from '@angular/core';

import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'nz-demo-dropdown-extra',
  imports: [NzDropdownModule, NzIconModule],
  template: `
    <a nz-dropdown [nzDropdownMenu]="menu">
      Hover me
      <nz-icon nzType="down" />
    </a>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item nzDisabled>My Account</li>
        <li nz-menu-divider></li>
        <li nz-menu-item nzExtra="⌘P">Profile</li>
        <li nz-menu-item nzExtra="⌘B">Billing</li>
        <li nz-menu-item nzIcon="setting" nzExtra="⌘S">Settings</li>
      </ul>
    </nz-dropdown-menu>
  `
})
export class NzDemoDropdownExtraComponent {}
