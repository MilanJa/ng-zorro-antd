/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzDividerModule } from './divider.module';

@Component({
  imports: [NzDividerModule],
  template: `<nz-divider nzText="T" [nzOrientation]="$any(orientation())" [nzType]="type()" />`
})
class TestDividerWarnComponent {
  readonly orientation = signal<string>('horizontal');
  readonly type = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('divider deprecation warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const PLACEMENT =
    '`nzOrientation (left/right/center)` on `nz-divider` is deprecated, use `nzTitlePlacement` instead.';
  const TYPE = '`nzType` on `nz-divider` is deprecated, use `nzOrientation` instead.';

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  // every host binds nzType, so this must stay the first test of the file
  it('warns once for nzType', () => {
    TestBed.createComponent(TestDividerWarnComponent).detectChanges();
    expect(messages().filter(m => m.includes(TYPE)).length).toBe(1);
  });

  it('does not warn for the axis values of nzOrientation', () => {
    const fixture = TestBed.createComponent(TestDividerWarnComponent);
    fixture.componentInstance.type.set('vertical');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(PLACEMENT))).toEqual([]);
  });

  it('warns once when nzOrientation carries a title placement', () => {
    const fixture = TestBed.createComponent(TestDividerWarnComponent);
    fixture.componentInstance.orientation.set('left');
    fixture.detectChanges();
    fixture.componentInstance.orientation.set('right');
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(PLACEMENT)).length).toBe(1);
  });

  it('warns about and ignores a value outside both sets', () => {
    const fixture = TestBed.createComponent(TestDividerWarnComponent);
    fixture.componentInstance.orientation.set('diagonal');
    fixture.detectChanges();
    expect(messages().some(m => m.includes('ignoring "diagonal"'))).toBe(true);
    expect((fixture.nativeElement.querySelector('nz-divider') as HTMLElement).classList).toContain(
      'ant-divider-horizontal'
    );
  });
});
