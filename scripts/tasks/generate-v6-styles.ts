/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { bundleEngine } from '../build/v6/bundle-engine';
import { allAntdComponentNames } from '../build/v6/components';
import { generateStyles } from '../build/v6/generate-styles';
import { generatedDir } from '../build/v6/paths';
import { buildConfig } from '../build-config';

/** Generate antd v6 CSS into the publish directory (runs after the library build). */
async function main(): Promise<void> {
  // `generate-styles`'s manifest budgets are meant to track *minified* engine sizes (see
  // `manifest.ts`'s `ENGINE_CORE_BUDGET`/`ENGINE_COMPONENTS_BUDGET`), but `generated/engine-*.ts` are
  // now written unminified (so ng-packagr can compile them like any other entry-point source -- see
  // `bundle-engine.ts`). Re-run `bundleEngine` here (idempotent; same content already on disk) purely to
  // get its separately-measured minified sizes, and pass them through explicitly instead of letting
  // `generateStyles` fall back to statting the (now larger, unminified) `.ts` files.
  const engineSizes = await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
  await generateStyles({
    publishDir: buildConfig.publishDir,
    componentsDir: buildConfig.componentsDir,
    updateManifest: process.argv.includes('--update-manifest'),
    engineSizes
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
