/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
// Replaces `@ant-design/cssinjs-utils` when bundling antd's style modules. Instead of creating React
// hooks, `genStyleHooks` records each component's default-token factory and unitless options.
// The style function argument is deliberately not referenced so esbuild can drop the style code.
export { default as genCalc } from '@ant-design/cssinjs-utils/es/util/calc/index.js';
export { merge as mergeToken, default as statisticToken, statistic } from '@ant-design/cssinjs-utils/es/util/statistic.js';

export const registry = new Map();

export function genStyleUtils(config) {
  const getCompUnitless = config.getCompUnitless;

  const record = (component, getDefaultToken, options) => {
    const [name, subStyle] = Array.isArray(component) ? [component[0], component[1] ?? component[0]] : [component, component];
    const existing = registry.get(name);
    if (existing) {
      if (existing.getDefaultToken !== getDefaultToken) {
        throw new Error(
          `v6 recorder: conflicting default-token factories for ${String(name)} (sub-styles: ${[...existing.subStyles, subStyle].join(', ')})`
        );
      }
      existing.subStyles.push(subStyle);
      return;
    }
    const prefixToken = key => `${String(name)}${key.slice(0, 1).toUpperCase()}${key.slice(1)}`;
    const unitless = {
      ...(typeof getCompUnitless === 'function' ? getCompUnitless(component) : {}),
      [prefixToken('zIndexPopup')]: true
    };
    Object.keys((options && options.unitless) || {}).forEach(k => {
      unitless[prefixToken(k)] = options.unitless[k];
    });
    registry.set(name, {
      getDefaultToken,
      unitless,
      ignore: options && options.ignore,
      deprecatedTokens: options && options.deprecatedTokens,
      prefixToken,
      subStyles: [subStyle]
    });
  };

  return {
    genStyleHooks(component, _styleFn, getDefaultToken, options) {
      record(component, getDefaultToken, options);
      return () => ['', ''];
    },
    genComponentStyleHook(component, _styleFn, getDefaultToken, options) {
      record(component, getDefaultToken, options);
      return () => '';
    },
    genSubStyleComponent() {
      return () => null;
    }
  };
}
