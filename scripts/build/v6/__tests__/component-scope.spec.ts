/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { beforeAll, describe, expect, it } from 'vitest';

import path from 'node:path';

import { bundleEngine } from '../bundle-engine';
import { allAntdComponentNames } from '../components';

const generatedDir = path.resolve(__dirname, '../../../../components/core/theme/generated');
type Renderer = typeof import('../../../../components/core/theme/render-theme-css');

const MARK = '#123456';

describe('component-scoped alias overrides', () => {
  let r: Renderer;
  let roots: Record<string, string>;
  beforeAll(async () => {
    await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
    r = await import('../../../../components/core/theme/render-theme-css');
    roots = (await import('../../../../components/core/theme/generated/component-roots')).COMPONENT_ROOT_CLS;
  });

  /** `[shorter, longer]` component names whose root class is a `-`-separated prefix of the other's, derived from the map. */
  function overlaps(): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    for (const [a, rootA] of Object.entries(roots)) {
      for (const [b, rootB] of Object.entries(roots)) {
        if (rootB.startsWith(`${rootA}-`)) {
          pairs.push([a, b]);
        }
      }
    }
    return pairs;
  }

  /** The selector of the rule that carries the override for `component`. */
  async function scopeOf(component: string): Promise<string> {
    const css = await r.renderThemeCss({ components: { [component]: { colorPrimary: MARK } } } as never);
    const rule = css.split('\n').find(line => line.includes(MARK) && line.includes(':is('));
    expect(rule, `${component} override rule`).toBeDefined();
    return rule!.slice(0, rule!.indexOf('{'));
  }

  it('scopes Calendar to antd’s own css-var root, apart from date pickers', () => {
    expect(roots['Calendar']).toBe('ant-picker-calendar');
    expect(roots['DatePicker']).toBe('ant-picker');
  });

  it('finds the known overlapping pairs automatically', () => {
    const pairs = overlaps().map(([a, b]) => `${a}>${b}`);
    expect(pairs).toEqual(expect.arrayContaining(['Input>InputNumber', 'Tree>TreeSelect', 'DatePicker>Calendar']));
  });

  it('excludes every longer root from a shorter root’s alias-level override', async () => {
    const pairs = overlaps();
    expect(pairs.length).toBeGreaterThan(0);
    for (const [shorter, longer] of pairs) {
      expect(await scopeOf(shorter), `${shorter} must not reach ${longer}`).toContain(
        `:not([class*="${roots[longer]}"])`
      );
    }
  });

  it('leaves a root without longer roots unchanged', async () => {
    expect(await scopeOf('Button')).not.toContain(':not(');
  });
});
