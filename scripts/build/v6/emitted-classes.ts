/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const componentsRoot = path.resolve(__dirname, '../../../components');
const SKIPPED_DIRS = new Set(['demo', 'doc', 'style', 'testing']);

/** Source files of a component directory that can emit `ant-*` classes: every .ts/.html except specs. */
export function sourceFiles(dir: string, root: string = componentsRoot): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const entry of readdirSync(d)) {
      const full = path.join(d, entry);
      if (statSync(full).isDirectory()) {
        if (!SKIPPED_DIRS.has(entry)) {
          walk(full);
        }
      } else if (/\.(ts|html)$/.test(entry) && !entry.endsWith('.spec.ts')) {
        out.push(full);
      }
    }
  };
  walk(path.join(root, dir));
  return out;
}

/**
 * `ant-*` class tokens written as complete literals in the component's sources. A token must not be
 * a prefix to a template-literal interpolation (e.g. `ant-btn-color-` from `` `ant-btn-color-${color}` ``)
 * or continue into a hyphenated word: the regex matches only tokens where the next character after the
 * final alphanumeric is neither alphanumeric nor hyphen. The rendered-class check
 * (tools/v6-compare/collect-classes.ts) covers runtime-built names.
 */
export function emittedClasses(dir: string, root: string = componentsRoot): string[] {
  const names = new Set<string>();
  for (const file of sourceFiles(dir, root)) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\bant-[a-z][a-z0-9-]*[a-z0-9](?![a-z0-9-])/g)) {
      names.add(m[0]);
    }
  }
  return [...names].sort();
}
