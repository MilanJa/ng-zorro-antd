/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzRadioModule } from './radio.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzRadioModule],
  template: `<label id="host" nz-radio [ngModel]="checked()">Label</label>`
})
class TestRadioComponent {
  checked = signal(true);
}

@Component({
  imports: [FormsModule, NzRadioModule],
  template: `
    <nz-radio-group id="group" [ngModel]="value()" nzButtonStyle="solid">
      <label nz-radio-button nzValue="a">A</label>
      <label nz-radio-button nzValue="b">B</label>
    </nz-radio-group>
  `
})
class TestRadioGroupComponent {
  value = signal('a');
}

describe('radio under antd v6 css', () => {
  let fixture: ComponentFixture<TestRadioComponent>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestRadioComponent);
    fixture.detectChanges();
    // NgModel writes the initial value one microtask after the first change detection.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the v6 round dot and fills it with the primary colour when checked', async () => {
    const inner = document.querySelector('#host .ant-radio-inner') as HTMLElement;
    const cs = getComputedStyle(inner);
    expect(cs.width).toBe('16px'); // radioSize
    expect(cs.borderRadius).toBe('50%');
    expect(cs.borderColor).toBe('rgb(22, 119, 255)');

    const dot = getComputedStyle(inner, '::after');
    expect(dot.borderRadius).toBe('50%');

    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();
    // NgModel writes the value one microtask after ngOnChanges; a second detectChanges applies it to the DOM.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    // The dot's border-color transition (motionDurationMid) must finish before the target colour reads back.
    await expectMotionSettled(inner);
    expect(getComputedStyle(inner).borderColor).toBe('rgb(217, 217, 217)');
  });

  it('does not draw a second control on the outer .ant-radio element, checked or unchecked', async () => {
    const outer = document.querySelector('#host .ant-radio') as HTMLElement;
    const inner = document.querySelector('#host .ant-radio-inner') as HTMLElement;
    await expectMotionSettled(outer);
    const cs = getComputedStyle(outer);
    // v6's own .ant-radio rule sets a background colour and a border (scoped under .ant-radio-wrapper,
    // which the patch's neutralisers must match in specificity); the patch neutralises both so the dot
    // drawn on .ant-radio-inner (checked above) is not doubled by the outer element.
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(cs.borderStyle).toBe('none');

    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();
    // NgModel writes the value one microtask after ngOnChanges; a second detectChanges applies it to the DOM.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    await expectMotionSettled(outer);
    await expectMotionSettled(inner);
    const outerUnchecked = getComputedStyle(outer);
    expect(outerUnchecked.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(outerUnchecked.borderStyle).toBe('none');
    const innerUnchecked = getComputedStyle(inner);
    expect(innerUnchecked.borderWidth).toBe('1px');
    expect(innerUnchecked.borderColor).toBe('rgb(217, 217, 217)');
  });
});

describe('radio-group solid button variant under antd v6 css', () => {
  let fixture: ComponentFixture<TestRadioGroupComponent>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestRadioGroupComponent);
    fixture.detectChanges();
    // NgModel writes the initial value one microtask after the first change detection.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('gives the checked solid button wrapper a primary background and white text', async () => {
    const checkedWrapper = document.querySelector('#group .ant-radio-button-wrapper-checked') as HTMLElement;
    expect(checkedWrapper).not.toBeNull();
    // The wrapper's background-color/color transition (motionDurationMid) must finish before the target colours read back.
    await expectMotionSettled(checkedWrapper);
    const cs = getComputedStyle(checkedWrapper);
    expect(cs.backgroundColor).toBe('rgb(22, 119, 255)');
    expect(cs.color).toBe('rgb(255, 255, 255)');
  });
});
