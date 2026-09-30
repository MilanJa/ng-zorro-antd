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

const v4Css = path.resolve(__dirname, '../../../../publish/ng-zorro-antd.css');
const skip = !existsSync(v4Css);

describe.skipIf(skip)('no new v6 class turns on a v4 rule (run build-lib first)', () => {
  const styledByV4 = v4StyledClasses(readFileSync(v4Css, 'utf8'));
  const baseline = emittedClassesBaseline();
  for (const dir of v6ComponentDirs) {
    it(`${dir}: classes emitted since the baseline are not styled by the compiled v4 CSS`, () => {
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
