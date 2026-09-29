# v6 compare harness

Renders real antd (React) demos next to the ng-zorro doc-site page for the same
component, under the generated Ant Design v6 stylesheet, so a reviewer can eyeball
whether a migrated ng-zorro component matches antd v6's visuals.

## Prerequisites

- A sibling `ant-design` checkout (antd 6.6.5 source) at `../ant-design`, or set
  `ANTD_REPO` to its path. Only its demo files are used. It needs no
  `node_modules` of its own; demo bundling resolves `react`, `react-dom` and
  `@ant-design/icons` from this fork's `node_modules` via esbuild's
  `nodePaths`. `antd` itself (and `antd/es/*` etc.) is aliased to this fork's
  installed `node_modules/antd` for every importer, overriding the checkout's
  `tsconfig.json` `paths` (which point at its `components/` source). The bundle
  therefore holds exactly one antd, the package the v6 CSS is generated from,
  and `compare.tsx`'s `ConfigProvider theme={{ zeroRuntime: true }}` reaches
  every demo. What antd v6 still registers at runtime under `zeroRuntime` (its
  default-theme CSS-variable blocks, which would override the harness theme's
  tokens) goes to a detached element through `StyleProvider`, so only the
  generated v6 CSS styles the antd pane. `capture.ts` fails if antd's runtime
  CSS-in-JS reaches the antd pane anyway.
- The checkout must be at the same version as this fork's `antd` dependency,
  since its demos are rendered against the installed package's CSS:
  `git -C ../ant-design checkout 6.6.5` (the tag matching
  `node_modules/antd/package.json`). `build-demos.ts` compares the checkout's
  `package.json`, its `components/version/version.ts` and the installed
  `antd` version and fails, naming all three, on a mismatch.
- The checkout's git-ignored generated file `components/version/version.ts`
  must exist (its own build produces this from `package.json` at publish
  time, and a bare checkout won't have it). Either create it manually as
  `export default '<version>';` matching that checkout's `package.json`
  version, or run `npm run version` there. `build-demos.ts` fails fast with
  this same guidance if the file is missing.
- `npm ci` in this fork (installs antd, react, react-dom, @ant-design/icons,
  esbuild, playwright).
- The doc site running (`npx nx run ng-zorro-antd-doc:serve`, on
  `http://localhost:4200` by default) for `capture.ts`, `collect-classes.ts`,
  `check-toggle.ts` and the right-hand ("live") pane. Set `SITE_URL` when it
  runs elsewhere (e.g. `SITE_URL=http://localhost:4300`).
- Playwright's Chromium headless shell: `npx playwright install chromium-headless-shell`.

## Commands

- `npx tsx tools/v6-compare/build-demos.ts [--component <dir>]` — bundles each
  mapped antd component's demo files (self-contained ESM, one per ng-zorro dir)
  into `out/demos/<dir>.js`, writes `out/v6-{default,dark,compact}.css` from
  `buildV6Bundle`, copies `compare.html` to `out/`, and writes/merges
  `out/build-report.json`. Demos that import docs-only packages (e.g.
  `antd-style`, `@ant-design/happy-work-theme`, `runes2`) are reported under
  `skipped` rather than installed; antd's `debug-*`/`*-debug` demos are not
  bundled.
- `npx tsx tools/v6-compare/serve-out.ts` — serves `tools/v6-compare/out` on
  `127.0.0.1` (loopback only, confined to `out/`), on the port of `HARNESS_URL`
  (default `http://localhost:4301`).
- `npx tsx tools/v6-compare/capture.ts [--component <dir>] [--theme v6]` —
  screenshots antd/ng-zorro demo pairs into `out/<dir>/<theme>/<key>.{antd,nz}.png`,
  then rebuilds `out/index.html` from every image on disk (all components and
  themes, `default` and `default-before` included), so a run limited by
  `--component` or `--theme` keeps the rest of the index. Starts `serve-out`
  itself on `HARNESS_URL`'s port (or reuses a running one) and reads the doc
  site from `SITE_URL`. `--theme default` captures the plain v4 ng-zorro page
  only (no antd pane) for a component task's before/after diff; copy
  `out/<dir>/default/` to `out/<dir>/default-before/` by hand before the
  template change.
- `npx tsx tools/v6-compare/dump-dom.ts --component <dir> --demo <stem> [--side antd|nz] [--theme v6] [--selector <css>] [--click]` —
  prints a demo's rendered DOM (text, `style`, `id`, `aria-*` and `data-*`
  stripped, indented by depth). `--side antd` (default) reads the bundled antd
  demo from the out server it starts; `--side nz` reads the doc site
  (`SITE_URL`; the demo key must exist on that page). `--click` first clicks
  the first trigger inside the demo (`.cmp-demo-body` on the antd side,
  `#components-<dir>-demo-<demo>` on the nz side) matching `.ant-btn`,
  `[nz-popconfirm]`, `[nz-popover]`, `[nz-tooltip]` or `[nz-dropdown]`, and
  says so if none matches. `--selector` defaults to the component's
  `prefixCls` on the antd side (with `--click`: `.ant-message`,
  `.ant-notification`, `-wrap` roots, `[role="tooltip"]`), and to the demo
  section's `[class^="ant-"]` descendants on the nz side (plus the CDK
  overlay container's with `--click`). Only top-most matches are printed; a
  root whose class attribute starts with a non-`ant-` class is missed, so
  pass `--selector` then. Exits non-zero on no match.
