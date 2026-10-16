---
category: Components
type: Navigation
title: Breadcrumb
cover: 'https://gw.alipayobjects.com/zos/alicdn/9Ltop8JwH/Breadcrumb.svg'
description: Displays the current location within a hierarchy. And allow going back to states higher up in the hierarchy.
---

## When To Use

- When the system has more than two layers in a hierarchy.
- When you need to inform the user of where they are.
- When the user may need to navigate back to a higher level.
- When the application has multi-layer architecture.

## API

### nz-breadcrumb

| Property            | Description                                                                                                                                                                                                                                                                                                   | Type                                                                                                | Default          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| `[nzSeparator]`     | Custom separator                                                                                                                                                                                                                                                                                              | `string \| TemplateRef<void> \| null`                                                               | `'/'`            |
| `[nzAutoGenerate]`  | Auto generate breadcrumb                                                                                                                                                                                                                                                                                      | `boolean`                                                                                           | `false`          |
| `[nzRouteLabel]`    | Name of property that determines displayed text in routing config. It should be used when `nzAutoGenerate` is `true`                                                                                                                                                                                          | `string`                                                                                            | `'breadcrumb'`   |
| `[nzRouteLabelFn]`  | Format breadcrumb item label text, normally used in international app to translate i18n key. It should be used when `nzAutoGenerate` is `true`                                                                                                                                                                | `(label:string) => string`                                                                          | `label => label` |
| `[nzRouteFn]`       | Format breadcrumb item route, normally used in international app to bind current params or query strings to avoid losing them while navigate using breadcrumb. It should be used when `nzAutoGenerate` is `true`                                                                                              | `(route:string) => route`                                                                           | `route => route` |
| `[nzItems]`         | Data-driven crumbs, rendered after the projected content as `nz-breadcrumb-item` and `nz-breadcrumb-separator` children; pass a new array to update them. When `[nzAutoGenerate]` is also set, `nzItems` wins and a dev-mode warning is logged; an empty array still takes precedence over `[nzAutoGenerate]` | `NzBreadcrumbItem[] \| null`                                                                        | `null`           |
| `[nzParams]`        | Values for `:name` placeholders in the `title` and `path` strings of `nzItems`; placeholders match whole keys                                                                                                                                                                                                 | `Record<string, string \| number> \| null`                                                          | `null`           |
| `[nzItemRender]`    | Custom content of each `nzItems` crumb; the context is `{ $implicit, item, params, items, paths }`, where `$implicit` is the default content                                                                                                                                                                  | `TemplateRef<NzBreadcrumbItemRenderContext> \| null`                                                | `null`           |
| `[nzDropdownIcon]`  | Icon after a crumb that has a dropdown menu, as an icon type or a template; `nz-breadcrumb-item`s that do not set their own use it                                                                                                                                                                            | `string \| TemplateRef<void>`                                                                       | `'down'`         |
| `(nzItemClick)`     | Emits when an `nzItems` crumb is clicked, after the entry's own `onClick`                                                                                                                                                                                                                                     | `EventEmitter<{ item: NzBreadcrumbItem; event: MouseEvent }>`                                       | -                |
| `(nzMenuItemClick)` | Emits when an enabled entry of a data `menu` is clicked; `(nzItemClick)` does not fire for menu entries                                                                                                                                                                                                       | `EventEmitter<{ item: NzBreadcrumbItemOption; menuItem: NzBreadcrumbMenuItem; event: MouseEvent }>` | -                |

Using `[nzAutoGenerate]` by configuring `data` like this:

```ts
{
  path: '/path',
  component: SomeComponent,
  data: {
    breadcrumb: 'Display Name'
  }
}
```

For lazy loading modules, you should write `data` in parent module like this:

```ts
{
  path: 'first',
  loadChildren: () => import('./first/first.module').then(m => m.FirstModule),
  data: {
    breadcrumb: 'First'
  },
}
```

Use `nzRouteLabel` to custom `data` breadcrumb label:

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

