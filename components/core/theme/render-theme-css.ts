/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { EngineComponents, EngineCore } from './engine.types';
import { COMPONENT_ROOT_CLS } from './generated/component-roots';
import * as coreModule from './generated/engine-core';
import type { NzMappingAlgorithm, NzThemeConfig } from './theme.types';

// `generated/engine-core.ts` is generated JS carrying `// @ts-nocheck` (see `bundle-engine.ts`), so its
// own inferred shape isn't relied on; cast once against the hand-maintained `EngineCore` interface.
const core = coreModule as unknown as EngineCore;

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
      // antd `getComputedToken` assigns the component-theme result as-is; `formatToken` deliberately
      // deletes override keys that collide with seed-token names so they flow through derivation, so
      // re-spreading `componentTokens` here would reinject the raw (pre-derivation) values.
      alias[component] = core.formatToken({ ...componentDerived, override: componentTokens });
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

let componentsBundle: Promise<EngineComponents> | null = null;

function loadComponents(): Promise<EngineComponents> {
  componentsBundle ??= import('./generated/engine-components').then(m => m as unknown as EngineComponents);
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
    // antd `getComponentToken`: the deprecated oldKey->newKey mapping is applied to the raw user
    // override (`customToken`) alone, before merging with `defaultToken` (which almost always already
    // defines `newKey`) — mapping after merging would make the "already defined" guard a no-op and
    // silently drop the user's override.
    const customToken: AnyToken = { ...(realToken[component] ?? {}) };
    for (const [oldKey, newKey] of entry.deprecatedTokens ?? []) {
      if (customToken[oldKey] || customToken[newKey]) {
        customToken[newKey] ??= customToken[oldKey];
      }
    }
    const componentToken: AnyToken = { ...defaultToken, ...customToken };
    // antd `getComponentToken`: drop values identical to the global token to minimise output
    for (const key of Object.keys(componentToken)) {
      if (componentToken[key] === realToken[key]) {
        delete componentToken[key];
      }
    }
    // antd `genCSSVarRegister`: only keys the component's own `getDefaultToken` declares get prefixed
    // and moved; any surviving key that came solely from the user's raw override (e.g. an alias-level
    // token like `colorPrimary` set via a component's `algorithm: true` sub-theme) is not one of the
    // component's own declared tokens, so it stays unprefixed, reusing the global variable name.
    const own: AnyToken = {};
    const shared: AnyToken = { ...componentToken };
    for (const key of Object.keys(defaultToken)) {
      own[entry.prefixToken(key)] = shared[key];
      delete shared[key];
    }
    const transformOptions = { prefix, unitless: entry.unitless, ignore: entry.ignore };
    // Namespaced `--ant-<component>-*` variables cannot collide with anything, so they live on `selector`.
    const [, ownCss] = core.transformToken(own, THEME_KEY_PLACEHOLDER, transformOptions);
    if (ownCss) {
      out.push(ownCss.replace(`.${THEME_KEY_PLACEHOLDER}`, selector));
    }
    // Unprefixed keys reuse global names (`--ant-color-primary`), so emitting them on `selector` would
    // override the global value for the whole page/scope. antd keeps them on the component's own css-var
    // root class; ng-zorro has no such class, so scope them to the component's elements instead.
    const [, sharedCss] = core.transformToken(shared, THEME_KEY_PLACEHOLDER, transformOptions);
    if (sharedCss) {
      out.push(sharedCss.replace(`.${THEME_KEY_PLACEHOLDER}`, componentScope(selector, component)));
    }
  }
  return out.join('\n');
}

/**
 * Selector for a component's unprefixed (alias-level) overrides: every element whose class list contains a
 * class starting with the component's root class (`ant-btn`, `ant-btn-icon`, ...), except elements that
 * belong to a component with a longer root of the same family (`ant-input` must not claim
 * `ant-input-number*`, `ant-tree` must not claim `ant-tree-select*`), nor anything inside such an element (`ant-picker` must not claim the cells of
 * `ant-picker-calendar`). Those longer roots are derived from
 * `COMPONENT_ROOT_CLS`: every other root that starts with `<root>-`. Falls back to `selector` for a
 * registry entry without a root class (a Node test keeps `COMPONENT_ROOT_CLS` in sync with the
 * registry, so this is defensive only).
 *
 * For `:root` this is any matching element on the page. For a scoped selector (a `[nzTheme]` host's class)
 * it is both the host's matching descendants *and* the host itself, since the host can be the component
 * root (e.g. `<button nz-button [nzTheme]>`), which the descendant-only combinator would otherwise miss.
 */
function componentScope(selector: string, component: string): string {
  const root = COMPONENT_ROOT_CLS[component];
  if (!root) {
    return selector;
  }
  const longerRoots = new Set(Object.values(COMPONENT_ROOT_CLS).filter(other => other.startsWith(`${root}-`)));
  const exclusions = [...longerRoots].map(longer => `:not([class*="${longer}"]):not([class*="${longer}"] *)`).join('');
  const elements = `:is([class^="${root}"],[class*=" ${root}"])${exclusions}`;
  return selector === ':root' ? elements : `${selector} ${elements}, ${selector}${elements}`;
}
