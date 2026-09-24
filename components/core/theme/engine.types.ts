/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shape of the bundles produced by `scripts/build/v6/bundle-engine.ts` (see `generated/engine-core.ts`
 * and `generated/engine-components.ts`). Those files are real, generated `.ts` sources (not hand-written
 * `.d.ts` ambient declarations) so ng-packagr can compile them like any other file in the `core/theme`
 * entry point, but they carry `// @ts-nocheck` and are not meant to be relied on for their own inferred
 * types; consumers import them with `import * as x from './generated/engine-core'` and cast once against
 * these interfaces instead (`x as unknown as EngineCore`).
 */
export type AntdToken = Record<string, any>;

export interface EngineCore {
  seedToken: AntdToken;
  defaultAlgorithm: (seed: AntdToken) => AntdToken;
  darkAlgorithm: (seed: AntdToken) => AntdToken;
  compactAlgorithm: (seed: AntdToken) => AntdToken;
  formatToken: (merged: AntdToken) => AntdToken;
  unitless: Record<string, boolean>;
  ignore: Record<string, boolean>;
  token2CSSVar: (token: string, prefix?: string) => string;
  transformToken: (
    token: AntdToken,
    themeKey: string,
    config: {
      prefix?: string;
      unitless?: Record<string, boolean>;
      ignore?: Record<string, boolean>;
      preserve?: Record<string, boolean>;
      scope?: string | string[];
    }
  ) => [AntdToken, string];
}

export interface RegistryEntry {
  getDefaultToken: ((token: Record<string, any>) => Record<string, any>) | Record<string, any> | undefined;
  unitless: Record<string, boolean>;
  ignore?: Record<string, boolean>;
  deprecatedTokens?: Array<[string, string]>;
  prefixToken: (key: string) => string;
}

export interface EngineComponents {
  registry: Map<string, RegistryEntry>;
}
