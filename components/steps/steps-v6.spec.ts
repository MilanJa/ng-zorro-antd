/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { NzSizeDSType } from 'ng-zorro-antd/core/types';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import {
  NzDirectionType,
  NzStepsOrientation,
  NzStepsTitlePlacement,
  NzStepsType,
  NzStepsVariant
} from './steps.component';
import { NzStepsModule } from './steps.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzStepsModule],
  template: `
    <div style="width: 900px">
      <nz-steps id="host" [nzCurrent]="1" [nzProgressDot]="progressDot()" [nzDirection]="direction()" [nzSize]="size()">
        <nz-step nzTitle="Finished" nzDescription="d1" />
        <nz-step nzTitle="In Progress" nzSubtitle="Left 00:00:08" nzDescription="d2" [nzPercentage]="percentage()" />
        <nz-step nzTitle="Waiting" nzDescription="d3" />
      </nz-steps>
      <nz-steps id="clickable" [nzCurrent]="0" (nzIndexChange)="index.set($event)">
        <nz-step nzTitle="A" />
        <nz-step nzTitle="B" />
      </nz-steps>
    </div>
  `
})
class TestStepsComponent {
  readonly progressDot = signal(false);
  readonly direction = signal<NzDirectionType>('horizontal');
  readonly size = signal<NzSizeDSType>('default');
  readonly percentage = signal<number | null>(null);
  readonly index = signal(0);
}

