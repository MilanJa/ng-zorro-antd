/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTagModule } from './tag.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzTagModule],
  template: `
    <nz-tag id="t1">a</nz-tag>
    <nz-tag id="t2" nzColor="blue">b</nz-tag>
    <nz-tag id="t3" nzMode="closeable">c</nz-tag>
  `
})
class TestTagComponent {}

describe('tag under antd v6 css', () => {
  let fixture: ComponentFixture<TestTagComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTagComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the default tag from the v6 tokens with the filled variant class', () => {
    // antd v6 resolves a Tag with no `variant` prop to 'filled' unconditionally
    // (node_modules/antd/es/tag/hooks/useColor.js:14-28) -- `nzBordered` has no effect on it.
    const t1 = document.querySelector('#t1') as HTMLElement;
    expect(t1.classList.contains('ant-tag-filled')).toBe(true);
    const cs = getComputedStyle(t1);
    expect(cs.fontSize).toBe('12px');
    expect(cs.borderRadius).toBe('4px'); // borderRadiusSM
    // --ant-tag-default-bg is #f5f5f5 (rgb(245, 245, 245)); the CSS-derived value, not the
    // colorFillQuaternary rgba(0, 0, 0, 0.02) computed from the token formula.
    expect(cs.backgroundColor).toBe('rgb(245, 245, 245)');
    // `.ant-tag-filled` zeroes the base rule's border colour (`border-color: transparent`).
    expect(cs.borderColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('applies the v6 filled-variant preset colour rule to a coloured tag', () => {
    const t2 = document.querySelector('#t2') as HTMLElement;
    expect(t2.classList.contains('ant-tag-blue')).toBe(true);
    expect(t2.classList.contains('ant-tag-filled')).toBe(true);
    const cs = getComputedStyle(t2);
    expect(cs.backgroundColor).toBe('rgb(230, 244, 255)'); // blue-1
    // The CSS-derived value (--ant-blue-7, #0958d9), not the colorPrimary/blue-6
    // rgb(22, 119, 255) that the token formula alone would suggest.
    expect(cs.color).toBe('rgb(9, 88, 217)');
  });

  it('sizes the close icon from the v6 tokens', () => {
    const closeIcon = document.querySelector('#t3 .ant-tag-close-icon') as HTMLElement;
    expect(closeIcon).toBeTruthy();
    const cs = getComputedStyle(closeIcon);
    expect(cs.fontSize).toBe('10px'); // fontSizeIcon - lineWidth * 2
    expect(cs.color).toBe('rgba(0, 0, 0, 0.45)'); // colorIcon
  });
});

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag id="o1" nzVariant="outlined">o</nz-tag>
    <nz-tag id="o2" nzVariant="outlined" nzColor="blue">o</nz-tag>
    <nz-tag id="o3" nzVariant="outlined" nzColor="#f50">o</nz-tag>
    <nz-tag id="s1" nzVariant="solid" nzColor="blue">s</nz-tag>
    <nz-tag id="s2" nzVariant="solid" nzColor="#f50">s</nz-tag>
    <nz-tag id="d1" nzDisabled>d</nz-tag>
    <nz-tag id="d2" nzMode="checkable" nzChecked nzDisabled>d</nz-tag>
    <nz-tag id="i1" nzIcon="check-circle">icon</nz-tag>
  `
})
class TestTagV6InputsComponent {}

describe('tag v6 inputs under antd v6 css', () => {
  const css = (id: string): CSSStyleDeclaration => getComputedStyle(document.getElementById(id) as HTMLElement);

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    TestBed.createComponent(TestTagV6InputsComponent).detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the outlined variant with a colorBorder border', () => {
    expect(css('o1').borderColor).toBe('rgb(217, 217, 217)'); // colorBorder
    expect(css('o1').backgroundColor).toBe('rgb(245, 245, 245)'); // defaultBg
  });

  it('draws preset colours per variant from the v6 rules', () => {
    expect(css('o2').backgroundColor).toBe('rgb(230, 244, 255)'); // blue-1
    expect(css('o2').borderColor).toBe('rgb(145, 202, 255)'); // blue-3
    expect(css('o2').color).toBe('rgb(9, 88, 217)'); // blue-7
    expect(css('s1').backgroundColor).toBe('rgb(22, 119, 255)'); // blue-6
    expect(css('s1').color).toBe('rgb(255, 255, 255)'); // colorTextLightSolid
  });

  it('draws custom colours per variant as antd useColor computes them', () => {
    expect(css('o3').backgroundColor).toBe('rgb(255, 238, 229)'); // #ffeee5, hsl l = 0.95
    expect(css('o3').borderColor).toBe('rgb(255, 85, 0)');
    expect(css('o3').color).toBe('rgb(255, 85, 0)');
    expect(css('s2').backgroundColor).toBe('rgb(255, 85, 0)');
    expect(css('s2').color).toBe('rgb(255, 255, 255)');
  });

  it('greys out disabled tags', () => {
    expect(css('d1').backgroundColor).toBe('rgba(0, 0, 0, 0.04)'); // colorBgContainerDisabled
    expect(css('d1').color).toBe('rgba(0, 0, 0, 0.25)'); // colorTextDisabled
    expect(css('d1').cursor).toBe('not-allowed');
    expect(css('d2').backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
    expect(css('d2').color).toBe('rgba(0, 0, 0, 0.25)');
  });

  it('spaces the nzIcon content span by the tag paddingInline', () => {
    const span = document.querySelector('#i1 > span') as HTMLElement;
    expect(getComputedStyle(span).marginLeft).toBe('7px'); // tagPaddingHorizontal - lineWidth
  });
});

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag-checkable-group id="g" nzDisabled>
      <nz-tag id="g1" nzMode="checkable" nzValue="a">a</nz-tag>
      <nz-tag id="g2" nzMode="checkable" nzValue="b">b</nz-tag>
    </nz-tag-checkable-group>
  `
})
class TestTagGroupV6Component {}

