/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Components that have Ant Design v6 style output. Keys are directories under `components/`,
 * `antd` lists the antd component names passed to `@ant-design/static-style-extract`, and
 * `prefixCls` is the component's root class (antd's `prefixCls`, e.g. `ant-btn`). The root class
 * scopes alias-level tokens overridden for a single component (`components: { Button: { colorPrimary } }`)
 * to that component's elements instead of `:root`; it is generated into
 * `components/core/theme/generated/component-roots.ts` for every antd name of the entry.
 * Adding a component here is the first step of migrating it to v6 (see .claude/DEVELOPMENT.md).
 */
export interface V6ComponentEntry {
  antd: readonly string[];
  prefixCls: string;
  /**
   * Extra class prefixes this component renders outside its own `prefixCls` (for example popconfirm's
   * `ant-popover-*`, or auto-complete's `ant-select-dropdown*`), attributed to it by the rendered-class
   * coverage check (`attributeRenderedClasses` in `rendered-coverage.ts`).
   */
  renderedPrefixes?: readonly string[];
}

export const v6Components = {
  alert: { antd: ['Alert'], prefixCls: 'ant-alert' },
  button: { antd: ['Button'], prefixCls: 'ant-btn' },
  drawer: { antd: ['Drawer'], prefixCls: 'ant-drawer' },
  // `BackTop` is a real top-level antd export (per the task brief), but it resolves to the
  // *deprecated* `antd/es/back-top` component ("@deprecated Please use `FloatButton.BackTop`
  // instead."), which registers its own separate style hook (`genStyleHooks('BackTop', ...)` in
  // `back-top/style/index.js`) targeting `.ant-back-top*` classes and a `--ant-back-top-*` token
  // namespace -- ng-zorro's `NzFloatButtonTopComponent` never renders any `.ant-back-top*` class; it
  // mirrors `FloatButton.BackTop` (`float-button/BackTop.js`), which renders a plain `FloatButton`
  // and owns no style hook of its own (only `float-button/style/index.js` does, keyed
  // `genStyleHooks('FloatButton', ...)`). Including the top-level `'BackTop'` name here therefore
  // pulled in an irrelevant `--ant-back-top-z-index-popup` token our component never consumes,
  // breaking `render-parity.spec.ts`'s byte-equality check against antd's real extraction (antd's own
  // per-request `extractStyle` never emits that token unless `.ant-back-top*` markup is actually
  // rendered). `FloatButton` alone already supplies 100% of `FloatButton.BackTop`'s rendered CSS
  // (BackTop is pure composition), so only it is listed.
  'float-button': { antd: ['FloatButton'], prefixCls: 'ant-float-btn' },
  input: { antd: ['Input'], prefixCls: 'ant-input' },
  message: { antd: ['message'], prefixCls: 'ant-message' },
  modal: { antd: ['Modal'], prefixCls: 'ant-modal' },
  notification: { antd: ['notification'], prefixCls: 'ant-notification' },
  result: { antd: ['Result'], prefixCls: 'ant-result' },
  select: { antd: ['Select'], prefixCls: 'ant-select' },
  skeleton: { antd: ['Skeleton'], prefixCls: 'ant-skeleton' },
  popconfirm: { antd: ['Popconfirm'], prefixCls: 'ant-popconfirm', renderedPrefixes: ['ant-popover'] },
  popover: { antd: ['Popover'], prefixCls: 'ant-popover' },
  progress: { antd: ['Progress'], prefixCls: 'ant-progress' },
  space: { antd: ['Space'], prefixCls: 'ant-space' },
  spin: { antd: ['Spin'], prefixCls: 'ant-spin' },
  tooltip: { antd: ['Tooltip'], prefixCls: 'ant-tooltip' }
} as const satisfies Record<string, V6ComponentEntry>;

export type V6ComponentDir = keyof typeof v6Components;

export const v6ComponentDirs = Object.keys(v6Components) as V6ComponentDir[];

/**
 * `v6Components[dir].antd` must hold the real antd package export name (`@ant-design/static-style-extract`'s
 * `extractStyle` looks components up as `antdInstance[name]`, and `components.spec.ts` pins that every
 * entry is a real export) -- but `message`/`notification` are the two components antd exports as
 * lowercase functions instead of PascalCase React components, while antd's *own* internal cssinjs
 * recorder still registers their style hooks under the PascalCase name (`genStyleHooks('Message', ...)`).
 * Everything that reads the bundled engine's registry by antd name (`componentTokenNames`, and
 * `componentRootClasses` below, whose output feeds `COMPONENT_ROOT_CLS`/generate-types.spec's "has a
 * root class for every component in the engine registry" check) needs that PascalCase registry name,
 * not the lowercase export name. Translate only at those read sites so the map itself keeps the literal
 * antd export name everywhere.
 */
const ANTD_REGISTRY_NAME_OVERRIDES: Record<string, string> = {
  message: 'Message',
  notification: 'Notification'
};

/** antd export name -> the name antd's own cssinjs recorder registers its style hook under. */
export function antdRegistryName(name: string): string {
  return ANTD_REGISTRY_NAME_OVERRIDES[name] ?? name;
}

/** All antd component names across the map, deduplicated, in map order. */
export function allAntdComponentNames(): string[] {
  return [...new Set(v6ComponentDirs.flatMap(dir => [...v6Components[dir].antd]))];
}

/** antd registry name -> root class, in map order (source of `generated/component-roots.ts`). */
export function componentRootClasses(): Record<string, string> {
  const roots: Record<string, string> = {};
  for (const dir of v6ComponentDirs) {
    for (const name of v6Components[dir].antd) {
      roots[antdRegistryName(name)] = v6Components[dir].prefixCls;
    }
  }
  return roots;
}
