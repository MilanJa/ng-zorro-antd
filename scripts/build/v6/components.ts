/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Components that have Ant Design v6 style output. Keys are directories under `components/`,
 * values list the antd component names passed to `@ant-design/static-style-extract`.
 * Adding a component here is the first step of migrating it to v6 (see .claude/DEVELOPMENT.md).
 */
export const v6Components = {
  button: { antd: ['Button'] },
  input: { antd: ['Input'] },
  select: { antd: ['Select'] },
  space: { antd: ['Space'] }
} as const satisfies Record<string, { antd: readonly string[] }>;

export type V6ComponentDir = keyof typeof v6Components;

export const v6ComponentDirs = Object.keys(v6Components) as V6ComponentDir[];

/** All antd component names across the map, deduplicated, in map order. */
export function allAntdComponentNames(): string[] {
  return [...new Set(v6ComponentDirs.flatMap(dir => [...v6Components[dir].antd]))];
}
