/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { attributeRenderedClasses, RenderedClassOwner } from '../rendered-coverage';

// A hypothetical future map: popconfirm renders the popover's classes, tree-select the select's.
const components: Record<string, RenderedClassOwner> = {
  input: { prefixCls: 'ant-input' },
  'input-number': { prefixCls: 'ant-input-number' },
  select: { prefixCls: 'ant-select' },
  'tree-select': { prefixCls: 'ant-tree-select', renderedPrefixes: ['ant-select'] },
  popconfirm: { prefixCls: 'ant-popconfirm', renderedPrefixes: ['ant-popover'] }
};

describe('attributeRenderedClasses', () => {
  it('keeps the classes under the component’s own prefix and drops unrelated ones', () => {
    expect(
      attributeRenderedClasses('input', ['ant-input', 'ant-input-affix-wrapper', 'ant-btn', 'ant-inputx'], components)
    ).toEqual(['ant-input', 'ant-input-affix-wrapper']);
  });

  it('keeps classes under an extra renderedPrefixes prefix', () => {
    expect(
      attributeRenderedClasses(
        'popconfirm',
        ['ant-popconfirm', 'ant-popover', 'ant-popover-message', 'ant-popover-buttons', 'ant-btn'],
        components
      )
    ).toEqual(['ant-popconfirm', 'ant-popover', 'ant-popover-buttons', 'ant-popover-message']);
    expect(
      attributeRenderedClasses(
        'tree-select',
        ['ant-tree-select-dropdown', 'ant-select', 'ant-select-selector'],
        components
      )
    ).toEqual(['ant-select', 'ant-select-selector', 'ant-tree-select-dropdown']);
  });

  it('excludes a class that a longer prefix owned by another mapped component matches', () => {
    expect(
      attributeRenderedClasses(
        'input',
        ['ant-input', 'ant-input-number', 'ant-input-number-handler', 'ant-input-group'],
        components
      )
    ).toEqual(['ant-input', 'ant-input-group']);
    expect(attributeRenderedClasses('input-number', ['ant-input', 'ant-input-number-handler'], components)).toEqual([
      'ant-input-number-handler'
    ]);
  });

  it('deduplicates and sorts', () => {
    expect(attributeRenderedClasses('select', ['ant-select-item', 'ant-select', 'ant-select'], components)).toEqual([
      'ant-select',
      'ant-select-item'
    ]);
  });
});
