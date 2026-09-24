/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Shape of the bundles produced by `scripts/build/v6/bundle-engine.ts` (see generated/). */
declare module '*engine-core.mjs' {
  export type AntdToken = Record<string, any>;
  export const seedToken: AntdToken;
  export const defaultAlgorithm: (seed: AntdToken) => AntdToken;
  export const darkAlgorithm: (seed: AntdToken) => AntdToken;
  export const compactAlgorithm: (seed: AntdToken) => AntdToken;
  export const formatToken: (merged: AntdToken) => AntdToken;
  export const unitless: Record<string, boolean>;
  export const ignore: Record<string, boolean>;
  export const token2CSSVar: (token: string, prefix?: string) => string;
  export const transformToken: (
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

declare module '*engine-components.mjs' {
  export interface RegistryEntry {
    getDefaultToken: ((token: Record<string, any>) => Record<string, any>) | Record<string, any> | undefined;
    unitless: Record<string, boolean>;
    ignore?: Record<string, boolean>;
    deprecatedTokens?: Array<[string, string]>;
    prefixToken: (key: string) => string;
  }
  export const registry: Map<string, RegistryEntry>;
}
