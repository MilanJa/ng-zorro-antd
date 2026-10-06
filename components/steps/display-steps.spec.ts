/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { getCollapsedIndexes, planDisplaySteps } from './display-steps';
describe('steps display window', () => {
  it.each([
    [7, 0, 5, [0, 1, 2, null, 5, 6]],
    [7, 3, 5, [0, null, 2, 3, 4, null, 6]],
    [7, 6, 5, [0, 1, null, 4, 5, 6]],
    [7, 10, 5, [0, 1, null, 4, 5, 6]],
    [7, -2, 5, [0, 1, 2, null, 5, 6]],
    [4, 1, 3, [0, 1, null, 3]]
  ])('total %i, current %i, max %i', (total, current, max, expected) => {
    expect(getCollapsedIndexes(total, current, max)).toEqual(expected);
  });
  it.each([[undefined], [2], [4], [7]])('shows all 4 steps for max %s', max => {
    expect(planDisplaySteps(4, 1, max)).toEqual({ canApply: false, roles: Array(4).fill('visible'), ellipses: [] });
  });
  it('turns the first hidden step of each range into the ellipsis item', () => {
    expect(planDisplaySteps(7, 0, 5)).toEqual({
      canApply: true,
      roles: ['visible', 'visible', 'visible', 'ellipsis', 'hidden', 'visible', 'visible'],
      ellipses: [{ at: 3, prev: 2, next: 5 }]
    });
    expect(planDisplaySteps(7, 3, 5).ellipses).toEqual([
      { at: 1, prev: 0, next: 2 },
      { at: 5, prev: 4, next: 6 }
    ]);
  });
});
