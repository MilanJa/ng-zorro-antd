import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTagModule, NzTagVariant } from 'ng-zorro-antd/tag';

@Component({
  selector: 'nz-demo-tag-colorful',
  imports: [NzDividerModule, NzFlexModule, NzTagModule],
  template: `
    @for (variant of variants; track variant) {
      <nz-divider nzTitlePlacement="start" [nzText]="'Presets (' + variant + ')'" />
      <div nz-flex nzGap="small" nzAlign="center" nzWrap="wrap">
        @for (color of presetColors; track color) {
          <nz-tag [nzColor]="color" [nzVariant]="variant">{{ color }}</nz-tag>
        }
      </div>
    }
    @for (variant of variants; track variant) {
      <nz-divider nzTitlePlacement="start" [nzText]="'Custom (' + variant + ')'" />
      <div nz-flex nzGap="small" nzAlign="center" nzWrap="wrap">
        @for (color of customColors; track color) {
          <nz-tag [nzColor]="color" [nzVariant]="variant">{{ color }}</nz-tag>
        }
      </div>
    }
  `
})
export class NzDemoTagColorfulComponent {
  readonly variants: NzTagVariant[] = ['filled', 'solid', 'outlined'];
  readonly presetColors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple'
  ];
  readonly customColors = ['#f50', '#2db7f5', '#87d068', '#108ee9'];
}
