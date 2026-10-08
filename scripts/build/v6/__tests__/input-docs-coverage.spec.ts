/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const componentsDir = path.resolve(__dirname, '../../../../components');
type Dir =
  | 'menu'
  | 'steps'
  | 'timeline'
  | 'splitter'
  | 'flex'
  | 'divider'
  | 'tag'
  | 'badge'
  | 'tabs'
  | 'pagination'
  | 'progress'
  | 'float-button'
  | 'grid'
  | 'layout'
  | 'dropdown'
  | 'breadcrumb';
type Lang = 'en-US' | 'zh-CN';

/** Files whose `nz*` inputs/outputs are public API and must be documented. */
const PUBLIC_FILES: Record<Dir, readonly string[]> = {
  menu: [
    'menu.directive.ts',
    'menu-item.component.ts',
    'submenu.component.ts',
    'menu-group.component.ts',
    'menu-divider.directive.ts'
  ],
  steps: ['steps.component.ts', 'step.component.ts'],
  timeline: ['timeline.component.ts', 'timeline-item.component.ts'],
  splitter: ['splitter.component.ts', 'splitter-panel.component.ts'],
  flex: ['nz-flex.directive.ts'],
  divider: ['divider.component.ts'],
  tag: ['tag.component.ts', 'tag-checkable-group.component.ts'],
  badge: ['badge.component.ts', 'ribbon.component.ts'],
  tabs: ['tabs.component.ts', 'tab.component.ts'],
  pagination: ['pagination.component.ts'],
  progress: ['progress.component.ts'],
  'float-button': ['float-button.component.ts', 'float-button-group.component.ts', 'float-button-top.component.ts'],
  grid: ['row.directive.ts', 'col.directive.ts'],
  layout: ['sider.component.ts'],
  dropdown: ['dropdown.directive.ts'],
  breadcrumb: ['breadcrumb.component.ts', 'breadcrumb-item.component.ts']
};
/** Internal components that forward `nz*` inputs from their public parent; not documented. */
const INTERNAL_FILES: Partial<Record<Dir, readonly string[]>> = {
  menu: ['submenu-non-inline-child.component.ts', 'submenu-title.component.ts'],
  badge: ['badge-sup.component.ts'],
  pagination: ['pagination-default.component.ts', 'pagination-options.component.ts'],
  'float-button': ['float-button-content.component.ts'],
  layout: ['sider-trigger.component.ts']
};
/** Inputs that only render under the v6 stylesheet (spec section 2 rule 3). Later tasks append. */
const V6_ONLY: Record<Dir, readonly string[]> = {
  menu: ['nzExtra', 'nzDashed'],
  steps: ['nzType', 'nzVariant', 'nzEllipsis'],
  timeline: ['nzOrientation', 'nzVariant', 'nzTitleSpan'],
  splitter: ['nzCollapsible', 'nzDraggerIcon'],
  flex: [],
  divider: ['nzTitleMargin'],
  tag: ['nzVariant', 'nzDisabled'],
  badge: [],
  tabs: [],
  pagination: [],
  progress: [],
  'float-button': [],
  grid: [],
  layout: [],
  dropdown: [],
  breadcrumb: []
};
const V6_PHRASE: Record<Lang, string> = { 'en-US': 'Requires the v6 stylesheet.', 'zh-CN': '需要 v6 样式表。' };
const DEPRECATED_PREFIX: Record<Lang, string> = { 'en-US': 'Deprecated, use ', 'zh-CN': '已废弃，请使用 ' };

