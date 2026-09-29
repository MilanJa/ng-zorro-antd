/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

import path from 'node:path';

import { startOutServer } from './serve-out';
import { v6Components } from '../../scripts/build/v6/components';

const outDir = path.join(__dirname, 'out');
const harnessUrl = process.env['HARNESS_URL'] ?? 'http://localhost:4301';

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : null;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

// Default selector set when the demo is clicked open: popups mount either inside `.cmp-demo-body`
// or portal to `document.body` level (message/notification/tooltip-like overlays).
const CLICK_DEFAULT_SELECTOR = '.ant-message, .ant-notification, [class^="ant-"][class*="-wrap"], [role="tooltip"]';

// Any click-opened popup trigger inside a demo container: a plain `.ant-btn` (modal/drawer/message/
// notification/…) or a directive-driven overlay trigger (popconfirm/popover/tooltip/dropdown) that may
// render on a non-button element (e.g. `<a nz-popconfirm>`). Narrower than `collect-classes.ts`, which
// also opens select and picker popups.
const CLICK_TARGET_SELECTOR = '.ant-btn, [nz-popconfirm], [nz-popover], [nz-tooltip], [nz-dropdown]';

// Scopes each comma-branch of `CLICK_TARGET_SELECTOR` to `containerSelector` individually -- a bare
// `"${containerSelector} ${CLICK_TARGET_SELECTOR}"` would only scope the first branch (`.ant-btn`) and
// leave the rest unscoped, matching the first `[nz-popconfirm]` etc. anywhere on the page.
function scopedClickSelector(containerSelector: string): string {
  return CLICK_TARGET_SELECTOR.split(',')
    .map(part => `${containerSelector} ${part.trim()}`)
    .join(', ');
}

async function main(): Promise<void> {
  const dir = arg('component');
  const demo = arg('demo');
  const theme = arg('theme') ?? 'v6';
  const side = arg('side') ?? 'antd';
  const click = hasFlag('click');
  let selector = arg('selector');

  if (!dir || !demo) {
    console.error(
      'Usage: dump-dom.ts --component <dir> --demo <name> [--side antd|nz] [--theme v6] [--selector <css>] [--click]'
    );
    process.exit(1);
  }

  if (side !== 'antd' && side !== 'nz') {
    console.error(`--side must be "antd" or "nz", got "${side}".`);
    process.exit(1);
  }

  if (!selector) {
    if (side === 'nz') {
      // The doc site wraps every demo in `<section id="components-<dir>-demo-<demo>">` (`nz-code-box`'s
      // `nzId`, see `codebox.component.html`). `--click` opens overlay-based demos (modal, drawer, message,
      // notification, popconfirm, …), which portal to `.cdk-overlay-container` outside that section.
      selector = `[id="components-${dir}-demo-${demo}"] [class^="ant-"]`;
      if (click) {
        selector += ', .cdk-overlay-container [class^="ant-"]';
      }
    } else if (click) {
      selector = CLICK_DEFAULT_SELECTOR;
    } else {
      const entry = (v6Components as Record<string, { prefixCls: string } | undefined>)[dir];
      if (!entry) {
        console.error(
          `--selector is required: "${dir}" is not mapped in scripts/build/v6/components.ts, so no default ` +
            `prefixCls-based selector can be derived. Pass --selector explicitly.`
        );
        process.exit(1);
      }
      selector = `[class^="${entry.prefixCls}"]`;
    }
  }

  // The nz side reads the live doc site directly; it never touches the antd-demo out/ bundle, so the
  // out server (which serves compare.html and out/demos/*.js for the antd side) stays unstarted for it.
  let stopServer: () => Promise<void> = async () => {};
  if (side === 'antd') {
    const harnessPort = Number(new URL(harnessUrl).port || 80);
    stopServer = await startOutServer(outDir, harnessPort);
  }
  const browser = await chromium.launch();
  // Set on the no-match path instead of calling `process.exit` inside the `try`, which would skip
  // the `finally` below and leak the browser and the out server on every no-match run.
  let noMatchError: string | null = null;
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 800 } });

    if (side === 'nz') {
      const siteUrl = process.env['SITE_URL'] ?? 'http://localhost:4200';
      await page.goto(`${siteUrl}/components/${dir}/en?theme=${theme}`, { waitUntil: 'networkidle' });
      if (click) {
        const containerSelector = `#components-${dir}-demo-${demo}`;
        const button = await page.$(scopedClickSelector(containerSelector));
        if (button) {
          await button.click();
          await page.waitForTimeout(600);
        } else {
          console.error(
            `--click: no element matched "${CLICK_TARGET_SELECTOR}" inside ${containerSelector}; nothing clicked.`
          );
        }
      }
    } else {
      await page.goto(`${harnessUrl}/compare.html?component=${dir}&demo=${demo}&theme=${theme}`, {
        waitUntil: 'networkidle'
      });
      if (click) {
        const button = await page.$(scopedClickSelector('.cmp-demo-body'));
        if (button) {
          await button.click();
          await page.waitForTimeout(600);
        } else {
          console.error(`--click: no element matched ".cmp-demo-body ${CLICK_TARGET_SELECTOR}"; nothing clicked.`);
        }
      }
    }

    // Depth-first pre-order via an explicit stack rather than a nested named recursive function: tsx/
    // esbuild's `keepNames` wraps a nested named function in a `__name(fn, "fn")` call that would be
    // serialized as part of this function's source by `page.evaluate` and throw (`__name` is not defined
    // in the page); an explicit stack has no nested named function to wrap.
    const dump = (sel: string): string[] => {
      const lines: string[] = [];
      const stack: Array<[Element, number]> = [];
      const allMatches = Array.from(document.querySelectorAll(sel));
      const matchSet = new Set(allMatches);
      // Top-most matches only: a broad wildcard selector (e.g. `[class^="ant-"]`) matches every
      // descendant too, but the depth-first walk below already prints a matched root's full subtree
      // (regardless of whether a given descendant itself matches `sel`), so keeping a matched
      // descendant as a second root would print its subtree twice.
      const roots = allMatches.filter(el => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          if (matchSet.has(p)) {
            return false;
          }
        }
        return true;
      });
      for (let i = roots.length - 1; i >= 0; i--) stack.push([roots[i], 0]);
      while (stack.length) {
        const [el, depth] = stack.pop()!;
        const attrs = [...el.attributes]
          .filter(a => !/^(style|id|aria-.*|data-.*)$/.test(a.name))
          .map(a => `${a.name}="${a.value}"`)
          .join(' ');
        lines.push(
          `${'  '.repeat(depth)}<${el.tagName.toLowerCase()}${attrs ? ` ${attrs}` : ''}>${el.children.length ? '' : '…'}`
        );
        const children = Array.from(el.children);
        for (let i = children.length - 1; i >= 0; i--) stack.push([children[i], depth + 1]);
      }
      return lines;
    };

    const lines = await page.evaluate(dump, selector);
    if (lines.length === 0) {
      noMatchError = `No elements matched selector "${selector}" for --side ${side} --component ${dir} --demo ${demo} --theme ${theme}.`;
    } else {
      console.log(lines.join('\n'));
    }
  } finally {
    await browser.close();
    await stopServer();
  }
  if (noMatchError) {
    console.error(noMatchError);
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
