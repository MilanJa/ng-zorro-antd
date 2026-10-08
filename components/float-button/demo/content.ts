import { Component } from '@angular/core';

import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';

@Component({
  selector: 'nz-demo-float-button-content',
  imports: [NzFloatButtonModule],
  template: `
    <div class="content">
      <nz-float-button nzIcon="file-text" nzContent="HELP INFO" nzShape="square" style="inset-inline-end: 24px" />
      <nz-float-button nzContent="HELP INFO" nzShape="square" style="inset-inline-end: 94px" />
      <nz-float-button nzIcon="file-text" nzContent="HELP" nzShape="square" style="inset-inline-end: 164px" />
    </div>
  `,
  styles: `
    .content {
      height: 300px;
      position: relative;
    }
    nz-float-button {
      position: absolute;
    }
  `
})
export class NzDemoFloatButtonContentComponent {}
