/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  renderedPrefixStyleOwner,
  v6Components,
  v6PatchDependencies,
  type V6ComponentDir,
  type V6ComponentEntry
} from './components';
import type { V6Manifest } from './manifest';

const matchesPrefixOrEqual = (cls: string, prefix: string): boolean => cls === prefix || cls.startsWith(`${prefix}-`);

/**
 * The classes that style `dir`'s own emitted/rendered DOM, scoped to what `dir` itself actually
 * renders -- never a flat union of every migrated component's classes
 * (`Object.values(manifest.components).flatMap(...)`), which let an unrelated component's CSS count
 * towards a class it merely happens to select somewhere (color-picker's own v6 CSS mentions
 * `.ant-select-selector` in a rule scoped to its own format-select row; that is not a real dependency
 * of `select`, `cascader` or `tree-select` and must not clear the class off their allowlists). The set
 * is the union of:
 * - `dir`'s own manifest classes;
 * - the classes of every directory `v6PatchDependencies(dir)` names (its alias host and its mapped
 *   `renderedPrefixes` owners for BUNDLING -- the same dependency graph `publish/<dir>/style/v6/index.css`
 *   carries);
 * - for each of `dir`'s `renderedPrefixes` entries `P`, the classes starting with `P-` (or equal to `P`)
 *   from `renderedPrefixStyleOwner(P)`'s manifest -- the directory whose antd extraction actually
 *   generates CSS under `P`, which is not always the same as `P`'s bundling owner (`ant-select-tree`'s
 *   structural classes are only ever extracted by rendering TreeSelect, so `tree`'s own coverage credits
 *   `tree-select`'s manifest for them, even though `tree`'s *bundle* does not carry `tree-select`'s patch);
 * - `dir`'s own compact-item classes (`<prefixCls>-compact-*`), which antd generates once, in Space's
 *   extraction (`node_modules/antd/es/style/compact-item.js`'s `genCompactItemStyle`, invoked by every
 *   component that supports `Space.Compact`, including `dir`'s own), never in `dir`'s own manifest entry.
 */
export function styledClassesFor(dir: V6ComponentDir, manifest: V6Manifest): Set<string> {
  const entry: V6ComponentEntry = v6Components[dir];
  const styled = new Set(manifest.components[dir]?.classes ?? []);
  for (const dep of v6PatchDependencies(dir)) {
    for (const cls of manifest.components[dep]?.classes ?? []) {
      styled.add(cls);
    }
  }
  for (const prefix of entry.renderedPrefixes ?? []) {
    const owner = renderedPrefixStyleOwner(prefix);
    for (const cls of manifest.components[owner ?? '']?.classes ?? []) {
      if (matchesPrefixOrEqual(cls, prefix)) {
        styled.add(cls);
      }
    }
  }
  const compactPrefix = `${entry.prefixCls}-compact-`;
  for (const cls of manifest.components['space']?.classes ?? []) {
    if (cls.startsWith(compactPrefix)) {
      styled.add(cls);
    }
  }
  return styled;
}

/**
 * The allowlist entries that may explain a class rendered by `dir`: its own entries plus, for each
 * prefix in its `renderedPrefixes`, the entries of that prefix's style owner that start with the
 * prefix. A directory that mounts select, radio or pagination therefore does not re-list the
 * owner's unstyled classes; the owner's `_<dir>_comment` is the single place that explains them.
 */
export function allowlistFor(dir: string, allowlist: Record<string, string[]>): Set<string> {
  const out = new Set(allowlist[dir] ?? []);
  // `dir` is not always a mapped directory (`renderedCoverageGaps` is called with every requested
  // dir, mapped or not -- a later plan's unmapped component has no `renderedPrefixes` to credit
  // from, not a bug to throw on).
  const entry = (v6Components as Record<string, V6ComponentEntry>)[dir];
  for (const prefix of entry?.renderedPrefixes ?? []) {
    const owner = renderedPrefixStyleOwner(prefix);
    if (!owner || owner === dir) continue;
    for (const cls of allowlist[owner] ?? []) {
      if (cls === prefix || cls.startsWith(`${prefix}-`)) out.add(cls);
    }
  }
  return out;
}

export function renderedCoverageGaps(
  rendered: Record<string, string[]>,
  styled: Set<string>,
  allowlist: Record<string, string[]>,
  dirs: string[]
): Record<string, string[]> {
  const gaps: Record<string, string[]> = {};
  for (const dir of dirs) {
    const allowed = allowlistFor(dir, allowlist);
    gaps[dir] = (rendered[dir] ?? []).filter(c => !styled.has(c) && !allowed.has(c)).sort();
  }
  return gaps;
}

/** What `attributeRenderedClasses` needs from a `v6Components` entry. */
export interface RenderedClassOwner {
  prefixCls: string;
  renderedPrefixes?: readonly string[];
}

const matchesPrefix = (cls: string, prefix: string): boolean => cls === prefix || cls.startsWith(`${prefix}-`);

/**
 * Keeps the rendered `ant-*` classes that belong to `dir`: those under its `prefixCls` or one of its
 * `renderedPrefixes` (classes a component renders outside its own antd prefix, e.g. popconfirm's
 * `ant-popover-*`), minus classes that a *longer* prefix owned by another mapped component also matches
 * (`ant-input-number-*` belongs to input-number, not to input). Deduplicated and sorted.
 */
export function attributeRenderedClasses(
  dir: string,
  classes: Iterable<string>,
  components: Readonly<Record<string, RenderedClassOwner>>
): string[] {
  const prefixesOf = (entry: RenderedClassOwner): string[] => [entry.prefixCls, ...(entry.renderedPrefixes ?? [])];
  const own = prefixesOf(components[dir]);
  // Only another component's *own* prefix competes: a `renderedPrefixes` entry means that component
  // borrows those classes (tree-select renders `ant-select-*`), which must not take them away from
  // the component that owns them.
  const others = Object.entries(components)
    .filter(([other]) => other !== dir)
    .map(([, entry]) => entry.prefixCls);
  return [...new Set(classes)]
    .filter(cls => {
      const ownLength = Math.max(-1, ...own.filter(prefix => matchesPrefix(cls, prefix)).map(p => p.length));
      return ownLength >= 0 && !others.some(prefix => prefix.length > ownLength && matchesPrefix(cls, prefix));
    })
    .sort();
}
