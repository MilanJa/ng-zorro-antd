/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';
import { emittedClasses } from '../emitted-classes';
import { emittedClassesBaseline, v4StyledClasses } from '../v4-rules';

// This guard only sees classes written as complete lowercase literals in a component's `.ts`/`.html`
// sources (`emitted-classes.ts`'s regex): a template-literal or helper-built class name (e.g.
// `` `${prefixCls}-x` ``, `getStatusClassNames(...)`, the compact-item directive's runtime class list)
// yields no token here and is invisible to this check. There is no rendered/runtime variant of this
// guard in this task; a class that only ever appears as a template-literal interpolation gets no
// automated coverage from this spec and must be checked against the compiled v4 CSS by hand.
const v4Css = path.resolve(__dirname, '../../../../publish/ng-zorro-antd.css');
const skip = !existsSync(v4Css);

describe.skipIf(skip)('no new v6 class turns on a v4 rule (run build-lib first)', () => {
  const styledByV4 = v4StyledClasses(readFileSync(v4Css, 'utf8'));
  const baseline = emittedClassesBaseline();
  for (const dir of v6ComponentDirs) {
    it(`${dir}: classes emitted since the baseline are not styled by the compiled v4 CSS`, () => {
      // A mapped directory absent from the baseline is not "nothing emitted before" (`?? []` would
      // silently check its ENTIRE current class set against v4 in one go, most of which the baseline
      // was supposed to have already cleared at an earlier plan) -- it means the baseline is stale for
      // this directory and must be regenerated at a plan start (`npm run v6:update-baseline`).
      expect(
        dir in baseline,
        `${dir} is missing from emitted-classes-baseline.json; regenerate the baseline at a plan start`
      ).toBe(true);
      const before = new Set(baseline[dir] ?? []);
      const added = emittedClasses(dir).filter(c => !before.has(c));
      const offending = added.filter(c => styledByV4.has(c));
      expect(offending, `mirror these in style/v6/patch.css instead of emitting them (${dir})`).toEqual([]);
    });
  }
});

describe('v4StyledClasses', () => {
  it('collects class selectors and ignores tokens inside declarations', () => {
    const set = v4StyledClasses('.ant-x-y:hover > .ant-x-z::after{content:"ant-not-a-class"} .ant-q{}');
    expect([...set].sort()).toEqual(['ant-q', 'ant-x-y', 'ant-x-z']);
  });
});
