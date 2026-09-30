---
order: 6.2
title: Ant Design v6 Theme (Preview)
---

NG-ZORRO ships an opt-in stylesheet generated from Ant Design v6. It uses the v6 design tokens as CSS variables, so a theme is a set of variables that can be switched at runtime, including during server-side rendering. The default v4 stylesheets are unchanged.

## Components covered

Only the components below have v6 styles so far. Others keep rendering with the v4 stylesheet you load.

<!-- prettier-ignore-start -->
<!-- v6-components:start -->
- `alert`
- `auto-complete`
- `badge`
- `button`
- `card`
- `carousel`
- `cascader`
- `checkbox`
- `color-picker`
- `date-picker`
- `descriptions`
- `drawer`
- `dropdown`
- `float-button`
- `form`
- `input`
- `input-number`
- `mention`
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
- `statistic`
- `switch`
- `tag`
- `time-picker`
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

Or compose it yourself (template + one token file + CDK overlay rules):

```css
@import 'ng-zorro-antd/style/v6/template.css';
@import 'ng-zorro-antd/style/v6/tokens.default.css'; /* or tokens.dark.css / tokens.compact.css */
@import 'ng-zorro-antd/style/v6/patch.css';
```

Or per component: `ng-zorro-antd/button/style/v6/index.css` plus a token file; each per-component file also carries the ng-zorro patches of the components it renders (for example `time-picker` carries date-picker's, `cascader` carries select's).

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

Popups rendered by the CDK overlay sit outside the section in the DOM. The following popups still carry the scope of the nearest enclosing `[nzTheme]`: the Select dropdown, Tooltip, Popover, Popconfirm, Drawer (when declared in a template) and Modal (when declared in a template, or created with `nzViewContainerRef` inside the scope), plus AutoComplete, TreeSelect, Cascader, DatePicker, TimePicker and Mention's overlay panels, ColorPicker's picker panel (built on Popover) and Slider's handle tooltip. Message and Notification are application-wide singletons and always follow the global theme. The scope is resolved from Angular's _injector_ tree, not from the DOM, and, as with any CDK overlay, the dropdown's classes are applied when the overlay is first created: a later `nzDropdownClassName` change does not reach a dropdown that was already opened once.

## Server-side rendering

The theme service writes a `<style id="nz-theme">` element through Angular's `DOCUMENT` and registers an Angular pending task (`PendingTasks`) until the element is written, so server rendering waits for the theme and the variables are part of the server-rendered HTML; hydration reuses the element. `[nzTheme]` registers a pending task for its scoped style in the same way.

## Limits of the preview

- Components not listed above fall back to v4 rules.
- Of the overlay-based components, the Select dropdown, Tooltip, Popover, Popconfirm, Drawer (when declared in a template) and Modal (when declared in a template, or created with `nzViewContainerRef` inside the scope) carry a scoped theme, along with AutoComplete, TreeSelect, Cascader, DatePicker, TimePicker and Mention's overlay panels, ColorPicker's picker panel (built on Popover) and Slider's handle tooltip. Message and Notification are application-wide singletons and always follow the global theme. The other overlay-based components follow the global theme until they are migrated.
- A Select projected with `<ng-content>` into a component whose own template holds `[nzTheme]`, or stamped with `ngTemplateOutlet` from a template declared outside the scope, gets the scoped theme on its inline part (CSS variables inherit through the DOM) but an unscoped dropdown, because the scope follows the injector tree where the Select was declared. Put the `[nzTheme]` where the Select is declared in that case.
- A component-level alias override set globally still applies inside a scope that does not inherit: it is written as a class-scoped rule on `:root`, and CSS variables inherit through the DOM regardless of `nzThemeInherit`.
- `cssVar.prefix` values other than `ant` are not supported by the generated CSS, which references `--ant-*` variables.
- Token names follow antd exactly (`--ant-color-primary`, `--ant-button-default-bg`); overriding them directly in CSS works for static values but is not re-derived, prefer `NzConfig.theme`.