describe('steps under antd v6 css', () => {
  let fixture: ComponentFixture<TestStepsComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestStepsComponent);
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  /**
   * Item statuses are assigned in a microtask after the first render, so the icon, title and rail
   * colours then run antd's `transition: … var(--ant-motion-duration-slow)` (0.3s) from the `wait`
   * look; the wait outlasts it before colours are read.
   */
  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 350));
  }

  function items(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('#host .ant-steps-item'));
  }

  function el(item: HTMLElement, selector: string): HTMLElement {
    return item.querySelector(selector) as HTMLElement;
  }

  it('renders the default horizontal steps with antd v6 colours, sizes and an in-flow rail', async () => {
    await render();
    const root = fixture.nativeElement.querySelector('#host') as HTMLElement;
    expect(root.classList).toContain('ant-steps-title-horizontal');
    expect(root.classList).toContain('ant-steps-filled');
    const [finish, process, wait] = items();
    expect(finish.classList).toContain('ant-steps-item-finish');

    // Filled variant (antd's default): `--ant-cmp-steps-item-icon-bg-color: var(--ant-color-primary-bg)`.
    const finishIcon = getComputedStyle(el(finish, '.ant-steps-item-icon'));
    expect(finishIcon.backgroundColor).toBe('rgb(230, 244, 255)');
    expect(finishIcon.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(finishIcon.width).toBe('32px');
    expect(finishIcon.height).toBe('32px');

    const processIcon = getComputedStyle(el(process, '.ant-steps-item-icon'));
    expect(processIcon.backgroundColor).toBe('rgb(22, 119, 255)');
    expect(processIcon.color).toBe('rgb(255, 255, 255)');

    expect(getComputedStyle(el(wait, '.ant-steps-item-title')).color).toBe('rgba(0, 0, 0, 0.45)');

    // The rail takes the status of the step it leads to: finish -> process (colorPrimary),
    // process -> wait (colorTextDisabled); the last step has none.
    const finishRail = el(finish, '.ant-steps-item-rail');
    expect(finishRail.classList).toContain('ant-steps-item-rail-process');
    expect(getComputedStyle(finishRail).borderTopColor).toBe('rgb(22, 119, 255)');
    expect(getComputedStyle(finishRail).borderTopWidth).toBe('1px');
    const processRail = el(process, '.ant-steps-item-rail');
    expect(processRail.classList).toContain('ant-steps-item-rail-wait');
    expect(getComputedStyle(processRail).borderTopColor).toBe('rgba(0, 0, 0, 0.25)');
    expect(wait.querySelector('.ant-steps-item-rail')).toBeNull();

    const subtitle = getComputedStyle(el(process, '.ant-steps-item-subtitle'));
    expect(subtitle.color).toBe('rgba(0, 0, 0, 0.45)');
    expect(subtitle.marginInlineStart).toBe('8px');

    // antd draws the rail after the title in the header row (16px rail margin), centred on the icon,
    // with the description below the title.
    const titleRect = el(finish, '.ant-steps-item-title').getBoundingClientRect();
    const railRect = finishRail.getBoundingClientRect();
    const iconRect = el(finish, '.ant-steps-item-icon').getBoundingClientRect();
    expect(railRect.left - titleRect.right).toBeCloseTo(16, 0);
    expect(railRect.width).toBeGreaterThan(0);
    expect(railRect.top + railRect.height / 2).toBeCloseTo(iconRect.top + iconRect.height / 2, 0);
    expect(el(finish, '.ant-steps-item-description').getBoundingClientRect().top).toBeGreaterThanOrEqual(
      titleRect.bottom
    );
    expect(getComputedStyle(el(finish, '.ant-steps-item-description')).color).toBe('rgba(0, 0, 0, 0.45)');
  });

  it('renders the dot style with antd v6 dot sizes', async () => {
    fixture.componentInstance.progressDot.set(true);
    await render();
    const root = fixture.nativeElement.querySelector('#host') as HTMLElement;
    expect(root.classList).toContain('ant-steps-dot');
    expect(root.classList).toContain('ant-steps-title-vertical');
    const [finish, process] = items();
    const dot = getComputedStyle(el(finish, '.ant-steps-item-icon'));
    expect(dot.width).toBe('8px');
    expect(dot.height).toBe('8px');
    expect(dot.backgroundColor).toBe('rgb(22, 119, 255)');
    const current = getComputedStyle(el(process, '.ant-steps-item-icon'));
    expect(current.width).toBe('10px');
    expect(current.height).toBe('10px');
  });

  it('renders the vertical direction with a vertical rail', async () => {
    fixture.componentInstance.direction.set('vertical');
    await render();
    const root = fixture.nativeElement.querySelector('#host') as HTMLElement;
    expect(getComputedStyle(root).flexDirection).toBe('column');
    expect(root.classList).toContain('ant-steps-title-horizontal');
    const [finish] = items();
    expect(getComputedStyle(finish).display).toBe('block');
    const rail = el(finish, '.ant-steps-item-rail');
    const railCs = getComputedStyle(rail);
    expect(railCs.position).toBe('absolute');
    // `--ant-cmp-steps-rail-size: var(--ant-line-width)` outside the dot style.
    expect(railCs.borderInlineStartWidth).toBe('1px');
    expect(railCs.borderTopWidth).toBe('0px');
    expect(rail.getBoundingClientRect().height).toBeGreaterThan(0);
  });

  it('renders the small size', async () => {
    fixture.componentInstance.size.set('small');
    await render();
    const icon = getComputedStyle(el(items()[0], '.ant-steps-item-icon'));
    expect(icon.width).toBe('24px');
    expect(icon.height).toBe('24px');
  });

  it('keeps the icon size with a progress ring', async () => {
    fixture.componentInstance.percentage.set(60);
    await render();
    const root = fixture.nativeElement.querySelector('#host') as HTMLElement;
    expect(root.classList).toContain('ant-steps-with-progress');
    const process = items()[1];
    const ring = el(process, '.ant-steps-progress-icon');
    expect(ring).not.toBeNull();
    const icon = el(process, '.ant-steps-item-icon');
    expect(getComputedStyle(icon).width).toBe('32px');
    // The ring box sits two bold line widths outside the icon's padding box on every side, as antd's
    // SVG does, centred on the icon.
    const ringCs = getComputedStyle(ring);
    expect(ringCs.position).toBe('absolute');
    expect(ringCs.top).toBe('-4px');
    expect(ringCs.left).toBe('-4px');
    const ringRect = ring.getBoundingClientRect();
    const iconRect = icon.getBoundingClientRect();
    expect(ringRect.left + ringRect.width / 2).toBeCloseTo(iconRect.left + iconRect.width / 2, 0);
    expect(ringRect.top + ringRect.height / 2).toBeCloseTo(iconRect.top + iconRect.height / 2, 0);

    // nz-progress's circle fills that box and draws antd's ring: a stroke of `lineWidthBold` in
    // viewBox units (100 / 40px * 2px = 5), butt caps, colorSplit rail.
    const svg = ring.querySelector('svg.ant-progress-circle') as SVGElement;
    const svgRect = svg.getBoundingClientRect();
    expect(svgRect.width).toBeCloseTo(ringRect.width, 0);
    expect(svgRect.left).toBeCloseTo(ringRect.left, 0);
    const path = getComputedStyle(ring.querySelector('.ant-progress-circle-path')!);
    expect(path.strokeWidth).toBe('5px');
    expect(path.strokeLinecap).toBe('butt');
    const trail = getComputedStyle(ring.querySelector('.ant-progress-circle-trail')!);
    expect(trail.strokeWidth).toBe('5px');
    expect(trail.stroke).toBe('rgba(5, 5, 5, 0.06)');
  });

  it('draws the focus ring of a clickable step around the item, not the wrapper', async () => {
    await render();
    const item = fixture.nativeElement.querySelector('#clickable .ant-steps-item:not(.ant-steps-item-active)');
    const wrapper = item.querySelector('.ant-steps-item-wrapper') as HTMLElement;
    expect(wrapper.getAttribute('role')).toBe('button');
    wrapper.focus({ focusVisible: true } as FocusOptions);
    expect(wrapper.matches(':focus-visible')).toBe(true);
    const itemCs = getComputedStyle(item);
    expect(itemCs.outlineStyle).toBe('solid');
    expect(itemCs.outlineWidth).toBe('3px');
    expect(itemCs.outlineColor).toBe('rgb(145, 202, 255)');
    expect(getComputedStyle(wrapper).outlineStyle).toBe('none');
  });
});

