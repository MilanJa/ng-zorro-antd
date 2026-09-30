# Coding Style Guide

### Basic Coding Guidelines

- Written in TypeScript and Angular.
- Each template must be defined in the component "\*.ts" file using the `template` property of the `@Component` decorator.
- Each official style must be defined in the component's `index.less` file.
- Each CSS patch must be defined in the component's `patch.less` file.
- Ant Design v6 styles are generated, not written: `scripts/build/v6/components.ts` lists the components that have v6 output, and `nx run ng-zorro-antd-lib:generate-v6-styles` produces their CSS from antd. The only hand-written v6 file is the component's `style/v6/patch.css`.
- Migrating a component to v6: (1) add it to `scripts/build/v6/components.ts` with its antd component names and root class (`prefixCls`, e.g. `ant-btn`) — a preset that has no style module of its own (AutoComplete, TimePicker) registers under its host component's style module via `ANTD_STYLE_MODULE_OVERRIDES` in the same file, since that module may be imported only once by the engine; (2) align host classes and templates until `scripts/build/v6/__tests__/class-coverage.spec.ts` passes with only documented permanent entries in `scripts/build/v6/class-allowlist.json` (classes that antd itself emits but its v6 CSS never styles, explained in the file's comment keys; categories include `pending-map (<dir>)` for a class owned by a component not yet mapped, removed once that component is mapped) — a nested antd component's own token block (e.g. Dropdown's inside Transfer) is foreign and dropped by `dropForeignComponentVarBlocks`, so never add the nested component's name to the entry to silence coverage; keep the default (v4) rendering intact: add v6 classes next to v4 ones, but never a v6 class that the compiled v4 CSS (`publish/ng-zorro-antd.css`, not the Less sources, which hide `&-suffix` nesting) also styles — grep the compiled CSS before adding a class; `scripts/build/v6/__tests__/v4-rule-guard.spec.ts` enforces this from `scripts/build/v6/emitted-classes-baseline.json` and fails the commit otherwise (the guard only sees classes written as complete lowercase literals in a component's sources; a template-literal or helper-built class name, e.g. `` `${prefixCls}-x` ``, `getStatusClassNames(...)`, or a class list a directive builds at runtime, is invisible to it and must be checked against the compiled v4 CSS by hand when written) — key its v6 rule onto a class or structure v4 leaves alone instead; mirror v6 rules onto ng-zorro-specific structure in `style/v6/patch.css`, and compare default-theme screenshots before and after (`capture.ts --theme default`); (3) port `style/patch.less` to `style/v6/patch.css` using `--ant-*` variables; the published `<dir>/style/v6/index.css` also carries the patches of the component's style-module host and of the mapped owners of its `renderedPrefixes` (`v6PatchDependencies` in `components.ts`), in map order, so list every mapped prefix the component renders there; (4) for components with popups, add an overlay test using `expectMotionSettled` from `ng-zorro-antd/core/testing`; (5) run `npm run v6:update-manifest` and commit `scripts/build/v6/manifest.json`, the regenerated `components/core/theme/generated/{tokens,component-roots}.ts` and the docs coverage list; (6) run `npx tsx tools/v6-compare/build-demos.ts --component <dir>`, `collect-classes.ts --component <dir>` and `capture.ts --component <dir>` with the doc site running, attach `tools/v6-compare/out/index.html` screenshots to the review, and add demo pairings to `tools/v6-compare/demo-map.json`; the class-coverage audit (`class-coverage.spec.ts`) is per directory — `styledClassesFor(dir)` covers only that directory's own manifest classes plus its `v6PatchDependencies(dir)` owners' classes, not every migrated component's classes, so an allowlist entry is stale only when that narrower set actually styles it; (7) at a plan's end, run `npm run v6:update-baseline` and commit the refreshed `scripts/build/v6/emitted-classes-baseline.json` so the v4-rule guard's next plan starts from the classes this plan shipped.
- Templates must follow the structure of the associated Ant Design component. Documentation can be found [here](https://ant.design/llms.txt) and [here](https://ant.design/llms-full.txt).
- Support Server Side Rendering (SSR).
- All imports of NG-ZORRO components need to be absolute. Example:

```typescript
import { NzMentionComponent } from 'ng-zorro-antd/mention';
```

### Component Development

- All code added to a component must be covered by unit tests. For guidelines on how to write unit tests, see the [testing](./TESTING.md) file.
- New development on existing components must respect the existing structure of the component; where possible, use modern Angular features.
- New components must be developed using the latest Angular features.
- New features must be documented and include a demo. Guidelines on how to document can be found [here](./DOCUMENTATION.md).

### TypeScript Guidelines

- Use generics where appropriate to enhance type flexibility.
- Use intersection types (&) to combine multiple types.
- Use literal union types to define a limited set of options.
- Avoid using `enum` in favor of union types and `as const`.
- Rely on TypeScript's type inference whenever possible.
- Use type assertions (`as`) only when necessary.

### Responsiveness and Theming Support

- Components should display well on different screen sizes.
- All components must support dark mode.
- Components should support right-to-left (RTL) text directions.
- Use logical CSS properties (e.g., `margin-inline-start`) instead of directional properties (e.g., `margin-left`).
