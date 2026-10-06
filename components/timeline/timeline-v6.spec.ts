/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTimelineModule } from './timeline.module';
import { NzTimelineMode, NzTimelineOrientation, NzTimelineVariant } from './typings';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTimelineModule],
  template: `
    <div style="width: 600px">
      <nz-timeline id="host">
        <nz-timeline-item nzColor="green">a</nz-timeline-item>
        <nz-timeline-item nzColor="red">b</nz-timeline-item>
        <nz-timeline-item nzColor="#00f">c</nz-timeline-item>
        <nz-timeline-item [nzDot]="tpl">d</nz-timeline-item>
      </nz-timeline>
      <ng-template #tpl><span class="custom-dot">*</span></ng-template>
    </div>
  `
})
class TestTimelineComponent {}

@Component({
  imports: [NzTimelineModule],
  template: `
    <div style="width: 600px">
      <nz-timeline id="modes" [nzMode]="mode()" [nzPending]="pending()" [nzReverse]="reverse()">
        <nz-timeline-item [nzLabel]="label()">a</nz-timeline-item>
        <nz-timeline-item [nzLabel]="label()">b</nz-timeline-item>
        <nz-timeline-item>c</nz-timeline-item>
        <nz-timeline-item [nzLabel]="label()">d</nz-timeline-item>
      </nz-timeline>
    </div>
  `
})
class TestTimelineModesComponent {
  readonly mode = signal<NzTimelineMode>('left');
  readonly pending = signal<string | undefined>(undefined);
  readonly reverse = signal(false);
  readonly label = signal<string | undefined>(undefined);
}

@Component({
  imports: [NzTimelineModule],
  template: `
    <div style="width: 600px">
      <nz-timeline
        id="v6api"
        [nzMode]="mode()"
        [nzOrientation]="orientation()"
        [nzVariant]="variant()"
        [nzTitleSpan]="span()"
      >
        <nz-timeline-item [nzTitle]="title()">a</nz-timeline-item>
        <nz-timeline-item [nzTitle]="title()">b</nz-timeline-item>
        <nz-timeline-item [nzLoading]="loading()">c</nz-timeline-item>
      </nz-timeline>
    </div>
  `
})
class TestTimelineV6ApiComponent {
  readonly mode = signal<NzTimelineMode>('start');
  readonly orientation = signal<NzTimelineOrientation>('vertical');
  readonly variant = signal<NzTimelineVariant>('outlined');
  readonly span = signal<number | string | undefined>(undefined);
  readonly title = signal<string | undefined>(undefined);
  readonly loading = signal(false);
}

