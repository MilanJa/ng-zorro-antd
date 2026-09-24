/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type Scalar = 'string' | 'number' | 'boolean';

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Ordinal (code-unit) comparison, so the output does not depend on the machine's locale/ICU data. */
function ordinal(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function scalarEntries(obj: Record<string, unknown>): Array<[string, Scalar]> {
  return Object.entries(obj)
    .filter(([, v]) => ['string', 'number', 'boolean'].includes(typeof v))
    .map(([k, v]): [string, Scalar] => [k, typeof v as Scalar])
    .sort(([a], [b]) => ordinal(a, b));
}

// antd's own token keys include names such as `blue-1` (see `LegacyColorPalettes`) that are not valid
// TypeScript identifiers; quote those as string-literal property names so the emitted interface stays
// syntactically valid (`tsc` rejects an unquoted `blue-1: string;`).
function propertyName(key: string): string {
  return VALID_IDENTIFIER.test(key) ? key : JSON.stringify(key);
}

function renderInterface(name: string, entries: Array<[string, Scalar]>, extendsName?: string): string {
  const head = extendsName ? `export interface ${name} extends ${extendsName} {` : `export interface ${name} {`;
  return [head, ...entries.map(([k, t]) => `  ${propertyName(k)}: ${t};`), '}'].join('\n');
}

/**
 * Writes tokens.ts (a plain source file, not `.d.ts`) next to the engine bundles in `generatedDir`.
 *
 * It has to be a real `.ts` source rather than a hand-authored `.d.ts`: ng-packagr's declaration bundler
 * (rollup-plugin-dts) only resolves relative imports against files TypeScript itself emitted for this
 * compilation (its `outputCache`); a `.d.ts` inside `rootDir` is never "emitted" (tsc treats it as
 * already-a-declaration and never copies it to `outDir`), so any entry point re-exporting types from it
 * (`core/theme`'s `public-api.ts`, and `theme.service.ts`'s `Signal<NzAliasToken | null>`) would fail
 * `ng-packagr build` with "Could not resolve './generated/tokens'" even though `tsc --noEmit` is clean.
 * A `.ts` file with the same interface-only content compiles like any other source and lands in that
 * cache at the expected relative path, so the bundler can find it.
 */
export async function generateTypes(generatedDir: string): Promise<void> {
  const core = await import(pathToFileURL(path.join(generatedDir, 'engine-core.ts')).href);
  const { registry } = await import(pathToFileURL(path.join(generatedDir, 'engine-components.ts')).href);
  const seed = core.seedToken as Record<string, unknown>;
  const alias = core.formatToken({ ...core.defaultAlgorithm(seed), override: {} }) as Record<string, unknown>;

  const seedEntries = scalarEntries(seed);
  const seedKeys = new Set(seedEntries.map(([k]) => k));
  const aliasEntries = scalarEntries(alias).filter(([k]) => !seedKeys.has(k));

  const componentBlocks: string[] = [];
  const mapEntries: string[] = [];
  for (const [name, entry] of [...registry.entries()].sort(([a], [b]) => ordinal(a as string, b as string))) {
    const defaults =
      typeof entry.getDefaultToken === 'function' ? entry.getDefaultToken({ ...alias }) : (entry.getDefaultToken ?? {});
    componentBlocks.push(renderInterface(`Nz${name}Token`, scalarEntries(defaults)));
    mapEntries.push(`  ${name}: Nz${name}Token;`);
  }

  const antdVersion =
    (core as { version?: string }).version ?? (require('antd/package.json') as { version: string }).version;

  const out = [
    '/**',
    ' * Use of this source code is governed by an MIT-style license that can be',
    ' * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE',
    ' */',
    '',
    `/* Generated from Ant Design ${antdVersion} by scripts/build/v6/generate-types.ts. Do not edit. */`,
    '',
    renderInterface('NzSeedToken', seedEntries),
    '',
    renderInterface('NzAliasToken', aliasEntries, 'NzSeedToken'),
    '',
    ...componentBlocks.flatMap(b => [b, '']),
    ['export interface NzComponentTokenMap {', ...mapEntries, '}'].join('\n'),
    ''
  ].join('\n');
  writeFileSync(path.join(generatedDir, 'tokens.ts'), out);
}
