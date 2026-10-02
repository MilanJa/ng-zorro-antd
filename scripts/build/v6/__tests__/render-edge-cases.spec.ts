/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { beforeAll, describe, expect, it } from 'vitest';

import path from 'node:path';

import { bundleEngine } from '../bundle-engine';
import { allAntdComponentNames } from '../components';
import { splitBlocks } from '../css-postprocess';

const generatedDir = path.resolve(__dirname, '../../../../components/core/theme/generated');
type Renderer = typeof import('../../../../components/core/theme/render-theme-css');

describe('renderThemeCss edge cases', () => {
  let r: Renderer;
  beforeAll(async () => {
    await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
    r = await import('../../../../components/core/theme/render-theme-css');
  });

  it('ignores component overrides for components that are not in the registry', async () => {
    // `Affix` has no map entry (plan F); any name genuinely absent from `v6Components` works here.
    const css = await r.renderThemeCss({ components: { Affix: { zIndexPopup: '#123456' } } } as never);
    expect(css).not.toContain('#123456');
    expect(css).not.toContain('--ant-affix-');
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

  describe('component-level alias overrides', () => {
    const config = { components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } } } as never;
    const buttonScope = ':is([class^="ant-btn"],[class*=" ant-btn"])';

    it('are scoped to the component root class instead of leaking onto :root', async () => {
      const blocks = splitBlocks(await r.renderThemeCss(config));
      const rootBlocks = blocks.filter(b => b.selector === ':root');
      expect(rootBlocks.length).toBeGreaterThan(0);
      for (const block of rootBlocks) {
        expect(block.body).not.toContain('--ant-color-primary:#ff4d4f');
      }
      const scoped = blocks.filter(b => b.selector === buttonScope);
      expect(scoped).toHaveLength(1);
      expect(scoped[0].body).toContain('--ant-color-primary:#ff4d4f;');
      // the component's own namespaced variables stay on the theme selector
      expect(scoped[0].body).not.toContain('--ant-button-');
      expect(rootBlocks.some(b => b.body.includes('--ant-button-'))).toBe(true);
    });

    it('are nested under a non-root theme selector, and also target the host itself', async () => {
      const blocks = splitBlocks(await r.renderThemeCss(config, '.nz-theme-1'));
      expect(blocks.map(b => b.selector)).toContain(`.nz-theme-1 ${buttonScope}, .nz-theme-1${buttonScope}`);
      const scopeBlocks = blocks.filter(b => b.selector === '.nz-theme-1');
      expect(scopeBlocks.length).toBeGreaterThan(0);
      expect(scopeBlocks.every(b => !b.body.includes('--ant-color-primary:#ff4d4f'))).toBe(true);
    });

    it('emit no scoped block when a component has no alias-level override', async () => {
      const css = await r.renderThemeCss({ components: { Button: { primaryShadow: 'none' } } } as never);
      expect(css).not.toContain(':is([class^=');
      expect(css).toContain('--ant-button-primary-shadow:none;');
    });
  });

  it('getDesignToken strips component entries and exposes alias values', () => {
    const t = r.getDesignToken({ components: { Button: { primaryShadow: 'none' } } } as never);
    expect(t['Button']).toBeUndefined();
    expect(t['colorPrimary']).toBe('#1677ff');
  });

  it('scoped component alias overrides target descendants and the host itself', async () => {
    const css = await r.renderThemeCss(
      { components: { Button: { algorithm: true, colorPrimary: '#ff4d4f' } } } as never,
      '.nz-theme-7'
    );
    const block = splitBlocks(css).find(b => b.body.includes('--ant-color-primary:#ff4d4f'));
    expect(block?.selector).toBe(
      '.nz-theme-7 :is([class^="ant-btn"],[class*=" ant-btn"]), .nz-theme-7:is([class^="ant-btn"],[class*=" ant-btn"])'
    );
  });
});
