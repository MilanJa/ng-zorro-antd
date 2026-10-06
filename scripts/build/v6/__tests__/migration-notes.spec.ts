/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../../..');
const HEADER = ['Component', 'Old input', 'New input', 'Value mapping', 'Removal'];

function tableRows(md: string): string[][] {
  return md
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|'))
    .map(line =>
      line
        .slice(1, -1)
        .split('|')
        .map(cell => cell.trim().replace(/`/g, ''))
    );
}

/** `// v6-alias: <old> -> <new>` markers in library sources (specs, demos and docs excluded). */
function aliasMarkers(): Array<{ file: string; oldName: string; newName: string }> {
  const files = (readdirSync(path.join(root, 'components'), { recursive: true }) as string[])
    .map(file => file.split(path.sep).join('/'))
    .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts') && !/(^|\/)(demo|doc)\//.test(file));
  return files.flatMap(file =>
    [...readFileSync(path.join(root, 'components', file), 'utf8').matchAll(/\/\/ v6-alias: (\w+) -> (\w+)/g)].map(
      ([, oldName, newName]) => ({ file, oldName, newName })
    )
  );
}

describe('docs/v6-migration-notes.md', () => {
  const rows = tableRows(readFileSync(path.join(root, 'docs/v6-migration-notes.md'), 'utf8'));
  const body = rows.slice(2);

  it('has the five-column alias table', () => {
    expect(rows[0]).toEqual(HEADER);
    expect(rows[1].every(cell => /^-{3,}$/.test(cell))).toBe(true);
    expect(body.filter(row => row.length !== HEADER.length)).toEqual([]);
  });

  it('has a row for every v6-alias marker in components/', () => {
    const missing = aliasMarkers()
      .filter(({ oldName, newName }) => !body.some(row => row[1].startsWith(oldName) && row[2] === newName))
      .map(({ file, oldName, newName }) => `${file}: ${oldName} -> ${newName}`);
    expect(missing).toEqual([]);
  });

  it('has no row without a marker', () => {
    const markers = aliasMarkers();
    const orphans = body.filter(row => !markers.some(m => row[1].startsWith(m.oldName) && row[2] === m.newName));
    expect(orphans).toEqual([]);
  });
});
