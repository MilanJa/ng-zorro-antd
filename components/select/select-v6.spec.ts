/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSelectModule } from './select.module';

@Component({
  imports: [FormsModule, NzSelectModule],
  template: `
    <nz-select id="host" [ngModel]="value()" [nzOpen]="open()" style="width: 160px; margin-top: 40px">
      <nz-option nzValue="jack" nzLabel="Jack" />
      <nz-option nzValue="lucy" nzLabel="Lucy" />
    </nz-select>
  `
})
class TestSelectComponent {
  value = signal('lucy');
  open = signal(false);
}

describe('select under antd v6 css', () => {
  let fixture: ComponentFixture<TestSelectComponent>;
  let overlay: OverlayContainer;
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
    document.head.appendChild(style);
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestSelectComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
  });

  it('opens a positioned, visible dropdown whose enter motion settles', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const dropdown = overlay.getContainerElement().querySelector('.ant-select-dropdown') as HTMLElement;
    expect(dropdown).not.toBeNull();
    await expectMotionSettled(dropdown);
    // The overlay's connected width is computed and applied on a `requestAnimationFrame` tick
    // (see `NzSelectComponent.updateCdkConnectedOverlayStatus`), which can race the motion
    // settling above when the enter animation resolves immediately; give it another frame.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    fixture.detectChanges();
    await fixture.whenStable();
    const rect = dropdown.getBoundingClientRect();
    const host = document.getElementById('host')!.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(100);
    expect(rect.height).toBeGreaterThan(30);
    expect(rect.top).toBeGreaterThanOrEqual(host.bottom - 1);
    expect(rect.top).toBeLessThan(window.innerHeight);
    const cs = getComputedStyle(dropdown);
    expect(cs.opacity).toBe('1');
    expect(cs.position).toBe('relative');
    expect(cs.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(dropdown.querySelectorAll('.ant-select-item').length).toBe(2);
  });

  it('removes the dropdown after the leave motion', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const dropdown = overlay.getContainerElement().querySelector('.ant-select-dropdown') as HTMLElement;
    await expectMotionSettled(dropdown);
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-select-dropdown')).toBeNull();
  });
});
