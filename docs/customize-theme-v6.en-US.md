---
order: 6.2
title: Ant Design v6 Theme (Preview)
---

NG-ZORRO ships an opt-in stylesheet generated from Ant Design v6. It uses the v6 design tokens as CSS variables, so a theme is a set of variables that can be switched at runtime, including during server-side rendering. The default v4 stylesheets are unchanged.

## Components covered

Every NG-ZORRO component that Ant Design v6 ships styles for is listed below. Watermark is not listed: antd 6 draws it on a canvas with inline styles, so there is no v6 CSS to port and it renders the same under either stylesheet. The NG-ZORRO-only components (check-list, code-editor, comment, cron-expression, graph, hash-code, page-header, resizable, tree-view) have no antd v6 counterpart and no v6 styles; the icon's `.anticon` rule ships in the shared template.

<!-- prettier-ignore-start -->
<!-- v6-components:start -->
- `affix`
- `alert`
- `anchor`
- `auto-complete`
- `avatar`
- `badge`
- `breadcrumb`
- `button`
- `calendar`
- `card`
- `carousel`
- `cascader`
- `checkbox`
- `collapse`
- `color-picker`
- `date-picker`
- `descriptions`
- `divider`
- `drawer`
- `dropdown`
- `empty`
- `flex`
- `float-button`
- `form`
- `grid`
- `image`
- `input`
- `input-number`
- `layout`
- `list`
- `mention`
- `menu`
- `message`
- `modal`
- `notification`
- `pagination`
- `popconfirm`
- `popover`
- `progress`
- `qr-code`
- `radio`
- `rate`
- `result`
- `segmented`
- `select`
- `skeleton`
- `slider`
- `space`
- `spin`
- `splitter`
- `statistic`
- `steps`
- `switch`
- `table`
- `tabs`
- `tag`
- `time-picker`
- `timeline`
- `tooltip`
- `transfer`
- `tree`
- `tree-select`
- `typography`
- `upload`
<!-- v6-components:end -->
<!-- prettier-ignore-end -->

## Opt in

Replace the default stylesheet in `angular.json`:

```json
"styles": ["node_modules/ng-zorro-antd/ng-zorro-antd.v6.min.css"]
```

Or compose it yourself, in this order (template + the per-component patches + one token file + CDK overlay rules); the result is byte-for-byte the bundle above:

```css
@import 'ng-zorro-antd/style/v6/template.css';
@import 'ng-zorro-antd/style/v6/component-patches.css';
@import 'ng-zorro-antd/style/v6/tokens.default.css'; /* or tokens.dark.css / tokens.compact.css */
@import 'ng-zorro-antd/style/v6/patch.css';
```

`component-patches.css` is what adapts Ant Design's CSS to NG-ZORRO's DOM; without it, for example, every dropdown stays at the offscreen position antd uses for measuring.

Or per component: `ng-zorro-antd/button/style/v6/index.css` plus a token file; each per-component file also carries the ng-zorro patches of the components it renders (for example `time-picker` carries date-picker's, `cascader` carries select's).

### Global reset

The v4 stylesheet normalized the whole page (`box-sizing: border-box` everywhere, `margin: 0` on `body`, inherited font and line height on `button` and `input`, no top margin on `ul` and `ol`, …). Like Ant Design v5 and v6, the v6 stylesheet resets only its own `.ant-*` elements, so elements an application never styled can move when it switches: a bare `<ul>` regains the browser's top margin, a bare `<button>` falls back to the browser's font. Add antd's reset when the application relied on the old normalize:

```css
@import 'ng-zorro-antd/style/v6/reset.css';
```

It is antd's `reset.css` as published, and it is not part of `ng-zorro-antd.v6.min.css`.

## Configure the theme

Besides the legacy colour keys, `NzConfig.theme` accepts these fields of Ant Design's `ThemeConfig`: `algorithm`, `token`, `components` (per-component tokens, optionally with `algorithm`) and `cssVar.prefix`. Other `ThemeConfig` fields (such as `hashed`, `inherit` or `zeroRuntime`) are not supported.

```ts
import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { nzCompactAlgorithm, nzDarkAlgorithm } from 'ng-zorro-antd/core/theme';

provideNzConfig({
  theme: {
    algorithm: [nzDarkAlgorithm, nzCompactAlgorithm],
    token: { colorPrimary: '#00b96b', borderRadius: 2 },
    components: { Button: { primaryShadow: 'none' } }
  }
});
```

