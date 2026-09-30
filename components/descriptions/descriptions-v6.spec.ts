/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzDescriptionsModule } from './descriptions.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzDescriptionsModule],
  template: `
    <nz-descriptions id="host" nzTitle="Info" nzBordered>
      <nz-descriptions-item nzTitle="Name">A</nz-descriptions-item>
      <nz-descriptions-item nzTitle="Age">3</nz-descriptions-item>
    </nz-descriptions>
    <nz-descriptions id="medium" nzSize="middle">
      <nz-descriptions-item nzTitle="Name">A</nz-descriptions-item>
    </nz-descriptions>
  `
})
class TestDescriptionsComponent {}

describe('descriptions under antd v6 css', () => {
  let fixture: ComponentFixture<TestDescriptionsComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestDescriptionsComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 bordered layout', () => {
    const host = document.getElementById('host')!;
    const title = host.querySelector('.ant-descriptions-title') as HTMLElement;
    expect(getComputedStyle(title).fontSize).toBe('16px');
    expect(getComputedStyle(title).marginBottom).toBe('0px'); // margin lives on .ant-descriptions-header, not the title itself
    const header = host.querySelector('.ant-descriptions-header') as HTMLElement;
    expect(getComputedStyle(header).marginBottom).toBe('20px'); // descriptionsTitleMarginBottom
    const label = host.querySelector('.ant-descriptions-item-label') as HTMLElement;
    expect(getComputedStyle(label).backgroundColor).toBe('rgba(0, 0, 0, 0.02)'); // colorFillAlter (descriptionsLabelBg)
    expect(getComputedStyle(label).padding).toBe('16px 24px');
    // descriptions-view border is colorSplit, not colorBorderSecondary: both resolve to the same
    // visual grey in the default theme but colorSplit's alpha form is what the generated CSS writes.
    expect(getComputedStyle(label).borderInlineEndColor).toBe('rgba(5, 5, 5, 0.06)');
    const view = host.querySelector('.ant-descriptions-view') as HTMLElement;
    expect(getComputedStyle(view).borderRadius).toBe('8px');
  });

  it('gives the v6 name to the middle size class without dropping the v4 one', () => {
    const medium = document.getElementById('medium')!;
    expect(medium.classList.contains('ant-descriptions-middle')).toBe(true);
    expect(medium.classList.contains('ant-descriptions-medium')).toBe(true);
  });
});
