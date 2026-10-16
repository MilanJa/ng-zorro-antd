---
category: Components
subtitle: 标签页
type: 导航
title: Tabs
cols: 1
cover: 'https://gw.alipayobjects.com/zos/antfincdn/lkI2hNEDr2V/Tabs.svg'
description: 选项卡切换组件。
---

## 何时使用

提供平级的区域将大块内容进行收纳和展现，保持界面整洁。

Ant Design 依次提供了三级选项卡，分别用于不同的场景。

- 卡片式的页签，提供可关闭的样式，常用于容器顶部。
- 标准线条式页签，用于容器内部的主功能切换，这是最常用的 Tabs。
- [RadioButton](/components/radio/zh/#components-radio-demo-radiobutton) 可作为更次级的页签来使用。

## API

### nz-tabs

| 参数                         | 说明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 类型                                                               | 默认值                                | 全局配置 | 版本   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------- | -------- | ------ |
| `[nzSelectedIndex]`          | 当前激活 tab 面板的 序列号，可双向绑定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `number`                                                           | -                                     |
| `[(nzActiveKey)]`            | 当前激活页签的 key（`nz-tab[nzKey]`），受控：用户选择时发出 `(nzActiveKeyChange)`，新的 key 写回后页签才切换。与任何页签都不匹配的 key 或 `null` 不激活任何页签（没有激活页签、指示条和面板）。优先于 `[nzSelectedIndex]`（两者同时绑定时开发模式下每个应用提示一次）；设置 `nzLinkRouter` 时忽略（同样每个应用提示一次）。没有激活页签时，点击任一可用且有 key 的页签即为选择；键盘选择仍按序号，因此在之前选中的页签上按 Enter/Space 或使用溢出菜单不会选择它（请改为点击），并且此时 `nzSelectedIndex` 为 -1，绑定的序号变更会被忽略 | `string \| null`                                                   | -                                     |
| `[nzDefaultActiveKey]`       | 未绑定 `nzActiveKey` 时初始选中页签的 key；不匹配任何页签时沿用序号行为（第一个页签）                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `string \| null`                                                   | `null`                                |
| `[nzAnimated]`               | 是否使用动画切换 Tabs，在 `nzTabPosition="top" \| "bottom"` 时有效                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `boolean \| {inkBar:boolean, tabPane:boolean}`                     | `true`, 当 `type="card"` 时为 `false` | ✅       |
| `[nzSize]`                   | 大小，提供 `large` `default` 和 `small` 三种大小                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `'large' \| 'small' \| 'default'`                                  | `'default'`                           | ✅       |
| `[nzTabBarExtraContent]`     | tab bar 上额外的元素                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `TemplateRef<void>`                                                | -                                     |
| `[nzTabBarStyle]`            | tab bar 的样式对象                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `object`                                                           | -                                     |
| `[nzTabPosition]`            | 页签位置，可选值有 `top` `right` `bottom` `left`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `'top' \| 'right' \| 'bottom' \| 'left'`                           | `'top'`                               |          |
| `[nzType]`                   | 页签的基本样式                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `'line' \| 'card' \| 'editable-card'`                              | `'line'`                              | ✅       |
| `[nzTabBarGutter]`           | tabs 之间的间隙                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `number`                                                           | -                                     | ✅       |
| `[nzHideAll]`                | 是否隐藏所有 tab 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                          | `false`                               |
| `[nzLinkRouter]`             | 与 Angular 路由联动                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `boolean`                                                          | `false`                               |          |
| `[nzLinkExact]`              | 以严格匹配模式确定联动的路由                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                          | `true`                                |
| `[nzCanDeactivate]`          | 决定一个 tab 是否可以被切换；调用参数为 `(fromIndex, toIndex, { fromKey, toKey })`，key 为页签的 `nzKey`                                                                                                                                                                                                                                                                                                                                                                                                                                | `NzTabsCanDeactivateFn`                                            | -                                     |
| `[nzCentered]`               | 标签居中展示                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                          | `false`                               |
| `[nzDestroyInactiveTabPane]` | 被隐藏时是否销毁 DOM 结构                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `boolean`                                                          | `false`                               |
| `[nzIndicator]`              | 自定义指示条宽度和对齐方式                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `NzIndicator`                                                      | -                                     |          | 21.2.0 |
| `(nzSelectedIndexChange)`    | 当前激活 tab 面板的 序列号变更回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `EventEmitter<number>`                                             | -                                     |
| `(nzSelectChange)`           | 当前激活 tab 面板变更回调函数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `EventEmitter<{index: number, key?: string, tab: NzTabComponent}>` | -                                     |
| `(nzActiveKeyChange)`        | 用户选择页签（点击、键盘、溢出菜单）时发出该页签的 `nzKey`，配合 `[(nzActiveKey)]` 使用。通过程序修改以及没有 `nzKey` 的页签不触发                                                                                                                                                                                                                                                                                                                                                                                                      | `EventEmitter<string>`                                             | -                                     |
| `(nzTabListScroll)`          | 页签列表通过触摸或滚轮滚动时的回调                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `EventEmitter<NzTabScrollEvent>`                                   | -                                     |

### nz-tabs[nzType="editable-card"]

| 参数          | 说明                                                         | 类型                                            | 默认值  | 全局配置 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------- | ------- | -------- |
| `[nzHideAdd]` | 隐藏添加按钮                                                 | `boolean`                                       | `false` |
| `[nzAddIcon]` | 添加按钮图标                                                 | `string \| TemplateRef<void>`                   | -       |
| `(nzAdd)`     | 点击添加按钮时的事件                                         | `EventEmitter<>`                                | -       |
| `(nzClose)`   | 点击删除按钮时的事件；设置了 `nzKey` 时 `key` 为该页签的 key | `EventEmitter<{ index: number, key?: string }>` | -       |

### nz-tab

| 参数              | 说明                                                                                                                                                                                       | 类型                                        | 默认值  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------- |
| `[nzTitle]`       | 选项卡头显示文字                                                                                                                                                                           | `string \| TemplateRef<TabTemplateContext>` | -       |
| `[nzKey]`         | 页签的 key，供 `nz-tabs` 的 `[nzActiveKey]` 与 `[nzDefaultActiveKey]` 匹配；没有 key 的页签只能按序号指定                                                                                  | `string`                                    | -       |
| `[nzIcon]`        | 选项卡头中显示在标题前的图标，包裹在 `<span class="ant-tabs-tab-icon">` 中；与 Ant Design 一致，溢出菜单只显示标题。字符串图标在默认样式表下可用；`TemplateRef` 图标的间距需要 v6 样式表。 | `string \| TemplateRef<void>`               | -       |
| `[nzForceRender]` | 被隐藏时是否渲染 DOM 结构                                                                                                                                                                  | `boolean`                                   | `false` |
| `[nzDisabled]`    | 是否禁用                                                                                                                                                                                   | `boolean`                                   | -       |
| `(nzClick)`       | 单击 title 的回调函数                                                                                                                                                                      | `EventEmitter<void>`                        | -       |
| `(nzContextmenu)` | 右键 title 的回调函数                                                                                                                                                                      | `EventEmitter<MouseEvent>`                  | -       |
| `(nzSelect)`      | tab 被选中的回调函数                                                                                                                                                                       | `EventEmitter<void>`                        | -       |
| `(nzDeselect)`    | tab 被取消选中的回调函数                                                                                                                                                                   | `EventEmitter<void>`                        | -       |

### nz-tabs[nzType="editable-card"] > nz-tab

| 参数            | 说明         | 类型                          | 默认值  | 全局配置 |
| --------------- | ------------ | ----------------------------- | ------- | -------- |
| `[nzClosable]`  | 显示删除按钮 | `boolean`                     | `false` |
| `[nzCloseIcon]` | 关闭按钮图标 | `string \| TemplateRef<void>` | -       |

#### `nz-tab[nzTitle]` 的模版引用变量

| 属性      | 说明                                                    | 类型      |
| --------- | ------------------------------------------------------- | --------- |
| `visible` | 表示是否在可见区域, 为 `false` 时将会被渲染到下拉菜单中 | `boolean` |

在 `nz-tab[nzTitle]` 中使用

```html
<nz-tab [nzTitle]="titleTemplate">
  ...
  <ng-template #titleTemplate let-visible="visible">...</ng-template>
</nz-tab>
```

在 `*nzTabLink` 中使用

```html
<nz-tab>
  <a *nzTabLink="let visible = visible" nz-tab-link [routerLink]="['.']">...</a>
</nz-tab>
```

### [nz-tab]

与 `ng-template` 一同使用，用于标记需要懒加载的 `tab` 内容，具体用法见示例。

### ng-template[nzTabLink] > a[nz-tab-link]

路由联动可以让 tab 的切换和路由行为相一致。

```html
<nz-tabs nzLinkRouter>
  <nz-tab>
    <a *nzTabLink nz-tab-link [routerLink]="['.']">Link</a>
    Default.
  </nz-tab>
</nz-tabs>
```

### [nzTabBarExtraContent]

> 注意：`*nzTabBarExtraContent` 比 `nz-tabs[nzTabBarExtraContent]` 具有更高的优先级。

| 参数                     | 说明           | 类型               | 默认值  |
| ------------------------ | -------------- | ------------------ | ------- |
| `[nzTabBarExtraContent]` | 附加内容的位置 | `'start' \| 'end'` | `'end'` |
