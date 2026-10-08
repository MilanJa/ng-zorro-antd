import { Component } from '@angular/core';

import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'nz-demo-tabs-icon',
  imports: [NzTabsModule],
  template: `
    <nz-tabs [nzSelectedIndex]="1">
      <nz-tab nzTitle="Tab 1" nzIcon="apple">Tab 1</nz-tab>
      <nz-tab nzTitle="Tab 2" nzIcon="android">Tab 2</nz-tab>
      <nz-tab nzTitle="Tab 3" [nzIcon]="heart">Tab 3</nz-tab>
    </nz-tabs>
    <ng-template #heart>
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true">
        <path
          d="M12 20.7l-1.4-1.3C5.4 14.8 2 11.7 2 8a5 5 0 0 1 10-1.7A5 5 0 0 1 22 8c0 3.7-3.4 6.8-8.6 11.4L12 20.7z"
        />
      </svg>
    </ng-template>
  `
})
export class NzDemoTabsIconComponent {}
