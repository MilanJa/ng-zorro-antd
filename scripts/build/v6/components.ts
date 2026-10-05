/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
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
  /**
   * antd renders this component's DOM through another component's rc-component implementation (Timeline
   * through Steps): the source directory's extracted CSS is rewritten onto this component's own prefix
   * and prepended to its template (`generate-styles.ts`'s `componentTemplate`), instead of re-extracting
   * antd rules this component's own antd name never renders.
   */
  stylesThrough?: StylesThrough;
}

/** Another mapped component whose extracted rules are copied under this component's prefix (`generate-styles.ts`'s `componentTemplate`). */
export interface StylesThrough {
  /**
   * mapped directory whose extracted rules are copied under this component's prefix. Typed `string`
   * rather than `V6ComponentDir`: `v6Components` is the source of `V6ComponentDir`, so the narrower type
   * would make the map's type refer to itself. `components.spec.ts` checks that it names a mapped
   * directory whose `prefixCls` is `from`.
   */
  dir: string;
  from: string;
  to: string;
}

/**
 * Components that have Ant Design v6 style output. Keys are directories under `components/`,
 * `antd` lists the antd component names passed to `@ant-design/static-style-extract`, and
 * `prefixCls` is the component's root class (antd's `prefixCls`, e.g. `ant-btn`). The root class
 * scopes alias-level tokens overridden for a single component (`components: { Button: { colorPrimary } }`)
 * to that component's elements instead of `:root`; it is generated into
 * `components/core/theme/generated/component-roots.ts` for every antd name of the entry.
 * Adding a component here is the first step of migrating it to v6 (see .claude/DEVELOPMENT.md).
 */
