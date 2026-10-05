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

    expect(css).toContain(bundle.antdTemplate);
    expect(css).toContain(bundle.tokens);
    expect(css).toContain('.ant-select');
    expect(css).toContain('--ant-color-primary');
  });

  it("leaves a stylesThrough copy (Steps' rules under ant-timeline) off the pane but keeps antd's own rules", async () => {
    const bundle = await buildV6Bundle('default', componentsDir);
    const css = antdPaneCss(bundle);
    // antd's Timeline root is `ant-steps … ant-steps-dot ant-timeline` with no `ant-timeline-dot`, so this
    // copied rule would paint every antd dot with the filled-icon background and border.
    const copied =
      '.ant-timeline:not(.ant-timeline-dot) .ant-timeline-item:not(.ant-timeline-item-custom) .ant-timeline-item-icon{';

    expect(bundle.template).toContain(copied);
    expect(css).not.toContain(copied);
    expect(css).toContain(bundle.antdTemplate);
    expect(css).toContain('.ant-steps.ant-steps-dot .ant-steps-item-icon{');
    expect(css).toContain('.ant-timeline .ant-timeline-item.ant-timeline-item.ant-timeline-item-color-red{');
  });
});
