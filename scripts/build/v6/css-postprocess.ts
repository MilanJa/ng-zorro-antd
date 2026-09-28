/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

export interface CssBlock {
  selector: string;
  body: string;
  raw: string;
}

/** Split CSS into top-level blocks. Nested braces (@keyframes, @media) stay inside `body`. */
export function splitBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  let depth = 0;
  let start = 0;
  let selectorEnd = -1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === '{') {
      if (depth === 0) {
        selectorEnd = i;
      }
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const selector = css.slice(start, selectorEnd).trim();
        const body = css.slice(selectorEnd + 1, i);
        blocks.push({ selector, body, raw: `${selector}{${body}}` });
        start = i + 1;
      }
    }
  }
  return blocks;
}

export function partitionBlocks(css: string, key: string): { template: CssBlock[]; vars: CssBlock[] } {
  const marker = `.${key}`;
  const blocks = splitBlocks(css);
  return {
    template: blocks.filter(b => !b.selector.includes(marker)),
    vars: blocks.filter(b => b.selector.includes(marker))
  };
}

/**
 * antd renders some variants inside a nested `ConfigProvider` without our `cssVar.key` (Modal's confirm
 * dialog does), so the extracted CSS gains blocks scoped by a React-`useId` key such as
 * `.css-var-_R_1f_{--ant-blue:…}` or `.css-var-_R_1f_.ant-btn{--ant-button-…}`. They only repeat token
 * values that our `.${key}` variable blocks already carry, so they are dropped. A foreign block with a
 * non-variable declaration would be a real style we are about to lose, hence the throw.
 */
export function dropForeignCssVarBlocks(blocks: CssBlock[], key: string): CssBlock[] {
  return blocks.filter(block => {
    const foreign = block.selector.includes('.css-var-') && !block.selector.includes(`.${key}`);
    if (!foreign) {
      return true;
    }
    const declarations = block.body
      .split(';')
      .map(d => d.trim())
      .filter(Boolean);
    if (declarations.some(d => !d.startsWith('--'))) {
      throw new Error(`foreign css-var block with non-variable declarations: ${block.selector}`);
    }
    return false;
  });
}

/** Component variable names are namespaced, so every variable block can live on :root. */
export function varsToRoot(vars: CssBlock[]): string {
  return [...new Set(vars.map(b => `:root{${b.body}}`))].join('\n');
}

/**
 * Some antd components (e.g. Input, Select) call `useCSSVarCls(prefixCls)` and register their reset
 * styles under that derived `<prefixCls>-css-var` root class instead of the plain component class. That
 * class only exists to scope antd's own React render; ng-zorro's markup never applies it. Rewriting the
 * class straight to `.ant-<x>` is *not* equivalent: antd's reset rules also target descendants via
 * `.ant-<x>-css-var [class^="ant-<x>"], .ant-<x>-css-var [class*=" ant-<x>"]` (see `genCommonStyle` in
 * `node_modules/antd/es/style/index.js`), and collapsing the root class alone turns those descendant
 * rules dead (e.g. `.ant-input [class^="ant-input"]{box-sizing:border-box}` never matches anything under
 * a bare `<input>`), silently dropping `box-sizing` from affix wrappers, dropdown roots, etc. antd's own
 * no-rootCls fallback in that same file is `[class^="ant-<x>"], [class*=" ant-<x>"]` (an attribute
 * selector matching the element carrying the class, with no separate root wrapper needed), so reproduce
 * that instead, wrapped in `:is(...)` to keep it a single compound selector at the same specificity as
 * the class it replaces. The negative lookahead keeps `.ant-x-css-var-foo` (a different, unrelated class)
 * from being mistaken for the scoping class.
 */
export function normalizeCssVarRootCls(css: string): string {
  return css.replace(/\.(ant-[a-z-]+)-css-var(?![\w-])/g, ':is([class^="$1"],[class*=" $1"])');
}

export function joinTemplate(template: CssBlock[]): string {
  return template.map(b => b.raw).join('\n');
}

export function assertNoAntdScoping(css: string): void {
  const match = /css-var-|-css-var/.exec(css);
  if (match) {
    throw new Error(`antd CSS variable scoping class survived post-processing: "${match[0]}" at ${match.index}`);
  }
}

export function extractClassNames(css: string): string[] {
  const names = new Set<string>();
  for (const block of splitBlocks(css)) {
    collectClassNames(block, names);
  }
  return [...names].sort();
}

function collectClassNames(block: CssBlock, names: Set<string>): void {
  if (block.selector.startsWith('@keyframes')) {
    return;
  }
  if (block.selector.startsWith('@')) {
    for (const inner of splitBlocks(block.body)) {
      collectClassNames(inner, names);
    }
    return;
  }
  for (const m of block.selector.matchAll(/\.(ant-[a-z0-9-]+)/g)) {
    names.add(m[1]);
  }
}

export function extractTokenNames(css: string): string[] {
  const names = new Set<string>();
  for (const m of css.matchAll(/(--ant-[a-z0-9-]+)\s*:/g)) {
    names.add(m[1]);
  }
  return [...names].sort();
}

export function withHeader(css: string, antdVersion: string): string {
  return `/*! Generated from Ant Design ${antdVersion} (MIT) by NG-ZORRO's generate-v6-styles. Do not edit. */\n${css}`;
}
