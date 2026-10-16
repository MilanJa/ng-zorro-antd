/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';

const publish = path.resolve(__dirname, '../../../../publish');
const skip = !existsSync(path.join(publish, 'ng-zorro-antd.v6.css'));

describe.skipIf(skip)('publish layout after build-lib', () => {
  it('contains the v6 bundle, style/v6 files and per-component v6 css', () => {
    for (const f of [
      'ng-zorro-antd.v6.css',
      'ng-zorro-antd.v6.min.css',
      'style/v6/template.css',
      'style/v6/tokens.default.css',
      'style/v6/tokens.dark.css',
      'style/v6/tokens.compact.css',
      'style/v6/patch.css',
      'style/v6/component-patches.css',
      'style/v6/reset.css',
      ...v6ComponentDirs.flatMap(d => [`${d}/style/v6/index.css`, `${d}/style/v6/index.min.css`])
    ]) {
      expect(existsSync(path.join(publish, f)), f).toBe(true);
    }
  });

  it('ships the core/theme entry point without React', () => {
    const fesm = readFileSync(path.join(publish, 'fesm2022/ng-zorro-antd-core-theme.mjs'), 'utf8');
    expect(fesm).toContain('token2CSSVar');
    expect(fesm).not.toMatch(/from\s*["']react["']/);
    expect(existsSync(path.join(publish, 'types/ng-zorro-antd-core-theme.d.ts'))).toBe(true);
  });

  it('v4 stylesheets are still produced', () => {
    for (const f of [
      'ng-zorro-antd.min.css',
      'ng-zorro-antd.dark.min.css',
      'button/style/index.min.css',
      'ng-zorro-antd.less'
    ]) {
      expect(existsSync(path.join(publish, f)), f).toBe(true);
    }
  });
});
