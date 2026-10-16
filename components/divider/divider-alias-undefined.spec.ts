/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzDividerModule } from './divider.module';

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider [nzType]="$any(undefined)" />`
})
class TestUndefinedTypeComponent {}

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider nzType="vertical" />`
})
class TestValueTypeComponent {}

// The logger prints each message once per page, so the undefined host must run before the valued one.
describe('divider nzType bound to undefined', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const typeWarnings = (): string[] =>
    warnSpy.mock.calls.map(args => args.map(String).join(' ')).filter(m => m.includes('`nzType` on `nz-divider`'));

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('does not warn and stays horizontal', () => {
    const fixture = TestBed.createComponent(TestUndefinedTypeComponent);
    fixture.detectChanges();
    expect(typeWarnings()).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.ant-divider-horizontal')).not.toBeNull();
  });

  it('still warns once when a value is bound', () => {
    TestBed.createComponent(TestValueTypeComponent).detectChanges();
    expect(typeWarnings()).toHaveLength(1);
  });
});
