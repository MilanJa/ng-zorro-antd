/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzAnchorModule } from './anchor.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzAnchorModule],
  template: `
    <div #box id="box" style="height: 200px; overflow: auto; position: relative;">
      <nz-anchor id="host" [nzAffix]="false" [nzContainer]="box" [nzDirection]="direction()">
        <nz-link nzHref="#a" nzTitle="A" />
        <nz-link nzHref="#b" nzTitle="B" />
      </nz-anchor>
      <div style="height: 50px"></div>
      <h2 id="a">A</h2>
      <div style="height: 1000px"></div>
      <h2 id="b">B</h2>
      <div style="height: 1000px"></div>
    </div>
  `
})
class TestAnchorComponent {
  @ViewChild('box', { static: true }) boxRef!: ElementRef<HTMLElement>;
  readonly direction = signal<'vertical' | 'horizontal'>('vertical');
  get box(): HTMLElement {
    return this.boxRef.nativeElement;
  }
}

describe('anchor under antd v6 css', () => {
  let fixture: ComponentFixture<TestAnchorComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAnchorComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the default-token padding and link title colour/size', () => {
    const host = fixture.debugElement.query(By.css('#host .ant-anchor')).nativeElement as HTMLElement;
    const hostCs = getComputedStyle(host);
    // `.ant-anchor`'s own `padding-inline-start` is driven by `--ant-line-width-bold` (2px), not
    // `--ant-anchor-link-padding-inline-start` (that token sizes `.ant-anchor-link` itself, see
    // `publish/anchor/style/v6/index.css` line 7 vs. line 8).
    expect(hostCs.paddingInlineStart).toBe('2px');

    const title = fixture.debugElement.query(By.css('#host .ant-anchor-link-title')).nativeElement as HTMLElement;
    const titleCs = getComputedStyle(title);
    expect(titleCs.color).toBe('rgba(0, 0, 0, 0.88)');
    expect(titleCs.fontSize).toBe('14px');
  });

  it('activates the scrolled-to link and positions the ink ball on it', async () => {
    const box = fixture.componentInstance.box;
    const targetB = fixture.debugElement.query(By.css('#b')).nativeElement as HTMLElement;
    box.scrollTop = targetB.offsetTop;
    box.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 0));
    // `top var(--ant-motion-duration-slow) ease-in-out` (style/v6/patch.css); default
    // `--ant-motion-duration-slow` is 0.3s -- wait past it before reading the settled position.
    await new Promise(resolve => setTimeout(resolve, 350));
    fixture.detectChanges();

    const activeTitle = fixture.debugElement.query(By.css('.ant-anchor-link-active > .ant-anchor-link-title'))
      .nativeElement as HTMLElement;
    expect(getComputedStyle(activeTitle).color).toBe('rgb(22, 119, 255)');

    const ball = fixture.debugElement.query(By.css('.ant-anchor-ink-ball')).nativeElement as HTMLElement;
    expect(getComputedStyle(ball).backgroundColor).toBe('rgb(22, 119, 255)');
    // antd v6 spans the indicator over exactly the active title (Anchor.js's `updateInk`: centred
    // on it, `height = clientHeight`), so the rendered boxes must coincide.
    const ballRect = ball.getBoundingClientRect();
    const titleRect = activeTitle.getBoundingClientRect();
    expect(Math.abs(ballRect.top - titleRect.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(ballRect.height - titleRect.height)).toBeLessThanOrEqual(1);

    // antd v6 moves the visible-state hook to `.ant-anchor-ink` itself (`${prefixCls}-ink-visible`);
    // ng-zorro keeps the ball, not the rail, as the moving element (anchor.component.ts's
    // `setVisible`), so the class lands on `.ant-anchor-ink-ball` here.
    expect(ball.classList.contains('ant-anchor-ink-visible')).toBe(true);
    expect(ball.classList.contains('ant-anchor-ink-ball-visible')).toBe(true);
  });

  it('lays out a horizontal anchor with a bottom-bar ink spanning the active title', async () => {
    fixture.componentInstance.direction.set('horizontal');
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 0));

    const wrapper = fixture.debugElement.query(By.css('#host .ant-anchor-wrapper')).nativeElement as HTMLElement;
    expect(wrapper.classList.contains('ant-anchor-wrapper-horizontal')).toBe(true);

    const anchor = fixture.debugElement.query(By.css('#host .ant-anchor')).nativeElement as HTMLElement;
    expect(getComputedStyle(anchor).display).toBe('flex');

    const box = fixture.componentInstance.box;
    const targetB = fixture.debugElement.query(By.css('#b')).nativeElement as HTMLElement;
    box.scrollTop = targetB.offsetTop;
    box.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setTimeout(resolve, 350));
    fixture.detectChanges();

    const activeTitle = fixture.debugElement.query(By.css('.ant-anchor-link-active > .ant-anchor-link-title'))
      .nativeElement as HTMLElement;
    const ball = fixture.debugElement.query(By.css('.ant-anchor-ink-ball')).nativeElement as HTMLElement;
    const ballCs = getComputedStyle(ball);
    expect(ballCs.height).toBe('2px');
    expect(parseFloat(ballCs.width)).toBeCloseTo(activeTitle.clientWidth, 0);
  });
});

@Component({
  imports: [NzAnchorModule],
  template: `
    <div #box2 id="box2" style="height: 200px; overflow: auto; position: relative;">
      <div style="height: 60px"></div>
      <nz-anchor id="host2" [nzContainer]="box2">
        <nz-link nzHref="#c" nzTitle="C" />
      </nz-anchor>
      <h2 id="c">C</h2>
      <div style="height: 1000px"></div>
    </div>
  `
})
class TestAffixedAnchorComponent {
  @ViewChild('box2', { static: true }) boxRef!: ElementRef<HTMLElement>;
  get box(): HTMLElement {
    return this.boxRef.nativeElement;
  }
}

describe('affixed anchor under antd v6 css', () => {
  let fixture: ComponentFixture<TestAffixedAnchorComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestAffixedAnchorComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('gives the composed nz-affix wrapper antd v6 z-index once scrolled, not auto', async () => {
    const box = fixture.componentInstance.box;

    box.scrollTop = 300;
    box.dispatchEvent(new Event('scroll'));
    // affix handles scroll through throttleTime(20, trailing) (affix.component.ts:39,128).
    await new Promise(resolve => setTimeout(resolve, 100));
    fixture.detectChanges();

    const fixedEl = fixture.debugElement.query(By.css('#host2 .ant-affix')).nativeElement as HTMLElement;
    expect(getComputedStyle(fixedEl).zIndex).toBe('10');
  });
});
