/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TemplateRef } from '@angular/core';

/** The preview's current transform (antd `TransformType`). */
export interface NzImagePreviewTransform {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  flipX: boolean;
  flipY: boolean;
}

/** The preview's action callbacks (antd `actionsRender` `info.actions`). */
export interface NzImagePreviewActions {
  onFlipY(): void;
  onFlipX(): void;
  onRotateLeft(): void;
  onRotateRight(): void;
  onZoomOut(): void;
  onZoomIn(): void;
  onClose(): void;
  /** Shows the image `offset` positions away; an index out of range is ignored. */
  onActive(offset: number): void;
}

/** The default action glyphs; each template renders the bare icon, without a click handler. */
export interface NzImagePreviewActionsIcons {
  flipY: TemplateRef<void>;
  flipX: TemplateRef<void>;
  rotateLeft: TemplateRef<void>;
  rotateRight: TemplateRef<void>;
  zoomOut: TemplateRef<void>;
  zoomIn: TemplateRef<void>;
}

/** The previewed image (antd `ImgInfo`). */
export interface NzImagePreviewImageInfo {
  url: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
}

/** Context of `nzActionsRender`; `$implicit` stamps the default actions. */
export interface NzImagePreviewActionsContext {
  $implicit: TemplateRef<void>;
  icons: NzImagePreviewActionsIcons;
  actions: NzImagePreviewActions;
  transform: NzImagePreviewTransform;
  current: number;
  total: number;
  image: NzImagePreviewImageInfo;
}

/** Context of `nzImageRender`; `$implicit` stamps the default preview image. */
export interface NzImagePreviewImageContext {
  $implicit: TemplateRef<void>;
  transform: NzImagePreviewTransform;
  current: number;
  image: NzImagePreviewImageInfo;
}
