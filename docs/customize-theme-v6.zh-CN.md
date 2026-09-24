---
order: 6.2
title: Ant Design v6 主题（预览）
---

NG-ZORRO 提供了一份基于 Ant Design v6 生成的可选样式表。它将 v6 设计令牌（design tokens）以 CSS 变量的形式表达，因此主题就是一组可以在运行时切换的变量，服务端渲染场景下同样适用。默认的 v4 样式表不受影响。

## 已覆盖的组件

目前只有以下组件拥有 v6 样式。其余组件仍会使用你加载的 v4 样式表渲染。

<!-- prettier-ignore-start -->
<!-- v6-components:start -->
- `button`
- `input`
- `select`
- `space`
<!-- v6-components:end -->
<!-- prettier-ignore-end -->

## 启用方式

在 `angular.json` 中替换默认样式表：

```json
"styles": ["node_modules/ng-zorro-antd/ng-zorro-antd.v6.min.css"]
```

或者自行组合（模板 + 一份令牌文件 + CDK 浮层规则）：

```css
@import 'ng-zorro-antd/style/v6/template.css';
@import 'ng-zorro-antd/style/v6/tokens.default.css'; /* 或 tokens.dark.css / tokens.compact.css */
@import 'ng-zorro-antd/style/v6/patch.css';
```

或者按组件单独引入：`ng-zorro-antd/button/style/v6/index.css` 加一份令牌文件。

## 配置主题

除旧版颜色字段外，`NzConfig.theme` 接受 Ant Design `ThemeConfig` 中的以下字段：`algorithm`、`token`、`components`（按组件配置的令牌，可附带 `algorithm`）以及 `cssVar.prefix`。`ThemeConfig` 的其他字段（如 `hashed`、`inherit`、`zeroRuntime`）不受支持。

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

运行时切换：

```ts
inject(NzConfigService).set('theme', { algorithm: nzDarkAlgorithm });
```

仅为某个组件覆盖的全局令牌（例如 `components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } }`）只作用于该组件的元素，不会影响页面的其他部分。

计算变量的引擎会在首次使用某个 v6 字段时才被惰性加载；只加载 CSS 的应用在运行时不会为此付出任何代价。旧版字段（`primaryColor` 等）仍然驱动着 v4 的变量样式表。

## 在 TypeScript 中读取令牌

```ts
import { getNzDesignToken } from 'ng-zorro-antd/core/theme';

const token = getNzDesignToken({ token: { colorPrimary: '#00b96b' } });
chart.color = token.colorPrimary;
```

## 局部主题

```html
<section [nzTheme]="{ algorithm: nzDarkAlgorithm }">
  <button nz-button nzType="primary">Dark inside</button>
</section>
```

`nzThemeInherit`（默认 `true`）会合并最近的祖先 `[nzTheme]` 的主题。由 CDK 浮层渲染的弹出内容（下拉选择框、提示框等）位于该区域之外，仍遵循全局主题。

## 服务端渲染

主题服务通过 Angular 的 `DOCUMENT` 写入一个 `<style id="nz-theme">` 元素，并在该元素写入之前注册一个 Angular 待处理任务（`PendingTasks`），因此服务端渲染会等待主题就绪，这些变量会成为服务端渲染 HTML 的一部分，且水合（hydration）过程会复用该元素。`[nzTheme]` 也会以同样的方式为其局部样式注册待处理任务。

## 预览版的限制

- 未在上方列出的组件仍会回退到 v4 规则。
- 局部主题无法作用于 CDK 浮层。
- `[nzTheme]` 只继承外层 `[nzTheme]` 的主题，而不继承全局的 `NzConfig.theme`：没有祖先指令时，它从默认主题开始。
- 生成的 CSS 引用的是 `--ant-*` 变量，因此不支持 `ant` 以外的 `cssVar.prefix` 取值。
- 令牌名称与 antd 完全一致（例如 `--ant-color-primary`、`--ant-button-default-bg`）；直接在 CSS 中覆盖它们对静态值有效，但不会被重新推导，建议优先使用 `NzConfig.theme`。
