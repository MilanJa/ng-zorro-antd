/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import less from 'less';
import LessPluginCleanCSS from 'less-plugin-clean-css';

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { allAntdComponentNames, v6ComponentDirs, v6Components } from './components';
import {
  assertNoAntdScoping,
  extractClassNames,
  extractTokenNames,
  joinTemplate,
  partitionBlocks,
  withHeader
} from './css-postprocess';
import { extractAntdCss } from './extract-styles';
import { generatedDir } from './generate-engine';
import { diffManifest, readManifest, V6Manifest, writeManifest } from './manifest';

const KEY = 'nz-root';
const antdVersion = (require('antd/package.json') as { version: string }).version;

export interface GenerateStylesOptions {
  publishDir: string;
  componentsDir: string;
  /** Rewrite manifest.json instead of comparing against it. */
  updateManifest?: boolean;
  /** Compare against manifest.json and throw on differences (default true). */
  checkManifest?: boolean;
  /** Bundle sizes to record; read from the built bundles when omitted. */
  engineSizes?: { coreBytes: number; componentsBytes: number };
}

export interface GeneratedStyles {
  perComponent: Record<string, string>;
  template: string;
  tokens: Record<'default' | 'dark' | 'compact', string>;
  bundle: string;
}

export function buildComponentCss(template: string, patchCss: string | null): string {
  return patchCss ? `${template}\n${patchCss}` : template;
}

/**
 * Some antd components (e.g. Input, Select) call `useCSSVarCls(prefixCls)` and register their reset
 * styles under that derived `<prefixCls>-css-var` root class instead of the plain component class. That
 * class only exists to scope antd's own React render; ng-zorro's markup never applies it. Rewriting the
 * class straight to `.ant-<x>` is *not* equivalent: antd's reset rules also target descendants via
 * `.ant-<x>-css-var [class^="ant-<x>"], .ant-<x>-css-var [class*=" ant-<x>"]` (see `genCommonStyle` in
 * `node_modules/antd/es/style/index.js`), and collapsing the root class alone turns those descendant
 * rules dead (e.g. `.ant-input [class^="ant-input"]{box-sizing:border-box}` never matches anything under
 * a bare `<input>`), silently dropping `box-sizing` from affix wrappers, dropdown roots, etc. antd's own
 * no-rootCls fallback in that same file is `[class^="ant-<x>"], [class*=" ant-<x>"]` (an attribute
 * selector matching the element carrying the class, with no separate root wrapper needed), so reproduce
 * that instead, wrapped in `:is(...)` to keep it a single compound selector at the same specificity as
 * the class it replaces. The negative lookahead keeps `.ant-x-css-var-foo` (a different, unrelated class)
 * from being mistaken for the scoping class.
 */
export function normalizeCssVarRootCls(css: string): string {
  return css.replace(/\.(ant-[a-z-]+)-css-var(?![\w-])/g, ':is([class^="$1"],[class*=" $1"])');
}

async function minify(css: string): Promise<string> {
  const { css: out } = await less.render(css, { plugins: [new LessPluginCleanCSS({ advanced: true })] });
  return out;
}

function readPatch(componentsDir: string, dir: string): string | null {
  const file = path.join(componentsDir, dir, 'style/v6/patch.css');
  return existsSync(file) ? readFileSync(file, 'utf8').trim() : null;
}

function write(file: string, content: string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

/** Runs AFTER the ng-packagr build (it wipes publish/). */
export async function generateStyles(options: GenerateStylesOptions): Promise<GeneratedStyles> {
  const { publishDir, componentsDir, updateManifest = false, checkManifest = true } = options;
  const perComponent: Record<string, string> = {};
  const manifest: V6Manifest = {
    antdVersion,
    engineCoreBytes: options.engineSizes?.coreBytes ?? statSize(path.join(generatedDir, 'engine-core.mjs')),
    engineComponentsBytes:
      options.engineSizes?.componentsBytes ?? statSize(path.join(generatedDir, 'engine-components.mjs')),
    components: {}
  };

  for (const dir of v6ComponentDirs) {
    const raw = extractAntdCss({ includes: [...v6Components[dir].antd], key: KEY });
    const { template } = partitionBlocks(raw, KEY);
    const templateCss = normalizeCssVarRootCls(joinTemplate(template));
    assertNoAntdScoping(templateCss);
    const css = buildComponentCss(templateCss, readPatch(componentsDir, dir));
    perComponent[dir] = css;
    manifest.components[dir] = { classes: extractClassNames(templateCss), tokens: [] };
    write(path.join(publishDir, dir, 'style/v6/index.css'), withHeader(css, antdVersion));
    write(path.join(publishDir, dir, 'style/v6/index.min.css'), withHeader(await minify(css), antdVersion));
  }

  // Full template: one extraction with every mapped component (shared reset rules are emitted once).
  const allRaw = extractAntdCss({ includes: allAntdComponentNames(), key: KEY });
  const template = normalizeCssVarRootCls(joinTemplate(partitionBlocks(allRaw, KEY).template));
  assertNoAntdScoping(template);

  // Token files come from the engine so runtime and static paths share one code path (parity test proves equality).
  const renderer = await import('../../../components/core/theme/render-theme-css');
  const core = await import(pathToFileURL(path.join(generatedDir, 'engine-core.mjs')).href);
  const tokens = {
    default: await renderer.renderThemeCss({}, ':root'),
    dark: await renderer.renderThemeCss({ algorithm: core.darkAlgorithm }, ':root'),
    compact: await renderer.renderThemeCss({ algorithm: core.compactAlgorithm }, ':root')
  };
  for (const dir of v6ComponentDirs) {
    const own = v6Components[dir].antd.map(n => `--ant-${kebab(n)}-`);
    manifest.components[dir].tokens = extractTokenNames(tokens.default).filter(t => own.some(p => t.startsWith(p)));
  }

  const globalPatch = readFileSync(path.join(componentsDir, 'style/v6/patch.css'), 'utf8');
  // Every mapped component's own patch (map order, skipping components with none) so that an app
  // importing only the bundle still gets e.g. select's CDK-overlay positioning and space's item display,
  // not just the plain antd template.
  const componentPatches = v6ComponentDirs
    .map(dir => readPatch(componentsDir, dir))
    .filter((patch): patch is string => patch !== null);
  const bundle = [template, ...componentPatches, tokens.default, globalPatch].join('\n');

  write(path.join(publishDir, 'style/v6/template.css'), withHeader(template, antdVersion));
  for (const name of ['default', 'dark', 'compact'] as const) {
    write(path.join(publishDir, `style/v6/tokens.${name}.css`), withHeader(tokens[name], antdVersion));
  }
  copyFileSync(path.join(componentsDir, 'style/v6/patch.css'), path.join(publishDir, 'style/v6/patch.css'));
  write(path.join(publishDir, 'ng-zorro-antd.v6.css'), withHeader(bundle, antdVersion));
  write(path.join(publishDir, 'ng-zorro-antd.v6.min.css'), withHeader(await minify(bundle), antdVersion));

  if (updateManifest) {
    writeManifest(manifest);
  } else if (checkManifest) {
    const diff = diffManifest(readManifest(), manifest);
    if (diff.length) {
      throw new Error(
        `v6 manifest is out of date. Review the changes and run \`npm run v6:update-manifest\` if they are intended:\n  ${diff.join('\n  ')}`
      );
    }
  }
  return { perComponent, template, tokens, bundle };
}

function kebab(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function statSize(file: string): number {
  return existsSync(file) ? readFileSync(file).byteLength : 0;
}
