import { Component } from '@angular/core';

import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'nz-demo-image-cover',
  imports: [NzImageModule, NzSpaceModule],
  template: `
    <nz-space>
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="100"
        nzAlt="text cover"
        nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        nzPreviewCover="Text cover"
      />
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="100"
        nzAlt="template cover"
        nzSrc="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        [nzPreviewCover]="templateCover"
      />
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="100"
        nzAlt="default cover"
        nzSrc="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg"
        [nzPreviewCover]="true"
      />
    </nz-space>
    <ng-template #templateCover>
      <nz-space nzDirection="vertical" nzAlign="center">
        <span *nzSpaceItem>Template cover</span>
      </nz-space>
    </ng-template>
  `
})
export class NzDemoImageCoverComponent {}
