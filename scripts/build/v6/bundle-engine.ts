/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import * as esbuild from 'esbuild';

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { antdStyleModuleDir } from './components';

// Re-exported for existing importers (`build-demos.ts`, `token-attribution.spec.ts`); the implementation
// lives in `components.ts`, next to `antdStyleModuleDir`, which needs it.
export { kebabCase } from './components';

const shimsDir = path.resolve(__dirname, 'shims');

export function antdStyleModulePath(name: string): string {
  return `antd/es/${antdStyleModuleDir(name)}/style/index.js`;
}

const shimPlugin: esbuild.Plugin = {
  name: 'ng-zorro-v6-shims',
  setup(build) {
    build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, () => ({ path: path.join(shimsDir, 'react.js') }));
    build.onResolve({ filter: /^@ant-design\/cssinjs-utils$/ }, () => ({
      path: path.join(shimsDir, 'cssinjs-utils.js')
    }));
    // antd/es/modal/style/index.js imports only `getMediaSize` from grid/style; the real module also
    // registers two conflicting `Grid` default-token factories (Row + Col) at module scope, which the
    // recorder above rejects (see shims/grid-style.js).
    build.onResolve({ filter: /^\.\.\/\.\.\/grid\/style$/ }, args => {
      if (args.importer.replace(/\\/g, '/').includes('/antd/es/modal/style/')) {
        return { path: path.join(shimsDir, 'grid-style.js') };
      }
      return undefined;
    });
  }
};

const CORE_ENTRY = `
export { default as seedToken } from 'antd/es/theme/themes/seed.js';
export { default as defaultAlgorithm } from 'antd/es/theme/themes/default/index.js';
export { default as darkAlgorithm } from 'antd/es/theme/themes/dark/index.js';
export { default as compactAlgorithm } from 'antd/es/theme/themes/compact/index.js';
export { default as formatToken } from 'antd/es/theme/util/alias.js';
export { unitless, ignore } from 'antd/es/theme/useToken.js';
export { token2CSSVar, transformToken } from '@ant-design/cssinjs/es/util/css-variables.js';
`;

export function componentsEntry(antdNames: string[]): string {
  // Import (rather than bare side-effect import) each style module's default so esbuild's real
  // tree-shaking sees it as used and keeps it, while still safely dropping unrelated modules that happen
  // to be reachable transitively (e.g. `antd/es/button/style` pulls in
  // `antd/es/color-picker/components/ColorPresets.js` for an unrelated helper, which itself renders
  // `<Collapse>` and would otherwise register a phantom `Collapse` entry in `registry` that real antd
  // never emits for these components).
  //
  // Most style modules call `genStyleHooks(Name, ...)` eagerly at module scope (e.g.
  // `antd/es/popover/style/index.js` and `antd/es/popconfirm/style/index.js` both do `export default
  // genStyleHooks('Popover'/'Popconfirm', ...)` directly), which is what actually records the component
  // into the shimmed `registry` (see `shims/cssinjs-utils.js`) -- importing the module is enough. A few
  // (Tooltip; also Menu, per `antd/es/menu/style/index.js`) instead export a `(prefixCls, rootCls,
  // injectStyle) => { const useStyle = genStyleHooks(Name, ...); return useStyle(...); }` wrapper,
  // deferring the `genStyleHooks` call to when antd's React component actually renders and invokes it --
  // which never happens here, so the component would never make it into the registry. Calling each
  // default export once (with no arguments) fixes that: for the eager case the default is already
  // `genStyleHooks`'s own return value (a dummy `(prefixCls, rootCls) => ['', '']` from the shim), so
  // calling it again is a harmless extra no-op; for the lazy case, calling it is what actually runs
  // `genStyleHooks` and records the component.
  // Deduped by module path, not by name: `AutoComplete`/`TimePicker` share `Select`/`DatePicker`'s style
  // module (`ANTD_STYLE_MODULE_OVERRIDES` in `components.ts`), which must be imported only once.
  const modulePaths = [...new Set(antdNames.map(antdStyleModulePath))];
  const lines = modulePaths.map((p, i) =>
    [
      `import { default as _c${i} } from '${p}';`,
      `export { _c${i} };`,
      `try { _c${i}(); } catch (e) { console.warn('v6 engine: calling the default export of ${p} threw', e); }`
    ].join('\n')
  );
  return `${lines.join('\n')}\nexport { registry } from '${path.join(shimsDir, 'cssinjs-utils.js').replace(/\\/g, '/')}';\n`;
}

