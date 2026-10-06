import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSplitterCollapseOption, NzSplitterModule, NzSplitterShowCollapsibleIcon } from 'ng-zorro-antd/splitter';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'nz-demo-splitter-collapsible-icon',
  imports: [FormsModule, NzFlexModule, NzRadioModule, NzSplitterModule, NzTypographyModule],
  template: `
    <nz-flex nzVertical [nzGap]="20">
      <nz-flex [nzGap]="5">
        <p>ShowCollapsibleIcon:</p>
        <nz-radio-group [(ngModel)]="mode">
          <label nz-radio nzValue="auto">Auto</label>
          <label nz-radio [nzValue]="true">True</label>
          <label nz-radio [nzValue]="false">False</label>
        </nz-radio-group>
      </nz-flex>
      <nz-splitter>
        @for (name of ['First', 'Second', 'Third']; track name) {
          <nz-splitter-panel [nzMin]="$first ? '20%' : undefined" [nzCollapsible]="collapsible()">
            <div class="box"
              ><h5 nz-typography nzType="secondary">{{ name }}</h5></div
            >
          </nz-splitter-panel>
        }
      </nz-splitter>
    </nz-flex>
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
export class NzDemoSplitterCollapsibleIconComponent {
  readonly mode = signal<NzSplitterShowCollapsibleIcon>(true);
  readonly collapsible = computed<NzSplitterCollapseOption>(() => ({
    start: true,
    end: true,
    showCollapsibleIcon: this.mode()
  }));
}
