/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';

import { NzSpinModule } from './spin.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzSpinModule],
  template: `
    <nz-spin id="host" [nzSpinning]="loading()" nzTip="Loading">
      <div style="height: 80px">content</div>
    </nz-spin>
  `
})
class TestSpinComponent {
  loading = signal(true);
}

describe('spin under antd v6 css', () => {
  let fixture: ComponentFixture<TestSpinComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(TestSpinComponent);
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the description text with the v6 class and colour', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const tip = document.querySelector('#host .ant-spin-description') as HTMLElement;
    expect(tip).not.toBeNull();
    expect(tip.textContent?.trim()).toBe('Loading');
    expect(getComputedStyle(tip).color).toBe('rgb(22, 119, 255)');
  });

  it('overlays the spinner on the content while loading and blurs the container', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const spin = document.querySelector('#host .ant-spin') as HTMLElement;
    const container = document.querySelector('#host .ant-spin-container') as HTMLElement;
    expect(getComputedStyle(spin).position).toBe('absolute');
    expect(getComputedStyle(container).opacity).toBe('0.5');
    fixture.componentInstance.loading.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    await fixture.whenStable();
    // `.ant-spin-container`'s opacity change is CSS-transitioned (`--ant-motion-duration-slow`); let it settle.
    await new Promise(r => setTimeout(r, 400));
    expect(document.querySelector('#host .ant-spin')).toBeNull();
    expect(getComputedStyle(container).opacity).toBe('1');
  });
});
