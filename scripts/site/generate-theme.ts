/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { writeFile } from 'fs-extra';
import less from 'less';
import LessPluginCleanCSS from 'less-plugin-clean-css';

import path from 'path';

import { aliyunPaletteLess } from '../build/aliyun-vars';
import { compactPaletteLess } from '../build/compact-vars';
import { darkPaletteLess } from '../build/dark-vars';
import { buildV6Bundle, V6Algorithm } from '../build/v6/generate-styles';

const themePath = path.join(__dirname, '../../site/styles.less');
const colorPalettePath = path.join(__dirname, '../../components/style/color/colorPalette.less');
const themeContent = `
@import '${themePath}';
`;

const v6ChromePath = path.join(__dirname, '../../site/styles-v6-chrome.less');
const componentsDir = path.join(__dirname, '../../components');

async function generateTheme(vars: Record<string, string | number>, fileName: string): Promise<void> {
  const data = await less.render(themeContent, {
    plugins: [new LessPluginCleanCSS({ advanced: true })],
    modifyVars: {
      hack: `true;@import '${colorPalettePath}';`,
      ...vars,
      '@site-markdown-code-bg': '@input-bg',
      '@site-text-color': '@heading-color'
    }
  });

  return writeFile(path.join(__dirname, `../../site/assets/${fileName}`), data.css);
}

async function generateV6Theme(algorithm: V6Algorithm, fileName: string): Promise<void> {
  const chrome = await less.render(`@import '${v6ChromePath}';`, {
    plugins: [new LessPluginCleanCSS({ advanced: true })],
    modifyVars: {
      hack: `true;@import '${colorPalettePath}';`,
      '@site-markdown-code-bg': '@input-bg',
      '@site-text-color': '@heading-color'
    }
  });
  const bundle = await buildV6Bundle(algorithm, componentsDir);
  return writeFile(path.join(__dirname, `../../site/assets/${fileName}`), `${chrome.css}\n${bundle.css}`);
}

export async function generateV6Themes(): Promise<void> {
  await Promise.all([
    generateV6Theme('default', 'v6.css'),
    generateV6Theme('dark', 'v6-dark.css'),
    generateV6Theme('compact', 'v6-compact.css')
  ]);
}

export default async function generateAllTheme(): Promise<void> {
  await Promise.all([
    generateTheme(compactPaletteLess, 'compact.css'),
    generateTheme(darkPaletteLess, 'dark.css'),
    generateTheme(aliyunPaletteLess, 'aliyun.css'),
    generateV6Themes()
  ]);
}
