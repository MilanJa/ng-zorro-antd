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
import { NzSelectModule } from 'ng-zorro-antd/select';

import { NzInputModule } from './input.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzInputModule],
  template: `
    <input id="plain" nz-input placeholder="a" />
    <nz-input-wrapper id="affix" nzSuffix="x">
      <input nz-input nzStatus="error" />
    </nz-input-wrapper>
    <nz-input-wrapper id="readonly" nzSuffix="x">
      <input nz-input readonly value="ro" />
    </nz-input-wrapper>
    <nz-input-search id="search" nzEnterButton="true">
      <input nz-input />
    </nz-input-search>
    <nz-input-password id="password">
      <input nz-input />
    </nz-input-password>
    <nz-input-wrapper id="textarea" nzAllowClear="true">
      <textarea nz-input></textarea>
    </nz-input-wrapper>
  `
})
class TestInputComponent {}

describe('input under antd v6 css', () => {
  let fixture: ComponentFixture<TestInputComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting()],
      animationsEnabled: true
    });
    fixture = TestBed.createComponent(TestInputComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
  });

  it('renders the outlined v6 input and the error status on the affix wrapper', () => {
    const plain = document.getElementById('plain')!;
    expect(plain.classList.contains('ant-input-outlined')).toBe(true);
    expect(getComputedStyle(plain).borderColor).toBe('rgb(217, 217, 217)');
    expect(getComputedStyle(plain).height).toBe('32px');
    const wrapper = document.getElementById('affix')!;
    expect(wrapper.classList.contains('ant-input-affix-wrapper')).toBe(true);
    expect(getComputedStyle(wrapper).borderColor).toBe('rgb(255, 77, 79)');
  });

  it('carries the resolved variant and status classes directly on the affix wrapper', () => {
    const wrapper = document.getElementById('affix')!;
    expect(wrapper.classList.contains('ant-input-outlined')).toBe(true);
    expect(wrapper.classList.contains('ant-input-status-error')).toBe(true);
    // Kept for the default (v4) stylesheet, which keys the wrapper's status border and the
    // wrapper's own variant lookup off these prefixed classes instead.
    expect(wrapper.classList.contains('ant-input-affix-wrapper-status-error')).toBe(true);
    expect(wrapper.classList.contains('ant-input-affix-wrapper-outlined')).toBe(true);
  });

  it('keeps antd emitting the unstyled readonly class on the affix wrapper', () => {
    const wrapper = document.getElementById('readonly')!;
    expect(wrapper.classList.contains('ant-input-affix-wrapper-readonly')).toBe(true);
  });

  it('adds the v6 search button class next to the v4 one', () => {
    const button = document.querySelector('#search .ant-input-search-button') as HTMLElement;
    expect(button.classList.contains('ant-input-search-btn')).toBe(true);
    expect(document.getElementById('search')!.classList.contains('ant-input-search-with-button')).toBe(true);
  });

  it('keeps antd emitting the unstyled password class on the wrapper', () => {
    expect(document.getElementById('password')!.classList.contains('ant-input-password')).toBe(true);
  });

  it('adds the v6 textarea affix wrapper class alongside the v4 clear-button hook', () => {
    const wrapper = document.getElementById('textarea')!;
    expect(wrapper.classList.contains('ant-input-textarea-affix-wrapper')).toBe(true);
    expect(wrapper.classList.contains('ant-input-affix-wrapper-textarea-with-clear-btn')).toBe(true);
  });
});

@Component({
  imports: [FormsModule, NzInputModule, NzSelectModule],
  template: `
    <nz-input-wrapper>
      <nz-select id="addon-select" nzInputAddonBefore ngModel="a">
        <nz-option nzLabel="a" nzValue="a" />
      </nz-select>
      <input nz-input />
    </nz-input-wrapper>
  `
})
class TestInputAddonSelectComponent {}

describe('select inside an input addon under antd v6 css', () => {
  beforeEach(() => installV6Css());
  afterEach(() => style.remove());

  it('draws no box of its own: the selector and the root have no visible border or background', async () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    const fixture = TestBed.createComponent(TestInputAddonSelectComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('#addon-select') as HTMLElement;
    expect(root.closest('.ant-input-group-addon')).not.toBeNull();
    const selector = root.querySelector('.ant-select-selector') as HTMLElement;
    const selectorCs = getComputedStyle(selector);
    expect(selectorCs.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(selectorCs.borderTopWidth).toBe('1px');
    expect(selectorCs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(selectorCs.boxShadow).toBe('none');
    expect(getComputedStyle(root).borderTopStyle).toBe('none');
  });
});
