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
  // AutoComplete has no style module of its own (`ANTD_STYLE_MODULE_OVERRIDES` below); it renders
  // Select's DOM in combobox mode, so its CSS is Select's class set under Select's `prefixCls`.
  'auto-complete': { antd: ['AutoComplete'], prefixCls: 'ant-select' },
  button: { antd: ['Button'], prefixCls: 'ant-btn' },
  // `ant-empty` is included because cascader's own v6 CSS styles `.ant-cascader-menu-empty .ant-empty-*`
  // (the empty-state cell inside the dropdown), unlike a component with no such nested rule.
  cascader: { antd: ['Cascader'], prefixCls: 'ant-cascader', renderedPrefixes: ['ant-select', 'ant-empty'] },
  checkbox: { antd: ['Checkbox'], prefixCls: 'ant-checkbox' },
  // `ant-popover` is ColorPicker's own popup chrome; `ant-collapse` is styled by ColorPicker's own
  // extracted CSS for the presets accordion even though Collapse itself has no v6 entry yet;
  // `ant-input-number` and `ant-select` are the format-input row's mapped components.
  'color-picker': {
    antd: ['ColorPicker'],
    prefixCls: 'ant-color-picker',
    renderedPrefixes: ['ant-popover', 'ant-collapse', 'ant-input-number', 'ant-select']
  },
  // DatePicker and TimePicker share one style module and registry entry (`ANTD_STYLE_MODULE_OVERRIDES`,
  // `ANTD_REGISTRY_NAME_OVERRIDES` above): TimePicker is a DatePicker preset (`picker="time"`) with no
  // style module of its own.
  'date-picker': { antd: ['DatePicker'], prefixCls: 'ant-picker' },
  drawer: { antd: ['Drawer'], prefixCls: 'ant-drawer' },
  dropdown: { antd: ['Dropdown'], prefixCls: 'ant-dropdown' },
  // Only `FloatButton`: the top-level `BackTop` export is antd's deprecated `back-top` component, with
  // its own `.ant-back-top*` style hook and `--ant-back-top-*` tokens that ng-zorro never renders.
  // ng-zorro's back-top mirrors `FloatButton.BackTop`, which is a plain FloatButton.
  'float-button': { antd: ['FloatButton'], prefixCls: 'ant-float-btn' },
  // `ant-col`/`ant-row` are included because Form's own extracted CSS styles the labelCol=24 vertical
  // layout via `.ant-col-24.ant-form-item-label`/`.ant-row` selectors (Grid itself is not mapped;
  // borrowed here the same way Modal borrows `getMediaSize` from Grid's style module).
  form: { antd: ['Form'], prefixCls: 'ant-form', renderedPrefixes: ['ant-col', 'ant-row'] },
  input: { antd: ['Input'], prefixCls: 'ant-input' },
  'input-number': { antd: ['InputNumber'], prefixCls: 'ant-input-number' },
  mention: { antd: ['Mentions'], prefixCls: 'ant-mentions' },
  message: { antd: ['message'], prefixCls: 'ant-message' },
  modal: { antd: ['Modal'], prefixCls: 'ant-modal' },
  notification: { antd: ['notification'], prefixCls: 'ant-notification' },
  // The size changer is a real `nz-select` (`pagination-options.component.ts`); select's own
  // patch ships in pagination's per-component bundle via `v6PatchDependencies`.
  pagination: { antd: ['Pagination'], prefixCls: 'ant-pagination', renderedPrefixes: ['ant-select'] },
  popconfirm: { antd: ['Popconfirm'], prefixCls: 'ant-popconfirm', renderedPrefixes: ['ant-popover'] },
  popover: { antd: ['Popover'], prefixCls: 'ant-popover' },
  progress: { antd: ['Progress'], prefixCls: 'ant-progress' },
  radio: { antd: ['Radio'], prefixCls: 'ant-radio' },
  rate: { antd: ['Rate'], prefixCls: 'ant-rate' },
  result: { antd: ['Result'], prefixCls: 'ant-result' },
  segmented: { antd: ['Segmented'], prefixCls: 'ant-segmented' },
  select: { antd: ['Select'], prefixCls: 'ant-select' },
  skeleton: { antd: ['Skeleton'], prefixCls: 'ant-skeleton' },
  slider: { antd: ['Slider'], prefixCls: 'ant-slider', renderedPrefixes: ['ant-tooltip'] },
  space: { antd: ['Space'], prefixCls: 'ant-space' },
  spin: { antd: ['Spin'], prefixCls: 'ant-spin' },
  switch: { antd: ['Switch'], prefixCls: 'ant-switch' },
  'time-picker': { antd: ['TimePicker'], prefixCls: 'ant-picker' },
  tooltip: { antd: ['Tooltip'], prefixCls: 'ant-tooltip' },
  // `ant-btn`, `ant-checkbox` and `ant-input` are listed because Transfer's own extracted CSS
  // relies on those already-mapped components' classes being styled by their own entries. Real
  // antd extraction for `Transfer` alone also carries a `--ant-dropdown-*` component-token block
  // (Transfer's header always mounts a `Dropdown` trigger, `Section.js`'s "select all" menu) —
  // `Dropdown` is NOT added here to absorb that: it is a foreign nested component, not one this
  // entry maps, and `dropForeignComponentVarBlocks` (`css-postprocess.ts`) drops that block from
  // the byte-parity comparison instead, so the engine bundle and `component-roots.ts` stay clean.
  transfer: {
    antd: ['Transfer'],
    prefixCls: 'ant-transfer',
    renderedPrefixes: ['ant-btn', 'ant-checkbox', 'ant-input']
  },
  tree: { antd: ['Tree'], prefixCls: 'ant-tree', renderedPrefixes: ['ant-select-tree'] },
  'tree-select': {
    antd: ['TreeSelect'],
    prefixCls: 'ant-tree-select',
    renderedPrefixes: ['ant-select', 'ant-select-tree']
  },
  upload: { antd: ['Upload'], prefixCls: 'ant-upload' }
} as const satisfies Record<string, V6ComponentEntry>;

