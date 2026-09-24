/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import * as esbuild from 'esbuild';

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const shimsDir = path.resolve(__dirname, 'shims');

/** `DatePicker` -> `antd/es/date-picker/style/index.js`, `QRCode` -> `antd/es/qr-code/style/index.js`. */
export function antdStyleModulePath(name: string): string {
  const kebab = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
  return `antd/es/${kebab}/style/index.js`;
}

const shimPlugin: esbuild.Plugin = {
  name: 'ng-zorro-v6-shims',
  setup(build) {
    build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, () => ({ path: path.join(shimsDir, 'react.js') }));
    build.onResolve({ filter: /^@ant-design\/cssinjs-utils$/ }, () => ({
      path: path.join(shimsDir, 'cssinjs-utils.js')
    }));
  }
};

const CORE_ENTRY = `
export { default as seedToken } from 'antd/es/theme/themes/seed.js';
export { default as defaultAlgorithm } from 'antd/es/theme/themes/default/index.js';
export { default as darkAlgorithm } from 'antd/es/theme/themes/dark/index.js';
export { default as compactAlgorithm } from 'antd/es/theme/themes/compact/index.js';
export { default as formatToken } from 'antd/es/theme/util/alias.js';
export { unitless, ignore } from 'antd/es/theme/useToken.js';
export { token2CSSVar, transformToken } from '@ant-design/cssinjs/es/util/css-variables.js';
`;

function componentsEntry(antdNames: string[]): string {
  const imports = antdNames.map(n => `import '${antdStyleModulePath(n)}';`).join('\n');
  return `${imports}\nexport { registry } from '${path.join(shimsDir, 'cssinjs-utils.js').replace(/\\/g, '/')}';\n`;
}

export interface BundleEngineOptions {
  outDir: string;
  antdNames: string[];
  minify?: boolean;
}

export interface BundleEngineResult {
  coreBytes: number;
  componentsBytes: number;
}

export async function bundleEngine({
  outDir,
  antdNames,
  minify = true
}: BundleEngineOptions): Promise<BundleEngineResult> {
  mkdirSync(outDir, { recursive: true });
  const antdVersion = (require('antd/package.json') as { version: string }).version;
  const banner = `/*! Generated from Ant Design ${antdVersion} (MIT) by NG-ZORRO's generate-v6-engine. Do not edit. */`;

  const common: esbuild.BuildOptions = {
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify,
    write: false,
    logLevel: 'silent',
    ignoreAnnotations: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [shimPlugin],
    banner: { js: banner },
    absWorkingDir: path.resolve(__dirname, '../../..')
  };

  const core = await esbuild.build({
    ...common,
    stdin: { contents: CORE_ENTRY, resolveDir: path.resolve(__dirname, '../../..'), loader: 'js' }
  });
  const components = await esbuild.build({
    ...common,
    stdin: { contents: componentsEntry(antdNames), resolveDir: path.resolve(__dirname, '../../..'), loader: 'js' }
  });

  const coreText = core.outputFiles![0].text;
  const componentsText = components.outputFiles![0].text;
  writeFileSync(path.join(outDir, 'engine-core.mjs'), coreText);
  writeFileSync(path.join(outDir, 'engine-components.mjs'), componentsText);
  return { coreBytes: Buffer.byteLength(coreText), componentsBytes: Buffer.byteLength(componentsText) };
}
