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
  signal,
  Signal
} from '@angular/core';

import { renderThemeCss } from './render-theme-css';
import { NZ_THEME_SCOPE } from './theme-scope';
import { NzThemeScopeIdService } from './theme-scope-id.service';
import { NzThemeService, writeStyle } from './theme.service';
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
 *
 * By default (`nzThemeInherit`, true) it inherits the enclosing `[nzTheme]`, otherwise the global
 * `NzConfig.theme`; CDK overlays get the scope through `nzThemeScopeClasses()` (Task 9).
 */
@Directive({
  selector: '[nzTheme]',
  host: { '[class]': 'scopeClass' },
  providers: [{ provide: NZ_THEME_SCOPE, useFactory: () => inject(NzThemeDirective).scopeSignal }]
})
export class NzThemeDirective {
  private readonly doc = inject(DOCUMENT);
  private readonly cspNonce = inject(CSP_NONCE, { optional: true });
  private readonly parent = inject(NzThemeDirective, { optional: true, skipSelf: true });
  private readonly globalTheme = inject(NzThemeService);
  private readonly renderThemeCss = inject(NZ_THEME_RENDERER);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly id = inject(NzThemeScopeIdService).next();

  readonly nzTheme = input.required<NzThemeConfig>();
  readonly nzThemeInherit = input(true, { transform: booleanAttribute });

  /** @internal */
  readonly scopeClass = `nz-theme-${this.id}`;

  /**
   * @internal A constant per instance; a signal keeps `NZ_THEME_SCOPE`'s contract uniform for consumers
   * (`nzThemeScopeClasses()`), which reads any enclosing scope reactively regardless of whether it can change.
   */
  readonly scopeSignal: Signal<string | null> = signal(this.scopeClass).asReadonly();

  /**
   * Effective config after merging over the nearest ancestor `[nzTheme]` when inheriting, or, absent an
   * ancestor, over the global theme applied through `NzThemeService`.
   */
  readonly effectiveConfig: Signal<NzThemeConfig> = computed(() => {
    const own = this.nzTheme();
    if (!this.nzThemeInherit()) {
      return own;
    }
    const base = this.parent?.effectiveConfig() ?? this.globalTheme.config() ?? undefined;
    if (!base) {
      return own;
    }
    return {
      algorithm: own.algorithm ?? base.algorithm,
      cssVar: own.cssVar ?? base.cssVar,
      token: { ...base.token, ...own.token },
      components: { ...base.components, ...own.components }
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
