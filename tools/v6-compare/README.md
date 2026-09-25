# v6 compare harness

Renders real antd (React) demos next to the ng-zorro doc-site page for the same
component, under the generated Ant Design v6 stylesheet, so a reviewer can eyeball
whether a migrated ng-zorro component matches antd v6's visuals.

## Prerequisites

- A sibling `ant-design` checkout (antd 6.6.5 source) at `../ant-design`, or set
  `ANTD_REPO` to its path. It needs no `node_modules` of its own; demo bundling
  resolves `react`, `react-dom` and `@ant-design/icons` from this fork's
  `node_modules` via esbuild's `nodePaths`. `antd` itself is **not** resolved
  from there: the checkout's own `tsconfig.json` aliases `antd` →
  `components/index.ts`, and esbuild picks that alias up, so demos bundle
  against the checkout's **source**, not the installed `node_modules/antd`.
  The checkout must therefore be at the same version as this fork's `antd`
  dependency (6.6.5).
- The checkout's git-ignored generated file `components/version/version.ts`
  must exist (its own build produces this from `package.json` at publish
  time, and a bare checkout won't have it). Either create it manually as
  `export default '<version>';` matching that checkout's `package.json`
  version, or run `npm run version` there. `build-demos.ts` fails fast with
  this same guidance if the file is missing.
- `npm ci` in this fork (installs antd, react, react-dom, @ant-design/icons,
  esbuild, playwright).
- The doc site running on `http://localhost:4200` (`nx serve doc-site` or
  equivalent) for the right-hand ("live") pane.
- Playwright's Chromium headless shell: `npx playwright install chromium-headless-shell`.

## Commands

- `npx tsx tools/v6-compare/build-demos.ts [--component <dir>]` — bundles each
  mapped antd component's demo files (self-contained ESM, one per ng-zorro dir)
  into `out/demos/<dir>.js`, writes `out/v6-{default,dark,compact}.css` from
  `buildV6Bundle`, copies `compare.html` to `out/`, and writes/merges
  `out/build-report.json`. Demos that import docs-only packages (e.g.
  `antd-style`, `@ant-design/happy-work-theme`, `runes2`) are reported under
  `skipped` rather than installed.
- `npx tsx tools/v6-compare/serve-out.ts` — serves `tools/v6-compare/out` on
  `http://localhost:4301`.
- `npx tsx tools/v6-compare/capture.ts [--component <dir>] [--theme v6]` —
  screenshots antd/ng-zorro demo pairs and regenerates `out/index.html` (added in
  a later task).
- `npx tsx tools/v6-compare/collect-classes.ts [--component <dir>]` — records
  `ant-*` classes rendered on the doc-site page into `out/rendered-classes.json`
  for the style-coverage tests (added in a later task).
- `npx tsx tools/v6-compare/check-toggle.ts` — asserts the doc site's
  `?theme=v6|v6-dark|default` toggle swaps stylesheets and tokens correctly.
- `npx tsx tools/v6-compare/ssr-check/run.ts` — builds and asserts on the
  standalone SSR check app (added in a later task).

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
this is unrelated to the harness itself. See the sub-project 1 ledger for details
if `test-scripts` fails to launch browser tests.
