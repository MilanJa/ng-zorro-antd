/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium, Page } from 'playwright';

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { pairDemos } from './pairing';
import { startOutServer } from './serve-out';
import { CLICK_TRIGGERS } from './triggers';
import { v6ComponentDirs, v6Components, V6ComponentDir } from '../../scripts/build/v6/components';

const repoRoot = path.resolve(__dirname, '../..');
const outDir = path.join(__dirname, 'out');
const siteUrl = process.env['SITE_URL'] ?? 'http://localhost:4200';
const harnessUrl = process.env['HARNESS_URL'] ?? 'http://localhost:4301';
const THEMES = ['v6', 'v6-dark', 'v6-compact'] as const;

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : null;
}

function ngDemoKeys(dir: string): string[] {
  const folder = path.join(repoRoot, 'components', dir, 'demo');
  return existsSync(folder)
    ? readdirSync(folder)
        .filter(f => f.endsWith('.ts'))
        .map(f => f.replace(/\.ts$/, ''))
        .sort()
    : [];
}

/**
 * Which element to click to open `dir`'s popup for its `demo`, and where to save the screenshot of
 * the opened state, scoped to that demo's own container the same way `collect-classes.ts` scopes its
 * click triggers. `null` when `dir` has no registered click trigger (`CLICK_TRIGGERS`): not every
 * mapped component opens a popup on click.
 */
export function openedShotPlan(
  dir: string,
  demo: string,
  clickTriggers: Partial<Record<string, string>>
): { selector: string; file: string } | null {
  const trigger = clickTriggers[dir];
  return trigger
    ? { selector: `[id^="components-${dir}-demo-${demo}"] ${trigger}`, file: `${demo}-opened.nz.png` }
    : null;
}

async function shotElement(page: Page, selector: string, file: string): Promise<boolean> {
  const el = await page.waitForSelector(selector, { timeout: 5000, state: 'attached' }).catch(() => null);
  if (!el) return false;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: file });
  return true;
}

/**
 * The antd pane must be styled only by the generated v6 CSS. `compare.tsx` renders under
 * `ConfigProvider theme={{ zeroRuntime: true, hashed: false }}` and sends what antd still registers at
 * runtime (its default-theme CSS-variable blocks) to a detached element. If antd's runtime CSS-in-JS reaches
 * the document anyway (for example because the bundle holds a second antd copy that the providers do not
 * reach), the pane shows antd's light default theme whatever the harness theme is. Fail the run instead of
 * producing misleading screenshots when the page has:
 * - a `<style data-css-hash>`/`<style data-rc-order>` element (runtime CSS-in-JS output);
 * - a hashed `css-dev-only-*` class (runtime component styles, i.e. the provider was not reached);
 * - a `css-var-*` class that a rule in the document targets. antd v6 always puts its CSS-variable class
 *   on components; it is inert unless runtime variable blocks were injected for it.
 */
async function assertNoAntdRuntimeStyles(page: Page, what: string): Promise<void> {
  const found = await page.evaluate(() => {
    const selectors = Array.from(document.styleSheets).flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => (rule as CSSStyleRule).selectorText ?? '');
      } catch {
        return [];
      }
    });
    const classes = [
      ...new Set(
        Array.from(document.querySelectorAll('[class]'))
          .flatMap(el => Array.from(el.classList))
          .filter(c => /^css-(dev-only|var)/.test(c))
      )
    ];
    return {
      styles: document.querySelectorAll('style[data-css-hash], style[data-rc-order]').length,
      classes: classes.filter(c => c.startsWith('css-dev-only') || selectors.some(s => s.includes(`.${c}`)))
    };
  });
  if (found.styles > 0 || found.classes.length > 0) {
    throw new Error(
      `antd runtime CSS-in-JS is active on the antd pane of ${what}: ${found.styles} runtime <style> ` +
        `element(s), styled runtime classes ${JSON.stringify(found.classes.slice(0, 5))}. The antd demos ` +
        `must render against the generated v6 CSS only; check that out/demos bundles a single antd copy ` +
        `(node_modules/antd) and that compare.tsx's StyleProvider/ConfigProvider wrap every demo, then ` +
        `rebuild with build-demos.ts.`
    );
  }
}

/**
 * A class of `dir`'s own prefix is "styled" when the antd-pane CSS has a selector that names it as a
 * literal class (a `:where()`-wrapped or antd-hashed form still contains the plain class token inside
 * it, so a substring match after the leading dot is enough; no need to parse selector lists).
 */
