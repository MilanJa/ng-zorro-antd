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

import { NzSwitchModule } from './switch.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzSwitchModule],
  template: `<nz-switch id="host" [ngModel]="checked()" nzCheckedChildren="1" nzUnCheckedChildren="0" />`
})
class TestSwitchComponent {
  checked = signal(true);
}

describe('switch under antd v6 css', () => {
  let fixture: ComponentFixture<TestSwitchComponent>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestSwitchComponent);
    fixture.detectChanges();
    // NgModel writes the initial value one microtask after the first change detection.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 switch with the primary track when checked and the handle on the right', async () => {
    const el = document.querySelector('#host .ant-switch') as HTMLElement;
    expect(getComputedStyle(el).backgroundColor).toBe('rgb(22, 119, 255)');
    expect(getComputedStyle(el).height).toBe('22px'); // trackHeight
    expect(getComputedStyle(el).minWidth).toBe('44px'); // trackMinWidth
    const handle = document.querySelector('#host .ant-switch-handle') as HTMLElement;
    expect(parseFloat(getComputedStyle(handle).insetInlineStart)).toBeGreaterThan(20); // calc(100% - 18px - 2px)
    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();
    // NgModel writes the value one microtask after ngOnChanges; a second detectChanges applies it to the DOM.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    // The track's background-color transition (switchDuration) must finish before the target colour reads back.
    await expectMotionSettled(el);
    expect(getComputedStyle(el).backgroundColor).toBe('rgba(0, 0, 0, 0.25)'); // colorTextQuaternary, the extracted CSS value for the unchecked track
  });

  it('gives the active label the v6 inner-label styling as a real child of .ant-switch-inner', async () => {
    const inner = document.querySelector('#host .ant-switch-inner') as HTMLElement;
    const checkedLabel = inner.querySelector('.ant-switch-inner-checked') as HTMLElement;
    expect(checkedLabel).not.toBeNull();
    expect(checkedLabel.textContent?.trim()).toBe('1');
    expect(inner.querySelector('.ant-switch-inner-unchecked')).toBeNull();
    expect(getComputedStyle(checkedLabel).color).toBe('rgb(255, 255, 255)'); // colorTextLightSolid
    expect(getComputedStyle(checkedLabel).fontSize).toBe('12px'); // fontSizeSM

    fixture.componentInstance.checked.set(false);
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    const uncheckedLabel = inner.querySelector('.ant-switch-inner-unchecked') as HTMLElement;
    expect(uncheckedLabel).not.toBeNull();
    expect(uncheckedLabel.textContent?.trim()).toBe('0');
    expect(inner.querySelector('.ant-switch-inner-checked')).toBeNull();
    expect(getComputedStyle(uncheckedLabel).color).toBe('rgb(255, 255, 255)');
  });
});
