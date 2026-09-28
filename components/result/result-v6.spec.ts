/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzResultModule } from './result.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzResultModule],
  template: `
    <nz-result id="host" nzStatus="success" nzTitle="Done" nzSubTitle="Sub">
      <div nz-result-content>body</div>
    </nz-result>
  `
})
class TestResultComponent {}

describe('result under antd v6 css', () => {
  let fixture: ComponentFixture<TestResultComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestResultComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 body wrapper and status colour', () => {
    expect(document.querySelector('#host .ant-result-body')).not.toBeNull();
    const icon = document.querySelector('#host .ant-result-icon .anticon') as HTMLElement;
    expect(getComputedStyle(icon).color).toBe('rgb(82, 196, 26)'); // colorSuccess #52c41a
    const title = document.querySelector('#host .ant-result-title') as HTMLElement;
    expect(getComputedStyle(title).fontSize).toBe('24px'); // titleFontSize
  });
});
