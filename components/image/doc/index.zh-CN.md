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

| 参数                    | 说明                                                                                                                                                                                                                                                                                                                                                                              | 类型                                                | 默认值  | 支持全局配置 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------- | ------------ |
| `[nzSrc]`               | 图片地址                                                                                                                                                                                                                                                                                                                                                                          | `string`                                            | -       | -            |
| `[nzSrcset]`            | 图片 `srcset`，设置在 `img` 上并传给预览                                                                                                                                                                                                                                                                                                                                          | `string`                                            | -       | -            |
| `[nzFallback]`          | 加载失败容错地址                                                                                                                                                                                                                                                                                                                                                                  | `string`                                            | -       | ✅           |
| `[nzPlaceholder]`       | 加载占位地址                                                                                                                                                                                                                                                                                                                                                                      | `string`                                            | -       | ✅           |
| `[nzDisablePreview]`    | 是否禁止预览                                                                                                                                                                                                                                                                                                                                                                      | `boolean`                                           | `false` | ✅           |
| `[nzCloseOnNavigation]` | 当用户在历史中前进/后退时是否关闭预览。注意，这通常不包括点击链接（除非用户使用 HashLocationStrategy）。                                                                                                                                                                                                                                                                          | `boolean`                                           | `false` | ✅           |
| `[nzDirection]`         | 文字方向                                                                                                                                                                                                                                                                                                                                                                          | `Direction`                                         | `'ltr'` | ✅           |
| `[nzScaleStep]`         | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                                                                                                                                                                            | `number`                                            | `0.5`   | ✅           |
| `[nzActionsRender]`     | 自定义预览操作，渲染在工具栏中关闭按钮之后（关闭按钮保留）；为 `null` 时不渲染操作。上下文：`NzImagePreviewActionsContext`。在 `nz-image-group` 内时以组的值为准。在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -       | -            |
| `[nzImageRender]`       | 自定义预览内容，替换预览图片渲染；仍可拖拽移动。上下文：`NzImagePreviewImageContext`。在 `nz-image-group` 内时以组的值为准。插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。                                                                                                                                                   | `TemplateRef<NzImagePreviewImageContext>`           | -       | -            |

其他属性见 [<img\>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes)

### nz-image-wrapper

渲染 antd 的内联图片 DOM：包裹 `img[nz-image]`（带 `ant-image-img`）的 `div.ant-image` 宿主、加载占位和悬停遮罩。`[nz-image]` 指令仍是轻量形式，不添加包裹元素和类名。可预览时包裹元素是可通过键盘访问的按钮：按 Enter 或空格打开预览。在 `nz-image-group` 中，包裹组件与 `img[nz-image]` 一样加入预览组。请引入 `NzImageModule`，它同时提供预览服务。

| 参数                        | 说明                                                                                                                                                                                                                                                                                                                                                                                    | 类型                                                | 默认值     | 支持全局配置 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------- | ------------ |
| `[nzSrc]`                   | 图片地址                                                                                                                                                                                                                                                                                                                                                                                | `string`                                            | -          | -            |
| `[nzSrcset]`                | 图片 `srcset`                                                                                                                                                                                                                                                                                                                                                                           | `string`                                            | -          | -            |
| `[nzAlt]`                   | 图片替代文本，可预览时也作为包裹元素的 `aria-label`                                                                                                                                                                                                                                                                                                                                     | `string`                                            | -          | -            |
| `[nzWidth]`                 | 包裹元素和图片的宽度，数字或纯数字字符串按 px 计                                                                                                                                                                                                                                                                                                                                        | `string \| number`                                  | -          | -            |
| `[nzHeight]`                | 包裹元素和图片的高度，数字或纯数字字符串按 px 计                                                                                                                                                                                                                                                                                                                                        | `string \| number`                                  | -          | -            |
| `[nzFallback]`              | 加载失败容错地址                                                                                                                                                                                                                                                                                                                                                                        | `string`                                            | -          | ✅           |
| `[nzPlaceholder]`           | 加载占位。地址：加载时显示在图片中，与 `[nz-image]` 相同；`true`：为图片加上 antd 的占位背景；模板：加载时渲染在图片上方的 `div.ant-image-placeholder` 中                                                                                                                                                                                                                               | `string \| TemplateRef<void> \| boolean`            | `false`    | ✅           |
| `[nzDisablePreview]`        | 是否禁止预览。禁止预览时包裹元素没有按钮角色、不在 Tab 顺序中，也没有遮罩                                                                                                                                                                                                                                                                                                               | `boolean`                                           | `false`    | ✅           |
| `[nzScaleStep]`             | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                                                                                                                                                                                  | `number`                                            | `0.5`      | ✅           |
| `[nzPreviewCover]`          | 可预览图片的悬停遮罩（antd `preview.cover`）。`true` 显示眼睛图标和本地化的“预览”文字；字符串或模板替换该内容；`false` 不渲染遮罩。图片加载失败时遮罩和按钮角色会被移除。遮罩同时带有 `ant-image-mask`，默认样式表下显示其自身的悬停遮罩 仅写属性名表示默认遮罩，`"false"` 表示不显示；遮罩内可聚焦控件上的 Enter 与 Space 交给该控件处理；宿主上已写的 `role` 或 `tabindex` 会被保留。 | `string \| TemplateRef<void> \| boolean`            | `true`     | -            |
| `[nzPreviewCoverPlacement]` | 遮罩在图片上的位置（antd `cover.placement`）。默认样式表下遮罩总是铺满图片。`'top'`、`'bottom'`：需要 v6 样式表。                                                                                                                                                                                                                                                                       | `'center' \| 'top' \| 'bottom'`                     | `'center'` | -            |
| `[nzActionsRender]`         | 自定义预览操作，传给内部的 `[nz-image]`（见 `[nz-image]`）                                                                                                                                                                                                                                                                                                                              | `TemplateRef<NzImagePreviewActionsContext> \| null` | -          | -            |
| `[nzImageRender]`           | 自定义预览图片，传给内部的 `[nz-image]`（见 `[nz-image]`）                                                                                                                                                                                                                                                                                                                              | `TemplateRef<NzImagePreviewImageContext>`           | -          | -            |

