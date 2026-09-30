/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTypographyModule } from './typography.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTypographyModule],
  template: `
    <h1 nz-typography id="h1">Title</h1>
    <p nz-typography id="p" nzType="secondary">text</p>
    <span nz-typography id="c" nzCopyable>copy</span>
    <span nz-typography id="ellipsis" nzEllipsis [nzEllipsisRows]="1">one line only</span>
  `
})
class TestTypographyComponent {}

describe('typography under antd v6 css', () => {
  let fixture: ComponentFixture<TestTypographyComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTypographyComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 heading shape via the native h1 + ant-typography compound selector (no extra class needed)', () => {
    const h1 = document.getElementById('h1')!;
    expect(h1.classList.contains('ant-typography')).toBe(true);
    const cs = getComputedStyle(h1);
    expect(cs.fontSize).toBe('38px'); // fontSizeHeading1
    expect(cs.fontWeight).toBe('600'); // fontWeightStrong
    expect(cs.lineHeight).toBe('46px'); // lineHeightHeading1 (1.2105263157894737 * 38px)
    // typographyTitleMarginBottom is `0.5em`, resolved against the h1's own 38px font-size, so the
    // computed margin is 19px, not a fixed px value.
    expect(cs.marginBottom).toBe('19px');
  });

  it('colours secondary text with colorTextDescription', () => {
    const p = document.getElementById('p')!;
    expect(getComputedStyle(p).color).toBe('rgba(0, 0, 0, 0.45)');
  });

  it('renders the copy action with v6 colour and spacing', () => {
    const copyBtn = document.getElementById('c')!.querySelector('.ant-typography-copy') as HTMLElement;
    expect(copyBtn).not.toBeNull();
    const cs = getComputedStyle(copyBtn);
    expect(cs.color).toBe('rgb(22, 119, 255)'); // colorLink
    expect(cs.marginInlineStart).toBe('4px'); // marginXXS
  });

  it('keeps the v4-only single-line marker class next to the v6 ellipsis classes', () => {
    const ellipsis = document.getElementById('ellipsis')!;
    expect(ellipsis.classList.contains('ant-typography-ellipsis')).toBe(true);
    expect(ellipsis.classList.contains('ant-typography-single-line')).toBe(true);
  });
});
