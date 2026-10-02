/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { v6Components, v6ComponentDirs, type V6ComponentEntry } from '../components';
import { joinTemplate, splitBlocks } from '../css-postprocess';
import {
  assertEngineBudgets,
  buildComponentCss,
  componentBundlePatches,
  componentTemplate,
  componentTokenNamesFor,
  dropStylesThroughSource,
  generateStyles,
  normalizeCssVarRootCls,
  type V6Algorithm
} from '../generate-styles';
import { ENGINE_COMPONENTS_BUDGET, ENGINE_CORE_BUDGET, readManifest } from '../manifest';

const componentsDir = path.resolve(__dirname, '../../../../components');

describe('buildComponentCss', () => {
  it('appends the patch after the template, separated by a newline', () => {
    expect(buildComponentCss('.a{}', '.p{}')).toBe('.a{}\n.p{}');
  });
  it('returns the template alone when there is no patch', () => {
    expect(buildComponentCss('.a{}', null)).toBe('.a{}');
  });
  it('appends several patches in the given order and skips missing ones', () => {
    expect(buildComponentCss('.a{}', ['.p{}', null, '.q{}'])).toBe('.a{}\n.p{}\n.q{}');
    expect(buildComponentCss('.a{}', [])).toBe('.a{}');
  });
});

describe('componentBundlePatches', () => {
  const patchOf = (dir: string): string =>
    readFileSync(path.join(componentsDir, dir, 'style/v6/patch.css'), 'utf8').trim();

  it('carries the alias host patch for a preset without a patch of its own', () => {
    expect(componentBundlePatches(componentsDir, 'time-picker')).toEqual([patchOf('date-picker')]);
  });
  it('orders own and borrowed patches in map order', () => {
    expect(componentBundlePatches(componentsDir, 'tree-select')).toEqual([
      patchOf('select'),
      patchOf('tree'),
      patchOf('tree-select')
    ]);
    // button has no patch of its own; transfer's own patch sorts after checkbox and input.
    expect(componentBundlePatches(componentsDir, 'transfer')).toEqual([
      patchOf('checkbox'),
      patchOf('input'),
      patchOf('transfer')
    ]);
  });
  it('is the own patch alone for a component with no dependencies', () => {
    expect(componentBundlePatches(componentsDir, 'select')).toEqual([patchOf('select')]);
    expect(componentBundlePatches(componentsDir, 'rate')).toEqual([]);
  });
});

