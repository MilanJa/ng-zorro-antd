/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzStatisticModule } from './statistic.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzStatisticModule],
  template: `
    <nz-statistic id="host" [nzValue]="1128.93" nzTitle="Active" [nzPrefix]="pre" />
    <ng-template #pre>↑</ng-template>
    <nz-statistic id="untitled" [nzValue]="42" />
  `
})
class TestStatisticComponent {}

describe('statistic under antd v6 css', () => {
  let fixture: ComponentFixture<TestStatisticComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestStatisticComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('wraps the title in the v6 header element', () => {
    const host = document.getElementById('host')!;
    const header = host.querySelector('.ant-statistic-header') as HTMLElement;
    expect(header).toBeTruthy();
    const title = header.querySelector('.ant-statistic-title') as HTMLElement;
    expect(title).toBeTruthy();
    expect(getComputedStyle(header).paddingBottom).toBe('4px'); // margin-xxs
    expect(getComputedStyle(title).fontSize).toBe('14px'); // statisticTitleFontSize
    expect(getComputedStyle(title).color).toBe('rgba(0, 0, 0, 0.45)'); // colorTextDescription
  });

  it('styles the content and prefix under v6', () => {
    const host = document.getElementById('host')!;
    const content = host.querySelector('.ant-statistic-content') as HTMLElement;
    expect(getComputedStyle(content).fontSize).toBe('24px'); // statisticContentFontSize
    expect(getComputedStyle(content).color).toBe('rgba(0, 0, 0, 0.88)'); // colorTextHeading
    const prefix = host.querySelector('.ant-statistic-content-prefix') as HTMLElement;
    expect(getComputedStyle(prefix).marginInlineEnd).toBe('4px'); // margin-xxs
    const intSpan = host.querySelector('.ant-statistic-content-value-int') as HTMLElement;
    expect(intSpan).toBeTruthy();
    const decimalSpan = host.querySelector('.ant-statistic-content-value-decimal') as HTMLElement;
    expect(decimalSpan).toBeTruthy();
  });

  it('keeps the title div in the DOM but hides the empty header under v6', () => {
    // The title div stays in the DOM unconditionally (statistic.component.ts) so the compiled v4
    // CSS's `.ant-statistic-title { margin-bottom: 4px }` still applies to it without a title;
    // under v6 alone, `style/v6/patch.css`'s `.ant-statistic-header:has(> .ant-statistic-title
    // :empty)` rule hides the header instead of leaving its empty `padding-bottom` band.
    const untitled = document.getElementById('untitled')!;
    const header = untitled.querySelector('.ant-statistic-header') as HTMLElement;
    expect(header).toBeTruthy();
    expect(getComputedStyle(header).display).toBe('none');
    expect(header.getBoundingClientRect().height).toBe(0);
    const title = header.querySelector('.ant-statistic-title') as HTMLElement;
    expect(title).toBeTruthy();
    expect(title.textContent?.trim()).toBe('');
  });
});
