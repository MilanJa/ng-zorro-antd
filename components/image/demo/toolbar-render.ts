import { Component } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';

@Component({
  selector: 'nz-demo-image-toolbar-render',
  imports: [NzIconModule, NzImageModule],
  template: `
    <nz-image-group [nzActionsRender]="toolbar">
      @for (src of images; track src) {
        <img nz-image width="200px" [nzSrc]="src" [alt]="'image-' + $index" />
      }
    </nz-image-group>

    <ng-template
      #toolbar
      let-actions="actions"
      let-transform="transform"
      let-current="current"
      let-total="total"
      let-image="image"
    >
      <div class="toolbar-wrapper">
        <nz-icon nzType="left" [class.disabled]="current === 0" (click)="actions.onActive(-1)" />
        <nz-icon nzType="right" [class.disabled]="current === total - 1" (click)="actions.onActive(1)" />
        <nz-icon nzType="download" (click)="download(image.url)" />
        <nz-icon nzType="swap" [nzRotate]="90" (click)="actions.onFlipY()" />
        <nz-icon nzType="swap" (click)="actions.onFlipX()" />
        <nz-icon nzType="rotate-left" (click)="actions.onRotateLeft()" />
        <nz-icon nzType="rotate-right" (click)="actions.onRotateRight()" />
        <nz-icon nzType="zoom-out" [class.disabled]="transform.scale === 1" (click)="actions.onZoomOut()" />
        <nz-icon nzType="zoom-in" [class.disabled]="transform.scale === 50" (click)="actions.onZoomIn()" />
      </div>
    </ng-template>
  `,
  styles: `
    .toolbar-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
    }

    .toolbar-wrapper nz-icon {
      padding: 12px;
      cursor: pointer;
    }

    .toolbar-wrapper nz-icon:hover,
    .toolbar-wrapper nz-icon.disabled {
      opacity: 0.3;
    }

    .toolbar-wrapper nz-icon.disabled {
      cursor: not-allowed;
    }
  `
})
export class NzDemoImageToolbarRenderComponent {
  readonly images = [
    'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg'
  ];

  download(url: string): void {
    const suffix = url.slice(url.lastIndexOf('.'));
    const filename = `${Date.now()}${suffix}`;
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(blobUrl);
        link.remove();
      });
  }
}
