import { Component } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'nz-demo-image-cover-placement',
  imports: [NzIconModule, NzImageModule, NzSpaceModule],
  template: `
    <nz-space [nzSize]="16">
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="96"
        nzAlt="basic image"
        nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        [nzPreviewCover]="centerCover"
        nzPreviewCoverPlacement="center"
      />
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="96"
        nzAlt="image"
        nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        [nzPreviewCover]="topCover"
        nzPreviewCoverPlacement="top"
      />
      <nz-image-wrapper
        *nzSpaceItem
        [nzWidth]="96"
        nzAlt="image"
        nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        [nzPreviewCover]="bottomCover"
        nzPreviewCoverPlacement="bottom"
      />
    </nz-space>
    <ng-template #centerCover>
      <nz-space nzAlign="center">
        <nz-icon *nzSpaceItem nzType="zoom-in" />
        <span *nzSpaceItem>center</span>
      </nz-space>
    </ng-template>
    <ng-template #topCover>
      <nz-space nzAlign="center">
        <nz-icon *nzSpaceItem nzType="zoom-in" />
        <span *nzSpaceItem>top</span>
      </nz-space>
    </ng-template>
    <ng-template #bottomCover>
      <nz-space nzAlign="center">
        <nz-icon *nzSpaceItem nzType="zoom-in" />
        <span *nzSpaceItem>bottom</span>
      </nz-space>
    </ng-template>
  `
})
export class NzDemoImageCoverPlacementComponent {}
