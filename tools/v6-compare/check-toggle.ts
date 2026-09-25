/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

import { V6ComponentDir, v6ComponentDirs } from '../../scripts/build/v6/components';

const base = process.env['SITE_URL'] ?? 'http://localhost:4200';
const THEMES = ['v6', 'v6-dark', 'default'] as const;
type Theme = (typeof THEMES)[number];

/**
 * One element per mapped component's doc page and computed styles that tell the v4 CSS (`default`) from
 * the v6 light and dark CSS. Typed over `V6ComponentDir`, so mapping a new component without a probe fails
 * to compile.
 */
const PROBES = {
  button: {
    selector: '#components-button-demo-basic .ant-btn-primary, #components-button-demo-basic .ant-btn-color-primary',
    expected: {
      backgroundColor: { v6: 'rgb(22, 119, 255)', 'v6-dark': 'rgb(22, 104, 220)', default: 'rgb(24, 144, 255)' },
      borderRadius: { v6: '6px', 'v6-dark': '6px', default: '2px' }
    }
  },
  input: {
    selector: '#components-input-demo-basic input.ant-input',
    expected: {
      backgroundColor: { v6: 'rgb(255, 255, 255)', 'v6-dark': 'rgb(20, 20, 20)', default: 'rgb(255, 255, 255)' },
      borderRadius: { v6: '6px', 'v6-dark': '6px', default: '2px' }
    }
  },
  select: {
    selector: '#components-select-demo-basic nz-select',
    expected: {
      backgroundColor: { v6: 'rgb(255, 255, 255)', 'v6-dark': 'rgb(20, 20, 20)', default: 'rgba(0, 0, 0, 0)' },
      borderRadius: { v6: '6px', 'v6-dark': '6px', default: '0px' }
    }
  },
  space: {
    // Space has no themed colours; its v6 rules reset the inherited v4 body line-height.
    selector: '#components-space-demo-basic .ant-space',
    expected: {
      columnGap: { v6: '8px', 'v6-dark': '8px', default: '8px' },
      lineHeight: { v6: 'normal', 'v6-dark': 'normal', default: '22.001px' }
    }
  }
} satisfies Record<
  V6ComponentDir,
  {
    selector: string;
    expected: Partial<Record<'backgroundColor' | 'borderRadius' | 'columnGap' | 'lineHeight', Record<Theme, string>>>;
  }
>;

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results: string[] = [];
  const failures: string[] = [];
  for (const dir of v6ComponentDirs) {
    const probe = PROBES[dir];
    for (const theme of THEMES) {
      await page.goto(`${base}/components/${dir}/en?theme=${theme}`, { waitUntil: 'networkidle' });
      await page.waitForSelector(probe.selector, { state: 'attached' });
      const state = await page.evaluate(
        ({ theme, selector, properties }) => {
          const baseLinks = Array.from(
            document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="styles"]')
          );
          const el = document.querySelector<HTMLElement>(selector)!;
          const cs = getComputedStyle(el);
          return {
            baseDisabled: baseLinks.map(l => l.disabled),
            hasThemeLink: !!document.getElementById(`site-theme-${theme}`),
            bodyTheme: document.body.getAttribute('data-theme'),
            styles: Object.fromEntries(properties.map(p => [p, cs[p as keyof CSSStyleDeclaration] as string]))
          };
        },
        { theme, selector: probe.selector, properties: Object.keys(probe.expected) }
      );
      results.push(`${dir} ${theme}: ${JSON.stringify(state)}`);
      const expectBaseDisabled = theme.startsWith('v6');
      if (state.baseDisabled.some(d => d !== expectBaseDisabled))
        failures.push(`${dir} ${theme}: base stylesheet disabled=${state.baseDisabled}`);
      if (theme !== 'default' && !state.hasThemeLink) failures.push(`${dir} ${theme}: theme link missing`);
      for (const [property, byTheme] of Object.entries(probe.expected) as Array<[string, Record<Theme, string>]>) {
        if (state.styles[property] !== byTheme[theme])
          failures.push(`${dir} ${theme}: ${property} ${state.styles[property]}, expected ${byTheme[theme]}`);
      }
    }
  }
  await browser.close();
  console.log(results.join('\n'));
  if (failures.length) throw new Error(`check-toggle failed:\n${failures.join('\n')}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
