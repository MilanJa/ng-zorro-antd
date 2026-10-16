/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { warnDeprecation } from 'ng-zorro-antd/core/logger';

/**
 * Returns a mapper for a deprecated input that forwards to its replacement.
 * Warns once per (component, oldName) in dev mode the first time it is called with a value; `undefined`
 * (a pass-through binding with nothing set) still maps but never warns and does not use up the warning.
 *
 * Decorator setters that pair a new input with an alias follow two rules (signal inputs get both from
 * `computed(() => nzNew() ?? nzOld())`):
 * - the new input is the source of truth: once bound to a value it wins over the alias, in either binding order;
 * - undefined means unset: a setter receiving `undefined` clears its explicit flag, falls back to the alias
 *   or default, and does not warn (the alias mapper itself skips the warning for `undefined`).
 *
 * ```ts
 * set nzNew(value: T | undefined) {
 *   this.nzNewExplicit = value !== undefined;
 *   this.resolved = value ?? this.aliasValue ?? DEFAULT;
 * }
 * ```
 */
export function aliasDeprecatedInput<TOld, TNew = TOld>(
  component: string,
  oldName: string,
  newName: string,
  map: (value: TOld) => TNew = value => value as unknown as TNew
): (value: TOld) => TNew {
  let warned = false;
  return (value: TOld): TNew => {
    if (!warned && value !== undefined) {
      warned = true;
      warnDeprecation(
        `\`${oldName}\` on \`${component}\` is deprecated, use \`${newName}\` instead. This will be removed in v23.0.0.`
      );
    }
    return map(value);
  };
}
