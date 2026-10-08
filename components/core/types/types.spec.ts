/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { expectTypeOf } from 'vitest';

import { NgStyleInterface, NzSemanticClassNames, NzSemanticStyles, NzSizeDMSType, NzSizeDSType } from './public-api';

describe('core types for Ant Design v6 parity', () => {
  it('NzSizeDMSType adds medium next to default and small', () => {
    expectTypeOf<NzSizeDMSType>().toEqualTypeOf<'default' | 'medium' | 'small'>();
    expectTypeOf<NzSizeDSType>().toEqualTypeOf<'default' | 'small'>();
    const sizes: NzSizeDMSType[] = ['default', 'medium', 'small'];
    expect(sizes).toHaveLength(3);
  });

  it('semantic slot maps are partial records keyed by slot name', () => {
    expectTypeOf<NzSemanticClassNames<'root' | 'body'>>().toEqualTypeOf<{ root?: string; body?: string }>();
    expectTypeOf<NzSemanticStyles<'root' | 'body'>>().toEqualTypeOf<{
      root?: NgStyleInterface;
      body?: NgStyleInterface;
    }>();
    const classNames: NzSemanticClassNames<'root' | 'body'> = { body: 'b' };
    const styles: NzSemanticStyles<'root' | 'body'> = { root: { padding: '4px' } };
    expect([classNames.root, classNames.body, styles.root?.['padding']]).toEqual([undefined, 'b', '4px']);
  });
});
