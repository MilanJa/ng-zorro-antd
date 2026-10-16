/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzTimelineModule } from './timeline.module';

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline>
      <nz-timeline-item [nzLabel]="undefined" [nzDot]="undefined" [nzPosition]="undefined">a</nz-timeline-item>
    </nz-timeline>
  `
})
class TestUndefinedAliasesComponent {}

@Component({
  imports: [NzTimelineModule],
  template: `
    <nz-timeline>
      <nz-timeline-item nzLabel="l" nzDot="dot" nzPosition="end">a</nz-timeline-item>
    </nz-timeline>
  `
})
class TestValueAliasesComponent {}

// The logger prints each message once per page, so the undefined host must run before the valued one.
describe('timeline item deprecated aliases bound to undefined', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const NAMES = [
    '`nzLabel` on `nz-timeline-item`',
    '`nzDot` on `nz-timeline-item`',
    '`nzPosition` on `nz-timeline-item`'
  ];

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('does not warn', () => {
    TestBed.createComponent(TestUndefinedAliasesComponent).detectChanges();
    for (const name of NAMES) {
      expect(
        messages().filter(m => m.includes(name)),
        name
      ).toHaveLength(0);
    }
  });

  it('still warns once when a value is bound', () => {
    TestBed.createComponent(TestValueAliasesComponent).detectChanges();
    for (const name of NAMES) {
      expect(
        messages().filter(m => m.includes(name)),
        name
      ).toHaveLength(1);
    }
  });
});
