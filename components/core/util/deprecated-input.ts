/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { warnDeprecation } from 'ng-zorro-antd/core/logger';

/**
 * Returns a mapper for a deprecated input that forwards to its replacement.
 * Warns once per (component, oldName) in dev mode the first time it is called.
 */
export function aliasDeprecatedInput<TOld, TNew = TOld>(
  component: string,
  oldName: string,
  newName: string,
  map: (value: TOld) => TNew = value => value as unknown as TNew
): (value: TOld) => TNew {
  let warned = false;
  return (value: TOld): TNew => {
    if (!warned) {
      warned = true;
      warnDeprecation(
        `\`${oldName}\` on \`${component}\` is deprecated, use \`${newName}\` instead. This will be removed in v23.0.0.`
      );
    }
    return map(value);
  };
}
