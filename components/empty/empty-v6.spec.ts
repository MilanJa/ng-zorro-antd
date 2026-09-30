/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzEmptyModule } from './empty.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzEmptyModule],
  template: `
    <nz-empty id="host" />
    <nz-empty id="simple" nzNotFoundImage="simple" />
  `
})
class TestEmptyComponent {}

describe('empty under antd v6 css', () => {
  let fixture: ComponentFixture<TestEmptyComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestEmptyComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes the default image at 100px and the description at colorTextDescription', () => {
    const host = document.getElementById('host')!;
    expect(host.classList.contains('ant-empty-normal')).toBe(false);
    const image = host.querySelector('.ant-empty-image') as HTMLElement;
    expect(getComputedStyle(image).height).toBe('100px');
    expect(getComputedStyle(image).marginBottom).toBe('8px');
    const description = host.querySelector('.ant-empty-description') as HTMLElement;
    expect(getComputedStyle(description).color).toBe('rgba(0, 0, 0, 0.45)'); // colorTextDescription
  });

  it('shrinks the image to 40px when nzNotFoundImage is simple, via a v4-inert hook', () => {
    const simple = document.getElementById('simple')!;
    // antd's Empty/index.js adds the literal ant-empty-normal class here (mergedImage === simpleEmptyImg),
    // but compiled v4 CSS already styles that literal class (bigger margin, dimmer text, 40px image) and
    // ng-zorro never emitted it for this direct-usage path before, so emitting it now would newly change
    // v4's existing rendering of every nzNotFoundImage="simple" caller (confirmed by a default-theme
    // capture). nz-empty-simple is the v4-inert hook patch.css mirrors the same v6 rule onto instead.
    expect(simple.classList.contains('nz-empty-simple')).toBe(true);
    expect(simple.classList.contains('ant-empty-normal')).toBe(false);
    const image = simple.querySelector('.ant-empty-image') as HTMLElement;
    expect(getComputedStyle(image).height).toBe('40px'); // .nz-empty-simple .ant-empty-image, controlHeightLG
    const description = simple.querySelector('.ant-empty-description') as HTMLElement;
    expect(getComputedStyle(description).color).toBe('rgba(0, 0, 0, 0.45)'); // same colorTextDescription token as the default image
  });

  it('colours the default illustration shapes from theme tokens (patch.css mirror of empty.js)', () => {
    const host = document.getElementById('host')!;
    const ellipse = host.querySelector('.ant-empty-img-default-ellipse') as SVGEllipseElement;
    expect(getComputedStyle(ellipse).fill).not.toBe(''); // v6 CSS has no rule for this class at all; patch.css must supply one
    const path3 = host.querySelector('.ant-empty-img-default-path-3') as SVGPathElement;
    expect(getComputedStyle(path3).fill).not.toBe('');
  });

  it('colours the simple illustration shapes from theme tokens (patch.css mirror of empty/simple.js)', () => {
    const simple = document.getElementById('simple')!;
    const ellipse = simple.querySelector('.ant-empty-img-simple-ellipse') as SVGEllipseElement;
    expect(getComputedStyle(ellipse).fill).not.toBe('');
    const g = simple.querySelector('.ant-empty-img-simple-g') as SVGGElement;
    expect(getComputedStyle(g).stroke).not.toBe('');
  });
});
