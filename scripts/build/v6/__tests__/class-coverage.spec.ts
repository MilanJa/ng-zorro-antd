/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';
import { emittedClasses } from '../emitted-classes';
import { readManifest } from '../manifest';
import { renderedCoverageGaps } from '../rendered-coverage';

const allowlist = JSON.parse(readFileSync(path.resolve(__dirname, '../class-allowlist.json'), 'utf8')) as Record<
  string,
  string[]
>;
const manifest = readManifest();
const styled = new Set(Object.values(manifest.components).flatMap(c => c.classes));

describe('class coverage of migrated components', () => {
  for (const dir of v6ComponentDirs) {
    it(`${dir}: every emitted ant-* class is styled by v6 CSS or allowlisted`, () => {
      const allowed = new Set(allowlist[dir] ?? []);
      const missing = emittedClasses(dir).filter(c => !styled.has(c) && !allowed.has(c));
      expect(missing, `unstyled classes emitted by ${dir}`).toEqual([]);
    });
  }

  it('allowlist contains no class that v6 CSS now styles (stale entries)', () => {
    for (const [dir, classes] of Object.entries(allowlist)) {
      if (dir.startsWith('_')) continue;
      const stale = classes.filter(c => styled.has(c));
      expect(stale, `${dir} allowlist`).toEqual([]);
    }
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
      const gaps = renderedCoverageGaps(rendered!, styled, allowlist, [dir]);
      expect(
        gaps[dir],
        `unstyled classes rendered by ${dir} (rendered-classes.json generated at ${renderedFile?.generatedAt ?? 'unknown'}; re-run collect-classes.ts if stale)`
      ).toEqual([]);
    });
  }
});
