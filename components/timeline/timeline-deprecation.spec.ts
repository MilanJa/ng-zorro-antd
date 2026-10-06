/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzTimelineModule } from './timeline.module';
import { NzTimelineMode } from './typings';

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline [nzMode]="mode()" [nzPending]="pending()" [nzPendingDot]="pendingDot()">
      <nz-timeline-item [nzPlacement]="$any(placement())">a</nz-timeline-item>
    </nz-timeline>
  `
})
class TestTimelineWarnComponent {
  readonly mode = signal<NzTimelineMode>('start');
  readonly pending = signal<string | undefined>(undefined);
  readonly pendingDot = signal<string | undefined>(undefined);
  readonly placement = signal<string | undefined>(undefined);
}

describe('timeline deprecation warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('warns once for nzMode="left|right"', () => {
    const MESSAGE = '`nzMode="left|right"` on `nz-timeline` is deprecated, use `nzMode="start|end"` instead.';
    const fixture = TestBed.createComponent(TestTimelineWarnComponent);
    fixture.detectChanges();
    fixture.componentInstance.mode.set('left');
    fixture.detectChanges();
    fixture.componentInstance.mode.set('right');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(MESSAGE)).length).toBe(1);
  });

  it('warns once for nzPending', () => {
    const MESSAGE = '`nzPending` on `nz-timeline` is deprecated, add a last item with nzLoading instead.';
    const fixture = TestBed.createComponent(TestTimelineWarnComponent);
    fixture.detectChanges();
    fixture.componentInstance.pending.set('Recording...');
    fixture.detectChanges();
    fixture.componentInstance.pending.set('Still recording...');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(MESSAGE)).length).toBe(1);
  });

  it('warns once for nzPendingDot', () => {
    const MESSAGE = '`nzPendingDot` on `nz-timeline` is deprecated, add a last item with nzLoading instead.';
    const fixture = TestBed.createComponent(TestTimelineWarnComponent);
    fixture.detectChanges();
    fixture.componentInstance.pendingDot.set('*');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(MESSAGE)).length).toBe(1);
  });

  it('warns once for nzPlacement="left|right" on nz-timeline-item', () => {
    const MESSAGE =
      '`nzPlacement="left|right"` on `nz-timeline-item` is deprecated, use `nzPlacement="start|end"` instead.';
    const fixture = TestBed.createComponent(TestTimelineWarnComponent);
    fixture.detectChanges();
    fixture.componentInstance.placement.set('left');
    fixture.detectChanges();
    fixture.componentInstance.placement.set('right');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(MESSAGE)).length).toBe(1);
  });
});
