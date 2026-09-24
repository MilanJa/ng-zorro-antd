/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync } from 'node:fs';
import path from 'node:path';

import { allAntdComponentNames, v6ComponentDirs, v6Components } from '../components';

const componentsRoot = path.resolve(__dirname, '../../../../components');

describe('v6 component map', () => {
  it('maps only existing ng-zorro component directories', () => {
    for (const dir of v6ComponentDirs) {
      expect(existsSync(path.join(componentsRoot, dir, 'style')), `${dir}/style missing`).toBe(true);
    }
  });

  it('names only components exported by antd', async () => {
    const antd = await import('antd');
    for (const name of allAntdComponentNames()) {
      expect(typeof (antd as Record<string, unknown>)[name], `antd.${name}`).not.toBe('undefined');
    }
  });

  it('has no duplicate antd names across entries', () => {
    const all = v6ComponentDirs.flatMap(dir => [...v6Components[dir].antd]);
    expect(new Set(all).size).toBe(all.length);
  });
});
