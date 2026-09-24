/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { EngineCore } from './engine.types';
import * as coreModule from './generated/engine-core';
import type { NzMappingAlgorithm } from './theme.types';

// `generated/engine-core.ts` is generated JS carrying `// @ts-nocheck` (see `bundle-engine.ts`), so its
// own inferred shape isn't relied on; cast once against the hand-maintained `EngineCore` interface.
const core = coreModule as unknown as EngineCore;

export const nzDefaultAlgorithm: NzMappingAlgorithm = core.defaultAlgorithm as NzMappingAlgorithm;
export const nzDarkAlgorithm: NzMappingAlgorithm = core.darkAlgorithm as NzMappingAlgorithm;
export const nzCompactAlgorithm: NzMappingAlgorithm = core.compactAlgorithm as NzMappingAlgorithm;
