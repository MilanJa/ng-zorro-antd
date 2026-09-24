/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as core from './generated/engine-core.mjs';
import type { NzMappingAlgorithm, NzThemeConfig } from './theme.types';

/** Internal selector key; rewritten to the real selector before the CSS leaves this module. */
export const THEME_KEY_PLACEHOLDER = 'nz-theme-key';

/** Tokens antd keeps as raw values instead of CSS variables (copied from antd `useToken.ts`). */
const PRESERVE: Record<string, boolean> = Object.fromEntries(
  [
    'screenXS',
    'screenXSMin',
    'screenXSMax',
    'screenSM',
    'screenSMMin',
    'screenSMMax',
    'screenMD',
    'screenMDMin',
    'screenMDMax',
    'screenLG',
    'screenLGMin',
    'screenLGMax',
    'screenXL',
    'screenXLMin',
    'screenXLMax',
    'screenXXL',
    'screenXXLMin',
    'screenXXLMax',
    'screenXXXL',
    'screenXXXLMin'
  ].map(k => [k, true])
);

type AnyToken = Record<string, any>;

function toArray(a: NzMappingAlgorithm | NzMappingAlgorithm[] | undefined): NzMappingAlgorithm[] {
  if (!a) {
    return [core.defaultAlgorithm as NzMappingAlgorithm];
  }
  return Array.isArray(a) ? a : [a];
}

/**
 * Chain multiple algorithms the way antd's `Theme.getDerivativeToken` does (see
 * `@ant-design/cssinjs/es/theme/Theme.js`): `token` is the fixed base passed to *every* algorithm,
 * while `result` (the previous algorithm's output) is threaded through as the second argument. Some
 * algorithms (e.g. `compactAlgorithm`) fall back to re-deriving from `token` alone when `result` is
 * absent, so passing the accumulator as `token` instead (as a naive single-argument chain would) feeds
 * an already-derived token back through as if it were the seed and silently discards prior derivations.
 */
function applyAlgorithms(token: AnyToken, algorithms: NzMappingAlgorithm[]): AnyToken {
  // `NzMappingAlgorithm` only declares the 1-argument public signature; antd's real algorithms also
  // accept the previous result as a second argument (see the comment above), so call through a widened
  // type here rather than changing the public type.
  type InternalAlgorithm = (token: AnyToken, result?: AnyToken) => AnyToken;
  return algorithms.reduce<AnyToken>(
    (result, algorithm) => (algorithm as InternalAlgorithm)(token, result),
    undefined as never
  );
}

/** Seed -> algorithm(s) -> alias, with `token` overrides applied like antd's `getComputedToken`. */
export function computeGlobalToken(config: NzThemeConfig): AnyToken {
  const seed: AnyToken = { ...core.seedToken, ...(config.token ?? {}) };
  const derived: AnyToken = applyAlgorithms(seed, toArray(config.algorithm));
  // antd: `formatToken({ ...derivativeToken, override })`, where override = seed + user token
  const alias: AnyToken = core.formatToken({ ...derived, override: seed });
  for (const [component, value] of Object.entries(config.components ?? {})) {
    const { algorithm, ...componentTokens } = value as AnyToken;
    if (algorithm) {
      // antd: component-level algorithm re-derives from (alias + component tokens)
      const algorithms = algorithm === true ? toArray(config.algorithm) : toArray(algorithm);
      const componentBase: AnyToken = { ...alias, ...componentTokens };
      const componentDerived: AnyToken = applyAlgorithms(componentBase, algorithms);
      alias[component] = {
        ...core.formatToken({ ...componentDerived, override: componentTokens }),
        ...componentTokens
      };
    } else {
      alias[component] = componentTokens;
    }
  }
  return alias;
}

/** Alias token for TypeScript consumers; component entries are stripped. */
export function getDesignToken(config: NzThemeConfig = {}): AnyToken {
  const token = computeGlobalToken(config);
  for (const key of Object.keys(config.components ?? {})) {
    delete token[key];
  }
  return token;
}

let componentsBundle: Promise<typeof import('./generated/engine-components.mjs')> | null = null;

function loadComponents(): Promise<typeof import('./generated/engine-components.mjs')> {
  componentsBundle ??= import('./generated/engine-components.mjs');
  return componentsBundle;
}

/**
 * Full theme CSS: the global variable block plus one block per registered component, all under `selector`.
 * Output is byte-equal to what antd's static extraction emits for the same config (see parity test).
 */
export async function renderThemeCss(
  config: NzThemeConfig,
  selector = ':root',
  componentFilter: (name: string) => boolean = () => true
): Promise<string> {
  const prefix = config.cssVar?.prefix ?? 'ant';
  const realToken = computeGlobalToken(config);
  const out: string[] = [];

  const [, globalCss] = core.transformToken(realToken, THEME_KEY_PLACEHOLDER, {
    prefix,
    ignore: core.ignore,
    unitless: core.unitless,
    preserve: PRESERVE
  });
  out.push(globalCss.replace(`.${THEME_KEY_PLACEHOLDER}`, selector));

  const { registry } = await loadComponents();
  for (const [component, entry] of registry) {
    if (!componentFilter(component)) {
      continue;
    }
    const merged = { ...realToken, ...(realToken[component] ?? {}) };
    const defaultToken: AnyToken =
      typeof entry.getDefaultToken === 'function' ? entry.getDefaultToken(merged) : (entry.getDefaultToken ?? {});
    const componentToken: AnyToken = { ...defaultToken, ...(realToken[component] ?? {}) };
    for (const [oldKey, newKey] of entry.deprecatedTokens ?? []) {
      if (componentToken[oldKey] !== undefined && componentToken[newKey] === undefined) {
        componentToken[newKey] = componentToken[oldKey];
      }
    }
    // antd `getComponentToken`: drop values identical to the global token to minimise output
    for (const key of Object.keys(componentToken)) {
      if (componentToken[key] === realToken[key]) {
        delete componentToken[key];
      }
    }
    const prefixed: AnyToken = {};
    for (const key of Object.keys(componentToken)) {
      prefixed[entry.prefixToken(key)] = componentToken[key];
    }
    const [, css] = core.transformToken(prefixed, THEME_KEY_PLACEHOLDER, {
      prefix,
      unitless: entry.unitless,
      ignore: entry.ignore
    });
    if (css) {
      out.push(css.replace(`.${THEME_KEY_PLACEHOLDER}`, selector));
    }
  }
  return out.join('\n');
}
