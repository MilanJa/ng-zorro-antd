import { Component } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'nz-demo-image-preview-cover',
  imports: [NzIconModule, NzImageModule, NzSpaceModule],
  template: `
    <nz-image-wrapper
      [nzWidth]="96"
      nzAlt="basic image"
      nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      [nzPreviewCover]="cover"
    />
    <ng-template #cover>
      <nz-space nzDirection="vertical" nzAlign="center">
        <nz-icon *nzSpaceItem nzType="zoom-in" />
        <span *nzSpaceItem>Preview</span>
      </nz-space>
    </ng-template>
  `
})
export class NzDemoImagePreviewCoverComponent {}
