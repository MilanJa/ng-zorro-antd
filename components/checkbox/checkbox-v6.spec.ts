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

import { NzCheckboxModule } from './checkbox.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzCheckboxModule],
  template: `<label id="host" nz-checkbox [ngModel]="checked()">Label</label>`
})
class TestCheckboxComponent {
  checked = signal(true);
}

describe('checkbox under antd v6 css', () => {
  let fixture: ComponentFixture<TestCheckboxComponent>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCheckboxComponent);
    fixture.detectChanges();
    // NgModel writes the initial value one microtask after the first change detection.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the v6 box and fills it with the primary colour when checked', async () => {
    const box = document.querySelector('#host .ant-checkbox-inner') as HTMLElement;
    const cs = getComputedStyle(box);
    expect(cs.width).toBe('16px'); // controlInteractiveSize
    expect(cs.borderRadius).toBe('4px'); // borderRadiusSM
    expect(cs.backgroundColor).toBe('rgb(22, 119, 255)');
    expect(cs.borderColor).toBe('rgb(22, 119, 255)');

    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();
    // NgModel writes the value one microtask after ngOnChanges; a second detectChanges applies it to the DOM.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    // The box's background-color transition (motionDurationSlow) must finish before the target colour reads back.
    await expectMotionSettled(box);
    expect(getComputedStyle(box).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(box).borderColor).toBe('rgb(217, 217, 217)');
  });

  it('does not draw a second box on the outer .ant-checkbox element', () => {
    const outer = document.querySelector('#host .ant-checkbox') as HTMLElement;
    const cs = getComputedStyle(outer);
    // v6's own .ant-checkbox rule sets a background colour and a border; the patch neutralises both
    // so the box drawn on .ant-checkbox-inner (checked above) is not doubled by the outer element.
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(cs.borderStyle).toBe('none');
  });
});