export function ownClassesStyled(css: string, classes: string[], prefixCls: string): { own: number; styled: number } {
  const own = classes.filter(c => c === prefixCls || c.startsWith(`${prefixCls}-`));
  let styled = 0;
  for (const cls of own) {
    const escaped = cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    if (new RegExp(`\\.${escaped}(?:[.:,\\s{~>+)]|$)`).test(css)) styled++;
  }
  return { own: own.length, styled };
}

/**
 * Guards against capturing screenshots from a stale `out/v6-<algorithm>.antd.css`: `build-demos.ts`
 * must run after `v6:update-manifest` for every component whose entry changed, or the antd pane can be
 * built from a bundle that predates the component's mapping, rendering it unstyled (an unstyled antd
 * pane is never acceptable evidence of parity). A small gap is expected even for a fresh bundle — antd emits a
 * few classes (e.g. `-dropdown-placement-bottomLeft`) under combined/hashed selector forms this
 * substring check does not resolve — measured at up to 2 classes (~3%) across every mapped component
 * on a known-fresh build, so the tolerance is the larger of 2 or 5% of the component's own classes.
 */
function assertAntdPaneFresh(dir: V6ComponentDir, theme: string): void {
  const algorithm = theme === 'v6-dark' ? 'dark' : theme === 'v6-compact' ? 'compact' : 'default';
  const cssPath = path.join(outDir, `v6-${algorithm}.antd.css`);
  if (!existsSync(cssPath)) return;
  const prefixCls = v6Components[dir]?.prefixCls;
  const manifestPath = path.join(repoRoot, 'scripts/build/v6/manifest.json');
  if (!prefixCls || !existsSync(manifestPath)) return;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    components: Record<string, { classes: string[] }>;
  };
  const classes = manifest.components[dir]?.classes ?? [];
  const { own, styled } = ownClassesStyled(readFileSync(cssPath, 'utf8'), classes, prefixCls);
  if (own === 0) return;
  const tolerance = Math.max(2, Math.ceil(own * 0.05));
  if (own - styled > tolerance) {
    throw new Error(
      `out/v6-${algorithm}.antd.css styles only ${styled} of ${own} "${prefixCls}" classes the manifest ` +
        `lists for "${dir}" (tolerance ${tolerance}); the bundle is stale. Re-run ` +
        `"npx tsx tools/v6-compare/build-demos.ts --component ${dir}" after the manifest change, then retry.`
    );
  }
}

const INDEX_STYLE =
  'body{font-family:sans-serif;margin:24px}figure{display:inline-block;margin:8px;vertical-align:top}' +
  'img{max-width:420px;border:1px solid #ddd}.pair{display:flex;gap:8px;align-items:flex-start;margin-bottom:12px}' +
  'h3{margin-top:32px}nav a{margin-right:12px}';

/** Theme folders in display order; any other folder under `out/<dir>/` follows alphabetically. */
const THEME_ORDER = ['v6', 'v6-dark', 'v6-compact', 'default', 'default-before'];

/**
 * Writes `out/index.html` from the screenshots on disk (`out/<dir>/<theme>/<key>.{nz,antd}.png`), so a
 * run limited by `--component` or `--theme` still leaves an index of every capture made so far. The
 * pairing notes come from `build-report.json` and `demo-map.json`.
 */
