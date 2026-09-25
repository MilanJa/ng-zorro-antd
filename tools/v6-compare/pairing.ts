/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

export interface DemoPairing {
  pairs: Array<{ key: string; antd: string }>;
  ngOnly: string[];
  antdOnly: string[];
}

/** Pairs ng-zorro demo keys with antd demo stems: explicit map entries first, then identical names. */
export function pairDemos(
  dir: string,
  ngDemos: string[],
  antdDemos: string[],
  map: Record<string, Record<string, string | null>>
): DemoPairing {
  const entry = map[dir] ?? {};
  const antdSet = new Set(antdDemos);
  const pairs: Array<{ key: string; antd: string }> = [];
  const ngOnly: string[] = [];
  const used = new Set<string>();
  for (const key of ngDemos) {
    const mapped = Object.prototype.hasOwnProperty.call(entry, key) && key !== '_antdDir' ? entry[key] : undefined;
    const target = mapped === undefined ? key : mapped;
    if (target !== null && antdSet.has(target)) {
      pairs.push({ key, antd: target });
      used.add(target);
    } else {
      ngOnly.push(key);
    }
  }
  return { pairs, ngOnly, antdOnly: antdDemos.filter(d => !used.has(d)) };
}
