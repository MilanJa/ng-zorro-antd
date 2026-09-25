/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../../scripts/build/v6/components';

const outDir = path.join(__dirname, 'out');
const outFile = path.join(outDir, 'rendered-classes.json');
const siteUrl = process.env['SITE_URL'] ?? 'http://localhost:4200';
// Elements whose activation opens a popup; best effort, each clicked/hovered once per page.
const TRIGGERS = [
  '.ant-select-selector',
  '[nz-tooltip]',
  '[nz-popover]',
  '[nz-popconfirm]',
  '.ant-picker-input input',
  '.ant-dropdown-trigger',
  '.ant-cascader .ant-select-selector'
];

async function main(): Promise<void> {
  const componentFlagIndex = process.argv.indexOf('--component');
  if (componentFlagIndex !== -1 && componentFlagIndex === process.argv.length - 1) {
    throw new Error('--component requires a directory name');
  }
  const only = componentFlagIndex !== -1 ? process.argv[componentFlagIndex + 1] : null;
  const previous = existsSync(outFile)
    ? (JSON.parse(readFileSync(outFile, 'utf8')).components as Record<string, string[]>)
    : {};
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const collect = (): string[] =>
    Array.from(document.querySelectorAll('[class]'))
      .flatMap(el => Array.from(el.classList))
      .filter(c => /^ant-[a-z0-9-]+$/.test(c));
  const components: Record<string, string[]> = { ...previous };
  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    await page.goto(`${siteUrl}/components/${dir}/en?theme=v6`, { waitUntil: 'networkidle' });
    const seen = new Set<string>(await page.evaluate(collect));
    for (const selector of TRIGGERS) {
      const handles = await page.$$(
        `#components-${dir}-demo-basic ${selector}, [id^="components-${dir}-demo-"] ${selector}`
      );
      for (const h of handles.slice(0, 3)) {
        try {
          await h.hover();
          await h.click({ timeout: 1000 });
        } catch {
          /* not clickable, skip */
        }
        await page.waitForTimeout(350);
        (await page.evaluate(collect)).forEach(c => seen.add(c));
        await page.keyboard.press('Escape');
      }
    }
    components[dir] = [...seen].sort();
    console.log(`${dir}: ${components[dir].length} classes`);
  }
  await browser.close();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, `${JSON.stringify({ generatedAt: new Date().toISOString(), components }, null, 2)}\n`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
