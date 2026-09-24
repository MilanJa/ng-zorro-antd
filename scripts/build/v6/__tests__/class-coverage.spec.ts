/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';
import { readManifest } from '../manifest';

const componentsRoot = path.resolve(__dirname, '../../../../components');
const allowlist = JSON.parse(readFileSync(path.resolve(__dirname, '../class-allowlist.json'), 'utf8')) as Record<
  string,
  string[]
>;

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d)) {
      const full = path.join(d, entry);
      if (statSync(full).isDirectory()) {
        if (!['demo', 'doc', 'style', 'testing'].includes(entry)) {
          walk(full);
        }
      } else if (/\.(component|directive|service)\.ts$|\.html$/.test(entry) && !entry.endsWith('.spec.ts')) {
        out.push(full);
      }
    }
  };
  walk(path.join(componentsRoot, dir));
  return out;
}

/** `ant-*` literals a component can put on the DOM. */
export function emittedClasses(dir: string): string[] {
  const names = new Set<string>();
  for (const file of sourceFiles(dir)) {
    // Class names must be written as complete literals, not template-literal interpolations
    // (e.g. `` `ant-btn-color-${color}` ``): this regex scans raw source text, so it would
    // otherwise capture the partial token before `${` (e.g. `ant-btn-color-`) as if it were a
    // real class.
    for (const m of readFileSync(file, 'utf8').matchAll(/\bant-[a-z][a-z0-9-]*/g)) {
      names.add(m[0]);
    }
  }
  return [...names].sort();
}

describe('class coverage of migrated components', () => {
  const manifest = readManifest();
  const styled = new Set(Object.values(manifest.components).flatMap(c => c.classes));

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
