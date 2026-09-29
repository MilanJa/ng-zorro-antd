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

import { NzRateModule } from './rate.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzRateModule],
  template: `<nz-rate id="host" [ngModel]="3" />`
})
class TestRateComponent {}

describe('rate under antd v6 css', () => {
  let fixture: ComponentFixture<TestRateComponent>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestRateComponent);
    fixture.detectChanges();
    // NgModel writes the initial value one microtask after the first change detection.
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders five stars with the v6 rate colour on the full ones', () => {
    const stars = document.querySelectorAll('#host .ant-rate-star');
    expect(stars.length).toBe(5);
    const full = document.querySelector('#host .ant-rate-star-full .ant-rate-star-second') as HTMLElement;
    expect(getComputedStyle(full).color).toBe('rgb(250, 219, 20)'); // starColor = yellow-6 #fadb14
    expect(getComputedStyle(stars[0] as HTMLElement).fontSize).toBe('20px'); // starSize
  });
});
