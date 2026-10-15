---
category: Components
type: 数据展示
title: Card
subtitle: 卡片
cols: 1
cover: 'https://gw.alipayobjects.com/zos/alicdn/keNB-R8Y9/Card.svg'
description: 通用卡片容器。
---

## 何时使用

最基础的卡片容器，可承载文字、列表、图片、段落，常用于后台概览页面。

## API

```html
<nz-card nzTitle="卡片标题">卡片内容</nz-card>
```

### nz-card

| 参数                      | 说明                                                                                                                                  | 类型                                  | 默认值      | 支持全局配置 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------- | ------------ |
| `[nzActions]`             | 卡片操作组，位置在卡片底部                                                                                                            | `Array<TemplateRef<void>>`            | -           |
| `[nzBodyStyle]`           | 内容区域自定义样式                                                                                                                    | `{ [key: string]: string }`           | -           |
| `[nzBordered]`            | 是否有边框                                                                                                                            | `boolean`                             | `true`      | ✅           |
| `[nzCover]`               | 卡片封面                                                                                                                              | `TemplateRef<void>`                   | -           |
| `[nzExtra]`               | 卡片右上角的操作区域                                                                                                                  | `string \| TemplateRef<void>`         | -           |
| `[nzHoverable]`           | 鼠标移过时可浮起                                                                                                                      | `boolean`                             | `false`     | ✅           |
| `[nzLoading]`             | 当卡片内容还在加载中时，可以用 loading 展示一个占位                                                                                   | `boolean`                             | `false`     |
| `[nzTitle]`               | 卡片标题                                                                                                                              | `string \| TemplateRef<void>`         | -           |
| `[nzType]`                | 卡片类型，可设置为 `inner` 或 不设置                                                                                                  | `'inner'`                             | -           |
| `[nzSize]`                | 卡片的尺寸                                                                                                                            | `'default' \| 'small'`                | `'default'` | ✅           |
| `[nzTabList]`             | 页头页签列表，渲染为标题行下方的 `nz-tabs`；设置后忽略投影的 `nz-card-tab`                                                            | `NzCardTabItem[] \| null`             | `null`      |
| `[(nzActiveTabKey)]`      | 当前激活页签的 key（受控）。与任何项都不匹配时不选中页签：没有激活的页签、没有指示条，也没有 `aria-selected` 的页签                   | `string                               | null`       | `null`       |
| `[nzDefaultActiveTabKey]` | 未绑定 `nzActiveTabKey` 时初始激活页签的 key；未设置或不匹配时为第一项                                                                | `string \| null`                      | `null`      |
| `[nzTabBarExtraContent]`  | 页签栏末尾的附加内容                                                                                                                  | `string \| TemplateRef<void> \| null` | `null`      |
| `[nzTabProps]`            | 页头 `nz-tabs` 的选项。`nzSize` 覆盖由 `nzSize` 推导的尺寸（小卡片为 `small`，否则为 `large`）；未设置的字段为 `line`、不居中、有动画 | `NzCardTabProps \| null`              | `null`      |
| `(nzActiveTabKeyChange)`  | 用户切换页签时发出新的 key，配合 `[(nzActiveTabKey)]` 使用                                                                            | `EventEmitter<string>`                | -           |
| `(nzTabChange)`           | 用户切换页签后的回调；通过程序修改 key 时不触发                                                                                       | `EventEmitter<string>`                | -           |

### nz-card-meta

| 参数              | 说明      | 类型                          | 默认值 |
| ----------------- | --------- | ----------------------------- | ------ |
| `[nzAvatar]`      | 头像/图标 | `TemplateRef<void>`           | -      |
| `[nzDescription]` | 描述内容  | `string \| TemplateRef<void>` | -      |
| `[nzTitle]`       | 标题内容  | `string \| TemplateRef<void>` | -      |

### [nz-card-grid]

| 参数            | 说明             | 类型      | 默认值 | 支持全局配置 |
| --------------- | ---------------- | --------- | ------ | ------------ |
| `[nzHoverable]` | 鼠标移过时可浮起 | `boolean` | `true` | -            |

分隔卡片内容区域

### nz-card-tab

分隔页签标题区域。仍然支持，但同一卡片设置了 `nzTabList` 时会被忽略（开发模式下卡片会提示一次，由日志的去重机制保证每个应用仅一次）；二者择一使用。

### NzCardTabItem

| 参数       | 说明                         | 类型                          | 默认值  |
| ---------- | ---------------------------- | ----------------------------- | ------- |
| `key`      | 页签的唯一 key               | `string`                      | -       |
| `label`    | 页签标题                     | `string \| TemplateRef<void>` | -       |
| `icon`     | 标题前的图标：图标类型或模板 | `string \| TemplateRef<void>` | -       |
| `disabled` | 是否禁用该页签               | `boolean`                     | `false` |

### NzCardTabProps

| 参数         | 说明                 | 类型                              | 默认值                               |
| ------------ | -------------------- | --------------------------------- | ------------------------------------ |
| `nzSize`     | 页头页签的尺寸       | `'large' \| 'default' \| 'small'` | 小卡片为 `'small'`，否则为 `'large'` |
| `nzType`     | 页头页签的基本样式   | `'line' \| 'card'`                | `'line'`                             |
| `nzCentered` | 页头页签居中展示     | `boolean`                         | `false`                              |
| `nzAnimated` | 是否使用动画切换页签 | `boolean`                         | `true`                               |
