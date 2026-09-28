/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import less from 'less';
import LessPluginCleanCSS from 'less-plugin-clean-css';

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { allAntdComponentNames, antdRegistryName, v6ComponentDirs, v6Components } from './components';
import {
  assertNoAntdScoping,
  dropForeignCssVarBlocks,
  extractClassNames,
  joinTemplate,
  normalizeCssVarRootCls,
  partitionBlocks,
  withHeader
} from './css-postprocess';
import { extractAntdCss } from './extract-styles';
import {
  diffManifest,
  ENGINE_COMPONENTS_BUDGET,
  ENGINE_CORE_BUDGET,
  manifestPath as defaultManifestPath,
  readManifest,
  V6Manifest,
  writeManifest
} from './manifest';
import { generatedDir } from './paths';

// Re-exported for existing importers; the implementation lives in css-postprocess.ts.
export { normalizeCssVarRootCls } from './css-postprocess';

const KEY = 'nz-root';
const antdVersion = (require('antd/package.json') as { version: string }).version;

const START = '<!-- v6-components:start -->';
const END = '<!-- v6-components:end -->';
const docsDir = path.resolve(__dirname, '../../../docs');
const docsLangs = ['en-US', 'zh-CN'] as const;

/** Replaces the list between the `v6-components` markers with a `- \`<dir>\`` line per entry. */
export function updateCoverageBlock(markdown: string, dirs: string[]): string {
  const s = markdown.indexOf(START);
  const e = markdown.indexOf(END);
  if (s < 0 || e < 0 || e < s) {
    throw new Error(`docs page is missing the ${START} / ${END} markers`);
  }
  const list = dirs.map(d => `- \`${d}\``).join('\n');
  return `${markdown.slice(0, s + START.length)}\n${list}\n${markdown.slice(e)}`;
}

export interface GenerateStylesOptions {
  publishDir: string;
  componentsDir: string;
  /** Rewrite manifest.json instead of comparing against it. */
  updateManifest?: boolean;
  /** Compare against manifest.json and throw on differences (default true). */
  checkManifest?: boolean;
  /** Minified engine bundle sizes (from `bundleEngine`) to record in the manifest and check against the budgets. */
  engineSizes: { coreBytes: number; componentsBytes: number };
  /** Manifest file to compare against or rewrite (defaults to the committed `manifest.json`). */
  manifestPath?: string;
}

/** Fails the generation when a minified engine bundle exceeds its budget (see `manifest.ts`). */
export function assertEngineBudgets(sizes: Pick<V6Manifest, 'engineCoreBytes' | 'engineComponentsBytes'>): void {
  const breaches: string[] = [];
  if (sizes.engineCoreBytes > ENGINE_CORE_BUDGET) {
    breaches.push(`engine-core is ${sizes.engineCoreBytes} B, over ENGINE_CORE_BUDGET (${ENGINE_CORE_BUDGET} B)`);
  }
  if (sizes.engineComponentsBytes > ENGINE_COMPONENTS_BUDGET) {
    breaches.push(
      `engine-components is ${sizes.engineComponentsBytes} B, over ENGINE_COMPONENTS_BUDGET (${ENGINE_COMPONENTS_BUDGET} B)`
    );
  }
  if (breaches.length) {
    throw new Error(`v6 engine size budget exceeded:\n  ${breaches.join('\n  ')}`);
  }
}

export interface GeneratedStyles {
  perComponent: Record<string, string>;
  template: string;
  tokens: Record<'default' | 'dark' | 'compact', string>;
  bundle: string;
}

export type V6Algorithm = 'default' | 'dark' | 'compact';

export interface V6Bundle {
  template: string;
  componentPatches: string[];
  tokens: string;
  globalPatch: string;
  /** template + component patches + tokens + global patch, in that order */
  css: string;
}

/** `--ant-<component>-<token>` names a component's default-token factory declares, from the engine registry. */
export async function componentTokenNames(component: string, prefix = 'ant'): Promise<string[]> {
  const core = await import(pathToFileURL(path.join(generatedDir, 'engine-core.ts')).href);
  const { registry } = await import(pathToFileURL(path.join(generatedDir, 'engine-components.ts')).href);
  const entry = registry.get(component);
  if (!entry) {
    return [];
  }
  const alias = core.formatToken({ ...core.defaultAlgorithm(core.seedToken), override: {} });
  const defaults =
    typeof entry.getDefaultToken === 'function' ? entry.getDefaultToken({ ...alias }) : (entry.getDefaultToken ?? {});
  return Object.keys(defaults)
    .map(key => core.token2CSSVar(entry.prefixToken(key), prefix))
    .sort();
}

async function renderTokens(algorithm: V6Algorithm): Promise<string> {
  const renderer = await import('../../../components/core/theme/render-theme-css');
  const core = await import(pathToFileURL(path.join(generatedDir, 'engine-core.ts')).href);
  const algorithms = { default: undefined, dark: core.darkAlgorithm, compact: core.compactAlgorithm };
  return renderer.renderThemeCss(algorithms[algorithm] ? { algorithm: algorithms[algorithm] } : {}, ':root');
}

let templateCache: string | null = null;

