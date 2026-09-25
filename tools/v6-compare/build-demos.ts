/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import * as esbuild from 'esbuild';

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { kebabCase } from '../../scripts/build/v6/bundle-engine';
import { v6ComponentDirs, v6Components } from '../../scripts/build/v6/components';
import { buildV6Bundle } from '../../scripts/build/v6/generate-styles';

const repoRoot = path.resolve(__dirname, '../..');
const antdRepo = path.resolve(process.env['ANTD_REPO'] ?? path.join(repoRoot, '../ant-design'));
const outDir = path.join(__dirname, 'out');
const demosOut = path.join(outDir, 'demos');
const demoMap = JSON.parse(readFileSync(path.join(__dirname, 'demo-map.json'), 'utf8')) as Record<
  string,
  Record<string, string | null>
>;
const EXCLUDE = /^(_semantic|component-token|debug|_?internal)/;
// esbuild's default resolution walks up from the importer's directory; the demo entry files live
// under the sibling `ant-design` checkout (which has no node_modules of its own), so `react`,
// `@ant-design/icons` etc. would not resolve without pointing esbuild at this fork's node_modules
// explicitly. (`antd` itself resolves via the checkout's own tsconfig `paths` alias to its source,
// not through nodePaths — see the version.ts check below and the README.)
const nodePaths = [path.join(repoRoot, 'node_modules')];

const antdVersionFile = path.join(antdRepo, 'components', 'version', 'version.ts');
if (!existsSync(antdVersionFile)) {
  throw new Error(
    `Missing ${antdVersionFile}. The ant-design checkout's own build generates this git-ignored ` +
      `file from its package.json version, so a bare checkout won't have it. Either create it ` +
      `manually as \`export default '<version>';\` matching that checkout's package.json version, ` +
      `or run \`npm run version\` there.`
  );
}

export function antdDirFor(dir: string): string {
  return demoMap[dir]?.['_antdDir'] ?? kebabCase(v6Components[dir as keyof typeof v6Components].antd[0]);
}

export function listAntdDemos(antdDir: string): string[] {
  const folder = path.join(antdRepo, 'components', antdDir, 'demo');
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter(f => f.endsWith('.tsx') && !EXCLUDE.test(f))
    .map(f => f.replace(/\.tsx$/, ''))
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
        define: { 'process.env.NODE_ENV': '"development"' }
      });
      kept.push(demo);
    } catch (error) {
      report[dir].skipped.push({
        file: path.relative(antdRepo, file).replace(/\\/g, '/'),
        error: String((error as Error).message).split('\n')[0]
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
  mkdirSync(demosOut, { recursive: true });
  const report: Report = {};
  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    await bundleComponent(dir, report);
  }
  for (const algorithm of ['default', 'dark', 'compact'] as const) {
    writeFileSync(
      path.join(outDir, `v6-${algorithm}.css`),
      (await buildV6Bundle(algorithm, path.join(repoRoot, 'components'))).css
    );
  }
  copyFileSync(path.join(__dirname, 'compare.html'), path.join(outDir, 'compare.html'));
  const previous = existsSync(path.join(outDir, 'build-report.json'))
    ? JSON.parse(readFileSync(path.join(outDir, 'build-report.json'), 'utf8'))
    : {};
  writeFileSync(path.join(outDir, 'build-report.json'), `${JSON.stringify({ ...previous, ...report }, null, 2)}\n`);
  for (const [dir, r] of Object.entries(report))
    console.log(`${dir}: ${r.demos.length} demos bundled, ${r.skipped.length} skipped (${r.antdDir})`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
