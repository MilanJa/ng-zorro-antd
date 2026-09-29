/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

import { V6ComponentDir, v6ComponentDirs, v6Components } from '../../scripts/build/v6/components';

const base = process.env['SITE_URL'] ?? 'http://localhost:4200';
const THEMES = ['v6', 'v6-dark', 'default'] as const;
type Theme = (typeof THEMES)[number];

/** `--ant-color-primary` on `:root` per theme; the v4 stylesheet defines no `--ant-*` variables. */
const ROOT_PRIMARY: Record<Theme, string> = { v6: '#1677ff', 'v6-dark': '#1668dc', default: '' };

type ProbeProperty = 'backgroundColor' | 'borderRadius' | 'columnGap' | 'lineHeight';

interface ExactProbe {
  selector: string;
  expected: Partial<Record<ProbeProperty, Record<Theme, string>>>;
}

/**
 * Exact computed values for components whose doc page has a stable element that differs between the
 * v4 CSS (`default`) and the v6 light and dark CSS. Checked on top of the generic probe.
 */
const EXACT_PROBES: Partial<Record<V6ComponentDir, ExactProbe>> = {
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
};

/**
 * Generic probe for every mapped component, keyed on its `prefixCls`:
 * - the base (v4) stylesheet is disabled under the v6 themes and enabled under `default`;
 * - the theme stylesheet is present and `--ant-color-primary` resolves on `:root` to the theme's value;
 * - the theme stylesheet has rules naming the root class, and the first element on the doc page carrying
 *   the root class (or a class starting with it) matches at least one of them, i.e. the component's v6
 *   rules reach it. Overlay components (message, modal, tooltip, ...) render nothing until opened, so
 *   for them only the stylesheet rule count is checked.
 */
async function main(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results: string[] = [];
  const failures: string[] = [];
  for (const dir of v6ComponentDirs) {
    const prefixCls = v6Components[dir].prefixCls;
    const exact = EXACT_PROBES[dir];
    for (const theme of THEMES) {
      await page.goto(`${base}/components/${dir}/en?theme=${theme}`, { waitUntil: 'networkidle' });
      if (exact) {
        await page.waitForSelector(exact.selector, { state: 'attached' });
      } else {
        await page
          .waitForFunction(p => !!document.querySelector(`[class~="${p}"], [class*="${p}-"]`), prefixCls, {
            timeout: 3000
          })
          .catch(() => undefined);
      }
      const state = await page.evaluate(
        ({ theme, prefixCls, exactSelector, properties }) => {
          const baseLinks = Array.from(
            document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="styles"]')
          );
          const themeLink = document.getElementById(`site-theme-${theme}`) as HTMLLinkElement | null;
          const rules: CSSStyleRule[] = [];
          const pending: CSSRuleList[] = themeLink?.sheet ? [themeLink.sheet.cssRules] : [];
          while (pending.length) {
            for (const rule of Array.from(pending.pop()!)) {
              if (rule instanceof CSSStyleRule) rules.push(rule);
              if ('cssRules' in rule) pending.push((rule as CSSGroupingRule).cssRules);
            }
          }
          const el =
            document.querySelector<HTMLElement>(`[class~="${prefixCls}"]`) ??
            Array.from(document.querySelectorAll<HTMLElement>(`[class*="${prefixCls}-"]`)).find(e =>
              Array.from(e.classList).some(c => c.startsWith(`${prefixCls}-`))
            ) ??
            null;
          const matchingV6Rules = el
            ? rules.filter(r => {
                try {
                  return r.selectorText.includes(`.${prefixCls}`) && el.matches(r.selectorText);
                } catch {
                  return false;
                }
              }).length
            : null;
          const prefixRules = rules.filter(r => r.selectorText.includes(`.${prefixCls}`)).length;
          const exactEl = exactSelector ? document.querySelector<HTMLElement>(exactSelector) : null;
          const cs = exactEl ? getComputedStyle(exactEl) : null;
          return {
            baseDisabled: baseLinks.map(l => l.disabled),
            hasThemeLink: !!themeLink,
            rootPrimary: getComputedStyle(document.documentElement).getPropertyValue('--ant-color-primary').trim(),
            element: el ? `${el.tagName.toLowerCase()}.${Array.from(el.classList).join('.')}` : null,
            matchingV6Rules,
            prefixRules,
            styles: Object.fromEntries(
              properties.map(p => [p, cs ? (cs[p as keyof CSSStyleDeclaration] as string) : ''])
            ) as Record<string, string>
          };
        },
        {
          theme,
          prefixCls,
          exactSelector: exact?.selector ?? null,
          properties: exact ? Object.keys(exact.expected) : []
        }
      );
      results.push(`${dir} ${theme}: ${JSON.stringify(state)}`);
      const isV6 = theme !== 'default';
      if (state.baseDisabled.some(d => d !== isV6)) {
        failures.push(`${dir} ${theme}: base stylesheet disabled=${state.baseDisabled}`);
      }
      if (isV6 !== state.hasThemeLink) failures.push(`${dir} ${theme}: theme link present=${state.hasThemeLink}`);
      if (state.rootPrimary.toLowerCase() !== ROOT_PRIMARY[theme]) {
        failures.push(`${dir} ${theme}: --ant-color-primary "${state.rootPrimary}", expected "${ROOT_PRIMARY[theme]}"`);
      }
      if (isV6 && state.matchingV6Rules === 0) failures.push(`${dir} ${theme}: no v6 rule matches ${state.element}`);
      if (isV6 && state.prefixRules === 0) failures.push(`${dir} ${theme}: theme stylesheet has no .${prefixCls} rule`);
      const expected = Object.entries(exact?.expected ?? {}) as Array<[string, Record<Theme, string>]>;
      for (const [property, byTheme] of expected) {
        if (state.styles[property] !== byTheme[theme]) {
          failures.push(`${dir} ${theme}: ${property} ${state.styles[property]}, expected ${byTheme[theme]}`);
        }
      }
    }
  }
  await browser.close();
  console.log(results.join('\n'));
  if (failures.length) throw new Error(`check-toggle failed:\n${failures.join('\n')}`);
  console.log(`check-toggle: ${v6ComponentDirs.length} components x ${THEMES.length} themes passed`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
