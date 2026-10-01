/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const ENGINE_CORE_BUDGET = 50 * 1024;
// Raised from 150 KiB to 256 KiB when the components bundle (151,480 B before Progress) crossed the
// old budget with Progress's line, circle and steps CSS. Raised again to 384 KiB when a 33-name
// bundle measured 265,567 B, and again to 512 KiB when a 51-name bundle measured 366,466 B before
// pagination.
export const ENGINE_COMPONENTS_BUDGET = 512 * 1024;
const SIZE_TOLERANCE = 1024;

export interface V6Manifest {
  antdVersion: string;
  engineCoreBytes: number;
  engineComponentsBytes: number;
  components: Record<string, { classes: string[]; tokens: string[] }>;
}

export const manifestPath = path.resolve(__dirname, 'manifest.json');

export function readManifest(file: string = manifestPath): V6Manifest {
  return JSON.parse(readFileSync(file, 'utf8')) as V6Manifest;
}

export function writeManifest(manifest: V6Manifest, file: string = manifestPath): void {
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

function setDiff(prefix: string, expected: string[], actual: string[], label: string, out: string[]): void {
  const e = new Set(expected);
  const a = new Set(actual);
  for (const x of actual) {
    if (!e.has(x)) {
      out.push(`${prefix}: +${label} ${x}`);
    }
  }
  for (const x of expected) {
    if (!a.has(x)) {
      out.push(`${prefix}: -${label} ${x}`);
    }
  }
}

/** Human-readable differences; empty when manifests are equivalent. */
export function diffManifest(expected: V6Manifest, actual: V6Manifest): string[] {
  const out: string[] = [];
  if (expected.antdVersion !== actual.antdVersion) {
    out.push(`antdVersion: ${expected.antdVersion} -> ${actual.antdVersion}`);
  }
  for (const key of ['engineCoreBytes', 'engineComponentsBytes'] as const) {
    if (Math.abs(expected[key] - actual[key]) > SIZE_TOLERANCE) {
      out.push(`${key}: ${expected[key]} -> ${actual[key]}`);
    }
  }
  const names = new Set([...Object.keys(expected.components), ...Object.keys(actual.components)]);
  for (const name of [...names].sort()) {
    const e = expected.components[name];
    const a = actual.components[name];
    if (!e) {
      out.push(`${name}: +component`);
      continue;
    }
    if (!a) {
      out.push(`${name}: -component`);
      continue;
    }
    setDiff(name, e.classes, a.classes, 'class', out);
    setDiff(name, e.tokens, a.tokens, 'token', out);
  }
  return out;
}
