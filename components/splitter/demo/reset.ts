import { Component, signal } from '@angular/core';

import { NzSplitterModule } from 'ng-zorro-antd/splitter';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

const defaultSizes = ['30%', '40%', '30%'];

@Component({
  selector: 'nz-demo-splitter-reset',
  imports: [NzSplitterModule, NzTypographyModule],
  template: `
    <nz-splitter (nzResize)="sizes.set($event)" (nzDraggerDoubleClick)="sizes.set(defaultSizes)">
      @for (size of sizes(); track $index) {
        <nz-splitter-panel [nzSize]="size">
          <div class="box"
            ><h5 nz-typography nzType="secondary">Panel {{ $index + 1 }}</h5></div
          >
        </nz-splitter-panel>
      }
    </nz-splitter>
  `,
  styles: `
    nz-splitter {
      height: 200px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .box {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      white-space: nowrap;
    }
  `
})
export class NzDemoSplitterResetComponent {
  readonly defaultSizes = defaultSizes;
  readonly sizes = signal<Array<number | string>>(defaultSizes);
}