describe('timeline under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  /**
   * The item classes are bound after the parent has counted its items (`ngAfterContentInit`), so the
   * icon and rail can start from the unclassed look; antd's
   * `transition: background-color/border/color var(--ant-motion-duration-slow)` (0.3s) on the icon and
   * `transition: all` on the rail would then be read mid-way. The wait outlasts it.
   */
  async function render(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 350));
  }

  function items(fixture: ComponentFixture<unknown>, host: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(`#${host} .ant-timeline > li`));
  }

  function part(item: HTMLElement, selector: string): HTMLElement {
    return item.querySelector(selector) as HTMLElement;
  }

  async function api(setup: (host: TestTimelineV6ApiComponent) => void): Promise<HTMLElement[]> {
    const fixture = TestBed.createComponent(TestTimelineV6ApiComponent);
    setup(fixture.componentInstance);
    await render(fixture);
    return items(fixture, 'v6api');
  }

  it('horizontal: items side by side on one rail, content centred under the dot', async () => {
    const [first, second, third] = await api(h => h.orientation.set('horizontal'));
    expect(first.getBoundingClientRect().top).toBeCloseTo(second.getBoundingClientRect().top, 0);
    expect(second.getBoundingClientRect().left).toBeGreaterThan(first.getBoundingClientRect().right - 1);
    const rail = getComputedStyle(part(first, '.ant-timeline-item-rail'));
    expect([rail.borderTopWidth, rail.borderTopStyle, rail.borderTopColor]).toEqual([
      '2px',
      'solid',
      'rgba(5, 5, 5, 0.06)'
    ]);
    expect(getComputedStyle(part(first, '.ant-timeline-item-wrapper')).flexDirection).toBe('column');
    expect(getComputedStyle(part(first, '.ant-timeline-item-content')).textAlign).toBe('center');
    expect(third.querySelector('.ant-timeline-item-rail')).toBeNull();
  });

  it('horizontal end: the item puts the dot under the content (column-reverse)', async () => {
    const [first] = await api(h => {
      h.orientation.set('horizontal');
      h.mode.set('end');
    });
    expect(getComputedStyle(first).alignItems).toBe('flex-end');
    expect(getComputedStyle(part(first, '.ant-timeline-item-wrapper')).flexDirection).toBe('column-reverse');
  });

  it('filled: solid primary dots without a ring', async () => {
    const [first] = await api(h => h.variant.set('filled'));
    const icon = getComputedStyle(part(first, '.ant-timeline-item-icon'));
    expect(icon.backgroundColor).toBe('rgb(22, 119, 255)');
    expect(icon.borderTopColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('nzTitleSpan moves the dot to span/24 of the row (number) or to the given percentage', async () => {
    for (const [span, ratio] of [
      [6, 0.25],
      ['30%', 0.3]
    ] as const) {
      const [first] = await api(h => {
        h.title.set('2015-09-01');
        h.span.set(span);
      });
      const li = first.getBoundingClientRect();
      const dot = part(first, '.ant-timeline-item-icon').getBoundingClientRect();
      expect(dot.left + dot.width / 2).toBeCloseTo(li.left + li.width * ratio, 0);
    }
  });

  it('nzLoading: a spinning custom icon and a dotted process rail before it', async () => {
    const [, second, third] = await api(h => h.loading.set(true));
    expect(third.classList).toContain('ant-timeline-item-process');
    expect(getComputedStyle(part(third, '.ant-timeline-item-icon')).borderTopWidth).toBe('0px');
    expect(part(third, '.ant-timeline-item-icon .anticon-loading')).toBeTruthy();
    expect(getComputedStyle(part(second, '.ant-timeline-item-tail')).borderLeftStyle).toBe('dotted');
  });

  it('paints dot items as antd: 10px outlined dots in the preset or custom colour, a 2px rail', async () => {
    const fixture = TestBed.createComponent(TestTimelineComponent);
    await render(fixture);
    const root = fixture.nativeElement.querySelector('#host .ant-timeline') as HTMLElement;
    expect(Array.from(root.classList)).toEqual(
      expect.arrayContaining([
        'ant-timeline-vertical',
        'ant-timeline-dot',
        'ant-timeline-title-horizontal',
        'ant-timeline-outlined'
      ])
    );
    expect(root.classList).not.toContain('ant-timeline-layout-alternate');

    const [green, red, custom, dot] = items(fixture, 'host');
    const icon = (item: HTMLElement): CSSStyleDeclaration => getComputedStyle(part(item, '.ant-timeline-item-icon'));
    // `--ant-cmp-steps-icon-size` falls back to the active dot size (`--ant-steps-dot-current-size`,
    // 10px) because Timeline's own `dotSize` token is unset.
    expect(icon(green).width).toBe('10px');
    expect(icon(green).height).toBe('10px');
    expect(icon(green).borderRadius).toBe('10px');
    expect(icon(green).borderTopWidth).toBe('2px');
    expect(icon(green).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(icon(green).borderTopColor).toBe('rgb(82, 196, 26)');
    expect(icon(red).borderTopColor).toBe('rgb(255, 77, 79)');
    // The border colour of an arbitrary colour is also the kept v4 inline `border-color`; the icon's
    // `color` comes only from the v6 rule `.ant-timeline-dot .ant-timeline-item-icon { color:
    // var(--ant-cmp-steps-item-icon-dot-color) }`, fed by the custom property on the item.
    expect(icon(custom).borderTopColor).toBe('rgb(0, 0, 255)');
    expect(custom.style.getPropertyValue('--ant-cmp-steps-item-icon-dot-color')).toBe('#00f');
    expect(icon(custom).getPropertyValue('--ant-cmp-steps-item-icon-dot-color').trim()).toBe('#00f');
    expect(icon(custom).color).toBe('rgb(0, 0, 255)');
    expect(icon(green).color).toBe('rgb(82, 196, 26)');
    expect(green.classList).toContain('ant-timeline-item-color-green');
    expect(part(green, '.ant-timeline-item-icon').classList).toContain('ant-timeline-item-head-green');

    // A custom dot drops the outline (`-item-custom`) and keeps the template.
    expect(dot.classList).toContain('ant-timeline-item-custom');
    expect(icon(dot).borderTopWidth).toBe('0px');
    expect(part(dot, '.ant-timeline-item-icon .custom-dot')).toBeTruthy();

    for (const item of [green, red, custom]) {
      const rail = part(item, '.ant-timeline-item-tail');
      expect(rail.classList).toContain('ant-timeline-item-rail');
      expect(rail.classList).toContain('ant-timeline-item-rail-finish');
      const railStyle = getComputedStyle(rail);
      expect(railStyle.width).toBe('2px');
      expect(railStyle.borderLeftWidth).toBe('2px');
      expect(railStyle.borderLeftStyle).toBe('solid');
      expect(railStyle.borderLeftColor).toBe('rgba(5, 5, 5, 0.06)');
      expect(item.classList).toContain('ant-timeline-item-finish');
      expect(item.classList).toContain('ant-timeline-item-placement-start');
      // Steps' vertical item: `padding-bottom: var(--ant-padding-sm)`, `min-height: controlHeight * 1.5`.
      expect(getComputedStyle(item).paddingBottom).toBe('12px');
      expect(getComputedStyle(item).minHeight).toBe('48px');
    }
    // The last node has no rail (antd renders none) and is the active one.
    const lastTail = part(dot, '.ant-timeline-item-tail');
    expect(lastTail.classList).not.toContain('ant-timeline-item-rail');
    expect(getComputedStyle(lastTail).display).toBe('none');
    expect(dot.classList).toContain('ant-timeline-item-active');
    expect(getComputedStyle(dot).paddingBottom).toBe('0px');

    // The dot sits beside the content, as antd's wrapper lays out icon and section.
    const dotBox = part(green, '.ant-timeline-item-icon').getBoundingClientRect();
    const contentBox = part(green, '.ant-timeline-item-content').getBoundingClientRect();
    expect(contentBox.left - dotBox.right).toBeCloseTo(16, 0);
    expect(contentBox.top).toBeLessThan(dotBox.top);
  });

  it('lays labelled items out on both sides of the dot (layout-alternate), alternating in alternate mode', async () => {
    const fixture = TestBed.createComponent(TestTimelineModesComponent);
    fixture.componentInstance.label.set('2015-09-01');
    fixture.componentInstance.mode.set('alternate');
    await render(fixture);
    const root = fixture.nativeElement.querySelector('#modes .ant-timeline') as HTMLElement;
    expect(root.classList).toContain('ant-timeline-layout-alternate');

    const list = items(fixture, 'modes');
    expect(list.map(item => item.classList.contains('ant-timeline-item-placement-start'))).toEqual([
      true,
      false,
      true,
      false
    ]);
    expect(list.map(item => item.classList.contains('ant-timeline-item-placement-end'))).toEqual([
      false,
      true,
      false,
      true
    ]);

    const [start, end, noLabel] = list;
    const header = part(start, '.ant-timeline-item-label');
    expect(header.classList).toContain('ant-timeline-item-header');
    expect(header.classList).toContain('ant-timeline-item-title');
    expect(getComputedStyle(header).textAlign).toBe('end');
    expect(getComputedStyle(part(end, '.ant-timeline-item-label')).textAlign).toBe('start');
    expect(getComputedStyle(part(end, '.ant-timeline-item-content')).textAlign).toBe('end');
    // Timeline's alternate item: `padding-bottom: itemPaddingBottom` (padding * 1.25).
    expect(getComputedStyle(start).paddingBottom).toBe('20px');

    // Head span 12/24: the dot is centred, the title ends and the content starts half an alternate gap
    // away from the centre line, on both kinds of item. The gap (margin * 2 + dot) is resolved on the
    // item, where the dot size is Steps' 8px `dotSize` (the 10px active size is set on the icon): 20px.
    for (const item of [start, end, noLabel]) {
      const li = item.getBoundingClientRect();
      const centre = li.left + li.width / 2;
      const dot = part(item, '.ant-timeline-item-icon').getBoundingClientRect();
      expect(dot.left + dot.width / 2).toBeCloseTo(centre, 0);
      const content = part(item, '.ant-timeline-item-content').getBoundingClientRect();
      if (item === end) {
        expect(content.right).toBeCloseTo(centre - 20, 0);
      } else {
        expect(content.left).toBeCloseTo(centre + 20, 0);
      }
    }
    expect(header.getBoundingClientRect().right).toBeCloseTo(
      start.getBoundingClientRect().left + start.getBoundingClientRect().width / 2 - 20,
      0
    );
    // Without a label antd still renders an empty header, which keeps the content on its side.
    expect(noLabel.classList).toContain('ant-timeline-item-empty-header');
  });

  it('marks the pending node as the processing step; the rail before it follows its status', async () => {
    const fixture = TestBed.createComponent(TestTimelineModesComponent);
    fixture.componentInstance.pending.set('Recording...');
    await render(fixture);
    const list = items(fixture, 'modes');
    expect(list.length).toBe(5);
    const pending = list[4];
    expect(pending.classList).toContain('ant-timeline-item-pending');
    expect(pending.classList).toContain('ant-timeline-item-process');
    expect(pending.classList).toContain('ant-timeline-item-custom');
    expect(pending.classList).toContain('ant-timeline-item-active');
    expect(part(pending, '.ant-timeline-item-icon .anticon-loading')).toBeTruthy();
    expect(getComputedStyle(part(pending, '.ant-timeline-item-tail')).display).toBe('none');

    // Normal order: a rail takes the status of the node it leads to.
    const rails = list.slice(0, 4).map(item => part(item, '.ant-timeline-item-tail'));
    expect(rails.slice(0, 3).every(rail => rail.classList.contains('ant-timeline-item-rail-finish'))).toBe(true);
    expect(rails[3].classList).toContain('ant-timeline-item-rail-process');
    expect(getComputedStyle(rails[3]).borderLeftStyle).toBe('dotted');
    expect(getComputedStyle(rails[2]).borderLeftStyle).toBe('solid');
    expect(list[3].classList).not.toContain('ant-timeline-item-active');
  });

  it('gives each rail its own node status when reversed', async () => {
    const fixture = TestBed.createComponent(TestTimelineModesComponent);
    fixture.componentInstance.pending.set('Recording...');
    fixture.componentInstance.reverse.set(true);
    await render(fixture);
    const list = items(fixture, 'modes');
    const [pending, ...rest] = list;
    expect(pending.classList).toContain('ant-timeline-item-process');
    expect(pending.classList).not.toContain('ant-timeline-item-active');
    const pendingRail = part(pending, '.ant-timeline-item-tail');
    expect(pendingRail.classList).toContain('ant-timeline-item-rail-process');
    expect(getComputedStyle(pendingRail).borderLeftStyle).toBe('dotted');
    for (const item of rest.slice(0, 3)) {
      expect(part(item, '.ant-timeline-item-tail').classList).toContain('ant-timeline-item-rail-finish');
    }
    const last = rest[3];
    expect(last.classList).toContain('ant-timeline-item-active');
    expect(part(last, '.ant-timeline-item-tail').classList).not.toContain('ant-timeline-item-rail');
    expect(getComputedStyle(part(last, '.ant-timeline-item-tail')).display).toBe('none');

    // Dropping the pending node moves the active node and removes the processing rail.
    fixture.componentInstance.pending.set(undefined);
    await render(fixture);
    const after = items(fixture, 'modes');
    expect(after.length).toBe(4);
    expect(after.filter(item => item.querySelector('.ant-timeline-item-rail-process')).length).toBe(0);
    expect(after[3].classList).toContain('ant-timeline-item-active');
  });

  it('puts end-placed items on the end side in right mode without labels', async () => {
    const fixture = TestBed.createComponent(TestTimelineModesComponent);
    fixture.componentInstance.mode.set('right');
    await render(fixture);
    const root = fixture.nativeElement.querySelector('#modes .ant-timeline') as HTMLElement;
    expect(root.classList).not.toContain('ant-timeline-layout-alternate');
    const [first] = items(fixture, 'modes');
    expect(first.classList).toContain('ant-timeline-item-placement-end');
    const li = first.getBoundingClientRect();
    const dot = part(first, '.ant-timeline-item-icon').getBoundingClientRect();
    const content = part(first, '.ant-timeline-item-content').getBoundingClientRect();
    expect(dot.right).toBeCloseTo(li.right, 0);
    expect(dot.left - content.right).toBeCloseTo(16, 0);
    expect(getComputedStyle(part(first, '.ant-timeline-item-content')).textAlign).toBe('end');
  });
});
