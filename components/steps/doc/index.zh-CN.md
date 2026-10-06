---
category: Components
subtitle: 步骤条
type: 导航
cols: 1
title: Steps
cover: 'https://gw.alipayobjects.com/zos/antfincdn/UZYqMizXHaj/Steps.svg'
description: 引导用户按照流程完成任务的导航条。
---

## 何时使用

当任务复杂或者存在先后关系时，将其分解成一系列步骤，从而简化任务。

## API

```html
<nz-steps>
  <nz-step nzTitle="第一步" />
  <nz-step nzTitle="第二步" />
  <nz-step nzTitle="第三步" />
</nz-steps>
```

### nz-steps

整体步骤条。

| 参数                     | 说明                                                                                 | 类型                                                                                      | 默认值         |
| ------------------------ | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------- |
| `[nzType]`               | 步骤条类型，有 `default`、`navigation` 和 `dot`（点状步骤条）                        | `'default' \| 'navigation' \| 'dot'`                                                      | `'default'`    |
| `[nzCurrent]`            | 指定当前步骤，从 0 开始记数。在子 `nz-step` 元素中，可以通过 `nzStatus` 属性覆盖状态 | `number`                                                                                  | `0`            |
| `[nzOrientation]`        | 指定步骤条方向。目前支持水平（`horizontal`）和竖直（`vertical`）两种方向             | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzDirection]`~~      | 已废弃，请使用 `[nzOrientation]`。指定步骤条方向                                     | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| `[nzTitlePlacement]`     | 指定标题放置位置，默认水平放图标右侧，可选 `vertical` 放图标下方                     | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzLabelPlacement]`~~ | 已废弃，请使用 `[nzTitlePlacement]`。指定标签放置位置                                | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzProgressDot]`~~    | 已废弃，请使用 `[nzType]`（`nzType="dot"`）。传入 TemplateRef 仍可自定义点           | `boolean \| TemplateRef<{ $implicit: TemplateRef<void>, status: string, index: number }>` | `false`        |
| `[nzVariant]`            | 步骤图标的变体。需要 v6 样式表。                                                     | `'filled' \| 'outlined'`                                                                  | `'filled'`     |
| `[nzSize]`               | 指定大小，目前支持普通（`default`）和迷你（`small`）                                 | `'small' \| 'default'`                                                                    | `'default'`    |
| `[nzStatus]`             | 指定当前步骤的状态，可选 `wait` `process` `finish` `error`                           | `'wait' \| 'process' \| 'finish' \| 'error'`                                              | `'process'`    |
| `[nzStartIndex]`         | 指定起始位置的序号                                                                   | `number`                                                                                  | `0`            |
| `(nzIndexChange)`        | 点击单个步骤时触发的事件                                                             | `number`                                                                                  | -              |

### nz-step

步骤条内的每一个步骤。

| 参数                  | 说明                                                                                                                 | 类型                                                                                    | 默认值   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| `[nzContent]`         | 步骤的详情描述，可选                                                                                                 | `string \| TemplateRef<void>`                                                           | -        |
| ~~`[nzDescription]`~~ | 已废弃，请使用 `[nzContent]`。步骤的详情描述                                                                         | `string \| TemplateRef<void>`                                                           | -        |
| `[nzIcon]`            | 步骤图标的类型，可选                                                                                                 | `string \| string[] \| Set<string> \| { [klass: string]: any; }` \| `TemplateRef<void>` | -        |
| `[nzStatus]`          | 指定状态。当不配置该属性时，会使用 `nz-steps` 的 `nzCurrent` 来自动指定状态。可选：`wait` `process` `finish` `error` | `'wait' \| 'process' \| 'finish' \| 'error'`                                            | `'wait'` |
| `[nzTitle]`           | 标题                                                                                                                 | `string \| TemplateRef<void>`                                                           | -        |
| `[nzSubtitle]`        | 子标题                                                                                                               | `string \| TemplateRef<void>`                                                           | -        |
| `[nzDisabled]`        | 禁用点击                                                                                                             | `boolean`                                                                               | `false`  |
| `[nzPercentage]`      | 当前状态为 `process` 的步骤所显示的进度条进度（只对基本类型的 `nz-steps` 生效）                                      | `number`                                                                                | -        |
| `(nzClick)`           | 点击未禁用的步骤时触发，参数为该步骤的序号                                                                           | `number`                                                                                | -        |
