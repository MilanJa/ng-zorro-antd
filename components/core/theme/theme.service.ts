/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { CSP_NONCE, inject, Injectable, signal } from '@angular/core';

import type { NzAliasToken } from './generated/tokens';
import { getDesignToken, renderThemeCss } from './render-theme-css';
import type { NzThemeConfig } from './theme.types';

export const NZ_THEME_STYLE_ID = 'nz-theme';

/**
 * Applies an Ant Design v6 theme at runtime by writing the design-token CSS variables into a single
 * `<style id="nz-theme">` element. Works with the injected DOCUMENT only, so it also runs during SSR.
 */
@Injectable({ providedIn: 'root' })
export class NzThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly cspNonce = inject(CSP_NONCE, { optional: true });
  private latestCall = 0;

  readonly config = signal<NzThemeConfig | null>(null);
  readonly token = signal<NzAliasToken | null>(null);

  async set(config: NzThemeConfig): Promise<void> {
    const call = ++this.latestCall;
    const css = await renderThemeCss(config, ':root');
    if (call !== this.latestCall) {
      return; // a newer call already applied its CSS
    }
    writeStyle(this.doc, NZ_THEME_STYLE_ID, css, this.cspNonce);
    this.config.set(config);
    this.token.set(getDesignToken(config) as NzAliasToken);
  }
}

/** @internal shared by the service and the scoped directive */
export function writeStyle(doc: Document, id: string, css: string, nonce: string | null): HTMLStyleElement {
  let style = doc.getElementById(id) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement('style');
    style.id = id;
    if (nonce) {
      style.nonce = nonce;
    }
    doc.head.appendChild(style);
  }
  if (style.textContent !== css) {
    style.textContent = css;
  }
  return style;
}