export interface BundleEngineOptions {
  outDir: string;
  antdNames: string[];
  minify?: boolean;
}

export interface BundleEngineResult {
  coreBytes: number;
  componentsBytes: number;
}

export async function bundleEngine({
  outDir,
  antdNames,
  minify = true
}: BundleEngineOptions): Promise<BundleEngineResult> {
  mkdirSync(outDir, { recursive: true });
  const antdVersion = (require('antd/package.json') as { version: string }).version;
  const banner = `/*! Generated from Ant Design ${antdVersion} (MIT) by NG-ZORRO's generate-v6-engine. Do not edit. */`;
  const workDir = path.resolve(__dirname, '../../..');

  const common: esbuild.BuildOptions = {
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
    ignoreAnnotations: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [shimPlugin],
    absWorkingDir: workDir
  };

  // Written as `.ts` (not `.mjs`) so ng-packagr's per-entry-point compile treats these bundles like any
  // other source file in the `core/theme` entry point instead of a raw asset it can't resolve during
  // bundling (see the commit message for the full story). They are never type-checked (`// @ts-nocheck`)
  // -- only required to be syntactically valid, which esbuild's output always is -- and kept unminified
  // for readability/debuggability; the manifest's size budgets are tracked separately below.
  const core = await esbuild.build({
    ...common,
    minify: false,
    stdin: { contents: CORE_ENTRY, resolveDir: workDir, loader: 'js' }
  });
  const components = await esbuild.build({
    ...common,
    minify: false,
    // Real (non-conservative) tree-shaking: combined with `componentsEntry`'s re-exports, this drops
    // unused component style modules that are only transitively reachable (see `componentsEntry`) while
    // still keeping the requested components, which are genuinely referenced.
    ignoreAnnotations: false,
    stdin: { contents: componentsEntry(antdNames), resolveDir: workDir, loader: 'js' }
  });

  const coreContent = `${banner}\n// @ts-nocheck\n${core.outputFiles![0].text}`;
  const componentsContent = `${banner}\n// @ts-nocheck\n${components.outputFiles![0].text}`;
  writeFileSync(path.join(outDir, 'engine-core.ts'), coreContent);
  writeFileSync(path.join(outDir, 'engine-components.ts'), componentsContent);

  // The manifest tracks *minified* size budgets (see `manifest.ts`'s `ENGINE_CORE_BUDGET` /
  // `ENGINE_COMPONENTS_BUDGET`), so measure that separately from what actually gets written above -- a
  // second, `write: false` esbuild pass over the same entries, honouring the `minify` option (default
  // `true`) the way the combined write+measure pass used to.
  const minifiedCore = await esbuild.build({
    ...common,
    minify,
    banner: { js: banner },
    stdin: { contents: CORE_ENTRY, resolveDir: workDir, loader: 'js' }
  });
  const minifiedComponents = await esbuild.build({
    ...common,
    minify,
    ignoreAnnotations: false,
    banner: { js: banner },
    stdin: { contents: componentsEntry(antdNames), resolveDir: workDir, loader: 'js' }
  });
  return {
    coreBytes: Buffer.byteLength(minifiedCore.outputFiles![0].text),
    componentsBytes: Buffer.byteLength(minifiedComponents.outputFiles![0].text)
  };
}