function writeIndex(
  report: Record<string, { demos: string[]; skipped: unknown[] }>,
  map: Record<string, Record<string, string | null>>
): string {
  const body: string[] = [];
  const nav: string[] = [];
  for (const dir of [...v6ComponentDirs].sort()) {
    const dirPath = path.join(outDir, dir);
    if (!existsSync(dirPath)) continue;
    const themes = readdirSync(dirPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort((a, b) => {
        const ia = THEME_ORDER.indexOf(a);
        const ib = THEME_ORDER.indexOf(b);
        return (ia < 0 ? THEME_ORDER.length : ia) - (ib < 0 ? THEME_ORDER.length : ib) || a.localeCompare(b);
      });
    if (!themes.length) continue;
    const pairing = pairDemos(dir, ngDemoKeys(dir), report[dir]?.demos ?? [], map);
    const antdName = new Map(pairing.pairs.map(p => [p.key, p.antd]));
    nav.push(`<a href="#${dir}">${dir}</a>`);
    body.push(`<h2 id="${dir}">${dir}</h2>`);
    if (pairing.ngOnly.length) body.push(`<p>ng-zorro only: ${pairing.ngOnly.join(', ')}</p>`);
    if (pairing.antdOnly.length) body.push(`<p>antd only: ${pairing.antdOnly.join(', ')}</p>`);
    if (report[dir]?.skipped?.length) {
      body.push(`<p>antd demos that failed to bundle: ${report[dir].skipped.length} (see build-report.json)</p>`);
    }
    for (const theme of themes) {
      const files = readdirSync(path.join(dirPath, theme)).filter(f => /\.(nz|antd)\.png$/.test(f));
      const keys = [...new Set(files.map(f => f.replace(/\.(nz|antd)\.png$/, '')))].sort();
      if (!keys.length) continue;
      body.push(`<h3 id="${dir}-${theme}">${theme}</h3>`);
      const v4 = theme.startsWith('default');
      for (const key of keys) {
        const figure = (side: 'nz' | 'antd', caption: string): string =>
          files.includes(`${key}.${side}.png`)
            ? `<figure><figcaption>${caption}</figcaption><img src="${dir}/${theme}/${key}.${side}.png"></figure>`
            : `<figure><figcaption>${caption}</figcaption><em>not captured</em></figure>`;
        const nz = figure('nz', `ng-zorro · ${key}${v4 ? ` (v4 ${theme})` : ''}`);
        const antd = v4 ? '' : figure('antd', `antd · ${antdName.get(key) ?? key}`);
        body.push(`<div class="pair">${antd}${nz}</div>`);
      }
    }
  }
  const file = path.join(outDir, 'index.html');
  writeFileSync(
    file,
    [
      `<!doctype html><meta charset="utf-8"><title>v6 compare</title><style>${INDEX_STYLE}</style>`,
      `<nav>${nav.join('')}</nav>`,
      ...body
    ].join('\n')
  );
  return file;
}

async function main(): Promise<void> {
  const only = arg('component');
  const themes = arg('theme') ? [arg('theme')!] : [...THEMES];
  const report = JSON.parse(readFileSync(path.join(outDir, 'build-report.json'), 'utf8')) as Record<
    string,
    { demos: string[]; skipped: unknown[] }
  >;
  const map = JSON.parse(readFileSync(path.join(__dirname, 'demo-map.json'), 'utf8')) as Record<
    string,
    Record<string, string | null>
  >;
  const harnessPort = Number(new URL(harnessUrl).port || 80);
  const stopServer = await startOutServer(outDir, harnessPort);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });

  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    const pairing = pairDemos(dir, ngDemoKeys(dir), report[dir]?.demos ?? [], map);
    for (const theme of themes) {
      if (theme !== 'default') assertAntdPaneFresh(dir, theme);
      const folder = path.join(outDir, dir, theme);
      mkdirSync(folder, { recursive: true });
      await page.goto(`${siteUrl}/components/${dir}/en?theme=${theme}`, { waitUntil: 'networkidle' });
      for (const { key, antd } of pairing.pairs) {
        await shotElement(page, `#components-${dir}-demo-${key}`, path.join(folder, `${key}.nz.png`));
        // Default-theme opened state of a popup demo, for the before/after diff popup components keep
        // next to their closed-state capture (`out/<dir>/default(-before)/<demo>-opened.nz.png`).
        if (theme === 'default' && arg('opened') !== null) {
          const plan = openedShotPlan(dir, key, CLICK_TRIGGERS);
          if (plan) {
            try {
              await page.click(plan.selector, { force: true, timeout: 1000 });
              await page.waitForTimeout(800);
              await page.screenshot({ path: path.join(folder, plan.file), fullPage: false });
            } catch (error) {
              console.warn(`${dir}/${key}: could not open the popup at "${plan.selector}" (${String(error)})`);
            }
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);
          }
        }
        // `default` is the plain v4 theme, captured for the before/after diff a component task keeps
        // under `out/<dir>/default(-before)/`; there is no antd v6 pane to compare it against.
        if (theme === 'default') continue;
        const antdPage = await browser.newPage({ viewport: { width: 900, height: 800 } });
        await antdPage.goto(`${harnessUrl}/compare.html?component=${dir}&demo=${antd}&theme=${theme}`, {
          waitUntil: 'networkidle'
        });
        await assertNoAntdRuntimeStyles(antdPage, `${dir}/${antd} (${theme})`);
        await shotElement(antdPage, `.cmp-demo[data-demo="${antd}"]`, path.join(folder, `${key}.antd.png`));
        await antdPage.close();
      }
    }
  }
  await browser.close();
  await stopServer();
  console.log(`wrote ${writeIndex(report, map)}`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
