/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { bundleEngine } from '../bundle-engine';
import { allAntdComponentNames, v6ComponentDirs, v6Components } from '../components';
import { generateTypes, renderComponentRoots } from '../generate-types';

describe('generateTypes', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-types-'));
  let dts: string;

  beforeAll(async () => {
    await bundleEngine({ outDir: dir, antdNames: allAntdComponentNames() });
    await generateTypes(dir);
    dts = readFileSync(path.join(dir, 'tokens.ts'), 'utf8');
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('declares seed, alias and per-component interfaces plus the map', () => {
    expect(dts).toContain('export interface NzSeedToken {');
    expect(dts).toContain('export interface NzAliasToken extends NzSeedToken {');
    expect(dts).toContain('export interface NzButtonToken {');
    expect(dts).toContain('export interface NzComponentTokenMap {');
    expect(dts).toMatch(/Button: NzButtonToken;/);
  });

  it('types keys by their default value type', () => {
    expect(dts).toMatch(/^\s+colorPrimary: string;$/m);
    expect(dts).toMatch(/^\s+controlHeight: number;$/m);
    expect(dts).toMatch(/^\s+wireframe: boolean;$/m);
    expect(dts).toMatch(/^\s+primaryShadow: string;$/m);
  });

  it('has exactly as many alias keys as the engine', async () => {
    const core = await import(path.join(dir, 'engine-core.ts'));
    const alias = core.formatToken({ ...core.defaultAlgorithm(core.seedToken), override: {} });
    const scalarKeys = Object.keys(alias).filter(k => ['string', 'number', 'boolean'].includes(typeof alias[k]));
    // Property names match either a bare identifier or a quoted string literal: some antd token keys
    // (e.g. `blue-1`) are not valid TypeScript identifiers and generateTypes quotes those (see
    // `propertyName` in generate-types.ts) so the emitted interface stays syntactically valid.
    const propertyLine = /^\s+(?:[A-Za-z0-9_]+|"[^"]+"): (string|number|boolean);$/gm;
    const declared = dts.match(propertyLine) ?? [];
    const aliasSection = dts.slice(
      dts.indexOf('interface NzSeedToken'),
      dts.indexOf('export interface Nz', dts.indexOf('interface NzAliasToken') + 1)
    );
    const aliasDeclared = aliasSection.match(propertyLine) ?? [];
    expect(aliasDeclared.length).toBe(scalarKeys.length);
    expect(declared.length).toBeGreaterThan(aliasDeclared.length);
  });
});

describe('committed tokens.ts', () => {
  it('matches a fresh generation', async () => {
    const committed = readFileSync(
      path.resolve(__dirname, '../../../../components/core/theme/generated/tokens.ts'),
      'utf8'
    );
    const dir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-types2-'));
    await bundleEngine({ outDir: dir, antdNames: allAntdComponentNames() });
    await generateTypes(dir);
    expect(readFileSync(path.join(dir, 'tokens.ts'), 'utf8')).toBe(committed);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('committed component-roots.ts', () => {
  const committedPath = path.resolve(__dirname, '../../../../components/core/theme/generated/component-roots.ts');

  it('maps every antd name in the component map to its entry prefixCls', async () => {
    const { COMPONENT_ROOT_CLS } = await import(committedPath);
    const expected: Record<string, string> = {};
    for (const dir of v6ComponentDirs) {
      for (const name of v6Components[dir].antd) {
        expected[name] = v6Components[dir].prefixCls;
      }
    }
    expect(COMPONENT_ROOT_CLS).toEqual(expected);
  });

  it('matches a fresh generation', () => {
    expect(renderComponentRoots()).toBe(readFileSync(committedPath, 'utf8'));
  });

  it('has a root class for every component in the engine registry', async () => {
    const { COMPONENT_ROOT_CLS } = await import(committedPath);
    const dir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-roots-'));
    await bundleEngine({ outDir: dir, antdNames: allAntdComponentNames() });
    const { registry } = await import(path.join(dir, 'engine-components.ts'));
    expect([...registry.keys()].filter(name => !COMPONENT_ROOT_CLS[name])).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
  });
});
