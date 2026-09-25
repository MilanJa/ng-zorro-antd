/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { chromium } from 'playwright';

const base = process.env['SITE_URL'] ?? 'http://localhost:4200';

async function main(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results: string[] = [];
  for (const theme of ['v6', 'v6-dark', 'default'] as const) {
    await page.goto(`${base}/components/button/en?theme=${theme}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#components-button-demo-basic .ant-btn');
    const state = await page.evaluate(theme => {
      const base = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href^="styles"]'));
      const v6Link = document.getElementById(`site-theme-${theme}`);
      const btn = document.querySelector<HTMLElement>(
        '#components-button-demo-basic .ant-btn-primary, #components-button-demo-basic .ant-btn-color-primary'
      )!;
      return {
        baseDisabled: base.map(l => l.disabled),
        hasThemeLink: !!v6Link,
        primaryBg: getComputedStyle(btn).backgroundColor,
        bodyTheme: document.body.getAttribute('data-theme')
      };
    }, theme);
    results.push(`${theme}: ${JSON.stringify(state)}`);
    const expectBaseDisabled = theme.startsWith('v6');
    if (state.baseDisabled.some(d => d !== expectBaseDisabled))
      throw new Error(`${theme}: base stylesheet disabled=${state.baseDisabled}`);
    if (expectBaseDisabled !== state.hasThemeLink && theme !== 'default')
      throw new Error(`${theme}: theme link missing`);
    const expectedBg =
      theme === 'v6' ? 'rgb(22, 119, 255)' : theme === 'v6-dark' ? 'rgb(22, 104, 220)' : 'rgb(24, 144, 255)';
    if (state.primaryBg !== expectedBg)
      throw new Error(`${theme}: primary bg ${state.primaryBg}, expected ${expectedBg}`);
  }
  await browser.close();
  console.log(results.join('\n'));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
