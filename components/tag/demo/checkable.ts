import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTagCheckableValue, NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'nz-demo-tag-checkable',
  imports: [FormsModule, NzFormModule, NzTagModule],
  template: `
    <form nz-form>
      <nz-form-item>
        <nz-form-label [nzSpan]="6">Checkable</nz-form-label>
        <nz-form-control>
          <nz-tag nzMode="checkable" [(nzChecked)]="checked">Yes</nz-tag>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6">Single</nz-form-label>
        <nz-form-control>
          <nz-tag-checkable-group name="single" [nzMultiple]="false" [(ngModel)]="singleSelected">
            @for (tag of tagsData; track tag) {
              <nz-tag nzMode="checkable" [nzValue]="tag">{{ tag }}</nz-tag>
            }
          </nz-tag-checkable-group>
        </nz-form-control>
      </nz-form-item>
      <nz-form-item>
        <nz-form-label [nzSpan]="6">Multiple</nz-form-label>
        <nz-form-control>
          <nz-tag-checkable-group name="multiple" [(ngModel)]="multipleSelected">
            @for (tag of tagsData; track tag) {
              <nz-tag nzMode="checkable" [nzValue]="tag">{{ tag }}</nz-tag>
            }
          </nz-tag-checkable-group>
        </nz-form-control>
      </nz-form-item>
    </form>
  `
})
export class NzDemoTagCheckableComponent {
  readonly tagsData = ['Movies', 'Books', 'Music', 'Sports'];
  checked = true;
  singleSelected: NzTagCheckableValue | null = 'Books';
  multipleSelected: NzTagCheckableValue[] = ['Movies', 'Music'];
}