`provideNzConfig` starts the v6 theme during bootstrap, so the global stylesheet is written before the first component renders and scoped `[nzTheme]` sections inherit it from their first render. Providing `NZ_CONFIG` directly does not: the theme is then applied when the first component injects `NzConfigService`, which can show default tokens briefly and lets a scoped section render before the global theme it inherits from.

Switch at runtime:

```ts
inject(NzConfigService).set('theme', { algorithm: nzDarkAlgorithm });
```

A global token overridden for one component (for example `components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } }`) applies to that component's elements only, not to the rest of the page.

The engine that computes the variables is loaded lazily the first time a v6 field is used; applications that only load the CSS pay nothing at runtime. The legacy keys (`primaryColor` and friends) keep driving the v4 variable stylesheet.

## Coming from a v4 Less theme

A v4 theme set Less variables; a v6 theme sets seed and component tokens, and the algorithm derives the rest. The variables applications most often set map as follows:

| Less variable (v4)                                                | v6 token                                                                                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `@primary-color`                                                  | `token.colorPrimary`                                                                                                                      |
| `@primary-1` … `@primary-5`, `@primary-7`                         | `token.colorPrimaryBg`, `colorPrimaryBgHover`, `colorPrimaryBorder`, `colorPrimaryBorderHover`, `colorPrimaryHover`, `colorPrimaryActive` |
| `@link-color`, `@link-hover-color`, `@link-active-color`          | `token.colorLink`, `colorLinkHover`, `colorLinkActive`                                                                                    |
| `@info-color`, `@success-color`, `@warning-color`, `@error-color` | `token.colorInfo`, `colorSuccess`, `colorWarning`, `colorError`                                                                           |
| `@processing-color`                                               | no seed of its own; Progress and the processing Badge read `colorInfo`                                                                    |
| `@font-family`, `@font-size-base`                                 | `token.fontFamily`, `fontSize`                                                                                                            |
| `@border-radius-base`, `@border-radius-sm`, `@border-radius-lg`   | `token.borderRadius`, `borderRadiusSM`, `borderRadiusLG`                                                                                  |
| `@text-color`, `@text-color-secondary`                            | `token.colorText`, `colorTextSecondary`                                                                                                   |
| `@border-color-base`, `@border-color-split`                       | `token.colorBorder`, `colorBorderSecondary`                                                                                               |
| `@layout-body-background`                                         | `token.colorBgLayout`                                                                                                                     |
| `@component-background`                                           | `token.colorBgContainer` (and `colorBgElevated` for popups)                                                                               |
| `@layout-sider-background`, `@layout-header-background`           | `components.Layout.siderBg`, `headerBg`                                                                                                   |
| `@menu-dark-bg`, `@menu-dark-inline-submenu-bg`                   | `components.Menu.darkItemBg`, `darkSubMenuItemBg` (and `darkPopupBg`)                                                                     |
| `@segmented-bg`                                                   | `components.Segmented.trackBg`                                                                                                            |

Three things the derivation does that a Less theme did not:

- **The primary ramp is derived from the seed, and a dark or desaturated seed gets grey tints.** `colorPrimary: '#5c2a98'` yields `colorPrimaryBg: '#d4ccd9'`, because antd's palette generator lowers saturation as it lightens. A v4 theme that set `@primary-1` … `@primary-7` by hand has to set the matching `colorPrimary*` tokens by hand under v6 too.
- **Under `nzDarkAlgorithm`, `colorPrimary` is a seed, not the rendered colour.** The algorithm re-derives the palette against `colorBgContainer`, so `colorPrimary: '#9254de'` renders as `--ant-color-primary: #7f4ac0`. Read the rendered value with `getNzDesignToken`, or set `colorPrimary` to the value that derives to the colour you want.
- **A segmented control's track is the layout background.** `Segmented.trackBg` defaults to `colorBgLayout`, so a `nz-segmented` placed directly on the layout background shows no track; v4's `@segmented-bg` was a fill colour. Set `components.Segmented.trackBg` when the control does not sit on a container.

## Read tokens in TypeScript

```ts
import { getNzDesignToken } from 'ng-zorro-antd/core/theme';

const token = getNzDesignToken({ token: { colorPrimary: '#00b96b' } });
chart.color = token.colorPrimary;
```

