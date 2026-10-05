/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import * as esbuild from 'esbuild';

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { kebabCase } from '../../scripts/build/v6/bundle-engine';
import { v6ComponentDirs, v6Components } from '../../scripts/build/v6/components';
import { buildV6Bundle, type V6Bundle } from '../../scripts/build/v6/generate-styles';

const repoRoot = path.resolve(__dirname, '../..');
const antdRepo = path.resolve(process.env['ANTD_REPO'] ?? path.join(repoRoot, '../ant-design'));
const outDir = path.join(__dirname, 'out');
const demosOut = path.join(outDir, 'demos');
const demoMap = JSON.parse(readFileSync(path.join(__dirname, 'demo-map.json'), 'utf8')) as Record<
  string,
  Record<string, string | null>
>;
// antd's docs-only demos: semantic-DOM tables, component-token playgrounds, internal fixtures and
// the `debug-*`/`*-debug` demos (e.g. `borderless-debug`, `placement-debug`) that antd hides from its site.
const EXCLUDE = /^(_semantic|component-token|debug|_?internal)|(^|-)debug$/;
// esbuild's default resolution walks up from the importer's directory; the demo entry files live
// under the sibling `ant-design` checkout (which has no node_modules of its own), so `react`,
// `@ant-design/icons` etc. would not resolve without pointing esbuild at this fork's node_modules
// explicitly.
const nodePaths = [path.join(repoRoot, 'node_modules')];
// The checkout's tsconfig `paths` map `antd` (and `antd/es/*`, `antd/lib/*`, `antd/locale/*`) to its
// own `components/` source, while `compare.tsx` (in this fork) resolves `antd` to the installed
// package. Without this alias the bundle holds two antd copies with two separate `ConfigContext`s, so
// compare.tsx's `<ConfigProvider theme={{ zeroRuntime: true }}>` never reaches the demos and they
// fall back to antd's runtime CSS-in-JS (light default theme in every harness theme). esbuild applies
// `alias` before tsconfig `paths` and resolves the substituted path from `absWorkingDir` (this fork's
// root), so every importer, checkout demos included, gets the one installed `node_modules/antd`: the
// same package the v6 CSS is generated from. Subpaths (`antd/es/...`) are aliased too.
const alias = { antd: 'antd' };

/** Fails unless the checkout's package.json, its generated version.ts and the installed antd agree. */
function assertAntdVersions(): void {
  const antdVersionFile = path.join(antdRepo, 'components', 'version', 'version.ts');
  if (!existsSync(antdVersionFile)) {
    throw new Error(
      `Missing ${antdVersionFile}. The ant-design checkout's own build generates this git-ignored ` +
        `file from its package.json version, so a bare checkout won't have it. Either create it ` +
        `manually as \`export default '<version>';\` matching that checkout's package.json version, ` +
        `or run \`npm run version\` there.`
    );
  }
  const checkout = (JSON.parse(readFileSync(path.join(antdRepo, 'package.json'), 'utf8')) as { version: string })
    .version;
  const versionTs =
    /export default ['"]([^'"]+)['"]/.exec(readFileSync(antdVersionFile, 'utf8'))?.[1] ?? '<unparsable>';
  const installed = (
    JSON.parse(readFileSync(path.join(repoRoot, 'node_modules', 'antd', 'package.json'), 'utf8')) as {
      version: string;
    }
  ).version;
  if (checkout !== installed || versionTs !== installed) {
    throw new Error(
      `antd version mismatch: checkout package.json ${checkout}, checkout components/version/version.ts ` +
        `${versionTs}, installed node_modules/antd ${installed}. The demos come from the checkout and the ` +
        `v6 CSS from the installed package, so they must match: run \`git -C ${antdRepo} checkout ${installed}\` ` +
        `(and regenerate version.ts there).`
    );
  }
}

// The component patches and the global patch only adapt antd's CSS onto ng-zorro's DOM (e.g. moving
// the select box's border/radius/height off `.ant-select` and onto `.ant-select-selector`), so on the
// antd pane — real antd markup — they strip or relocate rules antd itself depends on. The antd pane
// gets the extracted template and the theme tokens only, the same two pieces antd's own DOM needs.
// The template is antd's own (`antdTemplate`): a `stylesThrough` copy (Steps' rules under
// `ant-timeline`) is ng-zorro-only and would match antd's dual-prefixed Timeline markup.
export function antdPaneCss(bundle: Pick<V6Bundle, 'antdTemplate' | 'tokens'>): string {
  return [bundle.antdTemplate, bundle.tokens].join('\n');
}

export function antdDirFor(dir: string): string {
  return demoMap[dir]?.['_antdDir'] ?? kebabCase(v6Components[dir as keyof typeof v6Components].antd[0]);
}

