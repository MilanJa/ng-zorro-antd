/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import * as antdExports from 'antd';

import { kebabCase } from './components';

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

/**
 * Every real antd export name (`Dropdown`, `Transfer`, `InputNumber`, …), kebab-cased once. antd's
 * component-token variables are namespaced by the kebab-case of the component's *registry* name
 * (`--ant-dropdown-*`, `--ant-button-*` for `Button` — not its `prefixCls`, which for `Button` is
 * `ant-btn`), so this is the same vocabulary a variable declaration's name is drawn from, independent
 * of which components this build happens to map.
 */
const ANTD_COMPONENT_SEGMENTS = new Set(
  Object.keys(antdExports)
    .filter(name => /^[A-Z]/.test(name))
    .map(kebabCase)
);

/**
 * A component that antd genuinely mounts as a child of another (Transfer's header always renders a
 * `Dropdown` trigger, `Section.js`) registers its own component-token variable block next to the
 * parent's when both share the same `cssVar.key` — real antd extraction for `Transfer` alone always
 * carries `--ant-dropdown-*` declarations as a result, even though `Dropdown` is never named in that
 * extraction's `includes`. Such a block is FOREIGN to an entry that does not itself map the nested
 * component: dropped here, before both the static engine bundle (which only ever registers a
 * component's tokens by importing its own style module directly) and any byte-parity comparison
 * against it, the same way `dropForeignCssVarBlocks` drops a differently-shaped foreign block.
 *
 * A block is dropped only when every one of its declarations names the SAME single component segment
 * (checked against the real universe of antd export names, longest word-run first, so a multi-word
 * name like `input-number` is matched whole) and that segment is not one of `ownComponents`. A global
 * alias-level declaration (`--ant-color-primary`, no recognizable component segment) or a mix of
 * segments keeps the whole block, matching `dropForeignCssVarBlocks`'s "when in doubt, keep it" default.
 * A non-variable declaration is a real style about to be lost, hence the throw.
 */
export function dropForeignComponentVarBlocks(blocks: CssBlock[], ownComponents: string[]): CssBlock[] {
  const own = new Set(ownComponents.map(kebabCase));
  const segmentOf = (declaration: string): string | null => {
    const words = declaration
      .slice(0, declaration.indexOf(':'))
      .replace(/^--ant-/, '')
      .split('-');
    for (let len = words.length; len >= 1; len--) {
      const candidate = words.slice(0, len).join('-');
      if (ANTD_COMPONENT_SEGMENTS.has(candidate)) {
        return candidate;
      }
    }
    return null;
  };
  return blocks.filter(block => {
    const declarations = block.body
      .split(';')
      .map(d => d.trim())
      .filter(Boolean);
    if (declarations.some(d => !d.startsWith('--'))) {
      throw new Error(`component var block with a non-variable declaration: ${block.selector}`);
    }
    const segments = new Set(declarations.map(segmentOf));
    if (segments.size !== 1) {
      return true; // no declarations, a global token, or a mix of segments -> keep
    }
    const [segment] = segments;
    return segment === null || own.has(segment);
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
