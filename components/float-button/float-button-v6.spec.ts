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

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <nz-float-button id="circle-count" [nzBadge]="{ nzCount: 5 }" />
    <nz-float-button id="circle-dot" [nzBadge]="{ nzDot: true }" />
    <nz-float-button id="square-count" nzShape="square" [nzBadge]="{ nzCount: 5 }" />
    <nz-float-button id="square-dot" nzShape="square" [nzBadge]="{ nzDot: true }" />
    <div #box style="height: 100px; overflow-y: auto"><div style="height: 300px"></div></div>
    <nz-float-button-top
      id="ring-count"
      [nzTarget]="box"
      [nzVisibilityHeight]="-1"
      nzShowProgress
      [nzBadge]="{ nzCount: 5 }"
    />
  `
})
class TestFloatButtonBadgeComponent {}

// antd 6 positions the badge root inside the button's border (`--ant-line-width`, or the progress ring's
// `--ant-line-width-bold`) and insets it by `controlHeight / 2 * (1 - 1 / sqrt(2))` on a circle and by
// `borderRadius * (1 - 1 / sqrt(2))` for a square dot (publish/float-button/style/v6/index.css).
const BADGE_INSET = 0.29289321881345254;
const LINE_WIDTH = 1; // --ant-line-width
const LINE_WIDTH_BOLD = 2; // --ant-line-width-bold
const CIRCLE_INSET = (32 / 2) * BADGE_INSET; // --ant-control-height: 32px
const SQUARE_DOT_INSET = 6 * BADGE_INSET; // --ant-border-radius: 6px

async function renderBadges(): Promise<void> {
  const fixture = TestBed.createComponent(TestFloatButtonBadgeComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const box = fixture.nativeElement.querySelector('div') as HTMLElement;
  box.scrollTop = 100;
  box.dispatchEvent(new Event('scroll'));
  await new Promise(resolve => setTimeout(resolve, 60));
  await fixture.whenStable();
  fixture.detectChanges();
}

/** Distance of the badge indicator's centre from the inner button's top-end corner. */
function indicatorInset(id: string): { end: number; top: number } {
  const button = document.querySelector(`#${id} .ant-float-btn-inner`)!.getBoundingClientRect();
  const indicator = document.querySelector(`#${id} nz-badge-sup`)!.getBoundingClientRect();
  return {
    end: button.right - (indicator.left + indicator.width / 2),
    top: indicator.top + indicator.height / 2 - button.top
  };
}

describe('float-button badge under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => {
    style.remove();
  });

  it('lets the badge wrapper fill the button', async () => {
    await renderBadges();
    const button = document.querySelector('#circle-count .ant-float-btn-inner')!.getBoundingClientRect();
    const wrapper = document.querySelector('#circle-count nz-badge')!.getBoundingClientRect();
    expect(wrapper.width).toBeCloseTo(button.width, 1);
    expect(wrapper.height).toBeCloseTo(button.height, 1);
    expect(wrapper.left).toBeCloseTo(button.left, 1);
    expect(wrapper.top).toBeCloseTo(button.top, 1);
  });

  it('centres a circle count and a circle dot where antd 6 puts them', async () => {
    await renderBadges();
    for (const id of ['circle-count', 'circle-dot']) {
      const inset = indicatorInset(id);
      expect(inset.end).toBeCloseTo(LINE_WIDTH + CIRCLE_INSET, 1);
      expect(inset.top).toBeCloseTo(LINE_WIDTH + CIRCLE_INSET, 1);
    }
  });

  it('puts a square count on the border corner and insets a square dot', async () => {
    await renderBadges();
    const count = indicatorInset('square-count');
    expect(count.end).toBeCloseTo(LINE_WIDTH, 1);
    expect(count.top).toBeCloseTo(LINE_WIDTH, 1);
    const dot = indicatorInset('square-dot');
    expect(dot.end).toBeCloseTo(LINE_WIDTH + SQUARE_DOT_INSET, 1);
    expect(dot.top).toBeCloseTo(LINE_WIDTH + SQUARE_DOT_INSET, 1);
  });

  it('measures the inset from inside the progress ring', async () => {
    await renderBadges();
    const inset = indicatorInset('ring-count');
    expect(inset.end).toBeCloseTo(LINE_WIDTH_BOLD + CIRCLE_INSET, 1);
    expect(inset.top).toBeCloseTo(LINE_WIDTH_BOLD + CIRCLE_INSET, 1);
  });
});

describe('float-button badge without the v6 stylesheet', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  it('keeps nz-badge wrapping the body and emits no float-button badge class', async () => {
    await renderBadges();
    const content = document.querySelector('#circle-count nz-float-button-content') as HTMLElement;
    expect([...content.children].map(c => c.tagName.toLowerCase())).toEqual(['nz-badge']);
    const badge = content.firstElementChild as HTMLElement;
    expect(badge.className).toBe('ant-badge');
    expect(badge.getAttribute('style')).toBeNull();
    expect([...badge.children].map(c => [c.tagName.toLowerCase(), ...[...c.classList].sort()].join('.'))).toEqual([
      'div.ant-float-btn-body',
      'nz-badge-sup.ant-badge-count.ant-scroll-number'
    ]);
    expect(document.querySelector('.ant-float-btn-badge, .ant-float-btn-badge-dot')).toBeNull();
  });
});
