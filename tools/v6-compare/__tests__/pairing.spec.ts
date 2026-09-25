/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { pairDemos } from '../pairing';

describe('pairDemos', () => {
  const map = { button: { _antdDir: 'button', block: 'block', custom: null } } as Record<
    string,
    Record<string, string | null>
  >;

  it('pairs identical keys automatically and applies explicit mappings', () => {
    const r = pairDemos('button', ['basic', 'block', 'custom', 'loading'], ['basic', 'block', 'loading', 'icon'], map);
    expect(r.pairs).toEqual([
      { key: 'basic', antd: 'basic' },
      { key: 'block', antd: 'block' },
      { key: 'loading', antd: 'loading' }
    ]);
    expect(r.ngOnly).toEqual(['custom']);
    expect(r.antdOnly).toEqual(['icon']);
  });

  it('ignores the _antdDir key and reports a mapped antd demo that does not exist', () => {
    const r = pairDemos('button', ['size'], ['basic'], { button: { _antdDir: 'button', size: 'sizes' } });
    expect(r.pairs).toEqual([]);
    expect(r.ngOnly).toEqual(['size']);
    expect(r.antdOnly).toEqual(['basic']);
  });
});
