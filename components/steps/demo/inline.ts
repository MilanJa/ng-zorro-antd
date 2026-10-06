/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Component } from '@angular/core';

import { NzListModule } from 'ng-zorro-antd/list';
import { NzStatusType, NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-inline',
  imports: [NzListModule, NzStepsModule],
  template: `
    <nz-list nzItemLayout="horizontal">
      @for (item of data; track item.title) {
        <nz-list-item>
          <nz-list-item-meta
            [nzAvatar]="'https://api.dicebear.com/10.x/lorelei/svg?seed=' + $index"
            [nzTitle]="titleTpl"
            nzDescription="Ant Design, a design language for background applications, is refined by Ant UED Team"
          />
          <ng-template #titleTpl
            ><a href="https://ng.ant.design">{{ item.title }}</a></ng-template
          >
          <nz-steps style="margin-top: 8px" nzType="inline" [nzCurrent]="item.current" [nzStatus]="item.status">
            <nz-step nzTitle="Step 1" nzContent="This is Step 1" />
            <nz-step nzTitle="Step 2" nzContent="This is Step 2" />
            <nz-step nzTitle="Step 3" nzContent="This is Step 3" />
          </nz-steps>
        </nz-list-item>
      }
    </nz-list>
  `
})
export class NzDemoStepsInlineComponent {
  readonly data: Array<{ title: string; current: number; status: NzStatusType }> = [
    { title: 'Ant Design Title 1', current: 0, status: 'process' },
    { title: 'Ant Design Title 2', current: 1, status: 'error' },
    { title: 'Ant Design Title 3', current: 2, status: 'process' },
    { title: 'Ant Design Title 4', current: 1, status: 'process' }
  ];
}