使用默认样式表时，其他组件的两条规则对包裹组件与裸 `img[nz-image]` 的作用不同：在 `nz-avatar` 中，`.ant-avatar > img` 不再匹配图片（`.ant-avatar .ant-image-img` 仍匹配）；在卡片封面中，`.ant-card-cover > *` 作用于包裹元素而非图片（`.ant-card-cover img` 仍匹配图片）。

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

| 参数                  | 说明                                                                                                                                                                                                                           | 类型                                                | 默认值  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ------- |
| `nzKeyboard`          | 是否支持键盘 esc 关闭、左右键切换图片                                                                                                                                                                                          | `boolean`                                           | `true`  |
| `nzMaskClosable`      | 点击蒙层是否允许关闭                                                                                                                                                                                                           | `boolean`                                           | `true`  |
| `nzCloseOnNavigation` | 当用户在历史中前进/后退时是否关闭预览。注意，这通常不包括点击链接（除非用户使用 HashLocationStrategy）。                                                                                                                       | `boolean`                                           | `true`  |
| `nzZIndex`            | 设置预览层的 z-index                                                                                                                                                                                                           | `number`                                            | `1000`  |
| `nzZoom`              | 缩放比例                                                                                                                                                                                                                       | `number`                                            | `1`     |
| `nzRotate`            | 旋转角度                                                                                                                                                                                                                       | `number`                                            | `0`     |
| `nzScaleStep`         | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                         | `number`                                            | `0.5`   |
| `nzFlipHorizontally`  | 在水平向量上翻转图像                                                                                                                                                                                                           | `boolean`                                           | `false` |
| `nzFlipVertically`    | 在垂直向量上翻转图像                                                                                                                                                                                                           | `boolean`                                           | `false` |
| `nzActionsRender`     | 自定义预览操作，渲染在关闭按钮之后；为 `null` 时不渲染操作。在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -       |
| `nzImageRender`       | 自定义预览内容，替换预览图片渲染。插槽在预览打开时读取，打开期间修改将在下次打开时生效。                                                                                                                                       | `TemplateRef<NzImagePreviewImageContext>`           | -       |

### NzImagePreviewRef

| 名称                            | 描述         |
| ------------------------------- | ------------ |
| `switchTo(index: number): void` | 设置预览索引 |
| `prev(): void`                  | 上一张       |
| `next(): void`                  | 下一张       |
| `close(): void`                 | 关闭预览     |

### NzImageGroupComponent

| 名称                | 描述                                                                                                                                                                                                                                                                                                      | 类型                                                | 默认值 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| `[nzScaleStep]`     | `1 + nzScaleStep` 为缩放放大的每步倍数                                                                                                                                                                                                                                                                    | `number`                                            | -      |
| `[nzActionsRender]` | 为组内所有图片自定义预览操作，优先于图片自身的 `nzActionsRender`；为 `null` 时不渲染操作。在默认样式表下，重新渲染默认操作的模板会在槽内应用 antd v4 的边缘外边距规则，因此间距与内置工具栏略有不同。 插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。 | `TemplateRef<NzImagePreviewActionsContext> \| null` | -      |
| `[nzImageRender]`   | 为组内所有图片自定义预览内容，优先于图片自身的 `nzImageRender`。插槽在预览打开时读取，打开期间修改将在下次打开时生效。 在组内，整个预览期间使用被点击图片的插槽值。                                                                                                                                       | `TemplateRef<NzImagePreviewImageContext>`           | -      |

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
