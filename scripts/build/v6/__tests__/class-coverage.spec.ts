/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs, type V6ComponentDir } from '../components';
import { emittedClasses } from '../emitted-classes';
import { readManifest } from '../manifest';
import { allowlistFor, renderedCoverageGaps, styledClassesFor } from '../rendered-coverage';

const allowlist = JSON.parse(readFileSync(path.resolve(__dirname, '../class-allowlist.json'), 'utf8')) as Record<
  string,
  string[]
>;
const manifest = readManifest();

describe('class coverage of migrated components', () => {
  for (const dir of v6ComponentDirs) {
    it(`${dir}: every emitted ant-* class is styled by v6 CSS or allowlisted`, () => {
      const dirStyled = styledClassesFor(dir, manifest);
      const allowed = allowlistFor(dir, allowlist);
      const missing = emittedClasses(dir).filter(c => !dirStyled.has(c) && !allowed.has(c));
      expect(missing, `unstyled classes emitted by ${dir}`).toEqual([]);
    });
  }

  it('allowlist contains no class that v6 CSS now styles (stale entries)', () => {
    for (const [dir, classes] of Object.entries(allowlist)) {
      if (dir.startsWith('_') || !v6ComponentDirs.includes(dir as V6ComponentDir)) continue;
      const dirStyled = styledClassesFor(dir as V6ComponentDir, manifest);
      const stale = classes.filter(c => dirStyled.has(c));
      expect(stale, `${dir} allowlist`).toEqual([]);
    }
  });

  // `renderedPrefixStyleOwner('ant-select-tree')` resolves to `tree-select` (the only directory whose
  // antd extraction ever renders under that prefix), so tree's own coverage set gains its structural
  // classes without tree's *bundle* needing to carry tree-select's patch.
  it('styledClassesFor credits a renderedPrefixes style owner (tree via tree-select)', () => {
    const treeStyled = styledClassesFor('tree', manifest);
    expect(treeStyled.has('ant-select-tree-treenode')).toBe(true);
  });

  // select's own manifest never gets `.ant-select-selector`/`.ant-select-arrow` (v6 draws the box and
  // positions the arrow itself, with no CSS rule for either bare class -- see select's own
  // `style/v6/patch.css`), so neither cascader's nor tree-select's per-directory set gains them via
  // their dependency on `select`; color-picker (unrelated to either) is never consulted at all.
  it('styledClassesFor does not credit cascader/tree-select with select-selector/-arrow', () => {
    const cascaderStyled = styledClassesFor('cascader', manifest);
    const treeSelectStyled = styledClassesFor('tree-select', manifest);
    expect(cascaderStyled.has('ant-select-selector')).toBe(false);
    expect(cascaderStyled.has('ant-select-arrow')).toBe(false);
    expect(treeSelectStyled.has('ant-select-selector')).toBe(false);
    expect(treeSelectStyled.has('ant-select-arrow')).toBe(false);
  });

  // antd generates every component's compact-item rules once, in Space's own extraction
  // (`genCompactItemStyle`), never in the component's own manifest entry; the compact-family union
  // credits button with its `-compact-first-item`/`-last-item` classes from `space`'s manifest.
  it('styledClassesFor credits the compact-item family from space', () => {
    const buttonStyled = styledClassesFor('button', manifest);
    expect(buttonStyled.has('ant-btn-compact-first-item')).toBe(true);
    expect(buttonStyled.has('ant-btn-compact-last-item')).toBe(true);
  });

  // `button` is the reference-aligned component: its host now emits antd v6's colour/variant
  // classes for every type/danger combination. What remains on the allowlist is pinned to the
  // exact set of legacy, backward-compatibility-only classes that even upstream antd v6 itself
  // emits without a corresponding CSS rule (verified against node_modules/antd/es/button, e.g.
  // `ButtonTypeMap.link` maps `type="link"` to color `link`, which variant.js never styles, and
  // Button.js keeps `${prefixCls}-${mergedType}`/`${prefixCls}-dangerous` purely "compatible with
  // versions earlier than 5.21.0"). It must not grow beyond this pinned set.
  it('button allowlist is pinned to known backward-compatibility classes', () => {
    expect(allowlist['button']).toEqual([
      'ant-btn-color-link',
      'ant-btn-dangerous',
      'ant-btn-dashed',
      'ant-btn-default',
      'ant-btn-link',
      'ant-btn-rtl',
      'ant-btn-text'
    ]);
  });
});

