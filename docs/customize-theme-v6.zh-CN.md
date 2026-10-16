---
order: 6.2
title: Ant Design v6 主题（预览）
---

NG-ZORRO 提供了一份基于 Ant Design v6 生成的可选样式表。它将 v6 设计令牌（design tokens）以 CSS 变量的形式表达，因此主题就是一组可以在运行时切换的变量，服务端渲染场景下同样适用。默认的 v4 样式表不受影响。

## 已覆盖的组件

下面列出了 Ant Design v6 提供样式的全部 NG-ZORRO 组件。水印（watermark）不在列表中：antd 6 使用 canvas 和内联样式绘制水印，没有可移植的 v6 CSS，因此在两套样式表下渲染一致。NG-ZORRO 独有的组件（check-list、code-editor、comment、cron-expression、graph、hash-code、page-header、resizable、tree-view）在 antd v6 中没有对应组件，也没有 v6 样式；图标的 `.anticon` 规则包含在共享模板中。

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

## 启用方式

在 `angular.json` 中替换默认样式表：

```json
"styles": ["node_modules/ng-zorro-antd/ng-zorro-antd.v6.min.css"]
```

或者按以下顺序自行组合（模板 + 各组件补丁 + 一份令牌文件 + CDK 浮层规则），结果与上面的完整样式表规则相同、顺序相同：

```css
@import 'ng-zorro-antd/style/v6/template.css';
@import 'ng-zorro-antd/style/v6/component-patches.css';
@import 'ng-zorro-antd/style/v6/tokens.default.css'; /* 或 tokens.dark.css / tokens.compact.css */
@import 'ng-zorro-antd/style/v6/patch.css';
```

`component-patches.css` 负责让 Ant Design 的 CSS 适配 NG-ZORRO 的 DOM；缺少它时，例如所有下拉菜单都会停留在 antd 用于测量的屏幕外位置。

或者按组件单独引入：`ng-zorro-antd/button/style/v6/index.css` 加一份令牌文件；每个组件的文件也包含它所渲染的其他组件的 ng-zorro 补丁（例如 `time-picker` 包含 date-picker 的补丁，`cascader` 包含 select 的补丁）。

### 全局重置

v4 样式表会对整个页面做归一化（全局 `box-sizing: border-box`、`body` 的 `margin: 0`、`button` 与 `input` 继承字体和行高、`ul` 与 `ol` 没有上外边距……）。与 Ant Design v5、v6 一样，v6 样式表只重置自己的 `.ant-*` 元素，因此应用从未设置过样式的元素在切换时可能发生位移：裸露的 `<ul>` 会恢复浏览器默认的上外边距，裸露的 `<button>` 会回退到浏览器默认字体。如果应用依赖旧的归一化，请引入 antd 的重置样式：

```css
@import 'ng-zorro-antd/style/v6/reset.css';
```

它就是 antd 发布的 `reset.css`，不包含在 `ng-zorro-antd.v6.min.css` 中。它并不能恢复 v4 的全部行为：v4 还会给 `body` 设置主题的字体、字号、行高、文字颜色和背景，而 antd 的重置样式只给 `body` 设置 `margin: 0`、给 `html` 设置普通的 `sans-serif`。组件之外的文字会保留浏览器默认字体，除非应用自行设置：

```css
body {
  font-family: var(--ant-font-family);
  font-size: var(--ant-font-size);
  line-height: var(--ant-line-height);
  color: var(--ant-color-text);
  background: var(--ant-color-bg-layout);
}
```

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

## 从 v4 Less 主题迁移

v4 主题设置的是 Less 变量；v6 主题设置的是种子令牌和组件令牌，其余由算法推导。应用最常设置的变量对应关系如下：

