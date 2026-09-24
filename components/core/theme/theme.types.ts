/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { NzAliasToken, NzComponentTokenMap, NzSeedToken } from './generated/tokens';

export type NzMappingAlgorithm = (seed: NzSeedToken) => Record<string, unknown>;

export type NzComponentsConfig = {
  [K in keyof NzComponentTokenMap]?: Partial<NzComponentTokenMap[K]> & {
    algorithm?: boolean | NzMappingAlgorithm | NzMappingAlgorithm[];
  };
};

/** Mirrors antd's `ThemeConfig` so antd documentation and examples translate directly. */
export interface NzThemeConfig {
  algorithm?: NzMappingAlgorithm | NzMappingAlgorithm[];
  token?: Partial<NzAliasToken>;
  components?: NzComponentsConfig;
  cssVar?: { prefix?: string };
}
