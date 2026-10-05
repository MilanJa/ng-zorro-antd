/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { ownClassesStyled } from '../capture';

describe('ownClassesStyled', () => {
  it('counts a class as styled when a fresh bundle has a plain selector for it', () => {
    const css = '.ant-table { border: 1px solid; } .ant-table-cell { padding: 8px; }';
    const result = ownClassesStyled(css, ['ant-table', 'ant-table-cell', 'ant-table-row'], 'ant-table');
    expect(result).toEqual({ own: 3, styled: 2 });
  });

  it('still matches a class inside a `:where()`-wrapped or combined selector', () => {
    const css = ':where(.ant-tabs-tab, .ant-tabs-tab-active) { color: red; }';
    const result = ownClassesStyled(css, ['ant-tabs-tab', 'ant-tabs-tab-active'], 'ant-tabs');
    expect(result).toEqual({ own: 2, styled: 2 });
  });

  it('ignores classes that belong to a different prefix', () => {
    const css = '.ant-select-selector { border: 1px solid; }';
    const result = ownClassesStyled(css, ['ant-select-selector', 'ant-tabs-tab'], 'ant-tabs');
    expect(result).toEqual({ own: 1, styled: 0 });
  });

  it('reports the stale-bundle shape capture.ts rejects: most of a component prefix unstyled', () => {
    // Simulates a build-demos.ts bundle that predates the component's manifest entry: the antd pane
    // css carries none of the component's own classes.
    const css = '.ant-btn { color: blue; }';
    const result = ownClassesStyled(css, ['ant-tabs', 'ant-tabs-tab', 'ant-tabs-nav', 'ant-tabs-content'], 'ant-tabs');
    expect(result).toEqual({ own: 4, styled: 0 });
    // capture.ts's tolerance is max(2, ceil(own * 0.05)); a 4/4 miss exceeds it for any component size.
    const tolerance = Math.max(2, Math.ceil(result.own * 0.05));
    expect(result.own - result.styled).toBeGreaterThan(tolerance);
  });

  it("credits a stylesThrough entry's copied classes when the antd pane styles them under the source prefix", () => {
    const css = '.ant-steps.ant-steps-dot .ant-steps-item-icon{} .ant-timeline .ant-timeline-item-color-red{}';
    const classes = [
      'ant-timeline-dot',
      'ant-timeline-item-icon',
      'ant-timeline-item-color-red',
      'ant-timeline-item-rail'
    ];
    expect(ownClassesStyled(css, classes, 'ant-timeline')).toEqual({ own: 4, styled: 1 });
    expect(ownClassesStyled(css, classes, 'ant-timeline', { from: 'ant-steps', to: 'ant-timeline' })).toEqual({
      own: 4,
      styled: 3
    });
  });
});
