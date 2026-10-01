/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

const MOTION_CLASS = /^ant-.*-(enter|appear|leave)(-.*)?$/;

/**
 * Resolves once `animate.enter`/`animate.leave` motion classes are gone from `el` and no CSS animation is
 * running on it. Rejects after `timeoutMs`. Use it to assert that antd motion CSS and Angular's class-based
 * animations agree.
 */
export function expectMotionSettled(el: Element, timeoutMs = 2000): Promise<void> {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const check = (): void => {
      const stuck = Array.from(el.classList).filter(c => MOTION_CLASS.test(c));
      const running = typeof el.getAnimations === 'function' ? el.getAnimations().length : 0;
      if (!stuck.length && !running) {
        resolve();
      } else if (performance.now() - start > timeoutMs) {
        reject(
          new Error(`motion did not settle within ${timeoutMs}ms; classes=[${stuck.join(' ')}] animations=${running}`)
        );
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
}
