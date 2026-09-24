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
  InjectionToken,
  input,
  PendingTasks,
  Signal
} from '@angular/core';

import { renderThemeCss } from './render-theme-css';
import { NzThemeScopeIdService } from './theme-scope-id.service';
import { writeStyle } from './theme.service';
import type { NzThemeConfig } from './theme.types';

/**
 * @internal Testing seam only: production code always gets the real `renderThemeCss`. Overriding this
 * token lets a spec control the timing of the directive's render (e.g. to deterministically destroy the
 * directive while a render is still in flight) without depending on real import/network timing; spying
 * directly on the `render-theme-css.ts` module's export isn't possible here (its ESM namespace object is
 * not configurable in this build).
 */
export const NZ_THEME_RENDERER = new InjectionToken<typeof renderThemeCss>('NZ_THEME_RENDERER', {
  factory: () => renderThemeCss
});

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
  private readonly renderThemeCss = inject(NZ_THEME_RENDERER);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly id = inject(NzThemeScopeIdService).next();

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
    // Guards against writing a style after this directive is destroyed: `renderThemeCss` awaits a lazy
    // chunk import on its first call, so a destroy (e.g. an `@if`/route toggle) can easily land while
    // that first render is still in flight. `stale` (via the effect's `onCleanup`, which Angular also
    // runs when the effect itself is destroyed) covers both "config changed, a newer render superseded
    // this one" and "the directive was destroyed"; `destroyed` is a second, explicit belt-and-suspenders
    // check set from the `DestroyRef` callback itself, so `writeStyle` can never run after cleanup.
    let destroyed = false;
    effect(onCleanup => {
      const config = this.effectiveConfig();
      let stale = false;
      onCleanup(() => {
        stale = true;
      });
      // A pending task keeps the application unstable until the scoped CSS is written, so server
      // rendering serialises the page only after this style element exists.
      this.pendingTasks.run(() =>
        this.renderThemeCss(config, `.${this.scopeClass}`).then(css => {
          if (!stale && !destroyed) {
            writeStyle(this.doc, this.scopeClass, css, this.cspNonce);
          }
        })
      );
    });
    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      this.doc.getElementById(this.scopeClass)?.remove();
    });
  }
}