const DECLARATION =
  /@(?:Input|Output)\(([^)]*)\)\s*(?:(?:public|protected|readonly|override|set|get)\s+)*(\w+)|(?:readonly\s+)?(\w+)\s*=\s*(?:input|model|output)(?:\.required)?\s*[<(]/g;
/** A JSDoc block containing `@deprecated`, optionally followed by line comments (the `v6-alias` marker). */
const DEPRECATED_ABOVE = /\/\*\*(?:(?!\*\/)[\s\S])*@deprecated(?:(?!\*\/)[\s\S])*\*\/(?:\s*\/\/[^\n]*)*$/;

function declarations(src: string): Array<{ name: string; deprecated: boolean }> {
  return [...src.matchAll(DECLARATION)]
    .map(m => ({
      name: (m[1] && /alias:\s*'(\w+)'/.exec(m[1])?.[1]) || m[2] || m[3],
      deprecated: DEPRECATED_ABOVE.test(src.slice(Math.max(0, m.index - 600), m.index).trimEnd())
    }))
    .filter(d => d.name.startsWith('nz'));
}

function docRows(dir: Dir, lang: Lang): string[][] {
  return readFileSync(path.join(componentsDir, dir, 'doc', `index.${lang}.md`), 'utf8')
    .split('\n')
    .filter(line => line.startsWith('|'))
    .map(line =>
      line
        .split(/(?<!\\)\|/)
        .slice(1, -1)
        .map(cell => cell.trim())
    );
}

const names = (cell: string, name: string): boolean => cell.includes(`[${name}]`) || cell.includes(`(${name})`);
const read = (dir: Dir, file: string): string => readFileSync(path.join(componentsDir, dir, file), 'utf8');

describe('declaration parser', () => {
  it('reads decorator, aliased, accessor and signal declarations and JSDoc deprecation', () => {
    const src = [
      '@Input() nzA = 1;',
      "@Input({ alias: 'nzB', transform: booleanAttribute }) b = false;",
      '@Input()\n  set nzC(v: string) {}',
      '/** @deprecated Use `nzE` instead. */\n// v6-alias: nzD -> nzE\n@Input() set nzD(v: string) {}',
      'readonly nzF = input<string>();',
      'readonly nzG = output<void>();',
      '@Output() readonly nzH = new EventEmitter<void>();',
      'readonly open = input(false);'
    ].join('\n');
    expect(declarations(src)).toEqual([
      { name: 'nzA', deprecated: false },
      { name: 'nzB', deprecated: false },
      { name: 'nzC', deprecated: false },
      { name: 'nzD', deprecated: true },
      { name: 'nzF', deprecated: false },
      { name: 'nzG', deprecated: false },
      { name: 'nzH', deprecated: false }
    ]);
  });
});

for (const dir of Object.keys(PUBLIC_FILES) as Dir[]) {
  describe(`${dir} API docs`, () => {
    const decls = PUBLIC_FILES[dir].flatMap(file => declarations(read(dir, file)).map(d => ({ ...d, file })));

    it('classifies every file that declares nz inputs as public or internal', () => {
      const known = [...PUBLIC_FILES[dir], ...(INTERNAL_FILES[dir] ?? [])];
      const unclassified = readdirSync(path.join(componentsDir, dir))
        .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts') && !known.includes(f))
        .filter(f => declarations(read(dir, f)).length > 0);
      expect(unclassified).toEqual([]);
    });

    for (const lang of ['en-US', 'zh-CN'] as Lang[]) {
      const rows = docRows(dir, lang);
      const rowFor = (name: string): string[] | undefined => rows.find(row => names(row[0] ?? '', name));

      it(`${lang}: every nz input and output has a row`, () => {
        expect(decls.filter(d => !rowFor(d.name)).map(d => `${d.file}: ${d.name}`)).toEqual([]);
      });

      it(`${lang}: every @deprecated input has a struck-through row with the deprecation prefix`, () => {
        const bad = decls
          .filter(d => d.deprecated)
          .filter(d => {
            const row = rowFor(d.name);
            return !row || !row[0].includes('~~') || !(row[1] ?? '').startsWith(DEPRECATED_PREFIX[lang]);
          });
        expect(bad.map(d => `${d.file}: ${d.name}`)).toEqual([]);
      });

      it(`${lang}: every v6-only input says it requires the v6 stylesheet`, () => {
        expect(V6_ONLY[dir].filter(name => !(rowFor(name)?.[1] ?? '').endsWith(V6_PHRASE[lang]))).toEqual([]);
      });
    }
  });
}
