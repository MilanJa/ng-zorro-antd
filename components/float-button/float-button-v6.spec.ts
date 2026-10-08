/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzFloatButtonModule } from './float-button.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <nz-float-button id="host" nzIcon="question-circle" />
    <nz-float-button id="square-host" nzShape="square" nzIcon="question-circle" />
    <nz-float-button-group id="group" nzShape="square" nzTrigger="click" [nzOpen]="open()">
      <nz-float-button nzIcon="file-text" />
    </nz-float-button-group>
  `
})
class TestFloatButtonComponent {
  readonly open = signal(false);
}

describe('float-button under antd v6 css', () => {
  let fixture: ComponentFixture<TestFloatButtonComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestFloatButtonComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders a fixed circular 40px float button with the v6 classes', () => {
    const host = document.getElementById('host')!;
    expect(host.classList.contains('ant-float-btn')).toBe(true);
    expect(host.classList.contains('ant-float-btn-circle')).toBe(true);
    const cs = getComputedStyle(host);
    expect(cs.position).toBe('fixed');
    expect(cs.width).toBe('40px');
    expect(cs.height).toBe('40px');
    expect(cs.borderRadius).toBe('50%');
  });

  it('fills the host with a 40x40 inner button box for both circle and square', () => {
    const circleInner = document.querySelector('#host .ant-float-btn-inner') as HTMLElement;
    const circleRect = circleInner.getBoundingClientRect();
    expect(Math.round(circleRect.width)).toBe(40);
    expect(Math.round(circleRect.height)).toBe(40);

    const squareInner = document.querySelector('#square-host .ant-float-btn-inner') as HTMLElement;
    const squareRect = squareInner.getBoundingClientRect();
    expect(Math.round(squareRect.width)).toBe(40);
    expect(Math.round(squareRect.height)).toBe(40);
  });

  it('opens a square group list', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = document.querySelector('#group .ant-float-btn-group-list') as HTMLElement;
    expect(list).not.toBeNull();
    await expectMotionSettled(list);
    expect(document.getElementById('group')!.classList.contains('ant-float-btn-group-square')).toBe(true);
  });

  it('removes the group list after its leave keyframes when closed', async () => {
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await expectMotionSettled(document.querySelector('#group .ant-float-btn-group-list') as HTMLElement);

    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    const leaving = document.querySelector('#group .ant-float-btn-group-list') as HTMLElement;
    // The list stays in the DOM while the patch's leave keyframes run; Angular removes it on `animationend`.
    expect(leaving).not.toBeNull();
    expect(leaving.classList).toContain('ant-float-btn-leave-top');
    expect(getComputedStyle(leaving).animationName).toBe('ant-float-btn-leave-top-keyframes');
    await new Promise(r => setTimeout(r, 300 + 200)); // --ant-motion-duration-slow (0.3s) + slack
    expect(document.querySelector('#group .ant-float-btn-group-list')).toBeNull();
  });
});

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <div #box style="height: 100px; overflow-y: auto"><div style="height: 300px"></div></div>
    <nz-float-button-top id="ring" [nzTarget]="box" [nzVisibilityHeight]="-1" nzShowProgress />
    <nz-float-button-top id="plain" [nzTarget]="box" [nzVisibilityHeight]="-1" />
  `
})
class TestFloatButtonProgressComponent {}

describe('float-button-top progress ring under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => {
    style.remove();
  });

  it('draws the conic ring on the inner button and keeps its 40px box', async () => {
    const fixture = TestBed.createComponent(TestFloatButtonProgressComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('div') as HTMLElement;
    box.scrollTop = 100;
    box.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 60));
    await fixture.whenStable();
    fixture.detectChanges();
    const inner = document.querySelector('#ring .ant-float-btn-inner') as HTMLElement;
    const cs = getComputedStyle(inner);
    expect(cs.getPropertyValue('--ant-float-btn-progress').trim()).toBe('0.5turn');
    expect(cs.backgroundImage).toContain('conic-gradient');
    expect(cs.borderTopWidth).toBe('2px');
    expect(Math.round(inner.getBoundingClientRect().width)).toBe(40);
    // v4 safety (same sheet): without nzShowProgress the inner button keeps no border and no ring
    const plain = getComputedStyle(document.querySelector('#plain .ant-float-btn-inner') as HTMLElement);
    expect(plain.backgroundImage).not.toContain('conic-gradient');
    expect(plain.borderTopWidth).toBe('0px');
  });
});

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <nz-float-button id="wrap" nzShape="square" nzIcon="file-text" nzContent="HELP INFO" />
    <nz-float-button id="short" nzShape="square" nzIcon="file-text" nzContent="HELP" />
  `
})
class TestFloatButtonContentWrapComponent {}

describe('float-button content wrapping under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => {
    style.remove();
  });

  it('wraps long nzContent text inside the square instead of clipping it', async () => {
    const fixture = TestBed.createComponent(TestFloatButtonContentWrapComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const inner = document.querySelector('#wrap .ant-float-btn-inner') as HTMLElement;
    const description = document.querySelector('#wrap .ant-float-btn-description') as HTMLElement;
    expect(getComputedStyle(inner).whiteSpace).toBe('normal');
    expect(getComputedStyle(inner).wordBreak).toBe('break-word');
    expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth);
    expect(Math.round(inner.getBoundingClientRect().width)).toBe(40);
    // short content keeps the 40px square
    const short = document.querySelector('#short .ant-float-btn-inner') as HTMLElement;
    expect(Math.round(short.getBoundingClientRect().width)).toBe(40);
  });
});
