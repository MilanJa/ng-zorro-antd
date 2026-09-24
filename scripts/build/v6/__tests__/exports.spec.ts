/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, '../../../../components/package.json'), 'utf8'));

describe('components/package.json exports', () => {
  it('exposes the v6 bundle and style/v6 files', () => {
    expect(pkg.exports['./ng-zorro-antd.v6.css']).toEqual({ style: './ng-zorro-antd.v6.css' });
    expect(pkg.exports['./ng-zorro-antd.v6.min.css']).toEqual({ style: './ng-zorro-antd.v6.min.css' });
    expect(pkg.exports['./style/v6/*']).toEqual({ style: './style/v6/*' });
  });
  it('exposes per-component v6 css for every mapped component', () => {
    for (const dir of v6ComponentDirs) {
      expect(pkg.exports[`./${dir}/style/v6/*`], dir).toEqual({ style: `./${dir}/style/v6/*` });
    }
  });
});
