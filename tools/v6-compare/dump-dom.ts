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

async function main(): Promise<void> {
  const dir = arg('component');
  const demo = arg('demo');
  const theme = arg('theme') ?? 'v6';
  const click = hasFlag('click');
  let selector = arg('selector');

  if (!dir || !demo) {
    console.error(
      'Usage: dump-dom.ts --component <dir> --demo <antd demo stem> [--theme v6] [--selector <css>] [--click]'
    );
    process.exit(1);
  }

  if (!selector) {
    if (click) {
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

  const harnessPort = Number(new URL(harnessUrl).port || 80);
  const stopServer = await startOutServer(outDir, harnessPort);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
    await page.goto(`${harnessUrl}/compare.html?component=${dir}&demo=${demo}&theme=${theme}`, {
      waitUntil: 'networkidle'
    });

    if (click) {
      const button = await page.$('.cmp-demo-body .ant-btn');
      if (button) {
        await button.click();
        await page.waitForTimeout(600);
      }
    }

    // Depth-first pre-order via an explicit stack rather than a nested named recursive function: tsx/
    // esbuild's `keepNames` wraps a nested named function in a `__name(fn, "fn")` call that would be
    // serialized as part of this function's source by `page.evaluate` and throw (`__name` is not defined
    // in the page); an explicit stack has no nested named function to wrap.
    const dump = (sel: string): string[] => {
      const lines: string[] = [];
      const stack: Array<[Element, number]> = [];
      const roots = Array.from(document.querySelectorAll(sel));
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
      console.error(
        `No elements matched selector "${selector}" for --component ${dir} --demo ${demo} --theme ${theme}.`
      );
      process.exit(1);
    }
    console.log(lines.join('\n'));
  } finally {
    await browser.close();
    await stopServer();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
