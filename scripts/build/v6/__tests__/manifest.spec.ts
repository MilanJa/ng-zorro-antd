/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { diffManifest, ENGINE_COMPONENTS_BUDGET, ENGINE_CORE_BUDGET, readManifest, V6Manifest } from '../manifest';

const base: V6Manifest = {
  antdVersion: '6.6.5',
  engineCoreBytes: 1000,
  engineComponentsBytes: 2000,
  components: { button: { classes: ['ant-btn'], tokens: ['--ant-button-default-bg'] } }
};

describe('diffManifest', () => {
  it('is empty for equal manifests', () => {
    expect(diffManifest(base, structuredClone(base))).toEqual([]);
  });
  it('names changed version, added and removed classes and tokens', () => {
    const actual: V6Manifest = {
      ...base,
      antdVersion: '6.7.0',
      components: { button: { classes: ['ant-btn', 'ant-btn-new'], tokens: [] } }
    };
    const diff = diffManifest(base, actual);
    expect(diff).toContain('antdVersion: 6.6.5 -> 6.7.0');
    expect(diff).toContain('button: +class ant-btn-new');
    expect(diff).toContain('button: -token --ant-button-default-bg');
  });
  it('ignores byte-size drift below 1 KB but reports larger changes', () => {
    expect(diffManifest(base, { ...base, engineCoreBytes: 1500 })).toEqual([]);
    expect(diffManifest(base, { ...base, engineCoreBytes: 3000 })).toContain('engineCoreBytes: 1000 -> 3000');
  });
});

describe('committed manifest', () => {
  it('is within the engine size budgets', () => {
    const m = readManifest();
    expect(m.engineCoreBytes).toBeLessThanOrEqual(ENGINE_CORE_BUDGET);
    expect(m.engineComponentsBytes).toBeLessThanOrEqual(ENGINE_COMPONENTS_BUDGET);
  });
  it('lists every mapped component', async () => {
    const { v6ComponentDirs } = await import('../components');
    expect(Object.keys(readManifest().components).sort()).toEqual([...v6ComponentDirs].sort());
  });
});
