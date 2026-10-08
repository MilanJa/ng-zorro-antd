import { Component } from '@angular/core';

import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';

@Component({
  selector: 'nz-demo-float-button-progress-ring',
  imports: [NzFloatButtonModule],
  template: `
    <div class="progress-ring">
      @for (line of lines; track $index) {
        <div>Scroll to bottom</div>
      }
      <nz-float-button-top nzShowProgress [nzVisibilityHeight]="0" nzShape="circle" style="inset-inline-end: 24px" />
      <nz-float-button-top nzShowProgress [nzVisibilityHeight]="0" nzShape="square" style="inset-inline-end: 88px" />
    </div>
  `,
  styles: `
    .progress-ring {
      height: 300vh;
      padding: 10px;
    }
  `
})
export class NzDemoFloatButtonProgressRingComponent {
  readonly lines = Array.from({ length: 7 });
}
