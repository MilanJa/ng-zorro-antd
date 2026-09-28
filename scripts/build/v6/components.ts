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
  input: { antd: ['Input'], prefixCls: 'ant-input' },
  modal: { antd: ['Modal'], prefixCls: 'ant-modal' },
  result: { antd: ['Result'], prefixCls: 'ant-result' },
  select: { antd: ['Select'], prefixCls: 'ant-select' },
  skeleton: { antd: ['Skeleton'], prefixCls: 'ant-skeleton' },
  popconfirm: { antd: ['Popconfirm'], prefixCls: 'ant-popconfirm', renderedPrefixes: ['ant-popover'] },
  popover: { antd: ['Popover'], prefixCls: 'ant-popover' },
  space: { antd: ['Space'], prefixCls: 'ant-space' },
  spin: { antd: ['Spin'], prefixCls: 'ant-spin' },
  tooltip: { antd: ['Tooltip'], prefixCls: 'ant-tooltip' }
} as const satisfies Record<string, V6ComponentEntry>;

export type V6ComponentDir = keyof typeof v6Components;

export const v6ComponentDirs = Object.keys(v6Components) as V6ComponentDir[];

/** All antd component names across the map, deduplicated, in map order. */
export function allAntdComponentNames(): string[] {
  return [...new Set(v6ComponentDirs.flatMap(dir => [...v6Components[dir].antd]))];
}

/** antd component name -> root class, in map order (source of `generated/component-roots.ts`). */
export function componentRootClasses(): Record<string, string> {
  const roots: Record<string, string> = {};
  for (const dir of v6ComponentDirs) {
    for (const name of v6Components[dir].antd) {
      roots[name] = v6Components[dir].prefixCls;
    }
  }
  return roots;
}