export const v6Components = {
  affix: { antd: ['Affix'], prefixCls: 'ant-affix' },
  alert: { antd: ['Alert'], prefixCls: 'ant-alert' },
  // `anchor.component.ts:58-63` composes `nz-affix` when `nzAffix` is set (default); `ant-affix` is
  // also in anchor's own manifest because Anchor's extraction renders Affix.
  anchor: { antd: ['Anchor'], prefixCls: 'ant-anchor', renderedPrefixes: ['ant-affix'] },
  // AutoComplete has no style module of its own (`ANTD_STYLE_MODULE_OVERRIDES` below); it renders
  // Select's DOM in combobox mode, so its CSS is Select's class set under Select's `prefixCls`.
  'auto-complete': { antd: ['AutoComplete'], prefixCls: 'ant-select' },
  avatar: { antd: ['Avatar'], prefixCls: 'ant-avatar' },
  badge: { antd: ['Badge'], prefixCls: 'ant-badge' },
  // `breadcrumb-item.component.ts` wraps the dropdown-variant item's trigger in `nz-dropdown`
  // (dropdown's own rendered DOM); `ant-dropdown` credits the `ant-dropdown*` classes breadcrumb's
  // own demos render through that directive (see `manifest.json`'s `dropdown` entry for the set).
  breadcrumb: { antd: ['Breadcrumb'], prefixCls: 'ant-breadcrumb', renderedPrefixes: ['ant-dropdown'] },
  button: { antd: ['Button'], prefixCls: 'ant-btn' },
  // Calendar is a picker panel rendered inline (`getPrefixCls('picker')` in antd's
  // `generateCalendar.js`), so it shares `ant-picker` with date-picker/time-picker; its header
  // mounts Select and Radio.Group, and the full-mode date cell reuses Badge's dot and
  // Typography's ellipsis treatment in antd's own demos.
  calendar: {
    antd: ['Calendar'],
    prefixCls: 'ant-picker',
    renderedPrefixes: ['ant-select', 'ant-radio', 'ant-badge', 'ant-typography']
  },
  card: { antd: ['Card'], prefixCls: 'ant-card' },
  carousel: { antd: ['Carousel'], prefixCls: 'ant-carousel' },
  // `ant-empty` is included because cascader's own v6 CSS styles `.ant-cascader-menu-empty .ant-empty-*`
  // (the empty-state cell inside the dropdown), unlike a component with no such nested rule.
  cascader: { antd: ['Cascader'], prefixCls: 'ant-cascader', renderedPrefixes: ['ant-select', 'ant-empty'] },
  checkbox: { antd: ['Checkbox'], prefixCls: 'ant-checkbox' },
  collapse: { antd: ['Collapse'], prefixCls: 'ant-collapse' },
  // `ant-popover` is ColorPicker's own popup chrome; `ant-collapse` is styled by ColorPicker's own
  // extracted CSS for the presets accordion; `ant-input-number` and `ant-select` are the
  // format-input row's mapped components; `ant-divider` is the `nz-divider` between the picker
  // panel and the presets, which ColorPicker's own CSS targets as `-inner-content>.ant-divider`.
  'color-picker': {
    antd: ['ColorPicker'],
    prefixCls: 'ant-color-picker',
    renderedPrefixes: ['ant-popover', 'ant-collapse', 'ant-input-number', 'ant-select', 'ant-divider']
  },
  // DatePicker and TimePicker share one style module and registry entry (`ANTD_STYLE_MODULE_OVERRIDES`,
  // `ANTD_REGISTRY_NAME_OVERRIDES` above): TimePicker is a DatePicker preset (`picker="time"`) with no
  // style module of its own.
  // `renderedPrefixes: ['ant-picker-calendar']` credits date-picker with the `ant-picker-calendar*`
  // classes its shared `lib/abstract-table.html` renders for Calendar's benefit (see
  // `RENDERED_PREFIX_STYLE_OWNERS` below).
  'date-picker': { antd: ['DatePicker'], prefixCls: 'ant-picker', renderedPrefixes: ['ant-picker-calendar'] },
  descriptions: { antd: ['Descriptions'], prefixCls: 'ant-descriptions' },
  divider: { antd: ['Divider'], prefixCls: 'ant-divider' },
  drawer: { antd: ['Drawer'], prefixCls: 'ant-drawer' },
  dropdown: { antd: ['Dropdown'], prefixCls: 'ant-dropdown' },
  empty: { antd: ['Empty'], prefixCls: 'ant-empty' },
  flex: { antd: ['Flex'], prefixCls: 'ant-flex' },
  // Only `FloatButton`: the top-level `BackTop` export is antd's deprecated `back-top` component, with
  // its own `.ant-back-top*` style hook and `--ant-back-top-*` tokens that ng-zorro never renders.
  // ng-zorro's back-top mirrors `FloatButton.BackTop`, which is a plain FloatButton.
  'float-button': { antd: ['FloatButton'], prefixCls: 'ant-float-btn' },
  // `ant-col`/`ant-row` are Grid's (mapped); Form's own extracted CSS additionally styles the
  // labelCol=24 vertical layout via `.ant-col-24.ant-form-item-label`, which stays in form's manifest.
  form: { antd: ['Form'], prefixCls: 'ant-form', renderedPrefixes: ['ant-col', 'ant-row'] },
  // `Row` and `Col` share antd's `grid/style` module (`ANTD_STYLE_MODULE_OVERRIDES` below); every span,
  // offset, order, push, pull and breakpoint class is generated by rendering Col.
  grid: { antd: ['Row', 'Col'], prefixCls: 'ant-row', renderedPrefixes: ['ant-col'] },
  image: { antd: ['Image'], prefixCls: 'ant-image' },
  input: { antd: ['Input'], prefixCls: 'ant-input' },
  'input-number': { antd: ['InputNumber'], prefixCls: 'ant-input-number' },
  // `Layout` and `Layout.Sider` share antd's `layout/style` module (one `prepareComponentToken`); the
  // nz-header/nz-content/nz-footer hosts are custom elements, made block in style/v6/patch.css.
  layout: { antd: ['Layout'], prefixCls: 'ant-layout' },
  // The empty-data-source state mounts a real `nz-embed-empty`/`nz-empty` (`list-cell.ts`'s
  // `NzListEmptyComponent`), the loading state wraps content in a real `nz-spin`, and a `nzPagination`
  // template typically composes a real `nz-pagination` -- all three are mapped. `nzGrid` renders
  // `div[nz-row]`/`[nz-col]` around the items (`list.component.ts:55-58`), styled by Grid.
  list: {
    antd: ['List'],
    prefixCls: 'ant-list',
    renderedPrefixes: ['ant-empty', 'ant-spin', 'ant-pagination', 'ant-row', 'ant-col']
  },
  mention: { antd: ['Mentions'], prefixCls: 'ant-mentions' },
  // Menu's own extracted CSS styles `ant-typography-ellipsis-single-line` (an ellipsis label inside
  // `.ant-menu-title-content`) and the tooltip a collapsed inline menu's item opens (`nz-tooltip`,
  // `ant-menu-inline-collapsed-tooltip`). `ant-dropdown` is listed because `[nz-menu]`,
  // `[nz-menu-item]`, `[nz-submenu]` and `[nz-menu-group]` RENDER dropdown's menu vocabulary
  // (`ant-dropdown-menu-*`, switched on `NzIsMenuInsideDropdownToken`) when hosted in
  // `nz-dropdown-menu`; those classes are styled by dropdown's CSS, not menu's.
  menu: {
    antd: ['Menu'],
    prefixCls: 'ant-menu',
    renderedPrefixes: ['ant-dropdown', 'ant-tooltip', 'ant-typography']
  },
  message: { antd: ['message'], prefixCls: 'ant-message' },
  modal: { antd: ['Modal'], prefixCls: 'ant-modal' },
  notification: { antd: ['notification'], prefixCls: 'ant-notification' },
  // The size changer is a real `nz-select` (`pagination-options.component.ts`); select's own
  // patch ships in pagination's per-component bundle via `v6PatchDependencies`.
  pagination: { antd: ['Pagination'], prefixCls: 'ant-pagination', renderedPrefixes: ['ant-select'] },
  popconfirm: { antd: ['Popconfirm'], prefixCls: 'ant-popconfirm', renderedPrefixes: ['ant-popover'] },
  popover: { antd: ['Popover'], prefixCls: 'ant-popover' },
  progress: { antd: ['Progress'], prefixCls: 'ant-progress' },
  // antd's own `getPrefixCls('qrcode')` (no hyphen), unlike the `qr-code` directory name.
  'qr-code': { antd: ['QRCode'], prefixCls: 'ant-qrcode' },
  radio: { antd: ['Radio'], prefixCls: 'ant-radio' },
  rate: { antd: ['Rate'], prefixCls: 'ant-rate' },
  result: { antd: ['Result'], prefixCls: 'ant-result' },
  segmented: { antd: ['Segmented'], prefixCls: 'ant-segmented' },
  select: { antd: ['Select'], prefixCls: 'ant-select' },
  skeleton: { antd: ['Skeleton'], prefixCls: 'ant-skeleton' },
  slider: { antd: ['Slider'], prefixCls: 'ant-slider', renderedPrefixes: ['ant-tooltip'] },
  space: { antd: ['Space'], prefixCls: 'ant-space' },
  spin: { antd: ['Spin'], prefixCls: 'ant-spin' },
  splitter: { antd: ['Splitter'], prefixCls: 'ant-splitter' },
  // The loading state renders a real `nz-skeleton` (`statistic.component.ts`), so statistic's own
  // v6 bundle carries skeleton's patch (`v6PatchDependencies`).
  statistic: { antd: ['Statistic'], prefixCls: 'ant-statistic', renderedPrefixes: ['ant-skeleton'] },
  // `nzPercentage` composes a real `nz-progress`; a standalone steps bundle needs progress' v6 bundle too
  // (antd's Steps extraction has no progress rules).
  steps: { antd: ['Steps'], prefixCls: 'ant-steps', renderedPrefixes: ['ant-progress'] },
  switch: { antd: ['Switch'], prefixCls: 'ant-switch' },
  // Table's filter dropdown mounts a real `nz-dropdown` (dropdown's own classes), its selection
  // column mounts checkbox/radio, pagination mounts Pagination (which itself renders Select for
  // the page-size changer), the empty placeholder mounts Empty, the loading overlay mounts Spin,
  // and the filter tree (`nzFilterMultiple` with `nzFilters` nesting) mounts Tree.
  table: {
    antd: ['Table'],
    prefixCls: 'ant-table',
    renderedPrefixes: [
      'ant-checkbox',
      'ant-radio',
      'ant-dropdown',
      'ant-empty',
      'ant-spin',
      'ant-tree',
      'ant-pagination'
    ]
  },
  tabs: { antd: ['Tabs'], prefixCls: 'ant-tabs' },
  tag: { antd: ['Tag'], prefixCls: 'ant-tag' },
  'time-picker': { antd: ['TimePicker'], prefixCls: 'ant-picker' },
  // antd 6 renders Timeline as a dot-type Steps: Steps' extracted rules are copied onto the
  // `ant-timeline` prefix, so the timeline DOM never carries a literal `ant-steps-*` class (those
  // would turn on v4 steps rules).
  timeline: {
    antd: ['Timeline'],
    prefixCls: 'ant-timeline',
    stylesThrough: { dir: 'steps', from: 'ant-steps', to: 'ant-timeline' }
  },
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
  typography: { antd: ['Typography'], prefixCls: 'ant-typography' },
  upload: { antd: ['Upload'], prefixCls: 'ant-upload' }
} as const satisfies Record<string, V6ComponentEntry>;

