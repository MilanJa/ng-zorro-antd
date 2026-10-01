/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzAvatarModule } from './avatar.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzAvatarModule],
  template: `
    <nz-avatar id="a1" nzText="U" />
    <nz-avatar id="a2" nzIcon="user" nzShape="square" nzSize="large" />
  `
})
class TestAvatarComponent {}

describe('avatar under antd v6 css', () => {
  let fixture: ComponentFixture<TestAvatarComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAvatarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the default (circle) avatar at v6 token sizes and colours', () => {
    const avatar = fixture.debugElement.query(By.css('#a1')).nativeElement as HTMLElement;
    const cs = getComputedStyle(avatar);
    expect(cs.width).toBe('32px');
    expect(cs.height).toBe('32px');
    expect(cs.borderRadius).toBe('50%');
    // containerBg resolves to colorTextPlaceholder by default.
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0.25)');
    expect(cs.color).toBe('rgb(255, 255, 255)');

    const text = avatar.querySelector('.ant-avatar-string') as HTMLElement;
    expect(text).not.toBeNull();
    // v6 CSS has no `.ant-avatar-string` rule (position/scale come from the component's own
    // `calcStringSize`, the same technique antd's Avatar.js ResizeObserver callback uses); the
    // position is set inline by that method, asserted directly rather than via a stylesheet rule.
    expect(text.style.transform).toContain('scale');
  });

  it('renders a large square avatar at v6 token size and radius', () => {
    const avatar = fixture.debugElement.query(By.css('#a2')).nativeElement as HTMLElement;
    const cs = getComputedStyle(avatar);
    expect(cs.width).toBe('40px');
    expect(cs.height).toBe('40px');
    expect(cs.borderRadius).toBe('8px');
    expect(avatar.classList.contains('ant-avatar-square')).toBe(true);
    expect(avatar.classList.contains('ant-avatar-lg')).toBe(true);
    expect(avatar.classList.contains('ant-avatar-icon')).toBe(true);
  });
});