/**
 * antd components that are presets of another component and have no style module of their own
 * (`antd/es/auto-complete/style` does not exist: AutoComplete is Select with `mode="combobox"`;
 * TimePicker is DatePicker with `picker="time"`). Their CSS is extracted by rendering them, but the
 * engine bundles and registers the host component's style module.
 */
export const ANTD_STYLE_MODULE_OVERRIDES: Record<string, string> = {
  AutoComplete: 'select',
  TimePicker: 'date-picker'
};

/** `DatePicker` -> `date-picker`, `QRCode` -> `qr-code` (antd directory naming). */
export function kebabCase(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** antd export name -> directory under `antd/es/` holding its style module. */
export function antdStyleModuleDir(name: string): string {
  return ANTD_STYLE_MODULE_OVERRIDES[name] ?? kebabCase(name);
}

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
 *
 * `AutoComplete`/`TimePicker` need the same translation for a different reason: they have no style
 * module of their own (`ANTD_STYLE_MODULE_OVERRIDES` above), so the engine only ever registers their
 * host component (`Select`/`DatePicker`) under the registry.
 */
const ANTD_REGISTRY_NAME_OVERRIDES: Record<string, string> = {
  message: 'Message',
  notification: 'Notification',
  AutoComplete: 'Select',
  TimePicker: 'DatePicker'
};

/** antd export name -> the name antd's own cssinjs recorder registers its style hook under. */
export function antdRegistryName(name: string): string {
  return ANTD_REGISTRY_NAME_OVERRIDES[name] ?? name;
}

/** All antd component names across the map, deduplicated, in map order. */
export function allAntdComponentNames(): string[] {
  return [...new Set(v6ComponentDirs.flatMap(dir => [...v6Components[dir].antd]))];
}

/**
 * Rendered prefixes whose mapped owner is not the entry with that `prefixCls`: `ant-select-tree` is
 * Tree's DOM under Select's prefix (antd's TreeSelect renders rc-tree with `${selectPrefixCls}-tree`),
 * and its `-inner` checkbox box mirror lives in tree's `style/v6/patch.css`.
 */
const RENDERED_PREFIX_OWNERS: Record<string, V6ComponentDir> = {
  'ant-select-tree': 'tree'
};

/** True for an entry whose antd names all have a style module of their own (no preset alias). */
function ownsStyleModule(dir: V6ComponentDir): boolean {
  return v6Components[dir].antd.every(name => antdStyleModuleDir(name) === kebabCase(name));
}

/**
 * Overrides `renderedPrefixStyleOwner` for a prefix whose CSS is extracted under a directory other
 * than the one `RENDERED_PREFIX_OWNERS`/bundling names: `ant-select-tree` bundles from `tree` (its own
 * `-inner` checkbox mirror lives in tree's `style/v6/patch.css`), but the plain structural classes under
 * that prefix (`ant-select-tree-treenode`, `-list`, `-switcher`, …) are only ever generated by rendering
 * TreeSelect (Tree alone never mounts under the `${selectPrefixCls}-tree` prefix), so `tree-select`'s
 * manifest entry is the one that actually carries them.
 */
const RENDERED_PREFIX_STYLE_OWNERS: Record<string, V6ComponentDir> = {
  'ant-select-tree': 'tree-select'
};

/**
 * The directory whose manifest classes actually style rendered DOM under `prefix` (a component's own
 * `prefixCls` or one of its `renderedPrefixes`): `RENDERED_PREFIX_STYLE_OWNERS`'s override, or the
 * non-alias entry whose `prefixCls` is `prefix`. Used by the per-directory class-coverage audit
 * (`styledClassesFor` in `rendered-coverage.ts`) to credit a component with classes styled by the real
 * source of a prefix it renders but does not itself extract CSS for.
 */
export function renderedPrefixStyleOwner(prefix: string): V6ComponentDir | undefined {
  return (
    RENDERED_PREFIX_STYLE_OWNERS[prefix] ??
    v6ComponentDirs.find(d => v6Components[d].prefixCls === prefix && ownsStyleModule(d))
  );
}

/**
 * Mapped directories whose `style/v6/patch.css` a component's standalone bundle
 * (`<dir>/style/v6/index.css`) also carries, because its DOM relies on them:
 * - the style-module host of a preset alias (`ANTD_STYLE_MODULE_OVERRIDES`: auto-complete -> select,
 *   time-picker -> date-picker), whose extracted CSS is the alias's whole template;
 * - the owner of every `renderedPrefixes` entry: the non-alias entry whose `prefixCls` it is, or
 *   `RENDERED_PREFIX_OWNERS`; prefixes of unmapped components (`ant-empty`, `ant-col`) have none.
 * Returned in map order (the order `ng-zorro-antd.v6.css` concatenates patches in), without `dir`.
 */
export function v6PatchDependencies(dir: V6ComponentDir): V6ComponentDir[] {
  const entry: V6ComponentEntry = v6Components[dir];
  const deps = new Set<string>();
  for (const name of entry.antd) {
    const host = antdStyleModuleDir(name);
    if (host !== kebabCase(name)) {
      deps.add(host);
    }
  }
  for (const prefix of entry.renderedPrefixes ?? []) {
    const owner =
      RENDERED_PREFIX_OWNERS[prefix] ??
      v6ComponentDirs.find(d => v6Components[d].prefixCls === prefix && ownsStyleModule(d));
    if (owner) {
      deps.add(owner);
    }
  }
  deps.delete(dir);
  return v6ComponentDirs.filter(d => deps.has(d));
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
