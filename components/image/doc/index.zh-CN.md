---
category: Components
subtitle: 图片
type: 数据展示
title: Image
cover: 'https://gw.alipayobjects.com/zos/antfincdn/D1dXz9PZqa/image.svg'
description: 可预览的图片。
---

## 何时使用

- 需要展示图片时使用。
- 加载大图时渐进加载或加载失败时容错处理。

## API

### [nz-image]

| 参数                    | 说明                                                                                                                                                                                                                                                                                                                                                                             | 类型                                                | 默认值  | 支持全局配置 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------- | ------------ |
| `[nzSrc]`               | 图片地址                                                                                                                                                                                                                                                                                                                                                                         | `string`                                            | -       | -            |
| `[nzSrcset]`            | 图片 `srcset`，设置在 `img` 上并传给预览                                                                                                                                                                                                                                                                                                                                         | `string`                                            | -       | -            |
| `[nzFallback]`          | 加载失败容错地址                                                                                                                                                                                                                                                                                                                                                                 | `string`                                            | -       | ✅           |
| `[nzPlaceholder]`       | 加载占位地址                                                                                                                                                                                                                                                                                                                                                                     | `string`                                            | -       | ✅           |
| `[nzDisablePreview]`    | 是否禁止预览                                                                                                                                                                                                                                                                                                                                                                     | `boolean`                                           | `false` | ✅           |
| `[nzCloseOnNavigation]` | 当用户在历史中前进/后退时是否关闭预览。注意，这通常不包括点击链接（除非用户使用 HashLocationStrategy）。                                                                                                                                                                                                                                                                         | `boolean`                                           | `false` | ✅           |
| `[nzDirection]`         | 文字方向                                                                                                                                                                                                                                                                                                                                                                         | `Direction`                                         | `'ltr'` | ✅           |
| `[nzScaleStep]`         | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                                                                                                                                                                           | `number`                                            | `0.5`   | ✅           |
| `[nzActionsRender]`     | 自定义预览操作，渲染在工具栏中关闭按钮之后（关闭按钮保留）；为 `null` 时不渲染操作。上下文：`NzImagePreviewActionsContext`。在 `nz-image-group` 内时以组的值为准 在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -       | -            |
| `[nzImageRender]`       | 自定义预览内容，替换预览图片渲染；仍可拖拽移动。上下文：`NzImagePreviewImageContext`。在 `nz-image-group` 内时以组的值为准 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。                                                                                                                                                   | `TemplateRef<NzImagePreviewImageContext>`           | -       | -            |

其他属性见 [<img\>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes)

### NzImageService

| 参数      | 说明     | 类型                    | 默认值 |
| --------- | -------- | ----------------------- | ------ |
| `images`  | 预览图片 | `NzImage[]`             | -      |
| `options` | 预览参数 | `NzImagePreviewOptions` | -      |

## 相关类型定义

### NzImage

| 参数     | 说明     | 类型     | 默认值 |
| -------- | -------- | -------- | ------ |
| `src`    | src      | `string` | -      |
| `alt`    | alt      | `string` | -      |
| `width`  | 图片宽度 | `string` | -      |
| `height` | 图片高度 | `string` | -      |

### NzImagePreviewOptions

