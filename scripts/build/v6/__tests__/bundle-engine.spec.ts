/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { antdStyleModulePath, bundleEngine } from '../bundle-engine';

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
    expect(existsSync(path.join(outDir, 'engine-core.mjs'))).toBe(true);
    expect(existsSync(path.join(outDir, 'engine-components.mjs'))).toBe(true);
    expect(sizes.coreBytes).toBeGreaterThan(10_000);
    expect(sizes.componentsBytes).toBeGreaterThan(1_000);
  });

  it('core bundle computes the default alias token without React', async () => {
    const core = await import(pathToFileURL(path.join(outDir, 'engine-core.mjs')).href);
    const map = core.defaultAlgorithm(core.seedToken);
    const alias = core.formatToken({ ...map, override: {} });
    expect(alias.colorPrimary).toBe('#1677ff');
    expect(alias.colorPrimaryHover).toBe('#4096ff');
    expect(alias.controlHeight).toBe(32);
    expect(core.token2CSSVar('colorPrimaryHover', 'ant')).toBe('--ant-color-primary-hover');
  });

  it('components bundle registers every requested component with a default-token factory', async () => {
    const core = await import(pathToFileURL(path.join(outDir, 'engine-core.mjs')).href);
    const comps = await import(pathToFileURL(path.join(outDir, 'engine-components.mjs')).href);
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

  it('bundles contain no reference to the real react packages', async () => {
    const { readFileSync } = await import('node:fs');
    const core = readFileSync(path.join(outDir, 'engine-core.mjs'), 'utf8');
    const components = readFileSync(path.join(outDir, 'engine-components.mjs'), 'utf8');
    for (const bundle of [core, components]) {
      expect(bundle).not.toMatch(/from\s*["']react["']/);
      expect(bundle).not.toMatch(/require\(["']react["']\)/);
      expect(bundle).not.toMatch(/from\s*["']react-dom/);
      expect(bundle).not.toMatch(/require\(["']react-dom/);
    }
  });
});
