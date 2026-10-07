---
category: Components
cols: 1
type: Navigation
title: Menu
cover: 'https://gw.alipayobjects.com/zos/alicdn/3XZcjGpvK/Menu.svg'
description: A versatile menu for navigation.
---

## When To Use

Navigation menu is important for a website, it helps users jump from one site section to another quickly.
Mostly, it includes top navigation and side navigation. Top navigation provides all the category and functions of the website.
Side navigation provides the multi-level structure of the website.

More layouts with navigation: [layout](/components/layout/en).

## API

```html
<ul nz-menu>
  <li nz-menu-item>Menu 1</li>
  <li nz-menu-item>Menu 2</li>
  <li nz-submenu nzTitle="SubMenu Title">
    <ul>
      <li nz-menu-item>SubMenu Item 1</li>
      <li nz-menu-item>SubMenu Item 2</li>
      <li nz-menu-item>SubMenu Item 3</li>
    </ul>
  </li>
</ul>
```

### [nz-menu]

| Param                 | Description                                                                                                                                                                 | Type                                     | Default value |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------- |
| `[nzInlineCollapsed]` | specifies the collapsed status when menu is `inline` mode; a first-level item or submenu without an icon then shows the first letter of its label                           | `boolean`                                | -             |
| `[nzInlineIndent]`    | indent px of `inline` menu item on each level                                                                                                                               | `number`                                 | `24`          |
| `[nzMode]`            | type of the menu; `vertical`、 `horizontal`, and `inline` modes are supported                                                                                               | `'vertical' \| 'horizontal' \| 'inline'` | `'vertical'`  |
| `[nzSelectable]`      | allow selecting menu items                                                                                                                                                  | `boolean`                                | `true`        |
| `[nzTheme]`           | color theme of the menu                                                                                                                                                     | `'light' \| 'dark'`                      | `'light'`     |
| `[nzDisabled]`        | disable every item and submenu of the menu                                                                                                                                  | `boolean`                                | `false`       |
| `[nzTooltip]`         | show the label of a first-level item in a tooltip while the menu is collapsed (`nzInlineCollapsed`); `false` turns it off; an item with its own `nz-tooltip` keeps that one | `boolean`                                | `true`        |
| `[nzExpandIcon]`      | custom submenu expand icon; the template context's `$implicit` is the submenu's open state; horizontal submenus keep the default arrow                                      | `TemplateRef<{ $implicit: boolean }>`    | -             |
| `(nzClick)`           | the Output when click `nz-menu-item` inside nz-menu                                                                                                                         | `EventEmitter<NzMenuItemComponent>`      |               |

### [nz-menu-item]

| Param                  | Description                                                                                                                                                  | Type                          | Default value |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------- |
| `[nzDisabled]`         | whether menu item is disabled or not                                                                                                                         | `boolean`                     | `false`       |
| `[nzSelected]`         | whether menu item is selected or not                                                                                                                         | `boolean`                     | `false`       |
| `[nzMatchRouter]`      | whether auto set `nzSelected` according to [routerLink](https://www.angular.io/api/router/RouterLink)                                                        | `boolean`                     | `false`       |
| `[nzMatchRouterExact]` | only match when the url matches the link exactly, same as [routerLinkActiveOptions](https://angular.dev/api/router/RouterLinkActive#routerLinkActiveOptions) | `boolean`                     | `false`       |
| `[nzDanger]`           | display the danger style                                                                                                                                     | `boolean`                     | `false`       |
| `[nzPaddingLeft]`      | padding-left of the item in px; overrides the indent computed from `nzInlineIndent` and the level                                                            | `number`                      | -             |
| `[nzIcon]`             | icon type rendered before the label; stays visible when the menu is collapsed; a projected `<nz-icon>` is hidden while it is set                             | `string`                      | -             |
| `[nzExtra]`            | extra content at the end of the item, e.g. a shortcut. Requires the v6 stylesheet.                                                                           | `string \| TemplateRef<void>` | -             |

### [nz-submenu]

You can set the title of `[nz-submenu]` in the following ways.

```html
<li nz-submenu nzTitle="SubTitle" nzIcon="appstore"></li>

<li nz-submenu>
  <span title>
    <nz-icon nzType="appstore" />
    <span>SubTitle</span>
  </span>
</li>

<li nz-submenu [nzTitle]="titleTpl"></li>
<ng-template #titleTpl>
  <nz-icon nzType="appstore" />
  <span>SubTitle</span>
</ng-template>
```

| Param                      | Description                                                                                                | Type                                                                                        | Default value  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| `[nzPlacement]`            | placement of pop menu                                                                                      | `'bottomLeft' \| 'bottomCenter' \| 'bottomRight' \| 'topLeft' \| 'topCenter' \| 'topRight'` | `'bottomLeft'` |
| `[nzOpen]`                 | whether sub menu is open or not, double binding                                                            | `boolean`                                                                                   | `false`        |
| `[nzDisabled]`             | whether sub menu is disabled or not                                                                        | `boolean`                                                                                   | `false`        |
| `[nzTitle]`                | set submenu title                                                                                          | `string \| TemplateRef<void>`                                                               | -              |
| `[nzIcon]`                 | `icon` type in title                                                                                       | `string`                                                                                    | -              |
| `[nzMenuClassName]`        | Custom the submenu container's class name                                                                  | `string`                                                                                    | -              |
| `[nzTriggerSubMenuAction]` | Which action can trigger submenu open/close                                                                | `'hover' \| 'click'`                                                                        | `'hover'`      |
| `[nzPaddingLeft]`          | padding-left of the submenu title in px; overrides the indent computed from `nzInlineIndent` and the level | `number`                                                                                    | -              |
| `(nzOpenChange)`           | nzOpen callback                                                                                            | `EventEmitter<boolean>`                                                                     | -              |

In `horizontal` mode a submenu popup is as wide as its title; with the v6 stylesheet it is at least as wide as its title and grows with its content.

### [nz-menu-group]

You can set the title of `[nz-menu-group]` in the following ways.

```html
<li nz-menu-group nzTitle="SubTitle" nzIcon="appstore"></li>

<li nz-menu-group>
  <span title>
    <nz-icon nzType="appstore" />
    <span>SubTitle</span>
  </span>
</li>

<li nz-menu-group [nzTitle]="titleTpl"></li>
<ng-template #titleTpl>
  <nz-icon nzType="appstore" />
  <span>SubTitle</span>
</ng-template>
```

| Param       | Description          | Type                          | Default value |
| ----------- | -------------------- | ----------------------------- | ------------- |
| `[nzTitle]` | set menu group title | `string \| TemplateRef<void>` | -             |

### [nz-menu-divider]

Divider line in between menu items, only used in vertical popup Menu or Dropdown Menu.

| Param        | Description                                                | Type      | Default value |
| ------------ | ---------------------------------------------------------- | --------- | ------------- |
| `[nzDashed]` | whether the divider is dashed. Requires the v6 stylesheet. | `boolean` | `false`       |
