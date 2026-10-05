/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzAffixModule } from './affix.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzAffixModule],
  template: `
    <div id="box" #box style="height: 200px; overflow: auto">
      <div style="height: 60px"></div>
      <nz-affix [nzTarget]="box" [nzOffsetTop]="0">
        <button id="btn">b</button>
      </nz-affix>
      <div style="height: 1000px"></div>
    </div>
  `
})
class TestAffixComponent {
  @ViewChild('box', { static: true }) boxRef!: ElementRef<HTMLElement>;
  get box(): HTMLElement {
    return this.boxRef.nativeElement;
  }
}

describe('affix under antd v6 css', () => {
  let fixture: ComponentFixture<TestAffixComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAffixComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('defines the z-index-popup token', () => {
    expect(getComputedStyle(document.documentElement).getPropertyValue('--ant-affix-z-index-popup').trim()).toBe('10');
  });

  it('fixes the element with antd v6 z-index once scrolled past the offset, and releases it on scroll back', async () => {
    const box = fixture.componentInstance.box;

    box.scrollTop = 300;
    box.dispatchEvent(new Event('scroll'));
    // affix handles scroll through throttleTime(20, trailing) (affix.component.ts:39,128).
    await new Promise(resolve => setTimeout(resolve, 100));
    fixture.detectChanges();

    const fixedEl = fixture.debugElement.query(By.css('.ant-affix')).nativeElement as HTMLElement;
    const fixedCs = getComputedStyle(fixedEl);
    expect(fixedCs.position).toBe('fixed');
    expect(fixedCs.zIndex).toBe('10');
    // component reset (template CSS's `font-size: var(--ant-font-size)`).
    expect(fixedCs.fontSize).toBe('14px');

    box.scrollTop = 0;
    box.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 100));
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.ant-affix'))).toBeNull();
  });
});