- `npx tsx tools/v6-compare/collect-classes.ts [--component <dir>]` — records
  `ant-*` classes rendered on the doc-site page (`SITE_URL`) into
  `out/rendered-classes.json` for the style-coverage tests, with the popup
  triggers that opened something per component (hover `TRIGGERS` first, then
  click-only popups via `CLICK_TRIGGERS`). Classes are attributed by
  `prefixCls` plus `renderedPrefixes` (see `scripts/build/v6/components.ts`).
- `npx tsx tools/v6-compare/check-toggle.ts` — on every mapped component's
  page (`SITE_URL`) and each of `?theme=v6|v6-dark|default`, asserts the base
  stylesheet is disabled only under v6, the theme stylesheet and
  `--ant-color-primary` match the theme, and v6 rules reach the first element
  carrying the component's `prefixCls` (overlay pages, which render nothing
  until opened, only need `prefixCls` rules in the theme stylesheet). Button,
  input, select and space also check exact computed values.
- `npx tsx tools/v6-compare/ssr-check/run.ts` — builds and asserts on the
  standalone SSR check app.
- `npm run typecheck:tools` — `tsc` over `tools/` and `scripts/`
  (`tsconfig.tools.json`); tsx runs these files without type-checking, so run
  it after editing the harness or the build scripts.

## Doc-site v6 toggle

`?theme=v6|v6-dark|v6-compact` (or the theme menu) disables the v4 base
stylesheet (`link[href^="styles"]`) and loads the generated v6 CSS. With
Angular's default production optimization, the build would also inline the
v4 _critical_ CSS into each prerendered page as a `<style>` element, which
disabling the link cannot switch off, so above-the-fold v4 rules would stay
mixed into the v6 view. The doc site's production configuration
(`project.json`, `build` target, used by `npm run build` and the preview
deploy) therefore sets `optimization.styles.inlineCritical: false` (scripts,
style minification and fonts stay optimized); the cost is a slightly later
first paint on the preview site. A `?theme=` link applies for that visit
only and does not overwrite the reader's stored site theme.

## Viewing the harness

Open `http://localhost:4301/compare.html?component=<dir>&demo=<key>&theme=v6`
(theme is `v6`, `v6-dark` or `v6-compact`). Add `&live=1` to render the ng-zorro
doc-site page for the same component/demo/theme in a right-hand iframe (requires
the doc site on 4200, or pass `&site=<url>`). Omitting `demo` renders every
bundled demo for that component.

## demo-map.json

`{ "<ng-zorro dir>": { "_antdDir"?: "<antd dir>", "<ng-zorro demo key>": "<antd demo file stem>" | null } }`.
`_antdDir` overrides the antd component directory (default:
`kebabCase(v6Components[dir].antd[0])`). A string value pairs an ng-zorro demo key
with a differently-named antd demo file stem; `null` marks an ng-zorro-only demo
with no antd counterpart. Demo keys not listed pair by identical name.

## Windows note

The Vitest runner used by this fork's own test scripts may need a local patch to
`node_modules/@angular/build`'s vitest executor to run browser specs on Windows;
this is unrelated to the harness itself.
