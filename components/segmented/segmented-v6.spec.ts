/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSegmentedModule } from './segmented.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzSegmentedModule],
  template: `<nz-segmented id="host" [nzOptions]="['Daily', 'Weekly']" ngModel="Daily" />`
})
class TestSegmentedComponent {}

describe('segmented under antd v6 css', () => {
  let fixture: ComponentFixture<TestSegmentedComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestSegmentedComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the v6 segmented track and highlights the selected item', async () => {
    // `ant-segmented` is a host-binding class on <nz-segmented> itself (segmented.component.ts's
    // `host: { class: 'ant-segmented', ... }`), so the root is #host, not a `.ant-segmented` descendant of it.
    const root = document.getElementById('host') as HTMLElement;
    expect(getComputedStyle(root).backgroundColor).toBe('rgb(245, 245, 245)'); // --ant-segmented-track-bg: #f5f5f5
    expect(getComputedStyle(root).borderRadius).toBe('6px');
    const selected = document.querySelector('#host .ant-segmented-item-selected') as HTMLElement;
    // `.ant-segmented-item` transitions `color` over `--ant-motion-duration-mid` (0.2s); wait it out
    // so the computed value isn't read mid-transition (it would still report the pre-select colour).
    await new Promise(r => setTimeout(r, 250));
    expect(getComputedStyle(selected).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(selected).color).toBe('rgba(0, 0, 0, 0.88)'); // --ant-segmented-item-selected-color
  });
});
