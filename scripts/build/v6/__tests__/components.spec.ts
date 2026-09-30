/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  allAntdComponentNames,
  ANTD_STYLE_MODULE_OVERRIDES,
  antdRegistryName,
  antdStyleModuleDir,
  v6ComponentDirs,
  v6Components,
  v6PatchDependencies
} from '../components';

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

  it('resolves style-module and registry aliases to a mapped entry with the same prefixCls', () => {
    for (const [name, dir] of Object.entries(ANTD_STYLE_MODULE_OVERRIDES)) {
      const target = v6ComponentDirs.find(d =>
        v6Components[d].antd.some(n => antdStyleModuleDir(n) === dir && n !== name)
      );
      const alias = v6ComponentDirs.find(d => (v6Components[d].antd as readonly string[]).includes(name));
      if (alias) {
        expect(target, `${name} → ${dir} must alias a mapped component`).toBeDefined();
        expect(v6Components[alias].prefixCls).toBe(v6Components[target!].prefixCls);
      }
    }
    expect(antdStyleModuleDir('AutoComplete')).toBe('select');
    expect(antdStyleModuleDir('TimePicker')).toBe('date-picker');
    expect(antdStyleModuleDir('InputNumber')).toBe('input-number');
    expect(antdRegistryName('AutoComplete')).toBe('Select');
    expect(antdRegistryName('TimePicker')).toBe('DatePicker');
  });
});

describe('v6PatchDependencies', () => {
  it('pins the patches each standalone component bundle borrows', () => {
    const deps = Object.fromEntries(
      v6ComponentDirs.map(dir => [dir, v6PatchDependencies(dir)]).filter(([, list]) => list.length)
    );
    expect(deps).toEqual({
      'auto-complete': ['select'],
      cascader: ['select'],
      'color-picker': ['input-number', 'popover', 'select'],
      pagination: ['select'],
      popconfirm: ['popover'],
      slider: ['tooltip'],
      'time-picker': ['date-picker'],
      transfer: ['button', 'checkbox', 'input'],
      'tree-select': ['select', 'tree']
    });
  });

  it('never lists the component itself and keeps map order', () => {
    for (const dir of v6ComponentDirs) {
      const deps = v6PatchDependencies(dir);
      expect(deps, dir).not.toContain(dir);
      expect(deps, dir).toEqual(v6ComponentDirs.filter(d => deps.includes(d)));
    }
  });

  it('resolves a shared prefix to its non-alias owner (ant-select -> select, not auto-complete)', () => {
    expect(v6Components['auto-complete'].prefixCls).toBe(v6Components.select.prefixCls);
    expect(v6PatchDependencies('cascader')).toEqual(['select']);
  });
});
