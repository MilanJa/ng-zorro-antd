/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { NzAliasToken, NzComponentTokenMap, NzSeedToken } from './generated/tokens';

export type NzMappingAlgorithm = (seed: NzSeedToken) => Record<string, unknown>;

/**
 * Per-component overrides: the component's own tokens and, like antd's `ComponentsConfig`, any alias token
 * (e.g. `components: { Button: { colorPrimary } }`), scoped to that component's elements.
 */
export type NzComponentsConfig = {
  [K in keyof NzComponentTokenMap]?: Partial<NzComponentTokenMap[K]> &
    Partial<NzAliasToken> & {
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
