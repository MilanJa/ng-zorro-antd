/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/__tests__/**/*.spec.ts', 'tools/**/__tests__/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/fixtures/**'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    fileParallelism: false
  }
});
