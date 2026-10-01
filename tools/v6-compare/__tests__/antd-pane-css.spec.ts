/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import path from 'node:path';

import { buildV6Bundle } from '../../../scripts/build/v6/generate-styles';
import { antdPaneCss } from '../build-demos';

const componentsDir = path.resolve(__dirname, '../../../components');

describe('antdPaneCss', () => {
  it('excludes component patches (e.g. select moving its box off `.ant-select`) while keeping the template and tokens', async () => {
    const bundle = await buildV6Bundle('default', componentsDir);
    const css = antdPaneCss(bundle);

    // Distinctive declaration from components/select/style/v6/patch.css's `.ant-select` reset: it
    // relocates antd's select box onto `.ant-select-selector` for ng-zorro's DOM, which would strip
    // the border/height off real antd markup on the antd pane.
    expect(css).not.toContain('padding-inline: 0;\n  padding-block: 0;\n  border-radius: 0;');
    expect(bundle.componentPatches.join('\n')).toContain('.ant-select {');
    expect(css).not.toContain(bundle.globalPatch);

    expect(css).toContain(bundle.template);
    expect(css).toContain(bundle.tokens);
    expect(css).toContain('.ant-select');
    expect(css).toContain('--ant-color-primary');
  });
});
