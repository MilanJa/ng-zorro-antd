/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
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

@Component({
  imports: [FormsModule, NzSelectModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-select
        id="scoped"
        [ngModel]="value()"
        [nzOpen]="openScoped()"
        [nzDropdownClassName]="scopedDropdownClassName()"
        style="width: 160px; margin-top: 40px"
      >
        <nz-option nzValue="jack" nzLabel="Jack" />
      </nz-select>
    </div>
    <nz-select
      id="plain"
      [ngModel]="value()"
      [nzOpen]="openPlain()"
      [nzDropdownClassName]="plainDropdownClassName()"
      style="width: 160px; margin-top: 40px"
    >
      <nz-option nzValue="jack" nzLabel="Jack" />
    </nz-select>
  `
})
class ScopedSelectHostComponent {
  value = signal('jack');
  openScoped = signal(false);
  openPlain = signal(false);
  scopedDropdownClassName = signal<string[] | string | null>(null);
  plainDropdownClassName = signal<string[] | string | null>(null);
}

describe('select dropdown panel picks up the enclosing theme scope', () => {
  let fixture: ComponentFixture<ScopedSelectHostComponent>;
  let overlay: OverlayContainer;
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
    document.head.appendChild(style);
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(ScopedSelectHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  it('adds the enclosing [nzTheme] scope class to the overlay pane of a scoped select', async () => {
    fixture.componentInstance.openScoped.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).toMatch(/nz-theme-\d+/);
  });

  it('adds no scope class and no empty class token for a select outside any theme scope', async () => {
    fixture.componentInstance.openPlain.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    expect(pane.className).not.toMatch(/nz-theme-\d+/);
    expect(pane.className.trim().split(/\s+/)).not.toContain('');
  });

  it('includes a string nzDropdownClassName token, with no scope class, outside any theme scope', async () => {
    fixture.componentInstance.plainDropdownClassName.set('my-dd');
    fixture.componentInstance.openPlain.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    const tokens = pane.className.trim().split(/\s+/);
    expect(tokens).toContain('my-dd');
    expect(tokens.some(token => /^nz-theme-\d+$/.test(token))).toBe(false);
    expect(tokens).not.toContain('');
  });

  it('includes array nzDropdownClassName tokens plus exactly one scope class token, inside a theme scope', async () => {
    fixture.componentInstance.scopedDropdownClassName.set(['a', 'b']);
    fixture.componentInstance.openScoped.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    const tokens = pane.className.trim().split(/\s+/);
    expect(tokens).toContain('a');
    expect(tokens).toContain('b');
    expect(tokens.filter(token => /^nz-theme-\d+$/.test(token)).length).toBe(1);
    expect(new Set(tokens).size).toBe(tokens.length);
    expect(tokens).not.toContain('');
  });

  it('includes a string nzDropdownClassName token together with the scope class, inside a theme scope', async () => {
    fixture.componentInstance.scopedDropdownClassName.set('my-dd');
    fixture.componentInstance.openScoped.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    const pane = overlay.getContainerElement().querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane).not.toBeNull();
    const tokens = pane.className.trim().split(/\s+/);
    expect(tokens).toContain('my-dd');
    expect(tokens.some(token => /^nz-theme-\d+$/.test(token))).toBe(true);
  });
});
