/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../build/v6/components';
import { emittedClasses } from '../build/v6/emitted-classes';

const baselinePath = path.resolve(__dirname, '../build/v6/emitted-classes-baseline.json');

/**
 * Snapshots every mapped directory's emitted `ant-*` classes at the current commit, for
 * `v4-rules.ts`'s `v4StyledClasses` guard: only classes a directory emits AFTER this baseline are
 * checked against the compiled v4 CSS, so a class the guard already let through at an earlier plan
 * does not need re-litigating every run. Regenerated only at a plan's end (`npm run
 * v6:update-baseline`), so it becomes the next plan's starting point -- never mid-plan.
 */
function main(): void {
  const classes: Record<string, string[]> = {};
  for (const dir of v6ComponentDirs) {
    classes[dir] = emittedClasses(dir).sort();
  }
  const base = execSync('git rev-parse HEAD', { cwd: path.resolve(__dirname, '../..') })
    .toString()
    .trim();
  const baseline = { generatedAt: new Date().toISOString(), base, classes };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Wrote ${baselinePath} at ${base}.`);
}

main();
