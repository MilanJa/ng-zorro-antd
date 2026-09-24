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

/** Component variable names are namespaced, so every variable block can live on :root. */
export function varsToRoot(vars: CssBlock[]): string {
  return [...new Set(vars.map(b => `:root{${b.body}}`))].join('\n');
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
