/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzFloatButtonModule } from './float-button.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <nz-float-button id="host" nzIcon="question-circle" />
    <nz-float-button-group id="group" nzShape="square" nzTrigger="click" [nzOpen]="open()">
      <nz-float-button nzIcon="file-text" />
    </nz-float-button-group>
  `
})
class TestFloatButtonComponent {
  readonly open = signal(false);
}

describe('float-button under antd v6 css', () => {
  let fixture: ComponentFixture<TestFloatButtonComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestFloatButtonComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders a fixed circular 40px float button with the v6 classes', () => {
    const host = document.getElementById('host')!;
    expect(host.classList.contains('ant-float-btn')).toBe(true);
    expect(host.classList.contains('ant-float-btn-circle')).toBe(true);
    const cs = getComputedStyle(host);
    expect(cs.position).toBe('fixed');
    expect(cs.width).toBe('40px');
    expect(cs.height).toBe('40px');
    expect(cs.borderRadius).toBe('50%');
  });

  it('opens a square group list', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = document.querySelector('#group .ant-float-btn-group-list') as HTMLElement;
    expect(list).not.toBeNull();
    await expectMotionSettled(list);
    expect(document.getElementById('group')!.classList.contains('ant-float-btn-group-square')).toBe(true);
  });
});
