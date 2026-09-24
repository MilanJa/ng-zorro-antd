/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { extractStyle } from '@ant-design/static-style-extract';
import { ConfigProvider } from 'antd';
import React from 'react';

export interface ExtractOptions {
  /** antd component names, e.g. ['Button'] */
  includes: string[];
  /** cssVar key; blocks whose selector contains `.${key}` are variable blocks */
  key: string;
  /** antd ThemeConfig fields (algorithm, token, components) */
  theme?: Record<string, unknown>;
}

/** Raw antd CSS for the given components, unhashed, with CSS variables keyed by `key`. */
export function extractAntdCss({ includes, key, theme = {} }: ExtractOptions): string {
  return extractStyle({
    includes,
    customTheme: node =>
      React.createElement(ConfigProvider, { theme: { hashed: false, cssVar: { key }, ...theme } }, node)
  });
}
