/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import type { NzAliasToken } from './generated/tokens';
import { getDesignToken, renderThemeCss } from './render-theme-css';
import type { NzThemeConfig } from './theme.types';

/** Computed alias token for TypeScript consumers (charts, canvas). Pure and synchronous. */
export function getNzDesignToken(config: NzThemeConfig = {}): NzAliasToken {
  return getDesignToken(config) as NzAliasToken;
}

/**
 * CSS text of a theme: the global variable block plus every mapped component's block under `selector`
 * (default `:root`). Pure; asynchronous because the component token bundle is loaded on first use.
 */
export function renderNzThemeCss(config: NzThemeConfig, selector = ':root'): Promise<string> {
  return renderThemeCss(config, selector);
}
