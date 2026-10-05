/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

async function freshShim(): Promise<typeof import('../shims/cssinjs-utils.js')> {
  // Bust the module cache so each test starts with an empty registry.
  // Use URL to construct the import path at runtime to bypass Vite's static analysis
  const url = new URL('../shims/cssinjs-utils.js', import.meta.url);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  return import(url.href);
}

describe('recorder shim registry guard', () => {
  it('allows the same factory to be registered under several sub-styles', async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    const factory = (): Record<string, number> => ({ a: 1 });
    utils.genStyleHooks(['Input', 'Shared'], () => [], factory, {});
    utils.genComponentStyleHook(['Input', 'Component'], () => [], factory, {});
    const entry = shim.registry.get('Input');
    expect(entry.getDefaultToken).toBe(factory);
    expect(entry.subStyles).toEqual(['Shared', 'Component']);
  });

  it('throws when a second registration brings a different factory', async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    utils.genStyleHooks(
      ['Cascader', 'Cascader'],
      () => [],
      (): Record<string, number> => ({ a: 1 }),
      {}
    );
    expect(() =>
      utils.genComponentStyleHook(
        ['Cascader', 'Panel'],
        () => [],
        (): Record<string, number> => ({ b: 2 }),
        {}
      )
    ).toThrow(/conflicting default-token factories for Cascader \(sub-styles: Cascader, Panel\)/);
  });

  it('treats a plain string component name as sub-style equal to the name', async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    utils.genStyleHooks(
      'Button',
      () => [],
      (): Record<string, never> => ({}),
      {}
    );
    expect(shim.registry.get('Button').subStyles).toEqual(['Button']);
  });

  it("merges Grid's two default-token factories (Row's and Col's hooks share the name)", async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    utils.genStyleHooks(
      'Grid',
      () => [],
      (): Record<string, number> => ({ rowOnly: 1 }),
      {}
    );
    utils.genStyleHooks(
      'Grid',
      () => [],
      (): Record<string, number> => ({ colOnly: 2 }),
      {}
    );
    const entry = shim.registry.get('Grid');
    expect(entry.getDefaultToken({})).toEqual({ rowOnly: 1, colOnly: 2 });
    expect(entry.subStyles).toEqual(['Grid', 'Grid']);
  });

  it('accepts an object default token on either side of the Grid merge', async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    utils.genStyleHooks('Grid', () => [], { a: 1 }, {});
    utils.genStyleHooks(
      'Grid',
      () => [],
      (): Record<string, number> => ({ b: 2 }),
      {}
    );
    expect(shim.registry.get('Grid').getDefaultToken({})).toEqual({ a: 1, b: 2 });
  });

  it('still throws for any other name, even when both factories return no tokens', async () => {
    const shim = await freshShim();
    const utils = shim.genStyleUtils({ getCompUnitless: () => ({}) });
    utils.genStyleHooks(
      'Row',
      () => [],
      (): Record<string, never> => ({}),
      {}
    );
    expect(() =>
      utils.genStyleHooks(
        'Row',
        () => [],
        (): Record<string, never> => ({}),
        {}
      )
    ).toThrow(/conflicting default-token factories for Row \(sub-styles: Row, Row\)/);
  });
});
