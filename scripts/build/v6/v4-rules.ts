/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { V6ComponentDir } from './components';

const baselinePath = path.resolve(__dirname, 'emitted-classes-baseline.json');

export interface EmittedClassesBaseline {
  generatedAt: string;
  base: string;
  classes: Record<string, string[]>;
}

/** `scripts/tasks/v6-emitted-baseline.ts`'s output: each directory's emitted classes at the plan base. */
export function emittedClassesBaseline(file: string = baselinePath): Record<V6ComponentDir, string[]> {
  const baseline = JSON.parse(readFileSync(file, 'utf8')) as EmittedClassesBaseline;
  return baseline.classes as Record<V6ComponentDir, string[]>;
}

/**
 * Every `ant-*` token that appears as a class selector in compiled CSS (`.ant-x-y`, including inside a
 * compound or combinator chain), collected from `publish/ng-zorro-antd.css` -- the v4 stylesheet a new
 * v6-only class must never also be styled by, since v4 stays the default stylesheet until sub-project 3
 * (dual rendering). The lookahead `(?![a-zA-Z0-9-])` stops a shorter token matching inside a longer
 * class name (`.ant-x` must not match inside `.ant-x-y`), and the leading `\.` anchors the match to a
 * class selector rather than a string inside a declaration value (e.g. `content: "ant-not-a-class"`,
 * which has no leading `.`).
 */
export function v4StyledClasses(css: string): Set<string> {
  const classes = new Set<string>();
  for (const m of css.matchAll(/\.(ant-[a-z](?:[a-z0-9-]*[a-z0-9])?)(?![a-zA-Z0-9-])/g)) {
    classes.add(m[1]);
  }
  return classes;
}
