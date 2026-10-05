/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { antdStyleModulePath, bundleEngine, componentsEntry } from '../bundle-engine';

describe('bundleEngine', () => {
  const outDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-engine-'));
  let sizes: { coreBytes: number; componentsBytes: number };

  beforeAll(async () => {
    sizes = await bundleEngine({ outDir, antdNames: ['Button', 'Input', 'Select', 'Space'], minify: true });
  });
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it('maps antd component names to style module paths', () => {
    expect(antdStyleModulePath('Button')).toBe('antd/es/button/style/index.js');
    expect(antdStyleModulePath('DatePicker')).toBe('antd/es/date-picker/style/index.js');
    expect(antdStyleModulePath('QRCode')).toBe('antd/es/qr-code/style/index.js');
  });

  it('writes both bundles and reports their sizes', () => {
    expect(existsSync(path.join(outDir, 'engine-core.ts'))).toBe(true);
    expect(existsSync(path.join(outDir, 'engine-components.ts'))).toBe(true);
    expect(sizes.coreBytes).toBeGreaterThan(10_000);
    expect(sizes.componentsBytes).toBeGreaterThan(1_000);
  });

  it('core bundle computes the default alias token without React', async () => {
    const core = await import(pathToFileURL(path.join(outDir, 'engine-core.ts')).href);
    const map = core.defaultAlgorithm(core.seedToken);
    const alias = core.formatToken({ ...map, override: {} });
    expect(alias.colorPrimary).toBe('#1677ff');
    expect(alias.colorPrimaryHover).toBe('#4096ff');
    expect(alias.controlHeight).toBe(32);
    expect(core.token2CSSVar('colorPrimaryHover', 'ant')).toBe('--ant-color-primary-hover');
  });

  it('components bundle registers every requested component with a default-token factory', async () => {
    const core = await import(pathToFileURL(path.join(outDir, 'engine-core.ts')).href);
    const comps = await import(pathToFileURL(path.join(outDir, 'engine-components.ts')).href);
    const registry: Map<string, { getDefaultToken: unknown; prefixToken: (k: string) => string }> = comps.registry;
    for (const name of ['Button', 'Input', 'Select', 'Space']) {
      expect(registry.has(name), name).toBe(true);
    }
    const alias = core.formatToken({ ...core.defaultAlgorithm(core.seedToken), override: {} });
    const button = registry.get('Button')!;
    const defaults = (button.getDefaultToken as (t: unknown) => Record<string, unknown>)(alias);
    expect(defaults['defaultBg']).toBe('#ffffff');
    expect(button.prefixToken('defaultBg')).toBe('ButtonDefaultBg');
  });

  it('registers exactly the requested components, with no extra leaked entries', async () => {
    const comps = await import(pathToFileURL(path.join(outDir, 'engine-components.ts')).href);
    const registry: Map<string, unknown> = comps.registry;
    // `Button`'s style module transitively reaches `antd/es/color-picker/components/ColorPresets.js`,
    // which renders an unrelated `<Collapse>`; the bundle must not register `Collapse` (or anything else)
    // that wasn't in `antdNames`.
    expect([...registry.keys()].sort()).toEqual(['Button', 'Input', 'Select', 'Space'].sort());
  });

  it('bundles contain no reference to the real react packages', async () => {
    const { readFileSync } = await import('node:fs');
    const core = readFileSync(path.join(outDir, 'engine-core.ts'), 'utf8');
    const components = readFileSync(path.join(outDir, 'engine-components.ts'), 'utf8');
    for (const bundle of [core, components]) {
      expect(bundle).not.toMatch(/from\s*["']react["']/);
      expect(bundle).not.toMatch(/require\(["']react["']\)/);
      expect(bundle).not.toMatch(/from\s*["']react-dom/);
      expect(bundle).not.toMatch(/require\(["']react-dom/);
    }
  });

  it('dedupes a style module shared by two antd names into a single import', () => {
    const entry = componentsEntry(['Select', 'AutoComplete']);
    const imports = entry.match(/from 'antd\/es\/select\/style\/index\.js'/g) ?? [];
    expect(imports).toHaveLength(1);
  });

  it("calling a lazily-registered style module's default export with no arguments performs its registration", async () => {
    // Mirrors antd's lazy pattern (e.g. `antd/es/tooltip/style/index.js`): defers the `genStyleHooks` call
    // to when the component itself renders, instead of calling it eagerly at module scope. `componentsEntry`
    // calls every style module's default export with no arguments precisely to trigger this deferred case.
    const dir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-lazy-'));
    try {
      const shimUrl = new URL('../shims/cssinjs-utils.js', import.meta.url);
      const lazyFile = path.join(dir, 'lazy-style.mjs');
      writeFileSync(
        lazyFile,
        [
          `import { genStyleUtils } from ${JSON.stringify(shimUrl.href)};`,
          'const { genStyleHooks } = genStyleUtils({ getCompUnitless: () => ({}) });',
          'export default function (prefixCls, rootCls, injectStyle) {',
          "  const useStyle = genStyleHooks('SyntheticLazy', () => [], () => ({ a: 1 }), {});",
          '  return useStyle(prefixCls, rootCls, injectStyle);',
          '}'
        ].join('\n')
      );
      const { registry } = await import(shimUrl.href);
      expect(registry.has('SyntheticLazy')).toBe(false);
      const lazyModule = await import(pathToFileURL(lazyFile).href);
      // Same calling convention as the `try { _c0(); } catch (e) { ... }` line `componentsEntry` generates.
      try {
        (lazyModule.default as () => void)();
      } catch {
        /* ignore */
      }
      expect(registry.has('SyntheticLazy')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('componentsEntry for a style module without a default export', () => {
  it('imports antd/es/grid/style once, by its named hooks, for Row and Col', () => {
    const entry = componentsEntry(['Button', 'Row', 'Col']);
    expect(entry.match(/from 'antd\/es\/grid\/style\/index\.js'/g)).toHaveLength(1);
    expect(entry).toContain(
      "import { useRowStyle as _c1_0, useColStyle as _c1_1 } from 'antd/es/grid/style/index.js';"
    );
    expect(entry).toContain('export { _c1_0, _c1_1 };');
    expect(entry).not.toMatch(/_c1\(\)/);
    expect(entry).toContain("import { default as _c0 } from 'antd/es/button/style/index.js';");
  });
});

describe('bundleEngine with Row and Col', () => {
  const outDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-engine-grid-'));
  afterAll(() => rmSync(outDir, { recursive: true, force: true }));

  it('registers Grid once from the real module while Modal keeps its getMediaSize shim', async () => {
    await bundleEngine({ outDir, antdNames: ['Modal', 'Row', 'Col'], minify: true });
    const comps = await import(pathToFileURL(path.join(outDir, 'engine-components.ts')).href);
    const registry: Map<string, { getDefaultToken: (t: unknown) => unknown; subStyles: string[] }> = comps.registry;
    expect(registry.has('Modal')).toBe(true);
    // exactly Row's and Col's hooks: the modal-scoped shim (shims/grid-style.js) registers nothing
    expect(registry.get('Grid')!.subStyles).toEqual(['Grid', 'Grid']);
    expect(registry.get('Grid')!.getDefaultToken({})).toEqual({});
  });
});
