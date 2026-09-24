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

describe('renderThemeCss edge cases', () => {
  let r: Renderer;
  beforeAll(async () => {
    await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
    r = await import('../../../../components/core/theme/render-theme-css');
  });

  it('ignores component overrides for components that are not in the registry', async () => {
    const css = await r.renderThemeCss({ components: { Table: { headerBg: '#123456' } } } as never);
    expect(css).not.toContain('#123456');
    expect(css).not.toContain('--ant-table-');
  });

  it('keeps zero values (borderRadius: 0 renders as 0px)', async () => {
    const css = await r.renderThemeCss({ token: { borderRadius: 0 } });
    expect(css).toContain('--ant-border-radius:0px;');
    expect(css).toContain('--ant-border-radius-lg:0px;');
  });

  it('is byte-identical when a seed override equals the default', async () => {
    const a = await r.renderThemeCss({});
    const b = await r.renderThemeCss({ token: { colorPrimary: '#1677ff' } });
    expect(b).toBe(a);
  });

  it('getDesignToken strips component entries and exposes alias values', () => {
    const t = r.getDesignToken({ components: { Button: { primaryShadow: 'none' } } } as never);
    expect(t['Button']).toBeUndefined();
    expect(t['colorPrimary']).toBe('#1677ff');
  });
});
