/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzAlertModule } from './alert.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzAlertModule],
  template: `
    <nz-alert
      id="host"
      nzType="success"
      nzMessage="Title"
      nzDescription="Desc"
      [nzShowIcon]="true"
      [nzCloseable]="true"
      (nzOnClose)="closed.set(true)"
    />
  `
})
class TestAlertComponent {
  readonly closed = signal(false);
}

describe('alert under antd v6 css', () => {
  let fixture: ComponentFixture<TestAlertComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAlertComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the v6 section with title and description and the success colours', () => {
    const alert = document.querySelector('#host .ant-alert') as HTMLElement;
    expect(getComputedStyle(alert).backgroundColor).toBe('rgb(246, 255, 237)'); // colorSuccessBg
    expect(document.querySelector('#host .ant-alert-section .ant-alert-title')?.textContent?.trim()).toBe('Title');
    const title = document.querySelector('#host .ant-alert-title') as HTMLElement;
    expect(getComputedStyle(title).fontSize).toBe('16px'); // with-description title = fontSizeLG
  });

  it('closes and is removed', async () => {
    (document.querySelector('#host .ant-alert-close-icon') as HTMLElement).click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400)); // motion-duration-slow 0.3s
    expect(document.querySelector('#host .ant-alert')).toBeNull();
    expect(fixture.componentInstance.closed()).toBe(true);
  });
});
