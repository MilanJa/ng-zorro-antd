/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { execSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { emittedClasses, emittedClassesByFile } from '../build/v6/emitted-classes';

const componentsRoot = path.resolve(__dirname, '../../components');
const baselinePath = path.resolve(__dirname, '../build/v6/emitted-classes-baseline.json');

// Directories under `components/` that hold no user-facing template/host-binding classes: build
// tooling config (`core`'s own `theme/generated/*` re-lists every mapped prefix as a lookup table,
// not DOM this repo renders), i18n data, the version constant, and CDK/pipe utilities with no host
// template of their own. Every other directory is snapshotted, whether or not it currently emits any
// classes (a future plan mapping it needs its own baseline entry to exist already, or the guard would
// treat its entire class set as "new" and check all of it against the v4 CSS at once -- see the
// mapped-dir-missing check in `v4-rule-guard.spec.ts`).
const SKIPPED_UTILITY_DIRS = new Set([
  'core',
  'style',
  'i18n',
  'version',
  'cdk',
  'pipes',
  'experimental',
  'experimental-image'
]);

function componentDirNames(): string[] {
  return readdirSync(componentsRoot)
    .filter(name => !SKIPPED_UTILITY_DIRS.has(name))
    .filter(name => statSync(path.join(componentsRoot, name)).isDirectory())
    .sort();
}

/**
 * Snapshots every directory under `components/` (except the build-tooling/utility ones named above)
 * for `v4-rules.ts`'s `v4StyledClasses` guard: only classes a directory emits AFTER this baseline are
 * checked against the compiled v4 CSS, so a class the guard already let through at an earlier plan
 * does not need re-litigating every run. Snapshotting every component directory, not just the
 * currently mapped ones, means a directory newly mapped by a later plan already has a baseline entry
 * (its pre-existing v4-styled classes are not misread as "new" the day it gets mapped). Regenerated
 * only at a plan's end (`npm run v6:update-baseline`), so it becomes the next plan's starting point --
 * never mid-plan.
 */
function main(): void {
  const classes: Record<string, string[]> = {};
  const files: Record<string, Record<string, string[]>> = {};
  for (const dir of componentDirNames()) {
    classes[dir] = emittedClasses(dir).sort();
    files[dir] = emittedClassesByFile(dir);
  }
  const baseArg = process.argv.indexOf('--base');
  const base =
    baseArg >= 0 && process.argv[baseArg + 1]
      ? process.argv[baseArg + 1]
      : execSync('git rev-parse HEAD', { cwd: path.resolve(__dirname, '../..') })
          .toString()
          .trim();
  const baseline = { generatedAt: new Date().toISOString(), base, classes, files };
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Wrote ${baselinePath} at ${base} (${Object.keys(classes).length} directories).`);
}

main();
