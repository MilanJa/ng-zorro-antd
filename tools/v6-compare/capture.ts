/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium, Page } from 'playwright';

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { pairDemos } from './pairing';
import { startOutServer } from './serve-out';
import { v6ComponentDirs } from '../../scripts/build/v6/components';

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

async function shotElement(page: Page, selector: string, file: string): Promise<boolean> {
  const el = await page.$(selector);
  if (!el) return false;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: file });
  return true;
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
  const stopServer = await startOutServer(outDir, 4301);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const index: string[] = [
    '<!doctype html><meta charset="utf-8"><title>v6 compare</title><style>body{font-family:sans-serif;margin:24px}figure{display:inline-block;margin:8px;vertical-align:top}img{max-width:420px;border:1px solid #ddd}.pair{display:flex;gap:8px;align-items:flex-start;margin-bottom:12px}h3{margin-top:32px}</style>'
  ];

  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    const pairing = pairDemos(dir, ngDemoKeys(dir), report[dir]?.demos ?? [], map);
    index.push(`<h2 id="${dir}">${dir}</h2>`);
    for (const theme of themes) {
      index.push(`<h3>${theme}</h3>`);
      const folder = path.join(outDir, dir, theme);
      mkdirSync(folder, { recursive: true });
      await page.goto(`${siteUrl}/components/${dir}/en?theme=${theme}`, { waitUntil: 'networkidle' });
      for (const { key, antd } of pairing.pairs) {
        const nzFile = path.join(folder, `${key}.nz.png`);
        const okNz = await shotElement(page, `#components-${dir}-demo-${key}`, nzFile);
        const antdPage = await browser.newPage({ viewport: { width: 900, height: 800 } });
        await antdPage.goto(`${harnessUrl}/compare.html?component=${dir}&demo=${antd}&theme=${theme}`, {
          waitUntil: 'networkidle'
        });
        const antdFile = path.join(folder, `${key}.antd.png`);
        const okAntd = await shotElement(antdPage, `.cmp-demo[data-demo="${antd}"]`, antdFile);
        await antdPage.close();
        const rel = (f: string): string => path.relative(outDir, f).replace(/\\/g, '/');
        index.push(
          `<div class="pair"><figure><figcaption>antd · ${antd}</figcaption>${okAntd ? `<img src="${rel(antdFile)}">` : '<em>not rendered</em>'}</figure><figure><figcaption>ng-zorro · ${key}</figcaption>${okNz ? `<img src="${rel(nzFile)}">` : '<em>not found on page</em>'}</figure></div>`
        );
      }
      if (pairing.ngOnly.length) index.push(`<p>ng-zorro only: ${pairing.ngOnly.join(', ')}</p>`);
      if (pairing.antdOnly.length) index.push(`<p>antd only: ${pairing.antdOnly.join(', ')}</p>`);
      if (report[dir]?.skipped?.length)
        index.push(`<p>antd demos that failed to bundle: ${report[dir].skipped.length} (see build-report.json)</p>`);
    }
  }
  await browser.close();
  await stopServer();
  writeFileSync(path.join(outDir, 'index.html'), index.join('\n'));
  console.log(`wrote ${path.join(outDir, 'index.html')}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
