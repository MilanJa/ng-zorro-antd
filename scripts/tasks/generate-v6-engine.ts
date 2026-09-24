/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { generateEngine } from '../build/v6/generate-engine';

/** Bundle antd's token engine into components/core/theme/generated (runs before the library build). */
async function main(): Promise<void> {
  const sizes = await generateEngine();
  console.log(`v6 engine: core ${sizes.coreBytes} B, components ${sizes.componentsBytes} B`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
