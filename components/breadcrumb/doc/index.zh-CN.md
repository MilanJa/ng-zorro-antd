---
category: Components
subtitle: 面包屑
type: 导航
title: Breadcrumb
cover: 'https://gw.alipayobjects.com/zos/alicdn/9Ltop8JwH/Breadcrumb.svg'
description: 显示当前页面在系统层级结构中的位置，并能向上返回。
---

## 何时使用

- 当系统拥有超过两级以上的层级结构时；
- 当需要告知用户『你在哪里』时；
- 当需要向上导航的功能时。

## API

### nz-breadcrumb

| 参数                | 说明                                                                                                                                                                                                                                  | 类型                                                                                                | 默认值           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| `[nzSeparator]`     | 分隔符自定义                                                                                                                                                                                                                          | `string \| TemplateRef<void> \| null`                                                               | `'/'`            |
| `[nzAutoGenerate]`  | 自动生成 Breadcrumb                                                                                                                                                                                                                   | `boolean`                                                                                           | `false`          |
| `[nzRouteLabel]`    | 自定义 route data 属性名称，`nzAutoGenerate` 为 `true` 时才生效                                                                                                                                                                       | `string`                                                                                            | `'breadcrumb'`   |
| `[nzRouteLabelFn]`  | 格式化面包屑导航项的显示文字，通常用于在国际化应用中翻译键值， `nzAutoGenerate` 为 `true` 时才生效                                                                                                                                    | `(label:string) => string`                                                                          | `label => label` |
| `[nzRouteFn]`       | 格式化面包屑路由格式，可用于为 URL 添加 query params，`nzAutoGenerate` 为 `true` 时才生效                                                                                                                                             | `(route:string) => route`                                                                           | `route => route` |
| `[nzItems]`         | 数据驱动的面包屑项，在投影内容之后渲染为 `nz-breadcrumb-item` 与 `nz-breadcrumb-separator` 子元素；更新时请传入新数组。与 `[nzAutoGenerate]` 同时设置时以 `nzItems` 为准，并在开发模式下给出警告；空数组同样优先于 `[nzAutoGenerate]` | `NzBreadcrumbItem[] \| null`                                                                        | `null`           |
| `[nzParams]`        | `nzItems` 中 `title` 与 `path` 字符串里 `:name` 占位符的取值；占位符按完整键名匹配                                                                                                                                                    | `Record<string, string \| number> \| null`                                                          | `null`           |
| `[nzItemRender]`    | 自定义 `nzItems` 每一项的内容；上下文为 `{ $implicit, item, params, items, paths }`，其中 `$implicit` 为默认内容                                                                                                                      | `TemplateRef<NzBreadcrumbItemRenderContext> \| null`                                                | `null`           |
| `[nzDropdownIcon]`  | 带下拉菜单的面包屑项后的图标，可为图标类型或模板；未自行设置的 `nz-breadcrumb-item` 也使用它                                                                                                                                          | `string \| TemplateRef<void>`                                                                       | `'down'`         |
| `(nzItemClick)`     | 点击 `nzItems` 中的面包屑项时触发，在该项自身的 `onClick` 之后                                                                                                                                                                        | `EventEmitter<{ item: NzBreadcrumbItem; event: MouseEvent }>`                                       | -                |
| `(nzMenuItemClick)` | 点击数据 `menu` 中未禁用的菜单项时触发；菜单项不会触发 `(nzItemClick)`                                                                                                                                                                | `EventEmitter<{ item: NzBreadcrumbItemOption; menuItem: NzBreadcrumbMenuItem; event: MouseEvent }>` | -                |

使用 `[nzAutoGenerate]` 时，需要在路由类中定义 `data`:

```ts
{
  path: 'path',
  component: SomeComponent,
  data: {
    breadcrumb: 'Display Name'
  }
}
```

对于懒加载路由，应该在父层路由写 `data`：

```ts
{
  path: 'first',
  loadChildren: () => import('./first/first.module').then(m => m.FirstModule),
  data: {
    breadcrumb: 'First'
  },
}
```

使用 `nzRouteLabel` 自定义路由属性名称:

```html
<nz-breadcrumb [nzAutoGenerate]="true" [nzRouteLabel]="'customBreadcrumb'"></nz-breadcrumb>
```

```ts
{
  path: 'path',
  component: SomeComponent,
  data: {
    customBreadcrumb: 'Display Name'
  }
}
```

使用 `nzRouteLabelFn` 在国际化应用中格式化面包屑导航项的文本:

```html
<nz-breadcrumb
  [nzAutoGenerate]="true"
  [nzRouteLabel]="'breadcrumbI18nKey'"
  [nzRouteLabelFn]="translateFn"
></nz-breadcrumb>
```

```ts
// In Route
{
  path: 'path',
  component: SomeComponent,
  data: {
    breadcrumbI18nKey: 'i18n.aaa.bbbb'
  }
}

// In component
translateFn = (key: string) => this.yourI18nService.translate(key);
```

使用 `nzRouteFn` 来使用格式化 URL 或添加 query params：

```html
<nz-breadcrumb
  [nzAutoGenerate]="true"
  [nzRouteLabel]="'breadcrumbI18nKey'"
  [nzRouteLabelFn]="translateFn"
  [nzRouteFn]="customRoute"
></nz-breadcrumb>
```

