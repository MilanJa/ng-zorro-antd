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
