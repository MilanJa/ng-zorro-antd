/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { computed, inject, InjectionToken, Signal } from '@angular/core';

/** Provided by `[nzTheme]`: the scope class of the nearest enclosing scoped theme. */
export const NZ_THEME_SCOPE = new InjectionToken<Signal<string | null>>('NZ_THEME_SCOPE');

/**
 * Classes an overlay-based component adds to its popup root so a scoped theme reaches content rendered in
 * the CDK overlay container. Call from an injection context; returns an empty list outside any scope.
 */
export function nzThemeScopeClasses(): Signal<string[]> {
  const scope = inject(NZ_THEME_SCOPE, { optional: true });
  return computed(() => {
    const cls = scope?.();
    return cls ? [cls] : [];
  });
}
