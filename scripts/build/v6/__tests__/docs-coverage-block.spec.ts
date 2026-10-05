/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { v6ComponentDirs } from '../components';
import { updateCoverageBlock } from '../generate-styles';

describe('updateCoverageBlock', () => {
  it('replaces the list between the markers and leaves the rest untouched', () => {
    const md = 'intro\n<!-- v6-components:start -->\n- `old`\n<!-- v6-components:end -->\noutro\n';
    expect(updateCoverageBlock(md, ['button', 'input'])).toBe(
      'intro\n<!-- v6-components:start -->\n- `button`\n- `input`\n<!-- v6-components:end -->\noutro\n'
    );
  });
  it('throws when markers are missing', () => {
    expect(() => updateCoverageBlock('no markers', ['button'])).toThrow(/v6-components:start/);
  });
});

describe('docs pages', () => {
  for (const lang of ['en-US', 'zh-CN']) {
    it(`customize-theme-v6.${lang}.md lists exactly the mapped components`, () => {
      const md = readFileSync(path.resolve(__dirname, `../../../../docs/customize-theme-v6.${lang}.md`), 'utf8');
      expect(updateCoverageBlock(md, [...v6ComponentDirs])).toBe(md);
    });
  }
});

describe('watermark', () => {
  it('stays unmapped and is named in both docs pages: antd 6 ships no style module for it', () => {
    const antdWatermark = path.resolve(__dirname, '../../../../node_modules/antd/es/watermark');
    expect(existsSync(path.join(antdWatermark, 'index.js'))).toBe(true);
    expect(existsSync(path.join(antdWatermark, 'style'))).toBe(false);
    expect(v6ComponentDirs as readonly string[]).not.toContain('watermark');
    for (const lang of ['en-US', 'zh-CN']) {
      const md = readFileSync(path.resolve(__dirname, `../../../../docs/customize-theme-v6.${lang}.md`), 'utf8');
      const prose = md.replace(/<!-- v6-components:start -->[\s\S]*<!-- v6-components:end -->/, '');
      expect(prose, lang).toMatch(/watermark/i);
    }
  });
});
