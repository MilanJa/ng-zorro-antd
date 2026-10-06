---
category: Components
subtitle: 时间轴
type: 数据展示
title: Timeline
cover: 'https://gw.alipayobjects.com/zos/antfincdn/vJmo00mmgR/Timeline.svg'
description: 垂直展示的时间流信息。
---

## 何时使用

- 当有一系列信息需按时间排列时，可正序和倒序。
- 需要有一条时间轴进行视觉上的串联时。

## API

```html
<nz-timeline>
  <nz-timeline-item>创建服务现场 2015-09-01</nz-timeline-item>
  <nz-timeline-item>初步排除网络异常 2015-09-01</nz-timeline-item>
  <nz-timeline-item>技术测试异常 2015-09-01</nz-timeline-item>
  <nz-timeline-item>网络异常正在修复 2015-09-01</nz-timeline-item>
</nz-timeline>
```

### nz-timeline

时间轴。

| 参数                 | 说明                                                                                                                              | 类型                                          | 默认值                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| ~~`[nzPending]`~~    | 已废弃，请使用 [nzLoading]。请改为添加带 [nzLoading] 的最后一个 nz-timeline-item；指定最后一个幽灵节点是否存在或内容              | `string \| boolean \| TemplateRef<void>`      | `false`                        |
| ~~`[nzPendingDot]`~~ | 已废弃，请使用 [nzIcon]。请在带 [nzLoading] 的最后一个 nz-timeline-item 上设置 [nzIcon]；当最后一个幽灵节点存在時，指定其时间图点 | `string \| TemplateRef<void>`                 | `<nz-icon nzType="loading" />` |
| `[nzReverse]`        | 节点排序                                                                                                                          | `boolean`                                     | `false`                        |
| `[nzMode]`           | 节点位置；alternate 交替两侧，custom 使用各节点的 nzPlacement。'left' 与 'right' 已废弃，请使用 'start' 与 'end'                  | `'start' \| 'end' \| 'alternate' \| 'custom'` | `'start'`                      |
| `[nzOrientation]`    | 时间轴方向。'horizontal' 需要 v6 样式表。                                                                                         | `'vertical' \| 'horizontal'`                  | `'vertical'`                   |
| `[nzVariant]`        | 节点样式变体。需要 v6 样式表。                                                                                                    | `'filled' \| 'outlined'`                      | `'outlined'`                   |
| `[nzTitleSpan]`      | 标题列宽度，数字为 24 栅格中的份数，字符串为 CSS 长度；alternate 模式下无效。需要 v6 样式表。                                     | `number \| string`                            | `12`                           |

### nz-timeline-item

时间轴的每一个节点。

| 参数               | 说明                                                                | 类型                          | 默认值   |
| ------------------ | ------------------------------------------------------------------- | ----------------------------- | -------- |
| `[nzColor]`        | 指定圆圈颜色 `'blue' \| 'red' \| 'green' \| 'gray'` 或自定义的色值  | `string`                      | `'blue'` |
| `[nzIcon]`         | 自定义节点图标                                                      | `string \| TemplateRef<void>` | -        |
| ~~`[nzDot]`~~      | 已废弃，请使用 [nzIcon]。                                           | `string \| TemplateRef<void>` | -        |
| `[nzPlacement]`    | 自定义节点位置，仅当 nzMode 为 custom 时有效；'left'/'right' 已废弃 | `'start' \| 'end'`            | -        |
| ~~`[nzPosition]`~~ | 已废弃，请使用 [nzPlacement]。                                      | `'left' \| 'right'`           | -        |
| `[nzTitle]`        | 设置标题                                                            | `string \| TemplateRef<void>` | -        |
| ~~`[nzLabel]`~~    | 已废弃，请使用 [nzTitle]。                                          | `string \| TemplateRef<void>` | -        |
| `[nzLoading]`      | 加载中节点：显示加载图标，其前方的轨道显示为进行中                  | `boolean`                     | `false`  |