describe('allowlistFor', () => {
  it("credits a directory with its rendered-prefix owner's allowlist for that prefix", () => {
    const rendered = { calendar: ['ant-picker-calendar', 'ant-select-selection-search-mirror'] };
    const styled = new Set(['ant-picker-calendar']);
    // calendar renders `ant-select`; select owns that prefix's styles and already explains every
    // `ant-select-*` class on its own allowlist (both entries here), so calendar's own allowlist does
    // not need to repeat either of them.
    const allowlist = {
      select: ['ant-select-selection-search-mirror', 'ant-select-unrelated'],
      calendar: [] as string[]
    };
    expect(allowlistFor('calendar', allowlist)).toEqual(
      new Set(['ant-select-selection-search-mirror', 'ant-select-unrelated'])
    );
    expect(renderedCoverageGaps(rendered, styled, allowlist, ['calendar'])).toEqual({ calendar: [] });
  });
});

describe('renderedCoverageGaps', () => {
  const sample = JSON.parse(
    readFileSync(path.resolve(__dirname, 'fixtures/rendered-classes.sample.json'), 'utf8')
  ).components;
  it('reports rendered classes that are neither styled nor allowlisted, only for mapped components', () => {
    const gaps = renderedCoverageGaps(sample, new Set(['ant-btn', 'ant-btn-color-primary']), { button: [] }, [
      'button'
    ]);
    expect(gaps).toEqual({ button: ['ant-btn-mystery'] });
  });
  it('honours the allowlist and ignores unmapped components in the file', () => {
    const gaps = renderedCoverageGaps(
      sample,
      new Set(['ant-btn', 'ant-btn-color-primary']),
      { button: ['ant-btn-mystery'] },
      ['button']
    );
    // `toEqual` also proves the unrequested `table` entry of the sample is not reported.
    expect(gaps).toEqual({ button: [] });
  });
  it('reports no gaps for a requested component that has no rendered data', () => {
    expect(sample['space']).toBeUndefined();
    const gaps = renderedCoverageGaps(sample, new Set(['ant-btn', 'ant-btn-color-primary']), { button: [] }, [
      'button',
      'space'
    ]);
    expect(gaps).toEqual({ button: ['ant-btn-mystery'], space: [] });
  });
});

const renderedPath = path.resolve(__dirname, '../../../../tools/v6-compare/out/rendered-classes.json');
const renderedFile = existsSync(renderedPath)
  ? (JSON.parse(readFileSync(renderedPath, 'utf8')) as { generatedAt?: string; components: Record<string, string[]> })
  : null;
const rendered = renderedFile?.components ?? null;

describe('rendered class coverage (from tools/v6-compare/collect-classes)', () => {
  for (const dir of v6ComponentDirs) {
    it(`${dir}: every class rendered in the doc site is styled or allowlisted`, ctx => {
      if (!rendered?.[dir]) {
        ctx.skip('run tools/v6-compare/collect-classes.ts to enable');
      }
      const dirStyled = styledClassesFor(dir, manifest);
      const gaps = renderedCoverageGaps(rendered!, dirStyled, allowlist, [dir]);
      expect(
        gaps[dir],
        `unstyled classes rendered by ${dir} (rendered-classes.json generated at ${renderedFile?.generatedAt ?? 'unknown'}; re-run collect-classes.ts if stale)`
      ).toEqual([]);
    });
  }
});