/** The full v6 template (all mapped components, one extraction, shared reset rules emitted once). */
export function buildV6Template(): string {
  if (templateCache === null) {
    const allRaw = extractAntdCss({ includes: allAntdComponentNames(), key: KEY });
    templateCache = normalizeCssVarRootCls(
      joinTemplate(dropForeignCssVarBlocks(partitionBlocks(allRaw, KEY).template, KEY))
    );
    assertNoAntdScoping(templateCache);
  }
  return templateCache;
}

/** Everything an application needs for one algorithm; used by publish and by the doc site. */
export async function buildV6Bundle(algorithm: V6Algorithm, componentsDir: string): Promise<V6Bundle> {
  const template = buildV6Template();
  const componentPatches = v6ComponentDirs
    .map(dir => readPatch(componentsDir, dir))
    .filter((patch): patch is string => patch !== null);
  const tokens = await renderTokens(algorithm);
  const globalPatch = readFileSync(path.join(componentsDir, 'style/v6/patch.css'), 'utf8');
  return {
    template,
    componentPatches,
    tokens,
    globalPatch,
    css: [template, ...componentPatches, tokens, globalPatch].join('\n')
  };
}

export function buildComponentCss(template: string, patchCss: string | null): string {
  return patchCss ? `${template}\n${patchCss}` : template;
}

async function minify(css: string): Promise<string> {
  const { css: out } = await less.render(css, { plugins: [new LessPluginCleanCSS({ advanced: true })] });
  return out;
}

/** A component's `style/v6/patch.css`, trimmed, or `null` if it has none. Shared with `generate-engine.ts`. */
export function readPatch(componentsDir: string, dir: string): string | null {
  const file = path.join(componentsDir, dir, 'style/v6/patch.css');
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : null;
}

function write(file: string, content: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** Runs AFTER the ng-packagr build (it wipes publish/). */
export async function generateStyles(options: GenerateStylesOptions): Promise<GeneratedStyles> {
  const {
    publishDir,
    componentsDir,
    updateManifest = false,
    checkManifest = true,
    manifestPath = defaultManifestPath
  } = options;
  const perComponent: Record<string, string> = {};
  const manifest: V6Manifest = {
    antdVersion,
    engineCoreBytes: options.engineSizes.coreBytes,
    engineComponentsBytes: options.engineSizes.componentsBytes,
    components: {}
  };
  assertEngineBudgets(manifest);

  for (const dir of v6ComponentDirs) {
    const raw = extractAntdCss({ includes: [...v6Components[dir].antd], key: KEY });
    const { template } = partitionBlocks(raw, KEY);
    const templateCss = normalizeCssVarRootCls(joinTemplate(dropForeignCssVarBlocks(template, KEY)));
    assertNoAntdScoping(templateCss);
    const css = buildComponentCss(templateCss, readPatch(componentsDir, dir));
    perComponent[dir] = css;
    manifest.components[dir] = { classes: extractClassNames(templateCss), tokens: [] };
    write(path.join(publishDir, dir, 'style/v6/index.css'), withHeader(css, antdVersion));
    write(path.join(publishDir, dir, 'style/v6/index.min.css'), withHeader(await minify(css), antdVersion));
  }

  // Full template: one extraction with every mapped component (shared reset rules are emitted once).
  const template = buildV6Template();

  // Token files come from the engine so runtime and static paths share one code path (parity test proves equality).
  const tokens = {
    default: await renderTokens('default'),
    dark: await renderTokens('dark'),
    compact: await renderTokens('compact')
  };
  for (const dir of v6ComponentDirs) {
    const names = await Promise.all(v6Components[dir].antd.map(name => componentTokenNames(antdRegistryName(name))));
    manifest.components[dir].tokens = [...new Set(names.flat())].sort();
  }

  const defaultBundle = await buildV6Bundle('default', componentsDir);
  const bundle = defaultBundle.css;

  write(path.join(publishDir, 'style/v6/template.css'), withHeader(template, antdVersion));
  for (const name of ['default', 'dark', 'compact'] as const) {
    write(path.join(publishDir, `style/v6/tokens.${name}.css`), withHeader(tokens[name], antdVersion));
  }
  copyFileSync(path.join(componentsDir, 'style/v6/patch.css'), path.join(publishDir, 'style/v6/patch.css'));
  write(path.join(publishDir, 'ng-zorro-antd.v6.css'), withHeader(bundle, antdVersion));
  write(path.join(publishDir, 'ng-zorro-antd.v6.min.css'), withHeader(await minify(bundle), antdVersion));

  const diff = checkManifest && !updateManifest ? diffManifest(readManifest(manifestPath), manifest) : [];

  for (const lang of docsLangs) {
    const docPath = path.join(docsDir, `customize-theme-v6.${lang}.md`);
    const current = readFileSync(docPath, 'utf8');
    const updated = updateCoverageBlock(current, v6ComponentDirs);
    if (updateManifest) {
      if (updated !== current) {
        writeFileSync(docPath, updated);
      }
    } else if (checkManifest && updated !== current) {
      diff.push(`docs: customize-theme-v6.${lang}.md coverage list is stale`);
    }
  }

  if (updateManifest) {
    writeManifest(manifest, manifestPath);
  } else if (checkManifest && diff.length) {
    throw new Error(
      `v6 manifest is out of date. Review the changes and run \`npm run v6:update-manifest\` if they are intended:\n  ${diff.join('\n  ')}`
    );
  }
  return { perComponent, template, tokens, bundle };
}