```ts
// In component
bindCurrentParams(params, route) {
  let newRoute = route;
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      newRoute += `;${key}=${params[key]}`;
    }
  }
  return newRoute;
}

const params = this.activatedRoute.snapshot.params;

customRoute = (route:string) => this.bindCurrentParams(params,route);
```

### nz-breadcrumb-item

| 参数                   | 说明                                                                                          | 类型                                                                                        | 默认值         | 全局配置 |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- | -------- |
| `[nzOverlay]`          | 从该面包屑项展开的下拉菜单                                                                    | `NzDropdownMenuComponent`                                                                   | -              |          |
| `[nzOverlayPlacement]` | 下拉菜单的弹出位置；`'bottomCenter'` 与 antd v6 一样在面包屑下方居中                          | `'bottomLeft' \| 'bottomCenter' \| 'bottomRight' \| 'topLeft' \| 'topCenter' \| 'topRight'` | `'bottomLeft'` | ✅       |
| `[nzDropdownIcon]`     | 设置 `[nzOverlay]` 时面包屑项后的图标；未设置时使用父级 `nz-breadcrumb` 的 `[nzDropdownIcon]` | `string \| TemplateRef<void>`                                                               | -              |          |
| `[nzOverlayTrigger]`   | 面包屑项下拉菜单的触发方式                                                                    | `'click' \| 'hover'`                                                                        | `'hover'`      |          |

同一个 `nz-breadcrumb` 中请只使用投影的 `nz-breadcrumb-item` 或 `[nzItems]` 之一：数据项渲染在投影项之后，`:last-child` 规则会作用到错误的项上。

### NzBreadcrumbItem

`nzItems` 的每一项是一个面包屑项（`NzBreadcrumbItemOption`），或在 `type: 'separator'` 时为独立的分隔符（`NzBreadcrumbSeparatorOption`）。

| 参数            | 说明                                                                                                                                                                                                                                                                            | 类型                                                                | 默认值   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| `type`          | 为 `'separator'` 时该项是独立的分隔符；省略（或为 `'item'`）时为面包屑项                                                                                                                                                                                                        | `'item' \| 'separator'`                                             | `'item'` |
| `title`         | 面包屑项内容；字符串中的 `:name` 占位符由 `nzParams` 替换                                                                                                                                                                                                                       | `string \| TemplateRef<void>`                                       | -        |
| `href`          | 面包屑项的链接地址；优先于 `path`（antd 中 `path` 优先）                                                                                                                                                                                                                        | `string`                                                            | -        |
| `path`          | 路径片段，与之前各项的 `path` 拼接为 `#/a/b`（`:name` 占位符由 `nzParams` 替换）。应用配置了 Angular 路由（`provideRouter` 或 `RouterModule`）时，点击改用 `Router.navigateByUrl('/a/b')` 导航，且配置了路由时 href 由应用的 `LocationStrategy` 生成；否则为 antd 的 `#/…` 形式 | `string`                                                            | -        |
| `menu`          | 从该面包屑项展开的下拉菜单：`nz-dropdown-menu` 模板引用，或由面包屑渲染成下拉菜单的数据菜单（`NzBreadcrumbItemMenu`）                                                                                                                                                           | `NzDropdownMenuComponent \| NzBreadcrumbItemMenu \| null`           | -        |
| `dropdownProps` | 该下拉菜单的弹出位置与触发方式                                                                                                                                                                                                                                                  | `{ nzPlacement?: NzPlacementType; nzTrigger?: 'click' \| 'hover' }` | -        |
| `onClick`       | 点击面包屑项时调用                                                                                                                                                                                                                                                              | `(event: MouseEvent) => void`                                       | -        |
| `className`     | 渲染出的 `nz-breadcrumb-item` 的类名                                                                                                                                                                                                                                            | `string`                                                            | -        |
| `style`         | 渲染出的 `nz-breadcrumb-item` 的内联样式                                                                                                                                                                                                                                        | `NgStyleInterface`                                                  | -        |
| `separator`     | `type: 'separator'` 项的内容；未设置时使用 `[nzSeparator]`，再回退到 `'/'`                                                                                                                                                                                                      | `string \| TemplateRef<void>`                                       | -        |

### NzBreadcrumbItemMenu

数据 `menu` 的形式为 `{ items: NzBreadcrumbMenuItem[] }`，渲染为 `nz-dropdown-menu`，每一项对应一个 `nz-menu-item`。带 `path` 的菜单项链接到面包屑项的链接加 `/` 与该路径（路径开头的 `/` 会被去掉；antd 按原样拼接）。面包屑项的链接来自 `path` 或面包屑项没有链接时，应用配置了 Angular 路由后点击改用 `Router.navigateByUrl` 导航，与带 `path` 的面包屑项一致；面包屑项为字面 `href` 时菜单项保留普通链接。

| 参数       | 说明                            | 类型                          | 默认值  |
| ---------- | ------------------------------- | ----------------------------- | ------- |
| `key`      | 菜单项的唯一 key                | `string`                      | -       |
| `title`    | 菜单项内容                      | `string \| TemplateRef<void>` | -       |
| `path`     | 追加到面包屑项链接后的路径片段  | `string`                      | -       |
| `href`     | 菜单项的链接地址；优先于 `path` | `string`                      | -       |
| `disabled` | 是否禁用该菜单项                | `boolean`                     | `false` |
