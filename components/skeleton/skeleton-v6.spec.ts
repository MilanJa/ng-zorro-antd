/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSkeletonModule } from './skeleton.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzSkeletonModule],
  template: ` <nz-skeleton id="host" [nzActive]="active()" [nzAvatar]="true" /> `
})
class TestSkeletonComponent {
  active = signal(false);
}

describe('skeleton under antd v6 css', () => {
  let fixture: ComponentFixture<TestSkeletonComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestSkeletonComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 section wrapper and skeleton fill colour', () => {
    const section = document.querySelector('#host .ant-skeleton-section') as HTMLElement;
    expect(section).not.toBeNull();
    const title = section.querySelector('.ant-skeleton-title') as HTMLElement;
    expect(getComputedStyle(title).backgroundColor).toBe('rgba(0, 0, 0, 0.06)');
    expect(getComputedStyle(title).height).toBe('16px');
  });

  it('animates the fill when active', () => {
    fixture.componentInstance.active.set(true);
    fixture.detectChanges();
    const title = document.querySelector('#host .ant-skeleton-title') as HTMLElement;
    expect(getComputedStyle(title).animationName).not.toBe('none');
    expect(getComputedStyle(title).backgroundImage).toContain('linear-gradient');
  });
});
