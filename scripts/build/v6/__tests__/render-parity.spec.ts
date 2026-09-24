/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { theme as antdTheme } from 'antd';
import { beforeAll, describe, expect, it } from 'vitest';

import path from 'node:path';

import { bundleEngine } from '../bundle-engine';
import { allAntdComponentNames, v6Components, v6ComponentDirs } from '../components';
import { partitionBlocks, splitBlocks } from '../css-postprocess';
import { extractAntdCss } from '../extract-styles';

const generatedDir = path.resolve(__dirname, '../../../../components/core/theme/generated');
const KEY = 'nz-root';

type Renderer = typeof import('../../../../components/core/theme/render-theme-css');

describe('engine parity with antd extraction', () => {
  let renderer: Renderer;
  let core: typeof import('../../../../components/core/theme/generated/engine-core');

  beforeAll(async () => {
    await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
    renderer = await import('../../../../components/core/theme/render-theme-css');
    core = await import(path.join(generatedDir, 'engine-core.ts'));
  });

  const cases: Array<{ name: string; nz: () => Record<string, unknown>; antd: Record<string, unknown> }> = [
    { name: 'default', nz: () => ({}), antd: {} },
    { name: 'dark', nz: () => ({ algorithm: core.darkAlgorithm }), antd: { algorithm: antdTheme.darkAlgorithm } },
    {
      name: 'compact',
      nz: () => ({ algorithm: core.compactAlgorithm }),
      antd: { algorithm: antdTheme.compactAlgorithm }
    },
    {
      name: 'dark+compact',
      nz: () => ({ algorithm: [core.darkAlgorithm, core.compactAlgorithm] }),
      antd: { algorithm: [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm] }
    },
    {
      name: 'brand with component override',
      nz: () => ({
        token: { colorPrimary: '#00b96b', borderRadius: 2 },
        components: { Button: { primaryShadow: 'none' } }
      }),
      antd: { token: { colorPrimary: '#00b96b', borderRadius: 2 }, components: { Button: { primaryShadow: 'none' } } }
    },
    {
      name: 'component algorithm override',
      nz: () => ({ components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } } }),
      antd: { components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } } }
    }
  ];

  for (const c of cases) {
    it(`renders byte-equal variable blocks for ${c.name}`, async () => {
      const raw = extractAntdCss({ includes: allAntdComponentNames(), key: KEY, theme: c.antd });
      const { vars } = partitionBlocks(raw, KEY);
      // antd scopes component blocks to root classes; normalise both sides to `:root{...}` bodies.
      const expected = [...new Set(vars.map(b => `:root{${b.body}}`))].sort();
      // Split on brace balance, not `\n`: antd's real seed tokens (fontFamily, boxShadow*) legitimately
      // contain embedded newlines inside a single block, so splitting on `\n` here would fragment a
      // block that `partitionBlocks` above (also brace-based) keeps whole.
      const mine = splitBlocks(await renderer.renderThemeCss(c.nz() as never, ':root'))
        .map(b => b.raw)
        .sort();
      expect(mine).toEqual(expected);
    });
  }

  it('template CSS is identical across algorithms for every mapped component', () => {
    for (const dir of v6ComponentDirs) {
      const includes = [...v6Components[dir].antd];
      const light = partitionBlocks(extractAntdCss({ includes, key: KEY }), KEY)
        .template.map(b => b.raw)
        .join('\n');
      const dark = partitionBlocks(
        extractAntdCss({ includes, key: KEY, theme: { algorithm: antdTheme.darkAlgorithm } }),
        KEY
      )
        .template.map(b => b.raw)
        .join('\n');
      expect(dark, dir).toBe(light);
    }
  });
});
