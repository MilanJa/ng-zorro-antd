/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { V6Manifest } from './manifest';

/**
 * The classes that style `dir`'s own emitted/rendered DOM: `dir`'s own manifest classes plus those
 * of every directory `patchDependencies(dir)` names (its alias host and its mapped `renderedPrefixes`
 * owners -- the same dependency graph `publish/<dir>/style/v6/index.css` bundles, so "styled for this
 * directory" tracks exactly what that directory's own published bundle carries). This replaces the flat
 * union of every migrated component's classes (`Object.values(manifest.components).flatMap(...)`),
 * which made an unrelated component's CSS count towards a class it merely happens to select somewhere:
 * color-picker's own v6 CSS mentions `.ant-select-selector` in a rule scoped to its format-select row,
 * which is not select's own dependency and must not clear `ant-select-selector` off select's,
 * cascader's or tree-select's allowlist (plan C finding M8).
 */
export function styledClassesFor<D extends string>(
  dir: D,
  manifest: V6Manifest,
  patchDependencies: (dir: D) => D[]
): Set<string> {
  const styled = new Set(manifest.components[dir]?.classes ?? []);
  for (const dep of patchDependencies(dir)) {
    for (const cls of manifest.components[dep]?.classes ?? []) {
      styled.add(cls);
    }
  }
  return styled;
}

export function renderedCoverageGaps(
  rendered: Record<string, string[]>,
  styled: Set<string>,
  allowlist: Record<string, string[]>,
  dirs: string[]
): Record<string, string[]> {
  const gaps: Record<string, string[]> = {};
  for (const dir of dirs) {
    const allowed = new Set(allowlist[dir] ?? []);
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
