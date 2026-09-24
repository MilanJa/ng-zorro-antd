/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import {
  assertNoAntdScoping,
  extractClassNames,
  extractTokenNames,
  joinTemplate,
  partitionBlocks,
  splitBlocks,
  varsToRoot,
  withHeader
} from '../css-postprocess';

const KEY = 'nz-root';
const sample = [
  `.${KEY}{--ant-color-primary:#1677ff;--ant-line-width:1px;}`,
  `.${KEY}.ant-btn{--ant-button-default-bg:#ffffff;}`,
  `.ant-btn{color:var(--ant-btn-text-color);}`,
  `@keyframes antSlideUpIn{0%{transform:scaleY(0.8);opacity:0;}100%{transform:scaleY(1);opacity:1;}}`,
  `@media (max-width: 575px){.ant-btn-block{width:100%;}}`,
  `.ant-btn.ant-btn-variant-solid{--ant-btn-bg-color:var(--ant-btn-color-base);}`
].join('');

describe('splitBlocks', () => {
  it('splits into top-level blocks and keeps nested bodies intact', () => {
    const blocks = splitBlocks(sample);
    expect(blocks.map(b => b.selector)).toEqual([
      `.${KEY}`,
      `.${KEY}.ant-btn`,
      '.ant-btn',
      '@keyframes antSlideUpIn',
      '@media (max-width: 575px)',
      '.ant-btn.ant-btn-variant-solid'
    ]);
    expect(blocks[3].body).toBe('0%{transform:scaleY(0.8);opacity:0;}100%{transform:scaleY(1);opacity:1;}');
    expect(blocks[4].raw).toBe('@media (max-width: 575px){.ant-btn-block{width:100%;}}');
  });

  it('round-trips: joining raw blocks reproduces the input', () => {
    expect(
      splitBlocks(sample)
        .map(b => b.raw)
        .join('')
    ).toBe(sample);
  });
});

describe('partitionBlocks', () => {
  it('separates variable blocks (selector contains .key) from template blocks', () => {
    const { template, vars } = partitionBlocks(sample, KEY);
    expect(vars.map(b => b.selector)).toEqual([`.${KEY}`, `.${KEY}.ant-btn`]);
    expect(template).toHaveLength(4);
    expect(template.some(b => b.selector.includes(KEY))).toBe(false);
  });
});

describe('varsToRoot', () => {
  it('moves every variable block onto :root and deduplicates', () => {
    const { vars } = partitionBlocks(`${sample}.${KEY}.ant-input{--ant-button-default-bg:#ffffff;}`, KEY);
    const css = varsToRoot(vars);
    expect(css).toBe(
      `:root{--ant-color-primary:#1677ff;--ant-line-width:1px;}\n:root{--ant-button-default-bg:#ffffff;}`
    );
  });
});

describe('joinTemplate', () => {
  it('joins raw template blocks with newlines', () => {
    const { template } = partitionBlocks(sample, KEY);
    expect(joinTemplate(template).split('\n')).toHaveLength(4);
  });
});

describe('assertNoAntdScoping', () => {
  it('passes for clean css and throws for antd scoping classes', () => {
    expect(() => assertNoAntdScoping('.ant-btn{color:red}')).not.toThrow();
    expect(() => assertNoAntdScoping('.css-var-_R_0_.ant-btn{}')).toThrow(/css-var-/);
    expect(() => assertNoAntdScoping('.ant-select-css-var{}')).toThrow(/-css-var/);
  });
});

describe('extractClassNames / extractTokenNames', () => {
  it('lists sorted unique ant-* classes from selectors only', () => {
    expect(extractClassNames(sample)).toEqual(['ant-btn', 'ant-btn-block', 'ant-btn-variant-solid']);
  });

  it('lists sorted unique declared --ant-* tokens, ignoring var() references', () => {
    expect(extractTokenNames(sample)).toEqual([
      '--ant-btn-bg-color',
      '--ant-button-default-bg',
      '--ant-color-primary',
      '--ant-line-width'
    ]);
  });
});

describe('withHeader', () => {
  it('prepends the attribution comment', () => {
    const out = withHeader('.a{}', '6.6.5');
    expect(out.startsWith('/*! Generated from Ant Design 6.6.5 (MIT)')).toBe(true);
    expect(out.endsWith('.a{}')).toBe(true);
  });
});
