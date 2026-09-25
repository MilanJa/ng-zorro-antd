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
  Signal,
  untracked
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
 * Applies a theme to the host element's subtree.
 *
 * ```html
 * <section [nzTheme]="{ algorithm: nzDarkAlgorithm }">...</section>
 * ```
 *
 * By default (`nzThemeInherit`, true) it inherits the enclosing `[nzTheme]`, otherwise the global
 * `NzConfig.theme`. Content rendered in the CDK overlay container sits outside the host; overlay-based
 * components that add `nzThemeScopeClasses()` to their popup (Select's dropdown today) carry the scope of
 * the nearest enclosing `[nzTheme]` in the *injector* tree, others keep the global theme.
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
   * ancestor, over the global theme requested through `NzThemeService` (available synchronously, before the
   * global CSS is written). Like antd's nested `ConfigProvider`, `token` merges key by key and `components`
   * merges per component, so a scoped `components.Button.colorPrimary` keeps the inherited Button tokens.
   */
  readonly effectiveConfig: Signal<NzThemeConfig> = computed(() => {
    const own = this.nzTheme();
    if (!this.nzThemeInherit()) {
      return own;
    }
    const base = this.parent?.effectiveConfig() ?? this.globalTheme.config();
    if (!base) {
      return own;
    }
    return {
      algorithm: own.algorithm ?? base.algorithm,
      cssVar: own.cssVar ?? base.cssVar,
      token: { ...base.token, ...own.token },
      components: mergeComponents(base.components, own.components)
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
          // `stale` flips only when the effect re-runs, which Angular schedules; comparing with the current
          // effective config also drops a render whose inputs (e.g. the global theme requested meanwhile)
          // already changed, so an intermediate own-only CSS never overwrites the style element.
          if (!stale && !destroyed && untracked(this.effectiveConfig) === config) {
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

/** Merges `components` per component name, like antd's nested `ConfigProvider`. */
function mergeComponents(
  base: NzThemeConfig['components'],
  own: NzThemeConfig['components']
): NzThemeConfig['components'] {
  const merged: Record<string, object | undefined> = { ...base };
  for (const [name, value] of Object.entries(own ?? {})) {
    const inherited = merged[name];
    merged[name] = inherited && value ? { ...inherited, ...value } : (value ?? inherited);
  }
  return merged as NzThemeConfig['components'];
}
