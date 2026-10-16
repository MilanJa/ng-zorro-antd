import { Component } from '@angular/core';

import { NzImageModule } from 'ng-zorro-antd/image';

@Component({
  selector: 'nz-demo-image-image-render',
  imports: [NzImageModule],
  template: `
    <img
      nz-image
      width="200px"
      alt="basic image"
      nzSrc="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      [nzImageRender]="video"
      [nzActionsRender]="null"
    />
    <ng-template #video>
      <video
        muted
        width="100%"
        controls
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ"
      ></video>
    </ng-template>
  `
})
export class NzDemoImageImageRenderComponent {}
