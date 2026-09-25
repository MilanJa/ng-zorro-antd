/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../..');
const publishCss = path.join(repoRoot, 'publish', 'ng-zorro-antd.v6.css');
const indexHtmlPath = path.join(repoRoot, 'tools', 'v6-compare', 'ssr-check', 'dist', 'browser', 'index.html');

function run(command: string, args: string[]): void {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
  }
}

function main(): void {
  if (!existsSync(publishCss)) {
    console.log(
      `Running step: build-lib (publish/ng-zorro-antd.v6.css is missing, needed for the SSR app's styles.css import)`
    );
    run('npx', ['nx', 'run', 'ng-zorro-antd-lib:build-lib', '--skip-nx-cache']);
  }

  console.log('Running step: v6-ssr-check:build');
  run('npx', ['nx', 'run', 'v6-ssr-check:build', '--skip-nx-cache']);

  if (!existsSync(indexHtmlPath)) {
    throw new Error(`Expected prerendered output at ${indexHtmlPath}, but it does not exist.`);
  }
  const html = readFileSync(indexHtmlPath, 'utf8');

  // Assertion 1: the global theme's style element exists.
  const globalStyleMatch = html.match(/<style id="nz-theme">([\s\S]*?)<\/style>/);
  if (!globalStyleMatch) {
    throw new Error(
      `Assertion failed: <style id="nz-theme"> not found in ${indexHtmlPath}. ` +
        `Head excerpt:\n${html.slice(0, html.indexOf('</head>') + 7)}`
    );
  }
  console.log('PASS: <style id="nz-theme"> is present in the prerendered HTML.');

  // Assertion 2: the global theme's dark-derived primary color is serialised.
  const globalCss = globalStyleMatch[1];
  const expectedGlobalVar = '--ant-color-primary:#03a05e';
  if (!globalCss.includes(expectedGlobalVar)) {
    throw new Error(
      `Assertion failed: expected "${expectedGlobalVar}" inside <style id="nz-theme">. Actual content:\n${globalCss}`
    );
  }
  console.log(`PASS: <style id="nz-theme"> contains "${expectedGlobalVar}".`);

  // Assertion 3: exactly one element carries the scoped theme class `nz-theme-1`.
  const scopeClassMatches = html.match(/class="[^"]*\bnz-theme-1\b[^"]*"/g) ?? [];
  if (scopeClassMatches.length !== 1) {
    throw new Error(
      `Assertion failed: expected exactly one element with class "nz-theme-1", found ${scopeClassMatches.length}. ` +
        `Matches: ${JSON.stringify(scopeClassMatches)}`
    );
  }
  console.log('PASS: exactly one element carries the "nz-theme-1" scope class.');

  // Assertion 4: the scoped theme's style element serialises the scoped token override.
  const scopedStyleMatch = html.match(/<style id="nz-theme-1">([\s\S]*?)<\/style>/);
  if (!scopedStyleMatch) {
    throw new Error(`Assertion failed: <style id="nz-theme-1"> not found in ${indexHtmlPath}.`);
  }
  const scopedCss = scopedStyleMatch[1];
  const expectedScopedVar = '--ant-border-radius:0px';
  if (!scopedCss.includes(expectedScopedVar)) {
    throw new Error(
      `Assertion failed: expected "${expectedScopedVar}" inside <style id="nz-theme-1">. Actual content:\n${scopedCss}`
    );
  }
  console.log(`PASS: <style id="nz-theme-1"> contains "${expectedScopedVar}".`);

  console.log('\nAll SSR theme assertions passed.');
}

main();
