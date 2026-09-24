/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { v6ComponentDirs } from '../components';
import { buildComponentCss, generateStyles } from '../generate-styles';

const componentsDir = path.resolve(__dirname, '../../../../components');

describe('buildComponentCss', () => {
  it('appends the patch after the template, separated by a newline', () => {
    expect(buildComponentCss('.a{}', '.p{}')).toBe('.a{}\n.p{}');
  });
  it('returns the template alone when there is no patch', () => {
    expect(buildComponentCss('.a{}', null)).toBe('.a{}');
  });
});

describe('generateStyles', () => {
  const publishDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-publish-'));
  let result: Awaited<ReturnType<typeof generateStyles>>;

  beforeAll(async () => {
    result = await generateStyles({ publishDir, componentsDir, updateManifest: false, checkManifest: false });
  });
  afterAll(() => rmSync(publishDir, { recursive: true, force: true }));

  it('writes per-component css and min.css for every mapped component', () => {
    for (const dir of v6ComponentDirs) {
      expect(existsSync(path.join(publishDir, dir, 'style/v6/index.css')), dir).toBe(true);
      expect(existsSync(path.join(publishDir, dir, 'style/v6/index.min.css')), dir).toBe(true);
    }
  });

  it('appends select patch rules after the template and none for button', () => {
    const select = readFileSync(path.join(publishDir, 'select/style/v6/index.css'), 'utf8');
    const patch = readFileSync(path.join(componentsDir, 'select/style/v6/patch.css'), 'utf8').trim();
    expect(select.trimEnd().endsWith(patch)).toBe(true);
    expect(select.indexOf('.ant-select-dropdown{')).toBeLessThan(select.indexOf(patch));
    expect(result.perComponent['button']).not.toContain('/* antd positions popups');
  });

  it('writes the bundle and the style/v6 files with attribution headers', () => {
    for (const f of [
      'ng-zorro-antd.v6.css',
      'ng-zorro-antd.v6.min.css',
      'style/v6/template.css',
      'style/v6/tokens.default.css',
      'style/v6/tokens.dark.css',
      'style/v6/tokens.compact.css',
      'style/v6/patch.css'
    ]) {
      expect(existsSync(path.join(publishDir, f)), f).toBe(true);
    }
    expect(readFileSync(path.join(publishDir, 'style/v6/template.css'), 'utf8')).toMatch(
      /^\/\*! Generated from Ant Design 6\.6\.5/
    );
  });

  it('declares every variable block on :root and no antd scoping survives', () => {
    for (const name of ['default', 'dark', 'compact'] as const) {
      const css = result.tokens[name];
      expect(css).not.toMatch(/css-var-|-css-var/);
      expect(css.split('\n').filter(l => l.startsWith(':root{')).length).toBeGreaterThan(0);
    }
    expect(result.template).not.toMatch(/css-var-|-css-var/);
  });

  it('dark tokens differ from default while the template is shared', () => {
    expect(result.tokens.dark).not.toBe(result.tokens.default);
    expect(result.bundle).toContain(result.template.split('\n')[1]);
    expect(result.bundle).toContain(result.tokens.default.split('\n')[0]);
  });
});