## Scoped themes

```html
<section [nzTheme]="{ algorithm: nzDarkAlgorithm }">
  <button nz-button nzType="primary">Dark inside</button>
</section>
```

`nzThemeInherit` (default `true`) merges over the nearest ancestor `[nzTheme]`, or, when there is none, over the global theme applied through `NzConfig.theme`. As in antd, `token` merges key by key and `components` merges per component.

Popups rendered by the CDK overlay sit outside the section in the DOM. The following popups still carry the scope of the nearest enclosing `[nzTheme]`: the Select dropdown, Tooltip, Popover, Popconfirm, Drawer (when declared in a template) and Modal (when declared in a template, or created with `nzViewContainerRef` inside the scope), plus AutoComplete, TreeSelect, Cascader, DatePicker, TimePicker and Mention's overlay panels, ColorPicker's picker panel (built on Popover) and Slider's handle tooltip. Dropdown's menu panel (including the context menu created with `NzContextMenuService`), Image's preview overlay, Tabs' overflow menu and Table's filter dropdown (both built on Dropdown, so they inherit its scope with no wiring of their own), Breadcrumb's dropdown items (built on Dropdown), Menu's submenu popups (horizontal, vertical and collapsed inline menus), and Pagination's size-changer and Calendar's header selects (both built on Select) carry it too. Message and Notification are application-wide singletons and always follow the global theme. The scope is resolved from Angular's _injector_ tree, not from the DOM, and, as with any CDK overlay, the dropdown's classes are applied when the overlay is first created: a later `nzDropdownClassName` change does not reach a dropdown that was already opened once.

## Server-side rendering

The theme service writes a `<style id="nz-theme">` element through Angular's `DOCUMENT` and registers an Angular pending task (`PendingTasks`) until the element is written, so server rendering waits for the theme and the variables are part of the server-rendered HTML; hydration reuses the element. `[nzTheme]` registers a pending task for its scoped style in the same way.

## Limits of the preview

- Components not listed above fall back to v4 rules.
- Of the overlay-based components, the Select dropdown, Tooltip, Popover, Popconfirm, Drawer (when declared in a template) and Modal (when declared in a template, or created with `nzViewContainerRef` inside the scope) carry a scoped theme, along with AutoComplete, TreeSelect, Cascader, DatePicker, TimePicker and Mention's overlay panels, ColorPicker's picker panel (built on Popover) and Slider's handle tooltip. Dropdown's menu panel (and its context menu), Image's preview overlay, Tabs' overflow menu and Table's filter dropdown (both inheriting Dropdown's scope), Breadcrumb's dropdown items (inheriting Dropdown's scope), Menu's submenu popups, and Pagination's size-changer and Calendar's header selects (both inheriting Select's scope) carry it too. Message and Notification are application-wide singletons and always follow the global theme. The other overlay-based components follow the global theme until they are migrated.
- A Select projected with `<ng-content>` into a component whose own template holds `[nzTheme]`, or stamped with `ngTemplateOutlet` from a template declared outside the scope, gets the scoped theme on its inline part (CSS variables inherit through the DOM) but an unscoped dropdown, because the scope follows the injector tree where the Select was declared. Put the `[nzTheme]` where the Select is declared in that case.
- A component-level alias override set globally still applies inside a scope that does not inherit: it is written as a class-scoped rule on `:root`, and CSS variables inherit through the DOM regardless of `nzThemeInherit`.
- `cssVar.prefix` values other than `ant` are not supported by the generated CSS, which references `--ant-*` variables.
- Token names follow antd exactly (`--ant-color-primary`, `--ant-button-default-bg`); overriding them directly in CSS works for static values but is not re-derived, prefer `NzConfig.theme`.
- A text Divider's rails are drawn on `.ant-divider-rail` elements under v6, not on the host's `::before`/`::after` pseudo-elements that v4 uses; a stylesheet that colours `nz-divider::before`/`::after` needs a matching `.ant-divider-rail` rule to stay colored under v6.
- Dropdown menu items and submenu titles (`.ant-dropdown-menu-item`, `.ant-dropdown-menu-submenu-title`) are flex containers under v6, where v4 laid their children out inline. Whitespace between a projected icon and its label no longer renders as a gap; project icons through `nzIcon`, or give the item or title a `gap`.
