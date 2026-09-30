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

import { NzCarouselModule } from './carousel.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzCarouselModule],
  template: `
    <nz-carousel id="host" nzAutoPlay="false">
      <div nz-carousel-content>1</div>
      <div nz-carousel-content>2</div>
    </nz-carousel>
  `
})
class TestCarouselComponent {}

@Component({
  imports: [FormsModule, NzCarouselModule],
  template: `
    <nz-carousel id="host" nzAutoPlay="false" nzDotPosition="left">
      <div nz-carousel-content>1</div>
      <div nz-carousel-content>2</div>
    </nz-carousel>
  `
})
class LeftDotCarouselComponent {}

describe('carousel under antd v6 css', () => {
  let fixture: ComponentFixture<TestCarouselComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCarouselComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('sizes the bottom dots from the v6 carousel tokens', () => {
    const dots = document.querySelector('#host .slick-dots') as HTMLElement;
    expect(getComputedStyle(dots).bottom).toBe('12px'); // dotOffset
    const buttons = document.querySelectorAll('#host .slick-dots li button');
    expect(buttons.length).toBe(2);
    // Slide 0 is active by default, so the inactive dot (index 1) carries the plain dotWidth;
    // the active dot's own <li> widens to dotActiveWidth and its button is `width: 100%` of it.
    const cs = getComputedStyle(buttons[1]);
    expect(cs.height).toBe('3px'); // dotHeight
    expect(cs.width).toBe('16px'); // dotWidth
    // v6 sets `border-radius: var(--ant-carousel-dot-height)` (3px), not the 1px the v4 port used.
    expect(cs.borderRadius).toBe('3px');
    const active = document.querySelector('#host .slick-dots li.slick-active') as HTMLElement;
    expect(getComputedStyle(active).width).toBe('24px'); // dotActiveWidth
  });
});

describe('left-positioned carousel dots under antd v6 css', () => {
  let fixture: ComponentFixture<LeftDotCarouselComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(LeftDotCarouselComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('emits the logical slick-dots-start class v6 styles for a left dot position', () => {
    // antd's Carousel (node_modules/antd/es/carousel/index.js) maps dotPosition 'left' to
    // dotPlacement 'start' and renders `slick-dots-${mergedDotPlacement}` on the dots list;
    // v6's CSS has no rule for the old `slick-dots-left` class.
    const dots = document.querySelector('#host .slick-dots') as HTMLElement;
    expect(dots.classList.contains('slick-dots-start')).toBe(true);
    const cs = getComputedStyle(dots);
    expect(cs.width).toBe('3px'); // dotHeight, vertical dots track is dot-height wide
  });
});