| 参数                  | 说明                                                                                                                                                                                                                          | 类型                                                | 默认值  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------- |
| `nzKeyboard`          | 是否支持键盘 esc 关闭、左右键切换图片                                                                                                                                                                                         | `boolean`                                           | `true`  |
| `nzMaskClosable`      | 点击蒙层是否允许关闭                                                                                                                                                                                                          | `boolean`                                           | `true`  |
| `nzCloseOnNavigation` | 当用户在历史中前进/后退时是否关闭预览。注意，这通常不包括点击链接（除非用户使用 HashLocationStrategy）。                                                                                                                      | `boolean`                                           | `true`  |
| `nzZIndex`            | 设置预览层的 z-index                                                                                                                                                                                                          | `number`                                            | `1000`  |
| `nzZoom`              | 缩放比例                                                                                                                                                                                                                      | `number`                                            | `1`     |
| `nzRotate`            | 旋转角度                                                                                                                                                                                                                      | `number`                                            | `0`     |
| `nzScaleStep`         | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                        | `number`                                            | `0.5`   |
| `nzFlipHorizontally`  | 在水平向量上翻转图像                                                                                                                                                                                                          | `boolean`                                           | `false` |
| `nzFlipVertically`    | 在垂直向量上翻转图像                                                                                                                                                                                                          | `boolean`                                           | `false` |
| `nzActionsRender`     | 自定义预览操作，渲染在关闭按钮之后；为 `null` 时不渲染操作 在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -       |
| `nzImageRender`       | 自定义预览内容，替换预览图片渲染 插槽在预览打开时读取，打开期间修改将在下次打开时生效。                                                                                                                                       | `TemplateRef<NzImagePreviewImageContext>`           | -       |

### NzImagePreviewRef

| 名称                            | 描述         |
| ------------------------------- | ------------ |
| `switchTo(index: number): void` | 设置预览索引 |
| `prev(): void`                  | 上一张       |
| `next(): void`                  | 下一张       |
| `close(): void`                 | 关闭预览     |

### NzImageGroupComponent

| 名称                | 描述                                                                                                                                                                                                                                                                                                     | 类型                                                | 默认值 |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| `[nzScaleStep]`     | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                                                                                                   | `number`                                            | -      |
| `[nzActionsRender]` | 为组内所有图片自定义预览操作，优先于图片自身的 `nzActionsRender`；为 `null` 时不渲染操作 在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -      |
| `[nzImageRender]`   | 为组内所有图片自定义预览内容，优先于图片自身的 `nzImageRender` 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。                                                                                                                                       | `TemplateRef<NzImagePreviewImageContext>`           | -      |

### NzImagePreviewActionsContext

| 参数        | 说明                                                                                                                                                                       | 类型                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `$implicit` | 默认操作，按 antd 的顺序（flipY、flipX、rotateLeft、rotateRight、zoomOut、zoomIn）                                                                                         | `TemplateRef<void>`          |
| `icons`     | 默认操作的图标，键为 `flipY`、`flipX`、`rotateLeft`、`rotateRight`、`zoomOut`、`zoomIn`                                                                                    | `NzImagePreviewActionsIcons` |
| `actions`   | `onFlipY()`、`onFlipX()`、`onRotateLeft()`、`onRotateRight()`、`onZoomOut()`、`onZoomIn()`、`onClose()`，以及 `onActive(offset)`：切换到相距 `offset` 的图片（越界时忽略） | `NzImagePreviewActions`      |
| `transform` | 当前变换：`x`、`y`、`rotate`、`scale`、`flipX`、`flipY`                                                                                                                    | `NzImagePreviewTransform`    |
| `current`   | 当前预览图片的索引                                                                                                                                                         | `number`                     |
| `total`     | 预览图片总数                                                                                                                                                               | `number`                     |
| `image`     | 当前预览图片：`url`、`alt`、`width`、`height`                                                                                                                              | `NzImagePreviewImageInfo`    |

关闭按钮保留在工具栏胶囊内（antd 6 将其作为右上角的独立按钮）；自定义的 `nzActionsRender` 渲染在其后、同一胶囊内。`icons` 中的模板只渲染图标本身，点击行为需通过 `actions` 绑定。

### NzImagePreviewImageContext

| 参数        | 说明                                                    | 类型                      |
| ----------- | ------------------------------------------------------- | ------------------------- |
| `$implicit` | 默认的预览图片                                          | `TemplateRef<void>`       |
| `transform` | 当前变换：`x`、`y`、`rotate`、`scale`、`flipX`、`flipY` | `NzImagePreviewTransform` |
| `current`   | 当前预览图片的索引                                      | `number`                  |
| `image`     | 当前预览图片：`url`、`alt`、`width`、`height`           | `NzImagePreviewImageInfo` |