/**
 * antd components whose style module lives under another antd directory: presets with no style
 * module of their own (`antd/es/auto-complete/style` does not exist: AutoComplete is Select with
 * `mode="combobox"`; TimePicker is DatePicker with `picker="time"`), and Row/Col, whose
 * `antd/es/row/style`/`antd/es/col/style` are empty `export default {}` stubs for babel-plugin-import
 * while both hooks live in `antd/es/grid/style`. Their CSS is extracted by rendering them; the engine
 * bundles and registers the module named here.
 */
export const ANTD_STYLE_MODULE_OVERRIDES: Record<string, string> = {
  AutoComplete: 'select',
  Col: 'grid',
  Row: 'grid',
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
 * host component (`Select`/`DatePicker`) under the registry. `Row`/`Col` register under `Grid`
 * (`genStyleHooks('Grid', …)` twice in `grid/style`).
 */
const ANTD_REGISTRY_NAME_OVERRIDES: Record<string, string> = {
  message: 'Message',
  notification: 'Notification',
  AutoComplete: 'Select',
  Col: 'Grid',
  Row: 'Grid',
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
  'ant-select-tree': 'tree',
  // `ant-col*` is generated only by rendering Col, under Grid's style module; the grid entry's
  // `prefixCls` is `ant-row`.
  'ant-col': 'grid'
};

/**
 * True for an entry whose antd names all have their style module in the entry's own antd directory:
 * each name's own (`Button` -> `button`) or the directory's shared one (`Row`/`Col` -> `grid`). A
 * preset alias (`AutoComplete` -> `select`) does not own the styles of its prefix.
 */
export function ownsStyleModule(dir: string, entry: V6ComponentEntry = v6Components[dir as V6ComponentDir]): boolean {
  return entry.antd.every(name => {
    const moduleDir = antdStyleModuleDir(name);
    return moduleDir === kebabCase(name) || moduleDir === dir;
  });
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
  'ant-select-tree': 'tree-select',
  // `ant-picker-calendar*` is only ever generated by rendering Calendar (its `prefixCls` is
  // `ant-picker`, not `ant-picker-calendar`), but date-picker's shared `lib/abstract-table.html`
  // renders the same cell markup under that prefix for Calendar's benefit.
  'ant-picker-calendar': 'calendar',
  // `ant-col*` is generated only by rendering Col, under Grid's style module; the grid entry's
  // `prefixCls` is `ant-row`.
  'ant-col': 'grid'
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
 *   `RENDERED_PREFIX_OWNERS`; prefixes of unmapped components have none.
 * Returned in map order (the order `ng-zorro-antd.v6.css` concatenates patches in), without `dir`.
 */
export function v6PatchDependencies(dir: V6ComponentDir): V6ComponentDir[] {
  const deps = new Set<string>();
  const visited = new Set<string>([dir]);
  const queue: V6ComponentDir[] = [dir];
  // Walks the dependency graph breadth-first, so a chain such as table -> pagination -> select
  // contributes select's patch to table's bundle too; `visited` makes the walk cycle-safe.
  while (queue.length > 0) {
    const current = queue.shift()!;
    const entry: V6ComponentEntry = v6Components[current];
    const direct = new Set<string>();
    for (const name of entry.antd) {
      const host = antdStyleModuleDir(name);
      if (host !== kebabCase(name) && host !== current) {
        direct.add(host);
      }
    }
    for (const prefix of entry.renderedPrefixes ?? []) {
      const owner =
        RENDERED_PREFIX_OWNERS[prefix] ??
        v6ComponentDirs.find(d => v6Components[d].prefixCls === prefix && ownsStyleModule(d));
      if (owner) {
        direct.add(owner);
      }
    }
    for (const d of direct) {
      deps.add(d);
      if (!visited.has(d)) {
        visited.add(d);
        queue.push(d as V6ComponentDir);
      }
    }
  }
  deps.delete(dir);
  return v6ComponentDirs.filter(d => deps.has(d));
}

/**
 * `dir`'s `stylesThrough` entry, if it has one. `v6Components` is typed `as const satisfies
 * Record<string, V6ComponentEntry>`, so TS infers each entry's own narrow literal type (lacking
 * `stylesThrough` entirely for an entry that never sets it) rather than `V6ComponentEntry` itself;
 * this is the one place that widens back to the common shape to read the optional field.
 */
export function stylesThroughOf(dir: V6ComponentDir): StylesThrough | undefined {
  return (v6Components[dir] as V6ComponentEntry).stylesThrough;
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
