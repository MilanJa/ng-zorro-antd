/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { compactAlgorithm, darkAlgorithm, defaultAlgorithm } from './generated/engine-core.mjs';
import type { NzMappingAlgorithm } from './theme.types';

export const nzDefaultAlgorithm: NzMappingAlgorithm = defaultAlgorithm as NzMappingAlgorithm;
export const nzDarkAlgorithm: NzMappingAlgorithm = darkAlgorithm as NzMappingAlgorithm;
export const nzCompactAlgorithm: NzMappingAlgorithm = compactAlgorithm as NzMappingAlgorithm;
