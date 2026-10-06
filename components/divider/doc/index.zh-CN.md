---
category: Components
type: 布局
title: Divider
subtitle: 分割线
cover: 'https://gw.alipayobjects.com/zos/alicdn/5swjECahe/Divider.svg'
description: 区隔内容的分割线。
---

## 何时使用

- 对不同章节的文本段落进行分割。
- 对行内文字/链接进行分割，例如表格的操作列。

## API

### nz-divider

| 参数                 | 说明                                                                                                                                                      | 类型                              | 默认值         | 版本   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------- | ------ |
| `[nzDashed]`         | 是否虚线                                                                                                                                                  | `boolean`                         | `false`        |
| ~~`[nzType]`~~       | 已废弃，请使用 [nzOrientation]。水平还是垂直类型                                                                                                          | `'horizontal' \| 'vertical'`      | `'horizontal'` |
| `[nzText]`           | 中间文字                                                                                                                                                  | `string \| TemplateRef<void>`     | -              |
| `[nzPlain]`          | 文字是否显示为普通正文样式                                                                                                                                | `boolean`                         | `false`        |
| `[nzOrientation]`    | 水平还是垂直类型；原标题位置取值 `'left' \| 'right' \| 'center'` 仍可使用，会转发到 [nzTitlePlacement] 并给出废弃警告                                     | `'horizontal' \| 'vertical'`      | `'horizontal'` |
| `[nzTitlePlacement]` | 分割线标题的位置                                                                                                                                          | `'start' \| 'end' \| 'center'`    | `'center'`     |
| `[nzTitleMargin]`    | [nzTitlePlacement] 不为 `'center'` 时标题和最近边框之间的距离（对应 antd 的 `orientationMargin`），数字或不带单位的数字字符串按 px 处理。需要 v6 样式表。 | `number \| string`                | -              |
| `[nzVariant]`        | 分割线是虚线、点线还是实线                                                                                                                                | `'dashed' \| 'dotted' \| 'solid'` | `'solid'`      |
| `[nzSize]`           | 分割线大小                                                                                                                                                | `'small' \| 'middle' \| 'large'`  | -              | 20.2.0 |
