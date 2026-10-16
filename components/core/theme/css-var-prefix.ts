/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { warn } from 'ng-zorro-antd/core/logger';

import type { NzThemeConfig } from './theme.types';

/**
 * The generated theme templates only declare `--ant-*` variables, so a `cssVar.prefix` other than `ant`
 * writes variables nothing reads. Warns in dev mode, once per prefix.
 */
export function warnUnsupportedCssVarPrefix(config: NzThemeConfig): void {
  const prefix = config.cssVar?.prefix;
  if (prefix !== undefined && prefix !== 'ant') {
    warn(
      `\`cssVar.prefix\` is not supported: the v6 stylesheet reads \`--ant-*\` variables only, so \`${prefix}\` leaves components unstyled. Remove it or set it to 'ant'.`
    );
  }
}
