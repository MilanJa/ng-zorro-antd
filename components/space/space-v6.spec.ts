/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSpaceModule } from './space.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzSpaceModule],
  template: `
    <nz-space id="host" nzSplit="|">
      <span *nzSpaceItem>a</span>
      <span *nzSpaceItem>b</span>
    </nz-space>
  `
})
class TestSpaceComponent {}

describe('space under antd v6 css', () => {
  let fixture: ComponentFixture<TestSpaceComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestSpaceComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the v6 separator class next to the v4 split class', () => {
    // antd v6's Space.Item emits `${prefixCls}-item-separator` (Item.tsx), not `-split`; kept
    // additively next to the v4 class so both stylesheets render the separator element.
    const separator = document.querySelector('#host .ant-space-split') as HTMLElement;
    expect(separator).not.toBeNull();
    expect(separator.classList).toContain('ant-space-item-separator');
  });

  it('uses the default small gap between items', () => {
    const root = document.getElementById('host') as HTMLElement;
    expect(getComputedStyle(root).columnGap).toBe('8px'); // size small default: --ant-padding-xs resolves to 8px
  });
});
