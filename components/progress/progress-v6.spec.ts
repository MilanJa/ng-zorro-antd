/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzProgressModule } from './progress.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress id="line" [nzPercent]="30" [nzSuccessPercent]="10" />
    <nz-progress id="circle" nzType="circle" [nzPercent]="75" />
    <nz-progress id="steps" [nzSteps]="3" [nzPercent]="66" />
  `
})
class TestProgressComponent {}

describe('progress under antd v6 css', () => {
  let fixture: ComponentFixture<TestProgressComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestProgressComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the line as rail and tracks with the v6 colours and a success segment', () => {
    const rail = document.querySelector('#line .ant-progress-body > .ant-progress-rail') as HTMLElement;
    expect(getComputedStyle(rail).backgroundColor).toBe('rgba(0, 0, 0, 0.06)'); // remainingColor
    const track = rail.querySelector('.ant-progress-track:not(.ant-progress-track-success)') as HTMLElement;
    expect(getComputedStyle(track).backgroundColor).toBe('rgb(22, 119, 255)');
    const success = rail.querySelector('.ant-progress-track-success') as HTMLElement;
    expect(getComputedStyle(success).backgroundColor).toBe('rgb(82, 196, 26)');
    expect(Math.round((success.getBoundingClientRect().width / rail.getBoundingClientRect().width) * 100)).toBe(10);
    expect(document.querySelector('#line .ant-progress-indicator')?.textContent?.trim()).toBe('30%');
  });

  it('renders circle and steps with the v6 classes', () => {
    expect(
      document.querySelector('#circle .ant-progress-body > svg.ant-progress-circle .ant-progress-circle-rail')
    ).not.toBeNull();
    const items = document.querySelectorAll('#steps .ant-progress-steps-body > .ant-progress-steps-item');
    expect(items.length).toBe(3);
    expect(getComputedStyle(items[0] as HTMLElement).backgroundColor).toBe('rgb(22, 119, 255)');
    expect(getComputedStyle(items[2] as HTMLElement).backgroundColor).toBe('rgba(0, 0, 0, 0.06)');
  });
});
