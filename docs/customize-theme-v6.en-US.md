---
order: 6.2
title: Ant Design v6 Theme (Preview)
---

NG-ZORRO ships an opt-in stylesheet generated from Ant Design v6. It uses the v6 design tokens as CSS variables, so a theme is a set of variables that can be switched at runtime, including during server-side rendering. The default v4 stylesheets are unchanged.

## Components covered

Only the components below have v6 styles so far. Others keep rendering with the v4 stylesheet you load.

<!-- prettier-ignore-start -->
<!-- v6-components:start -->
- `button`
- `input`
- `select`
- `space`
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

Or per component: `ng-zorro-antd/button/style/v6/index.css` plus a token file.

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

`nzThemeInherit` (default `true`) merges the theme of the nearest ancestor `[nzTheme]`. Popups rendered by the CDK overlay (select dropdowns, tooltips) are outside the section and follow the global theme.

## Server-side rendering

The theme service writes a `<style id="nz-theme">` element through Angular's `DOCUMENT` and registers an Angular pending task (`PendingTasks`) until the element is written, so server rendering waits for the theme and the variables are part of the server-rendered HTML; hydration reuses the element. `[nzTheme]` registers a pending task for its scoped style in the same way.

## Limits of the preview

- Components not listed above fall back to v4 rules.
- Scoped themes do not reach CDK overlays.
- `[nzTheme]` inherits only from an enclosing `[nzTheme]`, not from the global `NzConfig.theme`: without an ancestor directive it starts from the default theme.
- `cssVar.prefix` values other than `ant` are not supported by the generated CSS, which references `--ant-*` variables.
- Token names follow antd exactly (`--ant-color-primary`, `--ant-button-default-bg`); overriding them directly in CSS works for static values but is not re-derived, prefer `NzConfig.theme`.
