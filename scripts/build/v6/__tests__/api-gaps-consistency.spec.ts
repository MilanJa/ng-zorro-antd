/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * antd prop (or token / dotted option) names delivered by sub-project 3, keyed by the gap file's Component
 * column. A task appends what it delivers and deletes or rewrites every row that still backticks it.
 */
const DELIVERED: Record<string, string[]> = {
  Steps: [
    'descriptionMaxWidth',
    'orientation',
    'titlePlacement',
    'variant',
    'content',
    'type',
    'maxCount',
    'ellipsis',
    'responsive'
  ],
  Timeline: ['mode', 'orientation', 'variant', 'titleSpan', 'placement', 'title', 'icon', 'loading'],
  Menu: ['extra', 'dashed', 'disabled', 'tooltip', 'expandIcon'],
  Splitter: [
    'orientation',
    'collapsible.showCollapsibleIcon',
    'showCollapsibleIcon',
    'collapsible.icon',
    'collapsibleIcon',
    'draggerIcon',
    'onDraggerDoubleClick',
    'collapsible.motion',
    'onCollapse'
  ],
  Flex: ['orientation', 'gap', 'align', 'wrap'],
  Divider: ['titlePlacement', 'orientationMargin', 'orientation'],
  Tag: ['icon', 'variant', 'disabled', 'CheckableTagGroup', 'multiple'],
  Badge: ['size'],
  Tabs: ['icon'],
  Pagination: ['size', 'variant'],
  Progress: ['percentPosition', 'size'],
  FloatButton: ['content', 'description', 'showProgress'],
  BackTop: ['showProgress'],
  Col: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'],
  Sider: ['classNames', 'styles'],
  'Dropdown menu items': ['icon', 'extra', 'label'],
  'Dropdown submenu title': [],
  Breadcrumb: ['placement', 'items', 'params', 'itemRender', 'dropdownIcon'],
  Card: ['tabList', 'activeTabKey', 'defaultActiveTabKey', 'onTabChange', 'tabBarExtraContent', 'tabProps'],
  Image: []
};

function gapRows(md: string): Array<{ components: string[]; names: string[]; line: string }> {
  return md
    .split('\n')
    .filter(line => line.startsWith('|'))
    .slice(2)
    .map(line => ({
      line,
      components: line
        .split(/(?<!\\)\|/)[1]
        .split(',')
        .map(c => c.trim()),
      // leading identifier or dotted path of each backticked span: `type="inline"` -> type
      names: [...line.matchAll(/`([^`]+)`/g)].map(m => /^[A-Za-z_][\w.]*/.exec(m[1])?.[0] ?? '').filter(Boolean)
    }));
}

describe('gap row parser', () => {
  it('reads components and backticked names', () => {
    const md = '| C | b |\n|---|---|\n| Tree, TreeSelect | `showLine.showLeafIcon` and `mode="a"\\|"b"` (`-x`) |';
    expect(gapRows(md).map(r => [r.components, r.names])).toEqual([
      [
        ['Tree', 'TreeSelect'],
        ['showLine.showLeafIcon', 'mode']
      ]
    ]);
  });
});

describe('docs/v6-api-gaps.md', () => {
  const rows = gapRows(readFileSync(path.resolve(__dirname, '../../../../docs/v6-api-gaps.md'), 'utf8'));
  for (const [component, delivered] of Object.entries(DELIVERED)) {
    it(`has no ${component} row naming a delivered prop`, () => {
      const stale = rows
        .filter(row => row.components.includes(component))
        .filter(row => row.names.some(name => delivered.includes(name)))
        .map(row => row.line.slice(0, 120));
      expect(stale).toEqual([]);
    });
  }
});