@Component({
  imports: [NzStepsModule],
  template: `
    <div style="width: 900px">
      <nz-steps
        id="v6"
        [nzCurrent]="1"
        [nzVariant]="variant()"
        [nzType]="type()"
        [nzOrientation]="orientation()"
        [nzTitlePlacement]="titlePlacement()"
      >
        <nz-step nzTitle="Finished" nzContent="d1" />
        <nz-step nzTitle="In Progress" nzContent="d2" />
        <nz-step nzTitle="Waiting" nzContent="d3" />
      </nz-steps>
    </div>
  `
})
class TestStepsV6InputsComponent {
  readonly variant = signal<NzStepsVariant>('filled');
  readonly type = signal<NzStepsType>('default');
  readonly orientation = signal<NzStepsOrientation>('horizontal');
  readonly titlePlacement = signal<NzStepsTitlePlacement>('horizontal');
}

describe('steps v6 inputs under antd v6 css', () => {
  let fixture: ComponentFixture<TestStepsV6InputsComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestStepsV6InputsComponent);
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  // Statuses land in a microtask; icon colours then run `var(--ant-motion-duration-slow)` (0.3s) transitions.
  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 350));
  }

  const root = (): HTMLElement => fixture.nativeElement.querySelector('#v6');
  const icon = (i: number): CSSStyleDeclaration =>
    getComputedStyle(root().querySelectorAll<HTMLElement>('.ant-steps-item-icon')[i]);

  it('draws filled by default and the outlined variant with antd v6 icon colours', async () => {
    await render();
    expect(icon(0).backgroundColor).toBe('rgb(230, 244, 255)');
    fixture.componentInstance.variant.set('outlined');
    await render();
    // `.ant-steps.ant-steps-outlined .ant-steps-item-finish`: colorBgContainer fill, colorPrimary border.
    expect([icon(0).backgroundColor, icon(0).borderTopColor]).toEqual(['rgb(255, 255, 255)', 'rgb(22, 119, 255)']);
    // `.ant-steps.ant-steps-outlined .ant-steps-item-wait`: colorTextDisabled border.
    expect(icon(2).borderTopColor).toBe('rgba(0, 0, 0, 0.25)');
  });

  it('lays out nzTitlePlacement="vertical" and nzOrientation="vertical" as antd does', async () => {
    fixture.componentInstance.titlePlacement.set('vertical');
    await render();
    expect(
      getComputedStyle(root().querySelector('.ant-steps-item-section > .ant-steps-item-title')!).flexDirection
    ).toBe('column');
    fixture.componentInstance.orientation.set('vertical');
    await render();
    expect(getComputedStyle(root()).flexDirection).toBe('column');
  });

  it('renders nzType="dot" with antd v6 dot sizes and nzContent as the body text', async () => {
    fixture.componentInstance.type.set('dot');
    await render();
    expect([icon(0).width, icon(1).width]).toEqual(['8px', '10px']);
    const body = root().querySelector('.ant-steps-item-description') as HTMLElement;
    expect(body.textContent!.trim()).toBe('d1');
    expect(getComputedStyle(body).color).toBe('rgba(0, 0, 0, 0.45)');
  });
});