describe('componentTemplate with a stylesThrough entry', () => {
  // Until the map has real `timeline`/`steps` entries, inject a fixture `steps` entry into the map
  // for the duration of the test (there is no `v6Components` setter: this is a plain object at
  // runtime despite its `as const` type).
  it('gets the source component rules under its own prefix', () => {
    const components = v6Components as unknown as Record<string, V6ComponentEntry>;
    const hadSteps = Object.prototype.hasOwnProperty.call(components, 'steps');
    const previousSteps = components['steps'];
    components['steps'] = { antd: ['Steps'], prefixCls: 'ant-steps' };
    try {
      const fixtureEntry: V6ComponentEntry = {
        antd: ['Timeline'],
        prefixCls: 'ant-timeline',
        stylesThrough: { dir: 'steps' as never, from: 'ant-steps', to: 'ant-timeline' }
      };
      const css = componentTemplate('timeline' as never, fixtureEntry);
      expect(css).toMatch(/\.ant-timeline-item-icon\{/);
      expect(css).not.toMatch(/\.ant-steps/);
    } finally {
      if (hadSteps) {
        components['steps'] = previousSteps;
      } else {
        delete components['steps'];
      }
    }
  });

  // `componentTokenNamesFor`'s union needs a SOURCE whose antd name is actually registered in the
  // engine (`componentTokenNames` reads `engine-components.ts`'s registry, built from the real map);
  // `steps`/`Steps` is not registered until a later plan maps it for real, so this fixture borrows
  // an already-mapped component (`button`) as the `stylesThrough` source to exercise the real union
  // mechanism against real data, rather than asserting against Steps tokens that do not exist yet.
  it("componentTokenNamesFor unions the entry's own tokens with the stylesThrough source's", async () => {
    const fixtureEntry: V6ComponentEntry = {
      antd: ['Avatar'],
      prefixCls: 'ant-avatar',
      stylesThrough: { dir: 'button', from: 'ant-btn', to: 'ant-avatar' }
    };
    const names = await componentTokenNamesFor('avatar', fixtureEntry);
    // `--ant-button-content-font-size` is one of Button's real registered tokens (verified by
    // printing `componentTokenNames('Button')` while writing this test).
    expect(names).toEqual(expect.arrayContaining(['--ant-button-content-font-size']));
    expect(names.some(n => n.startsWith('--ant-avatar-'))).toBe(true);
  });
});

describe('dropStylesThroughSource', () => {
  it('filters a selector list item by item, keeping the own half of a mixed rule', () => {
    const blocks = splitBlocks('.ant-timeline-x,.ant-steps-y{a:1}.ant-steps-z{b:2}.ant-timeline-w{c:3}');
    const out = joinTemplate(dropStylesThroughSource(blocks, 'ant-steps'));
    expect(out).toContain('.ant-timeline-x{a:1}');
    expect(out).toContain('.ant-timeline-w{c:3}');
    expect(out).not.toMatch(/\.ant-steps/);
  });

  it('drops a block entirely only once every selector in its list is filtered out', () => {
    const blocks = splitBlocks('.ant-steps-a,.ant-steps-b{a:1}');
    expect(dropStylesThroughSource(blocks, 'ant-steps')).toEqual([]);
  });
});

describe('normalizeCssVarRootCls', () => {
  it('rewrites a single-selector rule to the attribute-selector form', () => {
    expect(normalizeCssVarRootCls('.ant-input-css-var{box-sizing:border-box;}')).toBe(
      ':is([class^="ant-input"],[class*=" ant-input"]){box-sizing:border-box;}'
    );
  });
  it('rewrites every occurrence in a selector list', () => {
    expect(normalizeCssVarRootCls('.ant-input-css-var,.ant-select-css-var{box-sizing:border-box;}')).toBe(
      ':is([class^="ant-input"],[class*=" ant-input"]),:is([class^="ant-select"],[class*=" ant-select"]){box-sizing:border-box;}'
    );
  });
  it('rewrites the root class inside a descendant selector', () => {
    expect(normalizeCssVarRootCls('.ant-input-css-var [class^="ant-input"]{box-sizing:border-box;}')).toBe(
      ':is([class^="ant-input"],[class*=" ant-input"]) [class^="ant-input"]{box-sizing:border-box;}'
    );
  });
  it('leaves an unrelated class that merely starts with the same prefix untouched', () => {
    expect(normalizeCssVarRootCls('.ant-input-css-var-foo{color:red;}')).toBe('.ant-input-css-var-foo{color:red;}');
  });
});

describe('assertEngineBudgets', () => {
  it('accepts sizes at the budgets', () => {
    expect(() =>
      assertEngineBudgets({ engineCoreBytes: ENGINE_CORE_BUDGET, engineComponentsBytes: ENGINE_COMPONENTS_BUDGET })
    ).not.toThrow();
  });
  it('names the core budget when engine-core is too large', () => {
    expect(() => assertEngineBudgets({ engineCoreBytes: ENGINE_CORE_BUDGET + 1, engineComponentsBytes: 0 })).toThrow(
      /ENGINE_CORE_BUDGET/
    );
  });
  it('names the components budget when engine-components is too large', () => {
    expect(() =>
      assertEngineBudgets({ engineCoreBytes: 0, engineComponentsBytes: ENGINE_COMPONENTS_BUDGET + 1 })
    ).toThrow(/ENGINE_COMPONENTS_BUDGET/);
  });
  it('is enforced by generateStyles before anything is written', async () => {
    const publishDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-budget-'));
    try {
      await expect(
        generateStyles({
          publishDir,
          componentsDir,
          checkManifest: false,
          engineSizes: { coreBytes: ENGINE_CORE_BUDGET + 1, componentsBytes: 0 }
        })
      ).rejects.toThrow(/v6 engine size budget exceeded[\s\S]*ENGINE_CORE_BUDGET/);
      expect(existsSync(path.join(publishDir, 'ng-zorro-antd.v6.css'))).toBe(false);
    } finally {
      rmSync(publishDir, { recursive: true, force: true });
    }
  });
});

describe('generateStyles', () => {
  const publishDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-publish-'));
  let result: Awaited<ReturnType<typeof generateStyles>>;

  beforeAll(async () => {
    result = await generateStyles({
      publishDir,
      componentsDir,
      updateManifest: false,
      checkManifest: false,
      engineSizes: { coreBytes: 0, componentsBytes: 0 }
    });
  });
  afterAll(() => rmSync(publishDir, { recursive: true, force: true }));

  it('writes per-component css and min.css for every mapped component', () => {
    for (const dir of v6ComponentDirs) {
      expect(existsSync(path.join(publishDir, dir, 'style/v6/index.css')), dir).toBe(true);
      expect(existsSync(path.join(publishDir, dir, 'style/v6/index.min.css')), dir).toBe(true);
    }
  });

  it('appends select patch rules after the template and none for button', () => {
    const select = readFileSync(path.join(publishDir, 'select/style/v6/index.css'), 'utf8');
    const patch = readFileSync(path.join(componentsDir, 'select/style/v6/patch.css'), 'utf8').trim();
    expect(select.trimEnd().endsWith(patch)).toBe(true);
    const templateAt = select.indexOf('.ant-select-dropdown{');
    const patchAt = select.indexOf(patch);
    expect(templateAt).toBeGreaterThanOrEqual(0);
    expect(patchAt).toBeGreaterThanOrEqual(0);
    expect(templateAt).toBeLessThan(patchAt);
    expect(result.perComponent['button']).not.toContain('/* antd positions popups');
  });

  // Every CDK-positioned popup root needs its `position: relative` patch rule in the standalone
  // bundle of each component that opens it, including presets and components that borrow the popup.
  const popupRoots: Record<string, string> = {
    'auto-complete': '.ant-select-dropdown',
    cascader: '.ant-select-dropdown',
    'color-picker': '.ant-popover',
    'date-picker': '.ant-picker-dropdown',
    mention: '.ant-mentions-dropdown',
    popconfirm: '.ant-popover',
    popover: '.ant-popover',
    select: '.ant-select-dropdown',
    slider: '.ant-tooltip',
    'time-picker': '.ant-picker-dropdown',
    tooltip: '.ant-tooltip',
    'tree-select': '.ant-select-dropdown'
  };
  for (const [dir, root] of Object.entries(popupRoots)) {
    it(`${dir}: the standalone bundle keeps ${root} position: relative`, () => {
      const css = readFileSync(path.join(publishDir, dir, 'style/v6/index.css'), 'utf8');
      const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(css).toMatch(new RegExp(`(^|[\\n,}])\\s*${escaped}\\s*(,[^{]*)?\\{[^}]*position:\\s*relative`));
    });
  }

  it('writes the bundle and the style/v6 files with attribution headers', () => {
    for (const f of [
      'ng-zorro-antd.v6.css',
      'ng-zorro-antd.v6.min.css',
      'style/v6/template.css',
      'style/v6/tokens.default.css',
      'style/v6/tokens.dark.css',
      'style/v6/tokens.compact.css',
      'style/v6/patch.css'
    ]) {
      expect(existsSync(path.join(publishDir, f)), f).toBe(true);
    }
    expect(readFileSync(path.join(publishDir, 'style/v6/template.css'), 'utf8')).toMatch(
      /^\/\*! Generated from Ant Design 6\.6\.5/
    );
  });

  it('declares every variable block on :root and no antd scoping survives', () => {
    for (const name of ['default', 'dark', 'compact'] as const) {
      const css = result.tokens[name];
      expect(css).not.toMatch(/css-var-|-css-var/);
      expect(css.split('\n').filter(l => l.startsWith(':root{')).length).toBeGreaterThan(0);
    }
    expect(result.template).not.toMatch(/css-var-|-css-var/);
  });

  it('dark tokens differ from default while the template is shared', () => {
    expect(result.tokens.dark).not.toBe(result.tokens.default);
    expect(result.bundle).toContain(result.template.split('\n')[1]);
    expect(result.bundle).toContain(result.tokens.default.split('\n')[0]);
  });

  it('includes every mapped component patch in the bundle, not just the template', () => {
    // space's patch (nz-space-item display) and select's patch (CDK overlay positioning) must both be
    // reachable from the single bundled stylesheet, since an app may import only the bundle.
    expect(result.bundle).toContain('nz-space-item');
    expect(result.bundle).toContain('.ant-select-dropdown {');
  });

  describe('buildV6Bundle', () => {
    it('composes template, component patches, tokens and global patch in that order', async () => {
      const { buildV6Bundle } = await import('../generate-styles');
      const bundle = await buildV6Bundle('default', componentsDir);
      const parts = [bundle.template, ...bundle.componentPatches, bundle.tokens, bundle.globalPatch];
      expect(bundle.css).toBe(parts.join('\n'));
      expect(bundle.template).toContain('.ant-btn');
      expect(bundle.componentPatches.join('\n')).toContain('nz-space-item');
      expect(bundle.tokens).toMatch(/^:root\{--ant-/m);
      expect(bundle.globalPatch).toContain('.cdk-overlay-container');
    });

    it('dark and compact bundles share the template and differ only in tokens', async () => {
      const { buildV6Bundle } = await import('../generate-styles');
      const [d, dark, compact] = await Promise.all(
        ['default', 'dark', 'compact'].map(a => buildV6Bundle(a as V6Algorithm, componentsDir))
      );
      expect(dark.template).toBe(d.template);
      expect(compact.template).toBe(d.template);
      expect(dark.tokens).not.toBe(d.tokens);
      expect(compact.tokens).not.toBe(d.tokens);
      expect(dark.tokens).toContain('--ant-color-bg-container:#141414');
    });
  });
});

describe('generateStyles manifest check', () => {
  it('throws with the changed entries when the manifest is out of date', async () => {
    const workDir = mkdtempSync(path.join(os.tmpdir(), 'nz-v6-manifest-'));
    const committed = readManifest();
    const stale = structuredClone(committed);
    const removed = stale.components['button'].classes.shift()!;
    const manifestPath = path.join(workDir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify(stale));
    try {
      const run = generateStyles({
        publishDir: path.join(workDir, 'publish'),
        componentsDir,
        manifestPath,
        engineSizes: { coreBytes: committed.engineCoreBytes, componentsBytes: committed.engineComponentsBytes }
      });
      await expect(run).rejects.toThrow('v6 manifest is out of date');
      await expect(run).rejects.toThrow(`button: +class ${removed}`);
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  });
});
