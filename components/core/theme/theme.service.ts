/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { CSP_NONCE, inject, Injectable, PendingTasks, Signal, signal } from '@angular/core';

import type { NzAliasToken } from './generated/tokens';
import { renderThemeCss } from './render-theme-css';
import { getNzDesignToken } from './theme.api';
import type { NzThemeConfig } from './theme.types';

export const NZ_THEME_STYLE_ID = 'nz-theme';

/**
 * Applies an Ant Design v6 theme at runtime by writing the design-token CSS variables into a single
 * `<style id="nz-theme">` element. Works with the injected DOCUMENT only, so it also runs during SSR, and
 * registers a pending task per `set()` so server rendering waits for the theme before serialising.
 */
@Injectable({ providedIn: 'root' })
export class NzThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly cspNonce = inject(CSP_NONCE, { optional: true });
  private readonly pendingTasks = inject(PendingTasks);
  private latestCall = 0;

  private readonly configState = signal<NzThemeConfig | null>(null);
  private readonly tokenState = signal<NzAliasToken | null>(null);

  /**
   * The theme most recently *requested* through `set()`, or `null` before the first call. It updates
   * synchronously in `set()`, before the CSS is rendered, so scoped `[nzTheme]` directives merge over the
   * requested global theme from their first render instead of rendering over the defaults first.
   */
  readonly config: Signal<NzThemeConfig | null> = this.configState.asReadonly();
  /**
   * The alias token of the theme most recently *written*, or `null` before the first theme is written. It
   * updates once the CSS for a `set()` call is in the document (and never for a call superseded meanwhile),
   * so it can lag `config()` while a theme is rendering.
   */
  readonly token: Signal<NzAliasToken | null> = this.tokenState.asReadonly();

  // Server rendering waits for the pending task registered below; tools/v6-compare/ssr-check asserts the
  // serialised `<style id="nz-theme">`.
  set(config: NzThemeConfig): Promise<void> {
    this.configState.set(config);
    const applied = this.apply(config);
    // Errors reach the caller through the returned promise; the task only tracks completion.
    this.pendingTasks.run(() => applied.catch(() => undefined));
    return applied;
  }

  private async apply(config: NzThemeConfig): Promise<void> {
    const call = ++this.latestCall;
    const css = await renderThemeCss(config, ':root');
    if (call !== this.latestCall) {
      return; // a newer call already applied its CSS
    }
    writeStyle(this.doc, NZ_THEME_STYLE_ID, css, this.cspNonce);
    this.tokenState.set(getNzDesignToken(config));
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
