/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  computed,
  CSP_NONCE,
  DestroyRef,
  Directive,
  effect,
  inject,
  input,
  Signal
} from '@angular/core';

import { renderThemeCss } from './render-theme-css';
import { writeStyle } from './theme.service';
import type { NzThemeConfig } from './theme.types';

let nextId = 0;

/**
 * Applies a theme to the host element's subtree. CDK overlays rendered outside the host keep the global theme.
 *
 * ```html
 * <section [nzTheme]="{ algorithm: nzDarkAlgorithm }">...</section>
 * ```
 */
@Directive({
  selector: '[nzTheme]',
  host: { '[class]': 'scopeClass' }
})
export class NzThemeDirective {
  private readonly doc = inject(DOCUMENT);
  private readonly cspNonce = inject(CSP_NONCE, { optional: true });
  private readonly parent = inject(NzThemeDirective, { optional: true, skipSelf: true });
  private readonly id = ++nextId;

  readonly nzTheme = input.required<NzThemeConfig>();
  readonly nzThemeInherit = input(true, { transform: booleanAttribute });

  /** @internal */
  readonly scopeClass = `nz-theme-${this.id}`;

  /** Effective config after merging the ancestor directive's config when inheriting. */
  readonly effectiveConfig: Signal<NzThemeConfig> = computed(() => {
    const own = this.nzTheme();
    const parent = this.nzThemeInherit() ? this.parent?.effectiveConfig() : undefined;
    if (!parent) {
      return own;
    }
    return {
      algorithm: own.algorithm ?? parent.algorithm,
      cssVar: own.cssVar ?? parent.cssVar,
      token: { ...parent.token, ...own.token },
      components: { ...parent.components, ...own.components }
    };
  });

  constructor() {
    let latest = 0;
    effect(async () => {
      const config = this.effectiveConfig();
      const call = ++latest;
      const css = await renderThemeCss(config, `.${this.scopeClass}`);
      if (call === latest) {
        writeStyle(this.doc, this.scopeClass, css, this.cspNonce);
      }
    });
    inject(DestroyRef).onDestroy(() => this.doc.getElementById(this.scopeClass)?.remove());
  }
}