describe('tag checkable group under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    TestBed.createComponent(TestTagGroupV6Component).detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('lays the tags out with the v6 flex gap', () => {
    const cs = getComputedStyle(document.getElementById('g') as HTMLElement);
    expect(cs.display).toBe('flex');
    expect(cs.flexWrap).toBe('wrap');
    expect(cs.columnGap).toBe('8px'); // paddingXS
  });

  it('greys out the children of a disabled group', () => {
    const cs = getComputedStyle(document.getElementById('g1') as HTMLElement);
    expect(cs.color).toBe('rgba(0, 0, 0, 0.25)'); // colorTextDisabled
    expect(cs.cursor).toBe('not-allowed');
  });
});

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag id="c1" nzMode="checkable" nzChecked>on</nz-tag>
    <nz-tag id="c2" nzMode="checkable">off</nz-tag>
    <nz-tag id="c3" nzMode="checkable" nzDisabled>off disabled</nz-tag>
    <nz-tag id="c4" nzMode="checkable" nzDisabled nzChecked>on disabled</nz-tag>
  `
})
class TestCheckableV6Component {}

describe('checkable tag under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    TestBed.createComponent(TestCheckableV6Component).detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  const bg = (id: string): string => getComputedStyle(document.getElementById(id) as HTMLElement).backgroundColor;

  it('fills a checked tag with the primary colour, as antd draws it', () => {
    expect(bg('c1')).toBe('rgb(22, 119, 255)'); // colorPrimary
  });

  it('leaves unchecked tags unfilled and fills a checked disabled tag distinctly', () => {
    expect(bg('c2')).toBe('rgba(0, 0, 0, 0)');
    expect(bg('c3')).toBe('rgba(0, 0, 0, 0)');
    expect(bg('c4')).not.toBe(bg('c3')); // colorBgContainerDisabled
  });
});
