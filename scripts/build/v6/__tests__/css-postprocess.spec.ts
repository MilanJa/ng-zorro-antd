/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { describe, expect, it } from 'vitest';

import {
  assertNoAntdScoping,
  type CssBlock,
  dropForeignComponentVarBlocks,
  dropForeignCssVarBlocks,
  extractClassNames,
  extractTokenNames,
  joinTemplate,
  partitionBlocks,
  rewriteClassPrefix,
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

describe('dropForeignCssVarBlocks', () => {
  it('drops variable-only blocks scoped by a foreign css-var key and keeps ours', () => {
    const css = [
      '.nz-root{--ant-blue:#1677FF}',
      '.css-var-_R_1f_{--ant-blue:#1677FF;--ant-purple:#722ED1}',
      '.css-var-_R_1f_.ant-css-var{--ant-modal-header-bg:transparent}',
      '.css-var-_R_1f_.ant-btn{--ant-button-primary-color:#fff}',
      '.ant-modal{position:relative}'
    ].join('');
    const kept = dropForeignCssVarBlocks(splitBlocks(css), 'nz-root').map(b => b.selector);
    expect(kept).toEqual(['.nz-root', '.ant-modal']);
  });

  it('throws when a foreign block carries a real declaration', () => {
    const blocks = splitBlocks('.css-var-_R_2a_.ant-x{--ant-a:1;color:red}');
    expect(() => dropForeignCssVarBlocks(blocks, 'nz-root')).toThrow(
      /non-variable declarations: \.css-var-_R_2a_\.ant-x/
    );
  });
});

describe('dropForeignComponentVarBlocks', () => {
  // Shaped like real antd extraction: Transfer's own component-token block carries no `-css-var`
  // marker on its root class, while Dropdown's does (it calls `useCSSVarCls`) — the helper does not
  // rely on that difference, only on the variable names themselves.
  const dropdownBlock = '.x.ant-dropdown-css-var{--ant-dropdown-z-index-popup:1050;--ant-dropdown-padding-block:5px;}';
  const transferBlock = '.x.ant-transfer{--ant-transfer-list-width:180px;--ant-transfer-list-height:200px;}';

  it('drops a block whose declarations are all for a component absent from ownComponents', () => {
    const kept = dropForeignComponentVarBlocks(splitBlocks(dropdownBlock + transferBlock), ['Transfer']).map(
      b => b.selector
    );
    expect(kept).toEqual(['.x.ant-transfer']);
  });

  it('keeps a block whose component is in ownComponents', () => {
    const kept = dropForeignComponentVarBlocks(splitBlocks(dropdownBlock), ['Dropdown']).map(b => b.selector);
    expect(kept).toEqual(['.x.ant-dropdown-css-var']);
  });

  it('keeps a block mixing a foreign component segment with another declaration', () => {
    const mixed = '.x{--ant-dropdown-padding-block:5px;--ant-transfer-list-width:180px;}';
    expect(dropForeignComponentVarBlocks(splitBlocks(mixed), ['Transfer']).map(b => b.selector)).toEqual(['.x']);
    // A foreign segment mixed with an unrecognized (global) declaration is kept the same way.
    const mixedWithGlobal = '.x{--ant-dropdown-padding-block:5px;--ant-color-primary:#1677ff;}';
    expect(dropForeignComponentVarBlocks(splitBlocks(mixedWithGlobal), ['Transfer']).map(b => b.selector)).toEqual([
      '.x'
    ]);
  });

  it('keeps a block of unrecognized global alias tokens regardless of ownComponents', () => {
    const global = '.x{--ant-color-primary:#1677ff;--ant-control-item-bg-active:#e6f4ff;}';
    expect(dropForeignComponentVarBlocks(splitBlocks(global), ['Transfer']).map(b => b.selector)).toEqual(['.x']);
  });

  it('throws when a foreign-component block carries a non-variable declaration', () => {
    const blocks = splitBlocks('.x.ant-dropdown-css-var{--ant-dropdown-padding-block:5px;color:red}');
    expect(() => dropForeignComponentVarBlocks(blocks, ['Transfer'])).toThrow(
      /non-variable declaration: \.x\.ant-dropdown-css-var/
    );
  });
});

describe('rewriteClassPrefix', () => {
  const blocks = (css: string): CssBlock[] => splitBlocks(css);
  const css = (b: CssBlock[]): string => joinTemplate(b);

  it('rewrites every class selector under the prefix, compound forms included', () => {
    const out = css(
      rewriteClassPrefix(
        blocks(
          '.ant-steps .ant-steps-item-icon{a:1}' +
            '.ant-steps-vertical>.ant-steps-item:not(.ant-steps-item-active)::after{b:2}' +
            '.ant-steps.ant-steps-dot .ant-steps-item-icon .ant-steps-icon-dot{c:3}'
        ),
        'ant-steps',
        'ant-timeline'
      )
    );
    expect(out).toContain('.ant-timeline .ant-timeline-item-icon{a:1}');
    expect(out).toContain('.ant-timeline-vertical>.ant-timeline-item:not(.ant-timeline-item-active)::after{b:2}');
    expect(out).toContain('.ant-timeline.ant-timeline-dot .ant-timeline-item-icon .ant-timeline-icon-dot{c:3}');
    expect(out).not.toContain('ant-steps');
  });

  it('rewrites the class-attribute substring selectors antd uses for its box-sizing reset', () => {
    const out = css(
      rewriteClassPrefix(
        blocks('.ant-steps [class^="ant-steps"],.ant-steps [class*=" ant-steps"]{box-sizing:border-box}'),
        'ant-steps',
        'ant-timeline'
      )
    );
    expect(out).toBe(
      '.ant-timeline [class^="ant-timeline"],.ant-timeline [class*=" ant-timeline"]{box-sizing:border-box}'
    );
  });

  it('leaves custom properties, keyframe names, @container conditions and other prefixes alone', () => {
    const out = css(
      rewriteClassPrefix(
        blocks(
          '.ant-steps-item{--ant-cmp-steps-icon-size:8px;animation:ant-steps-spin 1s}' +
            '@keyframes ant-steps-spin{to{transform:rotate(1turn)}}' +
            '@container style(--ant-steps-description-max-width){.ant-steps-dot .ant-steps-item-icon{g:7}}' +
            '.ant-steps-item .anticon{d:4}' +
            '.ant-progress-circle .ant-steps-item{e:5}'
        ),
        'ant-steps',
        'ant-timeline'
      )
    );
    expect(out).toContain('--ant-cmp-steps-icon-size:8px');
    expect(out).toContain('animation:ant-steps-spin 1s');
    expect(out).toContain('@keyframes ant-steps-spin');
    expect(out).toContain(
      '@container style(--ant-steps-description-max-width){.ant-timeline-dot .ant-timeline-item-icon{g:7}}'
    );
    expect(out).toContain('.ant-timeline-item .anticon');
    expect(out).toContain('.ant-progress-circle .ant-timeline-item{e:5}');
  });

  it('keeps a repeated self-compound used as a specificity hack', () => {
    const out = css(
      rewriteClassPrefix(blocks('.ant-steps-item.ant-steps-item.ant-steps-item{h:8}'), 'ant-steps', 'ant-timeline')
    );
    expect(out).toBe('.ant-timeline-item.ant-timeline-item.ant-timeline-item{h:8}');
  });

  it('collapses a selector that already carries both prefixes', () => {
    const out = css(rewriteClassPrefix(blocks('.ant-steps-item.ant-timeline-item{f:6}'), 'ant-steps', 'ant-timeline'));
    expect(out).toBe('.ant-timeline-item{f:6}');
  });
});
