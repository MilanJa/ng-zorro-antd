import { Component } from '@angular/core';

import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'nz-demo-tag-disabled',
  imports: [NzFlexModule, NzTagModule],
  template: `
    <div nz-flex nzVertical nzGap="medium">
      <div nz-flex nzGap="small" nzWrap="wrap">
        <nz-tag nzDisabled>Basic Tag</nz-tag>
        <nz-tag nzDisabled><a href="https://ng.ant.design">Link Tag</a></nz-tag>
        <nz-tag nzDisabled nzColor="success" nzIcon="check-circle">Icon Tag</nz-tag>
      </div>
      <div nz-flex nzGap="small" nzWrap="wrap">
        <nz-tag nzDisabled nzColor="red">Preset Color Red</nz-tag>
        <nz-tag nzDisabled nzColor="#f50">Custom Color #f50 Outlined</nz-tag>
        <nz-tag nzDisabled nzColor="#f50" nzVariant="solid">Custom Color #f50 Filled</nz-tag>
        <nz-tag nzDisabled nzColor="#f50" nzVariant="filled">Custom Color #f50 Borderless</nz-tag>
        <nz-tag nzDisabled nzColor="success">Preset Status Success</nz-tag>
      </div>
      <div nz-flex nzGap="small" nzWrap="wrap">
        @for (tag of tags; track tag) {
          <nz-tag nzMode="checkable" nzDisabled [nzChecked]="selectedTags.includes(tag)">{{ tag }}</nz-tag>
        }
      </div>
      <div nz-flex nzGap="small" nzWrap="wrap">
        <nz-tag nzDisabled nzMode="closeable" (nzOnClose)="onClose('Closable')">Closable Tag</nz-tag>
        <nz-tag
          nzDisabled
          nzMode="closeable"
          nzColor="success"
          nzIcon="check-circle"
          (nzOnClose)="onClose('Closable Success')"
        >
          Closable with Icon
        </nz-tag>
      </div>
      <div nz-flex nzGap="small" nzWrap="wrap">
        <nz-tag nzDisabled nzVariant="filled">Borderless Basic</nz-tag>
        <nz-tag nzDisabled nzVariant="filled" nzColor="success" nzIcon="check-circle">Borderless with Icon</nz-tag>
        <nz-tag nzDisabled nzVariant="filled" nzMode="closeable" (nzOnClose)="onClose('Borderless Closable')">
          Borderless Closable
        </nz-tag>
      </div>
    </div>
  `
})
export class NzDemoTagDisabledComponent {
  readonly tags = ['Books', 'Movies', 'Music'];
  readonly selectedTags = ['Books'];

  onClose(name: string): void {
    console.log(`Tag ${name} closed`);
  }
}
