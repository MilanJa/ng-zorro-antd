---
order: 6.2
title: Ant Design v6 主题（预览）
---

NG-ZORRO 提供了一份基于 Ant Design v6 生成的可选样式表。它将 v6 设计令牌（design tokens）以 CSS 变量的形式表达，因此主题就是一组可以在运行时切换的变量，服务端渲染场景下同样适用。默认的 v4 样式表不受影响。

## 已覆盖的组件

目前只有以下组件拥有 v6 样式。其余组件仍会使用你加载的 v4 样式表渲染。

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
- `collapse`
- `color-picker`
- `date-picker`
- `descriptions`
- `drawer`
- `dropdown`
- `empty`
- `float-button`
- `form`
- `input`
- `input-number`
- `list`
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

或者按组件单独引入：`ng-zorro-antd/button/style/v6/index.css` 加一份令牌文件；每个组件的文件也包含它所渲染的其他组件的 ng-zorro 补丁（例如 `time-picker` 包含 date-picker 的补丁，`cascader` 包含 select 的补丁）。

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

`provideNzConfig` 会在应用启动时启动 v6 主题：全局样式在第一个组件渲染前写入，带 `[nzTheme]` 的局部区域从首次渲染起就继承它。直接提供 `NZ_CONFIG` 则不会：主题会在第一个组件注入 `NzConfigService` 时才应用，可能短暂显示默认令牌，局部区域也可能在其继承的全局主题之前完成渲染。

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

`nzThemeInherit`（默认 `true`）会合并最近的祖先 `[nzTheme]` 的主题；若没有祖先指令，则合并通过 `NzConfig.theme` 应用的全局主题。与 antd 一致，`token` 按键合并，`components` 按组件合并。

由 CDK 浮层渲染的弹出内容在 DOM 中位于该区域之外。会带上最近的外层 `[nzTheme]` 作用域的浮层：Select 下拉菜单、Tooltip、Popover、Popconfirm、Drawer（声明式）、Modal（声明式，或在作用域内通过 `nzViewContainerRef` 创建），此外还有 AutoComplete、TreeSelect、Cascader、DatePicker、TimePicker、Mention 的浮层面板，基于 Popover 构建的 ColorPicker 拾色面板，以及 Slider 的滑块提示气泡。Message 和 Notification 是应用级单例，始终遵循全局主题。作用域依据 Angular 的*注入器*树而不是 DOM 确定，并且与所有 CDK 浮层一样，下拉菜单的类名在浮层首次创建时应用：之后对 `nzDropdownClassName` 的修改不会作用于已经打开过的下拉菜单。

## 服务端渲染

主题服务通过 Angular 的 `DOCUMENT` 写入一个 `<style id="nz-theme">` 元素，并在该元素写入之前注册一个 Angular 待处理任务（`PendingTasks`），因此服务端渲染会等待主题就绪，这些变量会成为服务端渲染 HTML 的一部分，且水合（hydration）过程会复用该元素。`[nzTheme]` 也会以同样的方式为其局部样式注册待处理任务。

## 预览版的限制

- 未在上方列出的组件仍会回退到 v4 规则。
- 在基于浮层的组件中，Select 下拉菜单、Tooltip、Popover、Popconfirm、Drawer（声明式）以及 Modal（声明式，或在作用域内通过 `nzViewContainerRef` 创建）会带上局部主题，AutoComplete、TreeSelect、Cascader、DatePicker、TimePicker、Mention 的浮层面板，基于 Popover 构建的 ColorPicker 拾色面板，以及 Slider 的滑块提示气泡同样如此；Message 和 Notification 是应用级单例，始终遵循全局主题；其余浮层组件在迁移之前仍遵循全局主题。
- 如果 Select 通过 `<ng-content>` 投影到一个自身模板中包含 `[nzTheme]` 的组件里，或者通过 `ngTemplateOutlet` 渲染一个在作用域之外声明的模板，那么它的内联部分会获得局部主题（CSS 变量沿 DOM 继承），但下拉菜单不会带上作用域，因为作用域取决于 Select 声明位置的注入器树。此时请把 `[nzTheme]` 放在声明 Select 的位置。
- 全局设置的组件级别名覆盖，即使在不继承主题的局部作用域内也仍然生效：它以类作用域规则的形式写在 `:root` 上，而 CSS 变量的继承不受 `nzThemeInherit` 影响，会沿 DOM 正常传递。
- 生成的 CSS 引用的是 `--ant-*` 变量，因此不支持 `ant` 以外的 `cssVar.prefix` 取值。
- 令牌名称与 antd 完全一致（例如 `--ant-color-primary`、`--ant-button-default-bg`）；直接在 CSS 中覆盖它们对静态值有效，但不会被重新推导，建议优先使用 `NzConfig.theme`。
