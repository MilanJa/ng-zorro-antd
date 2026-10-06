---
category: Components
type: 布局
title: Splitter
subtitle: 分隔面板
tag: 19.2.0
cover: 'https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*f0SISaETY0wAAAAAAAAAAAAADrJ8AQ/original'
description: 自由切分指定区域。
---

## 何时使用

- 可以水平或垂直地分隔区域。
- 当需要自由拖拽调整各区域大小。
- 当需要指定区域的最大最小宽高时。

## API

### nz-splitter

| 参数                     | 说明                                                                                               | 类型                                                                                                      | 默认值         |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------- |
| `[nzOrientation]`        | 布局方向                                                                                           | `'horizontal' \| 'vertical'`                                                                              | `'horizontal'` |
| ~~`[nzLayout]`~~         | 已废弃，请使用 [nzOrientation]。                                                                   | `'horizontal' \| 'vertical'`                                                                              | `'horizontal'` |
| `[nzLazy]`               | 延迟渲染模式                                                                                       | `boolean`                                                                                                 | `false`        |
| `[nzCollapsible]`        | 所有拖拽条的折叠行为：motion 开启折叠动画，icon 替换折叠箭头（字符串为图标类型）。需要 v6 样式表。 | `{ motion?: boolean; icon?: { start?: string \| TemplateRef<void>; end?: string \| TemplateRef<void> } }` | -              |
| `[nzDraggerIcon]`        | 自定义拖拽图标，字符串为图标类型。需要 v6 样式表。                                                 | `string \| TemplateRef<void>`                                                                             | -              |
| `(nzResizeStart)`        | 开始拖拽之前回调                                                                                   | `EventEmitter<number[]>`                                                                                  | -              |
| `(nzResize)`             | 面板大小变化回调                                                                                   | `EventEmitter<number[]>`                                                                                  | -              |
| `(nzResizeEnd)`          | 拖拽结束回调                                                                                       | `EventEmitter<number[]>`                                                                                  | -              |
| `(nzDraggerDoubleClick)` | 双击拖拽条时触发，参数为拖拽条序号                                                                 | `EventEmitter<number>`                                                                                    | -              |
| `(nzCollapse)`           | 面板折叠或展开后触发                                                                               | `EventEmitter<{ collapsed: boolean[]; sizes: number[] }>`                                                 | -              |

### nz-splitter-panel

| 参数              | 说明                                                                                              | 类型                                                                                     | 默认值  |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------- |
| `[nzDefaultSize]` | 初始面板大小，支持数字 px 或者文字 '百分比%' 类型                                                 | `number \| string`                                                                       | -       |
| `[nzMin]`         | 最小阈值，支持数字 px 或者文字 '百分比%' 类型                                                     | `number \| string`                                                                       | -       |
| `[nzMax]`         | 最大阈值，支持数字 px 或者文字 '百分比%' 类型                                                     | `number \| string`                                                                       | -       |
| `[nzSize]`        | 受控面板大小，支持数字 px 或者文字 '百分比%' 类型                                                 | `number \| string`                                                                       | -       |
| `[nzCollapsible]` | 快速折叠；showCollapsibleIcon 为 'auto' 时悬停显示，true 始终显示，false 不显示。需要 v6 样式表。 | `boolean \| { start?: boolean; end?: boolean; showCollapsibleIcon?: boolean \| 'auto' }` | `false` |
| `[nzResizable]`   | 是否开启拖拽伸缩                                                                                  | `boolean`                                                                                | `true`  |
