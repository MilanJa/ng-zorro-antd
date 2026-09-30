/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzCollapseModule } from './collapse.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzCollapseModule],
  template: `
    <nz-collapse id="host">
      <nz-collapse-panel nzHeader="One" [nzActive]="true">
        <p>a</p>
      </nz-collapse-panel>
      <nz-collapse-panel nzHeader="Two">
        <p>b</p>
      </nz-collapse-panel>
    </nz-collapse>
  `
})
class TestCollapseComponent {}

describe('collapse under antd v6 css', () => {
  let fixture: ComponentFixture<TestCollapseComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCollapseComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 root and header appearance', () => {
    const host = document.getElementById('host')!;
    const hostStyle = getComputedStyle(host);
    expect(hostStyle.borderRadius).toBe('8px'); // borderRadiusLG
    expect(hostStyle.borderTopWidth).toBe('1px');
    expect(hostStyle.borderTopColor).toBe('rgb(217, 217, 217)'); // colorBorder
    expect(hostStyle.backgroundColor).toBe('rgba(0, 0, 0, 0.02)'); // collapseHeaderBg (colorFillAlter)

    const header = host.querySelector('.ant-collapse-header') as HTMLElement;
    const headerStyle = getComputedStyle(header);
    expect(headerStyle.padding).toBe('12px 16px'); // collapseHeaderPadding
    expect(headerStyle.color).toBe('rgba(0, 0, 0, 0.88)'); // colorTextHeading

    const body = host.querySelector('.ant-collapse-body') as HTMLElement;
    expect(getComputedStyle(body).padding).toBe('16px'); // collapseContentPadding
  });

  it('keeps the v6 icon-placement class name unrenamed (antd 6.6.5 still calls it icon-placement)', () => {
    const host = document.getElementById('host')!;
    expect(host.classList.contains('ant-collapse-icon-placement-start')).toBe(true);
  });

  it('hides the collapsed panel and shows the expanded one past the collapse motion', async () => {
    const host = document.getElementById('host')!;
    const panels = host.querySelectorAll('.ant-collapse-panel');
    const firstPanel = panels[0] as HTMLElement;
    const secondPanel = panels[1] as HTMLElement;

    expect(firstPanel.classList.contains('ant-collapse-panel-active')).toBe(true);
    expect(
      firstPanel.classList.contains('ant-collapse-item-active') ||
        firstPanel.parentElement!.classList.contains('ant-collapse-item-active')
    ).toBe(true);
    expect(getComputedStyle(secondPanel).display).toBe('none'); // ant-collapse-panel-hidden

    const secondHeader = host.querySelectorAll('.ant-collapse-header')[1] as HTMLElement;
    secondHeader.click();
    fixture.detectChanges();
    // the collapse motion sets height/opacity across `transitionend`; --ant-motion-duration-mid is
    // 0s in this test bundle, so one macrotask past the animation frame is enough to settle it.
    await new Promise(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();

    expect(getComputedStyle(secondPanel).display).not.toBe('none');
  });
});
