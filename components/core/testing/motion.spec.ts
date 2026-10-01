/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { expect } from 'vitest';

import { expectMotionSettled } from './motion';

describe('expectMotionSettled', () => {
  it('resolves immediately when no motion class or animation is present', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    await expectMotionSettled(el);
    el.remove();
  });

  it('rejects once the given timeout elapses while a motion class is stuck', async () => {
    const el = document.createElement('div');
    el.classList.add('ant-fade-enter');
    document.body.appendChild(el);
    const start = performance.now();
    await expect(expectMotionSettled(el, 50)).rejects.toThrow(/did not settle within 50ms/);
    expect(performance.now() - start).toBeGreaterThanOrEqual(50);
    el.remove();
  });

  it('defaults the internal timeout to 2000ms', async () => {
    const el = document.createElement('div');
    el.classList.add('ant-fade-leave');
    document.body.appendChild(el);
    await expect(expectMotionSettled(el)).rejects.toThrow(/did not settle within 2000ms/);
    el.remove();
  }, 3000);
});
