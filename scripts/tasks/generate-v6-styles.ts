/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { generateStyles } from '../build/v6/generate-styles';
import { buildConfig } from '../build-config';

/** Generate antd v6 CSS into the publish directory (runs after the library build). */
async function main(): Promise<void> {
  await generateStyles({
    publishDir: buildConfig.publishDir,
    componentsDir: buildConfig.componentsDir,
    updateManifest: process.argv.includes('--update-manifest')
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