export function listAntdDemos(antdDir: string): string[] {
  const folder = path.join(antdRepo, 'components', antdDir, 'demo');
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter(f => f.endsWith('.tsx'))
    .map(f => f.replace(/\.tsx$/, ''))
    .filter(demo => !EXCLUDE.test(demo))
    .sort();
}

interface Report {
  [dir: string]: { antdDir: string; demos: string[]; skipped: Array<{ file: string; error: string }> };
}

async function bundleComponent(dir: string, report: Report): Promise<void> {
  const antdDir = antdDirFor(dir);
  const demos = listAntdDemos(antdDir);
  report[dir] = { antdDir, demos: [], skipped: [] };
  const kept: string[] = [];
  // Try each demo alone first so one broken demo does not sink the component bundle.
  for (const demo of demos) {
    const file = path.join(antdRepo, 'components', antdDir, 'demo', `${demo}.tsx`);
    try {
      await esbuild.build({
        entryPoints: [file],
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'browser',
        jsx: 'automatic',
        logLevel: 'silent',
        absWorkingDir: repoRoot,
        nodePaths,
        alias,
        define: { 'process.env.NODE_ENV': '"development"' }
      });
      kept.push(demo);
    } catch (error) {
      report[dir].skipped.push({
        file: path.relative(antdRepo, file).replace(/\\/g, '/'),
        error: (error as esbuild.BuildFailure).errors?.[0]?.text ?? String((error as Error).message).split('\n')[0]
      });
    }
  }
  report[dir].demos = kept;
  const imports = kept
    .map(
      (demo, i) =>
        `import D${i} from ${JSON.stringify(path.join(antdRepo, 'components', antdDir, 'demo', `${demo}.tsx`).replace(/\\/g, '/'))};`
    )
    .join('\n');
  const list = `[${kept.map((demo, i) => `{ name: ${JSON.stringify(demo)}, Component: D${i} }`).join(', ')}]`;
  // Static imports are hoisted and evaluate before this module's own top-level code, so a static
  // `import` of compare.tsx here would run its top-level code (which reads `__DEMOS__`) before the
  // `globalThis.__DEMOS__ = ...` assignment below executes. Use a dynamic import so compare.tsx's
  // module body only runs after that assignment has completed.
  const entry = `${imports}\nglobalThis.__DEMOS__ = ${list};\nimport(${JSON.stringify(path.join(__dirname, 'compare.tsx').replace(/\\/g, '/'))});`;
  await esbuild.build({
    stdin: { contents: entry, resolveDir: repoRoot, loader: 'tsx' },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2022',
    sourcemap: false,
    logLevel: 'warning',
    absWorkingDir: repoRoot,
    outfile: path.join(demosOut, `${dir}.js`),
    nodePaths,
    alias,
    define: { 'process.env.NODE_ENV': '"development"', __DEMOS__: 'globalThis.__DEMOS__' },
    loader: { '.png': 'dataurl', '.svg': 'dataurl', '.css': 'text' }
  });
}

async function main(): Promise<void> {
  const componentFlagIndex = process.argv.indexOf('--component');
  if (componentFlagIndex !== -1 && componentFlagIndex === process.argv.length - 1) {
    throw new Error('--component requires a directory name');
  }
  const only = componentFlagIndex !== -1 ? process.argv[componentFlagIndex + 1] : null;
  assertAntdVersions();
  mkdirSync(demosOut, { recursive: true });
  const report: Report = {};
  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    await bundleComponent(dir, report);
  }
  for (const algorithm of ['default', 'dark', 'compact'] as const) {
    const bundle = await buildV6Bundle(algorithm, path.join(repoRoot, 'components'));
    // `bundle.css` (template + component patches + tokens + global patch) is kept for anything else
    // that reads `v6-<algorithm>.css` as the full v6 stylesheet; compare.tsx's antd pane uses the
    // `.antd.css` sibling instead (see antdPaneCss above).
    writeFileSync(path.join(outDir, `v6-${algorithm}.css`), bundle.css);
    writeFileSync(path.join(outDir, `v6-${algorithm}.antd.css`), antdPaneCss(bundle));
  }
  copyFileSync(path.join(__dirname, 'compare.html'), path.join(outDir, 'compare.html'));
  const previous = existsSync(path.join(outDir, 'build-report.json'))
    ? JSON.parse(readFileSync(path.join(outDir, 'build-report.json'), 'utf8'))
    : {};
  writeFileSync(path.join(outDir, 'build-report.json'), `${JSON.stringify({ ...previous, ...report }, null, 2)}\n`);
  for (const [dir, r] of Object.entries(report))
    console.log(`${dir}: ${r.demos.length} demos bundled, ${r.skipped.length} skipped (${r.antdDir})`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
