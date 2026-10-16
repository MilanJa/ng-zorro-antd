/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzStepsModule } from './steps.module';

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzDirection]="$any(undefined)" [nzLabelPlacement]="$any(undefined)" [nzProgressDot]="undefined">
      <nz-step nzTitle="x" [nzDescription]="undefined" />
    </nz-steps>
  `
})
class TestUndefinedAliasesComponent {}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps nzDirection="vertical" nzLabelPlacement="vertical" [nzProgressDot]="true">
      <nz-step nzTitle="x" nzDescription="d" />
    </nz-steps>
  `
})
class TestValueAliasesComponent {}

// The logger prints each message once per page, so the undefined host must run before the valued one.
describe('steps deprecated aliases bound to undefined', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const NAMES = [
    '`nzDirection` on `nz-steps`',
    '`nzLabelPlacement` on `nz-steps`',
    '`nzProgressDot` on `nz-steps`',
    '`nzDescription` on `nz-step`'
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
