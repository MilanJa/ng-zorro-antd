/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

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
  const others = Object.entries(components)
    .filter(([other]) => other !== dir)
    .flatMap(([, entry]) => prefixesOf(entry));
  return [...new Set(classes)]
    .filter(cls => {
      const ownLength = Math.max(-1, ...own.filter(prefix => matchesPrefix(cls, prefix)).map(p => p.length));
      return ownLength >= 0 && !others.some(prefix => prefix.length > ownLength && matchesPrefix(cls, prefix));
    })
    .sort();
}
