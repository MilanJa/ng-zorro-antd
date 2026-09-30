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

import { NzBadgeModule } from './badge.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzBadgeModule],
  template: `
    <nz-badge id="b1" [nzCount]="5"><a class="head" style="width:40px;height:40px;display:block"></a></nz-badge>
    <nz-badge id="b2" nzStatus="processing" nzText="Running" />
    <nz-ribbon id="r1" nzText="Hi"><div style="height:60px"></div></nz-ribbon>
  `
})
class TestBadgeComponent {}

describe('badge under antd v6 css', () => {
  let fixture: ComponentFixture<TestBadgeComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestBadgeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes and colours the count indicator from the v6 tokens', () => {
    const count = document.querySelector('#b1 .ant-badge-count') as HTMLElement;
    expect(count).toBeTruthy();
    const cs = getComputedStyle(count);
    expect(cs.height).toBe('20px'); // indicatorHeight
    expect(cs.minWidth).toBe('20px');
    expect(cs.borderRadius).toBe('10px'); // indicatorHeight / 2
    expect(cs.backgroundColor).toBe('rgb(255, 77, 79)'); // colorError
    expect(cs.fontSize).toBe('12px');
    // `box-shadow: 0 0 0 1px var(--ant-color-border-bg)` (white ring separating the badge from its host).
    expect(cs.boxShadow).toContain('rgb(255, 255, 255)');
  });

  it('colours the processing status dot and animates its ring', async () => {
    const dot = document.querySelector('#b2 .ant-badge-status-processing') as HTMLElement;
    expect(dot).toBeTruthy();
    expect(getComputedStyle(dot).backgroundColor).toBe('rgb(22, 119, 255)'); // colorInfo
    // `::after` can't be queried directly; assert via the pseudo-element computed style.
    const after = getComputedStyle(dot, '::after');
    expect(after.animationName).toContain('antStatusProcessing');
  });

  it('draws the ribbon box and corner from the v6 tokens', () => {
    const ribbon = document.querySelector('#r1 .ant-ribbon') as HTMLElement;
    expect(ribbon).toBeTruthy();
    const cs = getComputedStyle(ribbon);
    expect(cs.backgroundColor).toBe('rgb(22, 119, 255)'); // colorPrimary
    // borderRadiusSM (4px) on every corner except the one `ant-ribbon-placement-end` squares off.
    expect(cs.borderRadius).toBe('4px 4px 0px');
    expect(document.querySelector('#r1 .ant-ribbon-corner')).toBeTruthy();
    // v6 wraps the ribbon text in `.ant-ribbon-content`, which the v6 CSS colours
    // `colorTextLightSolid` (white) against the ribbon's coloured background.
    const content = document.querySelector('#r1 .ant-ribbon-content') as HTMLElement;
    expect(content).toBeTruthy();
    expect(content.textContent?.trim()).toBe('Hi');
    expect(getComputedStyle(content).color).toBe('rgb(255, 255, 255)');
  });
});
