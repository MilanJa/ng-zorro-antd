/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, DebugElement, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { environment } from 'ng-zorro-antd/core/environments';
import { testDirectionality } from 'ng-zorro-antd/core/testing';

import { NzDemoTimelineLabelComponent } from './demo/label';
import { NzTimelineItemComponent } from './timeline-item.component';
import { NzTimelineComponent } from './timeline.component';
import { NzTimelineModule } from './timeline.module';
import { NzTimelineMode, NzTimelineOrientation, NzTimelinePlacement, NzTimelineVariant } from './typings';

describe('nz-timeline', () => {
  describe('basic', () => {
    let fixture: ComponentFixture<NzTestTimelineBasicComponent>;
    let testComponent: NzTestTimelineBasicComponent;
    let timeline: DebugElement;
    let items: HTMLDivElement[] = [];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTimelineBasicComponent);
      testComponent = fixture.componentInstance;
      fixture.detectChanges();

      timeline = fixture.debugElement.query(By.directive(NzTimelineComponent));
      items = Array.from((fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.ant-timeline-item'));
    });

    it('should init className correct', () => {
      expect(timeline.nativeElement.firstElementChild!.classList).toContain('ant-timeline');
      expect(items.length).toBeGreaterThan(0);
      expect(items[0].classList).not.toContain('ant-timeline-item-last');
      expect(items[3].classList).toContain('ant-timeline-item-last');
    });

    it('should color work', () => {
      fixture.detectChanges();
      expect(items[0].querySelector('.ant-timeline-item-head')!.classList).toContain('ant-timeline-item-head-blue');
      testComponent.color.set('red');
      fixture.detectChanges();
      expect(items[0].querySelector('.ant-timeline-item-head')!.classList).toContain('ant-timeline-item-head-red');
      testComponent.color.set('green');
      fixture.detectChanges();
      expect(items[0].querySelector('.ant-timeline-item-head')!.classList).toContain('ant-timeline-item-head-green');
    });

    it('should dot work', () => {
      fixture.detectChanges();
      expect((items[0].querySelector('.ant-timeline-item-head') as HTMLDivElement).innerText).toBe('dot');
      expect((items[1].querySelector('.ant-timeline-item-head') as HTMLDivElement).innerText).toBe('template');
    });

    it('should last work', () => {
      fixture.detectChanges();
      expect(items.length).toBe(4);
      testComponent.last.set(true);
      fixture.detectChanges();
      items = Array.from((fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.ant-timeline-item'));
      expect(items.length).toBe(5);
      expect(items[4]!.classList).toContain('ant-timeline-item-last');
    });

    it('should pending work', () => {
      fixture.detectChanges();
      expect(timeline.nativeElement.querySelector('.ant-timeline-item-pending')).toBeNull();
      testComponent.pending.set(true);
      fixture.detectChanges();
      expect(timeline.nativeElement.querySelector('.ant-timeline-item-pending').innerText).toBe('');
      testComponent.pending.set('pending');
      fixture.detectChanges();
      expect(timeline.nativeElement.querySelector('.ant-timeline-item-pending').innerText).toBe('pending');
    });

    it('should reverse work', () => {
      fixture.detectChanges();
      testComponent.pending.set(true);
      testComponent.reverse.set(true);
      fixture.detectChanges();
      expect(timeline.nativeElement.firstElementChild.firstElementChild!.classList).toContain(
        'ant-timeline-item-pending'
      );
      expect(items[0].classList).toContain('ant-timeline-item-last');
      expect(items[3].classList).not.toContain('ant-timeline-item-last');
    });

    it('should alternate position work', () => {
      fixture.detectChanges();
      testComponent.mode.set('alternate');
      fixture.detectChanges();
      expect(timeline.nativeElement.firstElementChild!.classList).toContain('ant-timeline-alternate');
      expect(items[0].classList).toContain('ant-timeline-item-left');
      expect(items[1].classList).toContain('ant-timeline-item-right');
      expect(items[2].classList).toContain('ant-timeline-item-left');
    });

    it('should alternate right position work', () => {
      fixture.detectChanges();
      testComponent.mode.set('right');
      fixture.detectChanges();
      expect(timeline.nativeElement.firstElementChild!.classList).toContain('ant-timeline-right');
      expect(items[0].classList).toContain('ant-timeline-item-right');
      expect(items[1].classList).toContain('ant-timeline-item-right');
      expect(items[2].classList).toContain('ant-timeline-item-right');
    });
  });

  // add another test component for simplicity
  describe('custom position', () => {
    let fixture: ComponentFixture<NzTestTimelineCustomPositionComponent>;
    let timeline: DebugElement;
    let items: HTMLDivElement[] = [];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTimelineCustomPositionComponent);
      fixture.detectChanges();

      timeline = fixture.debugElement.query(By.directive(NzTimelineComponent));
      items = Array.from((fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.ant-timeline-item'));
    });

    it('should custom position work', () => {
      expect(timeline.nativeElement.firstElementChild!.classList).toContain('ant-timeline-alternate');
      expect(items[0].classList).toContain('ant-timeline-item-right');
    });
  });

  describe('custom color', () => {
    let fixture: ComponentFixture<NzTestTimelineCustomColorComponent>;
    let items: HTMLLIElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTimelineCustomColorComponent);
      fixture.detectChanges();

      items = Array.from((fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.ant-timeline-item'));
    });

    it('should support custom color', () => {
      fixture.detectChanges();
      expect((items[0].querySelector('.ant-timeline-item-head') as HTMLDivElement)!.style.borderColor).toBe('cyan');
      expect((items[1].querySelector('.ant-timeline-item-head') as HTMLDivElement)!.style.borderColor).toBe(
        'rgb(200, 0, 0)'
      );
      expect((items[2].querySelector('.ant-timeline-item-head') as HTMLDivElement)!.style.borderColor).toBe(
        'rgb(120, 18, 65)'
      ); // hex would be converted to rgb()
      expect((items[3].querySelector('.ant-timeline-item-head') as HTMLDivElement)!.style.borderColor).toBe('');
    });
  });

  describe('pending', () => {
    let fixture: ComponentFixture<NzTestTimelinePendingComponent>;
    let timeline: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTimelinePendingComponent);
      fixture.detectChanges();
      timeline = fixture.debugElement.query(By.directive(NzTimelineComponent));
    });

    it('should pending work', () => {
      fixture.detectChanges();
      expect(timeline.nativeElement.querySelector('.ant-timeline-item-pending').innerText).toBe('template');
    });
  });

  describe('label', () => {
    let fixture: ComponentFixture<NzDemoTimelineLabelComponent>;
    let timeline: DebugElement;
    let items: HTMLLIElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoTimelineLabelComponent);
      fixture.detectChanges();

      timeline = fixture.debugElement.query(By.directive(NzTimelineComponent));
      items = Array.from((fixture.debugElement.nativeElement as HTMLElement).querySelectorAll('.ant-timeline-item'));
    });

    it('should label work', () => {
      expect(timeline.nativeElement.firstElementChild!.classList).toContain('ant-timeline-label');
      expect(items[0].firstElementChild!.classList).toContain('ant-timeline-item-label');
      expect(items[2].firstElementChild!.classList).not.toContain('ant-timeline-item-label');
    });

    it('should mode right not affecting classnames', () => {
      fixture.componentInstance.mode.set('right');
      fixture.detectChanges();

      expect(timeline.nativeElement.firstElementChild!.classList).not.toContain('ant-timeline-right');
    });
  });

  testDirectionality(() => NzTestTimelineBasicComponent, By.css('.ant-timeline'), 'ant-timeline');

  describe('clear', () => {
    let fixture: ComponentFixture<NzTestTimelineClearItemsComponent>;
    let timeline: NzTimelineComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTimelineClearItemsComponent);
      fixture.detectChanges();
      timeline = fixture.componentInstance.nzTimeLine;
    });

    it('test clear items', () => {
      fixture.componentInstance.reset();
      fixture.detectChanges();
      expect(timeline.timelineItems.length).toBe(0);
    });
  });
});

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline
      [nzMode]="mode()"
      [nzOrientation]="orientation()"
      [nzVariant]="variant()"
      [nzTitleSpan]="titleSpan()"
      [nzPending]="pending()"
    >
      <nz-timeline-item [nzTitle]="title()" [nzIcon]="icon()" [nzPlacement]="placement()">a</nz-timeline-item>
      <nz-timeline-item nzLabel="old" nzDot="o" nzPosition="right">b</nz-timeline-item>
      <nz-timeline-item [nzLoading]="loading()">c</nz-timeline-item>
    </nz-timeline>
  `
})
class NzTestTimelineV6Component {
  readonly mode = signal<NzTimelineMode>('start');
  readonly orientation = signal<NzTimelineOrientation>('vertical');
  readonly variant = signal<NzTimelineVariant>('outlined');
  readonly titleSpan = signal<number | string | undefined>(undefined);
  readonly pending = signal<string | undefined>(undefined);
  readonly title = signal<string | undefined>(undefined);
  readonly icon = signal<string | undefined>(undefined);
  readonly placement = signal<NzTimelinePlacement | 'left' | 'right' | undefined>(undefined);
  readonly loading = signal(false);
}

describe('nz-timeline antd v6 inputs', () => {
  let fixture: ComponentFixture<NzTestTimelineV6Component>;
  let host: NzTestTimelineV6Component;
  const root = (): HTMLElement => fixture.nativeElement.querySelector('.ant-timeline');
  const items = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('.ant-timeline > li'));
  const update = (fn: () => void): void => {
    fn();
    fixture.detectChanges();
  };
  async function expectWarnOnce(message: string, act: () => void): Promise<void> {
    environment.isTestMode = false;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => void 0);
    try {
      act();
      fixture.detectChanges();
      expect(warn.mock.calls.filter(args => args.some(a => String(a).includes(message)))).toHaveLength(1);
    } finally {
      warn.mockRestore();
      environment.isTestMode = false; // the browser runner's default; never leave it true
    }
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(NzTestTimelineV6Component);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  // the warn-once assertion for `nzMode="left|right"` lives in timeline-deprecation.spec.ts: this
  // file's own earlier tests already bind nzMode="right" and would consume the one-time warning.
  it('nzMode start/end place every item; left/right still map to them', () => {
    expect(items()[0].classList).toContain('ant-timeline-item-placement-start');
    expect(items()[0].classList).toContain('ant-timeline-item-left');
    update(() => host.mode.set('end'));
    expect(items()[0].classList).toContain('ant-timeline-item-placement-end');
    expect(items()[0].classList).toContain('ant-timeline-item-right');
    update(() => host.mode.set('left'));
    expect(items()[0].classList).toContain('ant-timeline-item-placement-start');
    update(() => host.mode.set('right'));
    expect(items()[0].classList).toContain('ant-timeline-item-placement-end');
  });

  it('nzOrientation and nzVariant set the Steps root classes', () => {
    expect(root().classList).toContain('ant-timeline-vertical');
    expect(root().classList).toContain('ant-timeline-title-horizontal');
    expect(root().classList).toContain('ant-timeline-outlined');
    update(() => {
      host.orientation.set('horizontal');
      host.variant.set('filled');
    });
    expect(root().classList).toContain('ant-timeline-horizontal');
    expect(root().classList).toContain('ant-timeline-title-vertical');
    expect(root().classList).not.toContain('ant-timeline-vertical');
    expect(root().classList).toContain('ant-timeline-filled');
    expect(root().classList).not.toContain('ant-timeline-outlined');
    // horizontal: antd's tree with the v4 classes kept on their counterparts
    const wrapper = items()[0].querySelector(':scope > .ant-timeline-item-wrapper') as HTMLElement;
    expect(wrapper.querySelector(':scope > .ant-timeline-item-icon.ant-timeline-item-head')).toBeTruthy();
    expect(
      wrapper.querySelector(
        '.ant-timeline-item-section > .ant-timeline-item-header > .ant-timeline-item-rail.ant-timeline-item-tail'
      )
    ).toBeTruthy();
    expect(wrapper.querySelector('.ant-timeline-item-section > .ant-timeline-item-content')!.textContent).toContain(
      'a'
    );
    expect(items()[2].querySelector('.ant-timeline-item-rail')).toBeNull();
  });

  it('nzTitleSpan sets one head-span variable by type, never in alternate mode', () => {
    update(() => host.titleSpan.set(6));
    expect(root().style.getPropertyValue('--ant-timeline-head-span')).toBe('6');
    expect(root().style.getPropertyValue('--ant-timeline-head-span-ptg')).toBe('');
    update(() => host.titleSpan.set('30%'));
    expect(root().style.getPropertyValue('--ant-timeline-head-span')).toBe('');
    expect(root().style.getPropertyValue('--ant-timeline-head-span-ptg')).toBe('30%');
    update(() => host.mode.set('alternate'));
    expect(root().style.getPropertyValue('--ant-timeline-head-span-ptg')).toBe('');
  });

  it('nzLabel/nzDot/nzPosition alias nzTitle/nzIcon/nzPlacement; the new inputs win', () => {
    const old = items()[1];
    expect(old.querySelector('.ant-timeline-item-title')!.textContent).toContain('old');
    expect(old.querySelector('.ant-timeline-item-head-custom')!.textContent).toContain('o');
    expect(old.classList).toContain('ant-timeline-item-placement-end');
    expect(root().classList).toContain('ant-timeline-label');
    update(() => {
      host.title.set('new');
      host.icon.set('n');
      host.placement.set('end');
    });
    const first = items()[0];
    expect(first.querySelector('.ant-timeline-item-title')!.textContent).toContain('new');
    expect(first.classList).toContain('ant-timeline-item-custom');
    expect(first.classList).toContain('ant-timeline-item-placement-end');
  });

  it('nzPending and an item nzLoading are independent, not a single-winner precedence', () => {
    // nzPending renders a separate ghost node appended after the real items; nzLoading marks a real
    // item as the processing one. Neither suppresses the other, so this documents that both render
    // side by side rather than asserting a single-winner precedence between them.
    update(() => {
      host.pending.set('Recording...');
      host.loading.set(true);
    });
    const list = items();
    expect(list).toHaveLength(4);
    expect(list[2].classList).toContain('ant-timeline-item-process'); // the loading real item (c)
    expect(list[3].classList).toContain('ant-timeline-item-pending'); // the separate pending ghost node
  });

  it('nzPlacement accepts left/right with a one-time warning', async () => {
    await expectWarnOnce(
      '`nzPlacement="left|right"` on `nz-timeline-item` is deprecated, use `nzPlacement="start|end"` instead.',
      () => host.placement.set('left')
    );
    expect(items()[0].classList).toContain('ant-timeline-item-placement-start');
  });

  it('nzLoading renders the loading node and makes the rail before it a process rail', () => {
    update(() => host.loading.set(true));
    const [, second, third] = items();
    expect(third.classList).toContain('ant-timeline-item-process');
    expect(third.classList).not.toContain('ant-timeline-item-finish');
    expect(third.classList).toContain('ant-timeline-item-custom');
    expect(third.classList).toContain('ant-timeline-item-active');
    expect(third.querySelector('.ant-timeline-item-head-custom .anticon-loading')).toBeTruthy();
    expect(second.querySelector('.ant-timeline-item-tail')!.classList).toContain('ant-timeline-item-rail-process');
    update(() => host.loading.set(false));
    expect(second.querySelector('.ant-timeline-item-tail')!.classList).toContain('ant-timeline-item-rail-finish');
    expect(items()[2].querySelector('.anticon-loading')).toBeNull();
  });

  // the warn-once assertion for `nzPending` lives in timeline-deprecation.spec.ts: this file's own
  // earlier tests already bind nzPending and would consume the one-time warning.
  it('nzPending still works', () => {
    update(() => host.pending.set('Recording...'));
    expect(items()).toHaveLength(4);
    expect(items()[3].classList).toContain('ant-timeline-item-pending');
  });

  it('v4 stylesheet: horizontal, filled and loading keep every v4 class', () => {
    update(() => {
      host.orientation.set('horizontal');
      host.variant.set('filled');
      host.loading.set(true);
    });
    const list = items();
    expect(list.every(li => li.classList.contains('ant-timeline-item'))).toBe(true);
    expect(
      list.every(li => li.querySelector('.ant-timeline-item-head') && li.querySelector('.ant-timeline-item-content'))
    ).toBe(true);
    expect(list[0].querySelector('.ant-timeline-item-tail')).toBeTruthy();
    expect(list[2].classList).toContain('ant-timeline-item-last');
    expect(list[2].querySelector('.ant-timeline-item-head-custom')).toBeTruthy();
  });
});

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline>
      <nz-timeline-item
        nzTitle="new title"
        nzLabel="old label"
        nzIcon="n"
        nzDot="o"
        nzPlacement="end"
        nzPosition="left"
      >
        content
      </nz-timeline-item>
    </nz-timeline>
  `
})
class NzTestTimelineNewFirstComponent {
  @ViewChild(NzTimelineItemComponent) item!: NzTimelineItemComponent;
}

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline>
      <nz-timeline-item
        nzLabel="old label"
        nzTitle="new title"
        nzDot="o"
        nzIcon="n"
        nzPosition="left"
        nzPlacement="end"
      >
        content
      </nz-timeline-item>
    </nz-timeline>
  `
})
class NzTestTimelineOldFirstComponent {
  @ViewChild(NzTimelineItemComponent) item!: NzTimelineItemComponent;
}

describe('nz-timeline-item: new input wins over its deprecated alias regardless of attribute order', () => {
  for (const [name, TestComponent] of [
    ['new input bound first', NzTestTimelineNewFirstComponent],
    ['old input bound first', NzTestTimelineOldFirstComponent]
  ] as const) {
    it(`${name}: nzTitle/nzIcon/nzPlacement win over nzLabel/nzDot/nzPosition`, () => {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      const el = (fixture.nativeElement as HTMLElement).querySelector('.ant-timeline-item')!;

      // Rendered DOM reflects the new input's value, not the old alias's.
      expect(el.querySelector('.ant-timeline-item-title')!.textContent).toContain('new title');
      expect(el.querySelector('.ant-timeline-item-title')!.textContent).not.toContain('old label');
      expect(el.querySelector('.ant-timeline-item-head-custom')!.textContent).toContain('n');
      expect(el.querySelector('.ant-timeline-item-head-custom')!.textContent).not.toContain('o');
      expect(el.classList).toContain('ant-timeline-item-placement-end');
      expect(el.classList).not.toContain('ant-timeline-item-placement-start');

      // The old input's getter reflects the current (new-input-won) value too.
      const item = fixture.componentInstance.item;
      expect(item.nzTitle).toBe('new title');
      expect(item.nzLabel).toBe('new title');
      expect(item.nzIcon).toBe('n');
      expect(item.nzDot).toBe('n');
      expect(item.nzPlacement).toBe('end');
      expect(item.nzPosition).toBe('end');
    });
  }
});

@Component({
  imports: [NzTimelineModule],
  selector: 'nz-test-basic-timeline',
  template: `
    <ng-template #dotTemplate>template</ng-template>
    <nz-timeline [nzPending]="pending()" [nzReverse]="reverse()" [nzMode]="mode()">
      <nz-timeline-item [nzColor]="color()" [nzDot]="dot()">Create a services site 2015-09-01</nz-timeline-item>
      <nz-timeline-item [nzDot]="dotTemplate">Solve initial network problems 2015-09-01</nz-timeline-item>
      <nz-timeline-item>Technical testing 2015-09-01</nz-timeline-item>
      <nz-timeline-item>Network problems being solved 2015-09-01</nz-timeline-item>
      @if (last()) {
        <nz-timeline-item>Network problems being solved 2015-09-01</nz-timeline-item>
      }
    </nz-timeline>
  `
})
export class NzTestTimelineBasicComponent {
  readonly color = signal('blue');
  readonly dot = signal('dot');
  readonly pending = signal<boolean | string>(false);
  readonly last = signal(false);
  readonly reverse = signal(false);
  readonly mode = signal<NzTimelineMode>('left');
}

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline>
      <nz-timeline-item nzColor="cyan">Create a services site 2015-09-01</nz-timeline-item>
      <nz-timeline-item nzColor="rgb(200, 0, 0)">Solve initial network problems 2015-09-01</nz-timeline-item>
      <nz-timeline-item nzColor="#781241">Technical testing 2015-09-01</nz-timeline-item>
      <nz-timeline-item nzColor="red">Network problems being solved 2015-09-01</nz-timeline-item>
    </nz-timeline>
  `
})
export class NzTestTimelineCustomColorComponent {}

@Component({
  imports: [NzTimelineModule],
  template: `
    <ng-template #pendingTemplate>template</ng-template>
    <nz-timeline [nzPending]="pendingTemplate">
      <nz-timeline-item>Technical testing 2015-09-01</nz-timeline-item>
      <nz-timeline-item>Network problems being solved 2015-09-01</nz-timeline-item>
    </nz-timeline>
  `
})
export class NzTestTimelinePendingComponent {}

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline nzMode="custom">
      <nz-timeline-item nzPosition="right">Right</nz-timeline-item>
      <nz-timeline-item nzPosition="left">Left</nz-timeline-item>
    </nz-timeline>
  `
})
export class NzTestTimelineCustomPositionComponent {}

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline nzMode="custom">
      @for (item of data(); track item) {
        <nz-timeline-item>{{ item }}</nz-timeline-item>
      }
    </nz-timeline>
    <span (click)="reset()">reset</span>
  `
})
export class NzTestTimelineClearItemsComponent {
  @ViewChild(NzTimelineComponent)
  nzTimeLine!: NzTimelineComponent;
  readonly data = signal([1, 2, 3]);
  reset(): void {
    this.data.set([]);
  }
}
