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

import { NzQRCodeModule } from './qrcode.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzQRCodeModule],
  template: `<nz-qrcode id="host" nzValue="https://ng.ant.design" [nzBordered]="true" />`
})
class TestQRCodeComponent {}

@Component({
  imports: [FormsModule, NzQRCodeModule],
  template: `<nz-qrcode id="host" nzValue="https://ng.ant.design" nzStatus="expired" />`
})
class ExpiredQRCodeComponent {}

@Component({
  imports: [FormsModule, NzQRCodeModule],
  template: `<nz-qrcode id="host" nzValue="https://ng.ant.design" nzStatus="scanned" />`
})
class ScannedQRCodeComponent {}

describe('qrcode under antd v6 css', () => {
  let fixture: ComponentFixture<TestQRCodeComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestQRCodeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the v6 root box (border, radius, padding, background)', () => {
    const root = document.querySelector('#host') as HTMLElement;
    const cs = getComputedStyle(root);
    expect(cs.borderRadius).toBe('8px'); // borderRadiusLG
    // colorSplit's default token value, not the colorBorderSecondary rgb(240, 240, 240) the brief named.
    expect(cs.borderColor).toBe('rgba(5, 5, 5, 0.06)');
    expect(cs.borderWidth).toBe('1px');
    expect(cs.padding).toBe('12px'); // paddingSM
  });
});

describe('expired qrcode under antd v6 css', () => {
  let fixture: ComponentFixture<ExpiredQRCodeComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ExpiredQRCodeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 cover class with the mask background colour, expired text as a direct child', () => {
    // v6's QrcodeStatus (node_modules/antd/es/qr-code/QrcodeStatus.js) and index.js render
    // `.ant-qrcode-cover` as a direct child of the root and `.ant-qrcode-expired` as a direct
    // child of the cover (`.ant-qrcode>.ant-qrcode-cover>.ant-qrcode-expired` in the v6 CSS) --
    // no intermediate wrapper div.
    const cover = document.querySelector('#host > .ant-qrcode-cover') as HTMLElement;
    expect(cover).toBeTruthy();
    expect(getComputedStyle(cover).backgroundColor).toBe('rgba(255, 255, 255, 0.96)');
    const expired = document.querySelector('#host > .ant-qrcode-cover > .ant-qrcode-expired');
    expect(expired).toBeTruthy();
    expect(expired!.textContent?.trim().length).toBeGreaterThan(0);
  });
});

describe('scanned qrcode under antd v6 css', () => {
  let fixture: ComponentFixture<ScannedQRCodeComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(ScannedQRCodeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('uses ant-qrcode-scanned, not the expired class, for the scanned message', () => {
    // v4 reused `ant-qrcode-expired` for both messages; v6's QrcodeStatus gives the scanned
    // message its own `${prefixCls}-scanned` class.
    expect(document.querySelector('#host .ant-qrcode-expired')).toBeFalsy();
    const scanned = document.querySelector('#host > .ant-qrcode-cover > .ant-qrcode-scanned');
    expect(scanned).toBeTruthy();
  });
});
