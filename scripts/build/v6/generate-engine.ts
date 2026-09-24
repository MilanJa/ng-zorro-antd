/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import path from 'node:path';

import { bundleEngine, BundleEngineResult } from './bundle-engine';
import { allAntdComponentNames } from './components';
import { generateTypes } from './generate-types';

export const generatedDir = path.resolve(__dirname, '../../../components/core/theme/generated');

/** Runs BEFORE the ng-packagr build: the library source imports these bundles. */
export async function generateEngine(): Promise<BundleEngineResult> {
  const sizes = await bundleEngine({ outDir: generatedDir, antdNames: allAntdComponentNames() });
  await generateTypes(generatedDir);
  return sizes;
}
