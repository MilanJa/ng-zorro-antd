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
