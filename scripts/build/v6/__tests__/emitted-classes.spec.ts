/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import path from 'node:path';

import { emittedClasses, sourceFiles } from '../emitted-classes';

const root = path.resolve(__dirname, 'fixtures');

describe('emittedClasses', () => {
  it('scans bare-named .ts files and .html, skips specs and demo folders', () => {
    const files = sourceFiles('scan-sample', root)
      .map(f => path.basename(f))
      .sort();
    expect(files).toEqual(['sample.component.html', 'sample.ts']);
  });

  it('drops the partial token before a template-literal interpolation', () => {
    expect(emittedClasses('scan-sample', root)).toEqual([
      'ant-sample',
      'ant-sample-inner',
      'ant-sample-open',
      'ant-sample-status'
    ]);
  });
});