| Less 变量（v4）                                                   | v6 令牌                                                                                                                                                                                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@primary-color`                                                  | `token.colorPrimary`                                                                                                                                                                                                                   |
| `@primary-1` … `@primary-5`、`@primary-7`                         | `token.colorPrimaryBg`、`colorPrimaryBgHover`、`colorPrimaryBorder`、`colorPrimaryBorderHover`、`colorPrimaryHover`、`colorPrimaryActive`                                                                                              |
| `@link-color`、`@link-hover-color`、`@link-active-color`          | `token.colorLink`、`colorLinkHover`、`colorLinkActive`                                                                                                                                                                                 |
| `@info-color`、`@success-color`、`@warning-color`、`@error-color` | `token.colorInfo`、`colorSuccess`、`colorWarning`、`colorError`；v4 的 `@info-color` 默认等于 `@primary-color`，而 v6 的 `colorInfo` 是独立的种子（`#1677ff`），因此只设置了主色的主题还需要设置 `colorInfo`，信息类状态才能保持品牌色 |
| `@processing-color`                                               | 没有独立的种子；Progress 和处理中状态的 Badge 读取 `colorInfo`                                                                                                                                                                         |
| `@font-family`、`@font-size-base`                                 | `token.fontFamily`、`fontSize`                                                                                                                                                                                                         |
| `@border-radius-base`、`@border-radius-sm`、`@border-radius-lg`   | `token.borderRadius`、`borderRadiusSM`、`borderRadiusLG`                                                                                                                                                                               |
| `@text-color`、`@text-color-secondary`                            | `token.colorText`、`colorTextSecondary`                                                                                                                                                                                                |
| `@border-color-base`、`@border-color-split`                       | `token.colorBorder`、`colorBorderSecondary`                                                                                                                                                                                            |
| `@layout-body-background`                                         | `token.colorBgLayout`                                                                                                                                                                                                                  |
| `@component-background`                                           | `token.colorBgContainer`（浮层另有 `colorBgElevated`）                                                                                                                                                                                 |
| `@layout-sider-background`、`@layout-header-background`           | `components.Layout.siderBg`、`headerBg`                                                                                                                                                                                                |
| `@menu-dark-bg`、`@menu-dark-inline-submenu-bg`                   | `components.Menu.darkItemBg`、`darkSubMenuItemBg`（以及 `darkPopupBg`）                                                                                                                                                                |
| `@segmented-bg`                                                   | `components.Segmented.trackBg`                                                                                                                                                                                                         |

推导过程有三点与 Less 主题不同：

- **主色梯度由种子推导，偏暗或低饱和的种子会得到偏灰的浅色。** `colorPrimary: '#5c2a98'` 推导出 `colorPrimaryBg: '#d4ccd9'`，因为 antd 的调色板生成器在变亮的同时降低饱和度。v4 中手动设置了 `@primary-1` … `@primary-7` 的主题，在 v6 下同样需要手动设置对应的 `colorPrimary*` 令牌。
- **在 `nzDarkAlgorithm` 下，`colorPrimary` 是种子而不是最终渲染的颜色。** 算法使用 antd 的暗色调色板生成器重新推导，该生成器始终以固定的 `#141414` 为底色混合，与 `colorBgContainer` 无关，因此 `colorPrimary: '#9254de'` 渲染为 `--ant-color-primary: #7f4ac0`。可用 `getNzDesignToken` 读取渲染后的值，或者把 `colorPrimary` 设为能推导出目标颜色的值。
- **分段控制器的轨道颜色就是布局背景色。** `Segmented.trackBg` 默认为 `colorBgLayout`，因此直接放在布局背景上的 `nz-segmented` 看不到轨道；v4 的 `@segmented-bg` 是一个填充色。当控件不在容器内时，请设置 `components.Segmented.trackBg`。

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

