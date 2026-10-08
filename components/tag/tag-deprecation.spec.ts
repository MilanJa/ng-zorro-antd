/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzTagModule } from './tag.module';

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag [nzBordered]="bordered()">a</nz-tag>
    <nz-tag [nzBordered]="bordered()">b</nz-tag>
  `
})
class TestTagWarnComponent {
  readonly bordered = signal(true);
}

describe('tag deprecation warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const BORDERED = '`nzBordered` on `nz-tag` is deprecated, use `nzVariant` instead.';

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  // must stay the first test of the file: once printed, the message is never printed again
  it('does not warn for nzBordered="true" (antd warns only for bordered={false})', () => {
    TestBed.createComponent(TestTagWarnComponent).detectChanges();
    expect(messages().filter(m => m.includes(BORDERED))).toEqual([]);
  });

  it('warns once for nzBordered="false", however many tags bind it and however often', () => {
    const fixture = TestBed.createComponent(TestTagWarnComponent);
    fixture.componentInstance.bordered.set(false);
    fixture.detectChanges();
    fixture.componentInstance.bordered.set(true);
    fixture.detectChanges();
    fixture.componentInstance.bordered.set(false);
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(BORDERED)).length).toBe(1);
  });
});
