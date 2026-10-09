---
category: Components
subtitle: 标签
type: 数据展示
title: Tag
cover: 'https://gw.alipayobjects.com/zos/alicdn/cH1BOLfxC/Tag.svg'
description: 进行标记和分类的小标签。
---

## 何时使用

- 用于标记事物的属性和维度。
- 进行分类。

## API

### nz-tag

| 参数                | 说明                                                                                                                                                             | 类型                                      | 默认值      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------- |
| `[nzMode]`          | 设定标签工作的模式                                                                                                                                               | `'closeable' \| 'default' \| 'checkable'` | `'default'` |
| `[nzChecked]`       | 设置标签的选中状态，可双向绑定，在 `nzMode="checkable"` 时可用                                                                                                   | `boolean`                                 | `false`     |
| `[nzColor]`         | 标签色                                                                                                                                                           | `string`                                  | -           |
| `[nzVariant]`       | 标签的变体；`'outlined'` 时自定义 `nzColor` 会像 Ant Design 一样生成浅色背景；对于 `'outlined'`、`'solid'`：需要 v6 样式表。                                     | `'filled' \| 'outlined' \| 'solid'`       | `'filled'`  |
| `[nzIcon]`          | 显示在内容之前的图标，此时内容会像 Ant Design 一样包裹在 `<span>` 中                                                                                             | `string \| TemplateRef<void>`             | -           |
| `[nzDisabled]`      | 是否禁用：可选择标签不再切换，可关闭标签不再关闭，且不应用自定义 `nzColor`；禁用的可选择标签还会退出 Tab 顺序（`tabindex="-1"`）；对于禁用外观：需要 v6 样式表。 | `boolean`                                 | `false`     |
| `[nzValue]`         | `nz-tag-checkable-group` 中可选择标签的值；未设置时不参与组的取值                                                                                                | `string \| number`                        | -           |
| ~~`[nzBordered]`~~  | 已废弃，请使用 [nzVariant]。是否有边框；`false` 保留默认样式表的无边框外观，并解析为 `'filled'`                                                                  | `boolean`                                 | `true`      |
| `(nzOnClose)`       | 关闭时的回调，在 `nzMode="closable"` 时可用                                                                                                                      | `EventEmitter<MouseEvent>`                | -           |
| `(nzCheckedChange)` | 设置标签的选中状态的回调，在 `nzMode="checkable"` 时可用                                                                                                         | `EventEmitter<void>`                      | -           |

### nz-tag-checkable-group

| 参数           | 说明                                                                                                                                 | 类型                                               | 默认值  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------- |
| `[nzMultiple]` | 是否可多选；为 `true` 时取值为数组，否则为单个值或 `null`                                                                            | `boolean`                                          | `false` |
| `[nzDisabled]` | 禁用组内全部可选择标签；子标签自身绑定的 `[nzDisabled]` 控制其外观与焦点，但禁用的组始终拒绝修改模型；对于禁用外观：需要 v6 样式表。 | `boolean`                                          | `false` |
| `[(ngModel)]`  | 子可选择标签中被选中的 `nzValue`                                                                                                     | `(string \| number)[] \| string \| number \| null` | -       |