由 CDK 浮层渲染的弹出内容在 DOM 中位于该区域之外。会带上最近的外层 `[nzTheme]` 作用域的浮层：Select 下拉菜单、Tooltip、Popover、Popconfirm、Drawer（声明式）、Modal（声明式，或在作用域内通过 `nzViewContainerRef` 创建），此外还有 AutoComplete、TreeSelect、Cascader、DatePicker、TimePicker、Mention 的浮层面板，基于 Popover 构建的 ColorPicker 拾色面板，以及 Slider 的滑块提示气泡。Dropdown 的菜单面板（包括由 `NzContextMenuService` 创建的右键菜单）、Image 的预览浮层、Tabs 的溢出菜单和 Table 的筛选下拉菜单（后两者均基于 Dropdown，继承其作用域，无需额外接入），Breadcrumb 的下拉菜单项（基于 Dropdown），Menu 的子菜单弹出层（水平、垂直及收起的内嵌菜单），以及 Pagination 的每页条数选择器和 Calendar 头部的选择器（两者均基于 Select）同样会带上该作用域。Message 和 Notification 是应用级单例，始终遵循全局主题。作用域依据 Angular 的*注入器*树而不是 DOM 确定，并且与所有 CDK 浮层一样，下拉菜单的类名在浮层首次创建时应用：之后对 `nzDropdownClassName` 的修改不会作用于已经打开过的下拉菜单。

## 服务端渲染

主题服务通过 Angular 的 `DOCUMENT` 写入一个 `<style id="nz-theme">` 元素，并在该元素写入之前注册一个 Angular 待处理任务（`PendingTasks`），因此服务端渲染会等待主题就绪，这些变量会成为服务端渲染 HTML 的一部分，且水合（hydration）过程会复用该元素。`[nzTheme]` 也会以同样的方式为其局部样式注册待处理任务。

## 预览版的限制

- 未在上方列出的组件仍会回退到 v4 规则。
- 在基于浮层的组件中，Select 下拉菜单、Tooltip、Popover、Popconfirm、Drawer（声明式）以及 Modal（声明式，或在作用域内通过 `nzViewContainerRef` 创建）会带上局部主题，AutoComplete、TreeSelect、Cascader、DatePicker、TimePicker、Mention 的浮层面板，基于 Popover 构建的 ColorPicker 拾色面板，以及 Slider 的滑块提示气泡同样如此；Dropdown 的菜单面板（及其右键菜单）、Image 的预览浮层、Tabs 的溢出菜单和 Table 的筛选下拉菜单（继承 Dropdown 的作用域）、Breadcrumb 的下拉菜单项（继承 Dropdown 的作用域）、Menu 的子菜单弹出层、Pagination 的每页条数选择器和 Calendar 头部的选择器（继承 Select 的作用域）也是如此；Message 和 Notification 是应用级单例，始终遵循全局主题；其余浮层组件在迁移之前仍遵循全局主题。
- 如果 Select 通过 `<ng-content>` 投影到一个自身模板中包含 `[nzTheme]` 的组件里，或者通过 `ngTemplateOutlet` 渲染一个在作用域之外声明的模板，那么它的内联部分会获得局部主题（CSS 变量沿 DOM 继承），但下拉菜单不会带上作用域，因为作用域取决于 Select 声明位置的注入器树。此时请把 `[nzTheme]` 放在声明 Select 的位置。
- 全局设置的组件级别名覆盖，即使在不继承主题的局部作用域内也仍然生效：它以类作用域规则的形式写在 `:root` 上，而 CSS 变量的继承不受 `nzThemeInherit` 影响，会沿 DOM 正常传递。
- 生成的 CSS 引用的是 `--ant-*` 变量，因此不支持 `ant` 以外的 `cssVar.prefix` 取值。
- 令牌名称与 antd 完全一致（例如 `--ant-color-primary`、`--ant-button-default-bg`）；直接在 CSS 中覆盖它们对静态值有效，但不会被重新推导，建议优先使用 `NzConfig.theme`。
- 在 v6 下，带文字的 Divider 的分隔线绘制在 `.ant-divider-rail` 元素上，而不是 v4 使用的宿主 `::before`/`::after` 伪元素上；如果样式表给 `nz-divider::before`/`::after` 上色，需要补充一条匹配 `.ant-divider-rail` 的规则，才能在 v6 下保持颜色一致。
- 在 v6 下，下拉菜单的菜单项和子菜单标题（`.ant-dropdown-menu-item`、`.ant-dropdown-menu-submenu-title`）是 flex 容器，而 v4 中它们的子元素按行内布局。投影的图标与文字之间的空白不再呈现为间距；请通过 `nzIcon` 投影图标，或者为菜单项或标题设置 `gap`。
