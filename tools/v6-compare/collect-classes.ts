/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs, v6Components } from '../../scripts/build/v6/components';
import { attributeRenderedClasses } from '../../scripts/build/v6/rendered-coverage';

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

// Components whose popup only opens on click (not hover), scoped to the component's own demo
// containers; clicked up to 4 times each, closed with Escape/close buttons between attempts.
const CLICK_TRIGGERS: Partial<Record<string, string>> = {
  modal: '.ant-btn',
  drawer: '.ant-btn',
  message: '.ant-btn',
  notification: '.ant-btn',
  popconfirm: '.ant-btn',
  'float-button': '.ant-float-btn-group-trigger, .ant-float-btn',
  'color-picker': '.ant-color-picker-trigger',
  'tree-select': '.ant-select-selector',
  cascader: '.ant-select-selector',
  upload: '.ant-upload button, .ant-upload-btn'
};

async function main(): Promise<void> {
  const componentFlagIndex = process.argv.indexOf('--component');
  if (componentFlagIndex !== -1 && componentFlagIndex === process.argv.length - 1) {
    throw new Error('--component requires a directory name');
  }
  const only = componentFlagIndex !== -1 ? process.argv[componentFlagIndex + 1] : null;
  const previous = (existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {}) as {
    components?: Record<string, string[]>;
    triggers?: Record<string, string[]>;
  };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  // Scoped to the component's own demo containers plus any CDK overlay (dropdowns/tooltips/etc.
  // portal out of the demo container into `.cdk-overlay-container`) — the doc site's own chrome
  // (header, sidebar, TOC, theme widget) and sibling components embedded in the same demo page
  // are not this component's responsibility; each has its own class-coverage check.
  const collect = (dir: string): string[] => {
    const scope = `[id^="components-${dir}-demo-"], [id^="components-${dir}-demo-"] [class], .cdk-overlay-container, .cdk-overlay-container [class]`;
    return Array.from(document.querySelectorAll(scope))
      .flatMap(el => Array.from(el.classList))
      .filter(c => /^ant-[a-z0-9-]+$/.test(c));
  };
  const components: Record<string, string[]> = { ...previous.components };
  // Best effort, recorded: which trigger selectors opened something per component, so "no popup classes
  // because none opened" can be told apart from "no popup classes rendered".
  const triggers: Record<string, string[]> = { ...previous.triggers };
  for (const dir of v6ComponentDirs) {
    if (only && dir !== only) continue;
    await page.goto(`${siteUrl}/components/${dir}/en?theme=v6`, { waitUntil: 'networkidle' });
    const seen = new Set<string>(await page.evaluate(collect, dir));
    const opened: string[] = [];
    for (const selector of TRIGGERS) {
      const handles = await page.$$(
        `#components-${dir}-demo-basic ${selector}, [id^="components-${dir}-demo-"] ${selector}`
      );
      let activated = 0;
      for (const h of handles.slice(0, 3)) {
        try {
          await h.hover();
          await h.click({ timeout: 1000 });
          activated++;
        } catch {
          /* not clickable, skip */
        }
        await page.waitForTimeout(350);
        (await page.evaluate(collect, dir)).forEach(c => seen.add(c));
        await page.keyboard.press('Escape');
      }
      if (activated > 0) opened.push(`${selector} (${activated}/${handles.length})`);
    }
    if (CLICK_TRIGGERS[dir]) {
      const clickable = await page.$$(`[id^="components-${dir}-demo-"] ${CLICK_TRIGGERS[dir]}`);
      let activated = 0;
      for (const button of clickable.slice(0, 4)) {
        const before = new Set(await page.evaluate(collect, dir));
        try {
          await button.scrollIntoViewIfNeeded();
          await button.click({ timeout: 1000 });
        } catch {
          continue; // disabled or covered button: skip
        }
        await page.waitForTimeout(600); // open motion (--ant-motion-duration-slow is 0.3s)
        const after = await page.evaluate(collect, dir);
        after.forEach(c => seen.add(c));
        // Counted only when the click rendered a class that was not there before (a popup opened).
        if (after.some(c => !before.has(c))) activated++;
        await page.keyboard.press('Escape');
        for (const closer of await page.$$('.ant-modal-close, .ant-drawer-close, .ant-notification-notice-close')) {
          await closer.click({ timeout: 500 }).catch(() => undefined);
        }
        await page.waitForTimeout(400);
      }
      if (activated > 0) opened.push(`${CLICK_TRIGGERS[dir]} (${activated}/${clickable.length})`);
    }
    triggers[dir] = opened;
    // Keep only classes owned by this component (its prefixCls, its `renderedPrefixes`, minus classes of a
    // longer prefix owned by another mapped component); classes belonging to other components embedded in
    // the same demo (form, switch, card, ...) are filtered out here, in Node, rather than scoped away in
    // the DOM query above.
    components[dir] = attributeRenderedClasses(dir, seen, v6Components);
    console.log(`${dir}: ${components[dir].length} classes`);
  }
  await browser.close();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    outFile,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), components, triggers }, null, 2)}\n`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
