/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { getSize, handleCircleGradient, handleLinearGradient, isBrightColor } from './utils';

// https://github.com/ant-design/ant-design/blob/330a952a988a4ae18c201b464c51d5faeb714f7c/components/progress/__tests__/index.test.js#L74-L88.
describe('progress util functions', () => {
  it('get correct line-gradient', () => {
    expect(handleLinearGradient({ from: 'test', to: 'test' })).toBe('linear-gradient(to right, test, test)');
    expect(handleLinearGradient({})).toBe('linear-gradient(to right, #1890ff, #1890ff)');
    expect(handleLinearGradient({ from: 'test', to: 'test', '0%': 'test' })).toBe('linear-gradient(to right, test 0%)');
  });

  it('get correct circle gradient', () => {
    const gradientOne = handleCircleGradient({ '10%': 'test10', '30%': 'test30', '20%': 'test20' });
    expect(gradientOne[0].color).toBe('test10');
    expect(gradientOne[0].offset).toBe('10%');
    expect(gradientOne[1].color).toBe('test20');
    expect(gradientOne[1].offset).toBe('20%');
  });
});

// Expected values follow antd 6.6.5 `components/progress/utils.ts` `getSize`.
describe('getSize (port of antd getSize)', () => {
  it.each([
    ['small', 'step', { steps: 3 }, [6, 8]],
    [undefined, 'step', { steps: 3, strokeWidth: 4 }, [42, 4]],
    ['medium', 'step', { steps: 2 }, [28, 8]],
    [20, 'step', { steps: 3 }, [60, 20]],
    [[20, 30], 'step', { steps: 3 }, [60, 30]],
    [{ width: 10 }, 'step', { steps: 2 }, [20, 8]],
    ['default', 'line', undefined, [-1, 8]],
    ['medium', 'line', undefined, [-1, 8]],
    ['small', 'line', undefined, [-1, 6]],
    ['small', 'line', { strokeWidth: 4 }, [-1, 4]],
    [20, 'line', undefined, [20, 20]],
    [[300, 20], 'line', undefined, [300, 20]],
    [{ height: 12 }, 'line', undefined, [-1, 12]],
    [{}, 'line', undefined, [-1, 8]],
    ['small', 'circle', undefined, [60, 60]],
    ['default', 'dashboard', undefined, [120, 120]],
    [80, 'circle', undefined, [80, 80]],
    [[100, 50], 'circle', undefined, [100, 100]],
    [{ width: 10 }, 'circle', undefined, [-1, -1]]
  ] as const)('getSize(%j, %s, %j) = %j', (size, type, extra, expected) => {
    expect(getSize(size as never, type, extra as never)).toEqual(expected);
  });
});

describe('isBrightColor (antd FastColor isLight)', () => {
  it.each([
    ['#E6F4FF', true],
    ['#B7EB8F', true],
    ['#001342', false],
    ['#1677ff', false],
    [undefined, false],
    [{ from: '#ffffff', to: '#000000' }, true],
    [{ '0%': '#108ee9', '100%': '#87d068' }, false]
  ] as const)('%j -> %s', (color, bright) => {
    expect(isBrightColor(color as never)).toBe(bright);
  });
});
