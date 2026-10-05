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
  ownsStyleModule,
  stylesThroughOf,
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

  it("names a mapped directory whose prefixCls is `from` in every stylesThrough entry, and the entry's own prefix as `to`", () => {
    const entries = v6ComponentDirs.filter(dir => stylesThroughOf(dir));
    expect(entries).toContain('timeline');
    for (const dir of entries) {
      const through = stylesThroughOf(dir)!;
      expect(v6ComponentDirs as readonly string[], `${dir}: stylesThrough.dir`).toContain(through.dir);
      expect(through.dir, `${dir}: stylesThrough.dir must not be the entry itself`).not.toBe(dir);
      const source = v6Components[through.dir as (typeof v6ComponentDirs)[number]];
      expect(through.from, `${dir}: stylesThrough.from`).toBe(source.prefixCls);
      expect(through.to, `${dir}: stylesThrough.to`).toBe(v6Components[dir].prefixCls);
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

  it("points Row and Col at Grid's style module and registry name", () => {
    // antd/es/row/style and antd/es/col/style are `export default {}` stubs; the hooks live in grid/style.
    expect(antdStyleModuleDir('Row')).toBe('grid');
    expect(antdStyleModuleDir('Col')).toBe('grid');
    expect(antdRegistryName('Row')).toBe('Grid');
    expect(antdRegistryName('Col')).toBe('Grid');
  });

  it("treats an entry whose names share their own directory's style module as that module's owner", () => {
    expect(ownsStyleModule('grid', { antd: ['Row', 'Col'], prefixCls: 'ant-row' })).toBe(true);
    expect(ownsStyleModule('button', { antd: ['Button'], prefixCls: 'ant-btn' })).toBe(true);
    expect(ownsStyleModule('auto-complete', { antd: ['AutoComplete'], prefixCls: 'ant-select' })).toBe(false);
    expect(ownsStyleModule('time-picker', { antd: ['TimePicker'], prefixCls: 'ant-picker' })).toBe(false);
  });
});

describe('v6PatchDependencies', () => {
  it('pins the patches each standalone component bundle borrows', () => {
    const deps = Object.fromEntries(
      v6ComponentDirs.map(dir => [dir, v6PatchDependencies(dir)]).filter(([, list]) => list.length)
    );
    expect(deps).toEqual({
      'auto-complete': ['select'],
      breadcrumb: ['dropdown'],
      calendar: ['badge', 'radio', 'select', 'typography'],
      cascader: ['empty', 'select'],
      'color-picker': ['collapse', 'input-number', 'popover', 'select'],
      list: ['empty', 'pagination', 'select', 'spin'],
      menu: ['dropdown', 'tooltip', 'typography'],
      pagination: ['select'],
      popconfirm: ['popover'],
      slider: ['tooltip'],
      statistic: ['skeleton'],
      steps: ['progress'],
      table: ['checkbox', 'dropdown', 'empty', 'pagination', 'radio', 'select', 'spin', 'tree'],
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
    expect(v6PatchDependencies('cascader')).toEqual(['empty', 'select']);
  });

  it('follows a two-level dependency chain (table -> pagination -> select)', () => {
    expect(v6Components.pagination.renderedPrefixes).toContain('ant-select');
    expect(v6PatchDependencies('pagination')).toEqual(['select']);
    expect(v6PatchDependencies('table')).toContain('select');
    expect(v6PatchDependencies('list')).toContain('select');
  });
});