Use `nzRouteLabelFn` to format breadcrumb label in international application:

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
translateFn = (key:string) => this.yourI18nService.translate(key);
```

Use `nzRouteFn` to format or bind params and query strings to the route it self in international application:

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

| Property               | Description                                                                                                | Type                                                                                        | Default        | Global Config |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- | ------------- |
| `[nzOverlay]`          | Dropdown menu that opens from this crumb                                                                   | `NzDropdownMenuComponent`                                                                   | -              |               |
| `[nzOverlayPlacement]` | Placement of the dropdown overlay; `'bottomCenter'` centres it under the crumb as antd v6 does             | `'bottomLeft' \| 'bottomCenter' \| 'bottomRight' \| 'topLeft' \| 'topCenter' \| 'topRight'` | `'bottomLeft'` | ✅            |
| `[nzDropdownIcon]`     | Icon after the crumb when `[nzOverlay]` is set; unset uses the parent `nz-breadcrumb`'s `[nzDropdownIcon]` | `string \| TemplateRef<void>`                                                               | -              |               |
| `[nzOverlayTrigger]`   | Trigger of the item dropdown                                                                               | `'click' \| 'hover'`                                                                        | `'hover'`      |               |

Use either projected `nz-breadcrumb-item`s or `[nzItems]` in one `nz-breadcrumb`, not both: the data crumbs render after the projected ones, so the `:last-child` rules would style the wrong crumb.

### NzBreadcrumbItem

An `nzItems` entry is a crumb (`NzBreadcrumbItemOption`) or, with `type: 'separator'`, a standalone separator (`NzBreadcrumbSeparatorOption`).

| Property        | Description                                                                                                                                                                                                                                                                                                                                                                                           | Type                                                                | Default  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| `type`          | `'separator'` makes the entry a standalone separator; omit it (or use `'item'`) for a crumb                                                                                                                                                                                                                                                                                                           | `'item' \| 'separator'`                                             | `'item'` |
| `title`         | Crumb content; `:name` placeholders in a string are replaced from `nzParams`                                                                                                                                                                                                                                                                                                                          | `string \| TemplateRef<void>`                                       | -        |
| `href`          | Literal link of the crumb; wins over `path` (antd lets `path` win)                                                                                                                                                                                                                                                                                                                                    | `string`                                                            | -        |
| `path`          | Path segment, joined with the `path`s of the earlier entries into `#/a/b` (`:name` placeholders replaced from `nzParams`). When the application configures the Angular router (`provideRouter` or `RouterModule`), a click navigates with `Router.navigateByUrl('/a/b')` instead, and with the router configured the href is built by the app's `LocationStrategy`; otherwise it is antd's `#/…` form | `string`                                                            | -        |
| `menu`          | Dropdown menu that opens from the crumb: an `nz-dropdown-menu` template reference, or a data menu (`NzBreadcrumbItemMenu`) that the breadcrumb renders as one                                                                                                                                                                                                                                         | `NzDropdownMenuComponent \| NzBreadcrumbItemMenu \| null`           | -        |
| `dropdownProps` | Placement and trigger of that dropdown                                                                                                                                                                                                                                                                                                                                                                | `{ nzPlacement?: NzPlacementType; nzTrigger?: 'click' \| 'hover' }` | -        |
| `onClick`       | Called when the crumb is clicked                                                                                                                                                                                                                                                                                                                                                                      | `(event: MouseEvent) => void`                                       | -        |
| `className`     | Class of the rendered `nz-breadcrumb-item`                                                                                                                                                                                                                                                                                                                                                            | `string`                                                            | -        |
| `style`         | Inline style of the rendered `nz-breadcrumb-item`                                                                                                                                                                                                                                                                                                                                                     | `NgStyleInterface`                                                  | -        |
| `separator`     | Content of a `type: 'separator'` entry; falls back to `[nzSeparator]`, then `'/'`                                                                                                                                                                                                                                                                                                                     | `string \| TemplateRef<void>`                                       | -        |

### NzBreadcrumbItemMenu

A data `menu` is `{ items: NzBreadcrumbMenuItem[] }`, rendered as an `nz-dropdown-menu` with one `nz-menu-item` per entry. An entry with `path` links to the crumb's link plus `/` and the path (a leading `/` of the path is dropped; antd appends the path as given). When the crumb's link comes from `path`, or the crumb has no link, a click navigates with `Router.navigateByUrl` once the application configures the Angular router, as path crumbs do; under a literal crumb `href` the entry keeps its plain link.

| Property   | Description                                 | Type                          | Default |
| ---------- | ------------------------------------------- | ----------------------------- | ------- |
| `key`      | Unique key of the entry                     | `string`                      | -       |
| `title`    | Entry content                               | `string \| TemplateRef<void>` | -       |
| `path`     | Path segment appended to the crumb's link   | `string`                      | -       |
| `href`     | Literal link of the entry; wins over `path` | `string`                      | -       |
| `disabled` | Whether the entry is disabled               | `boolean`                     | `false` |
