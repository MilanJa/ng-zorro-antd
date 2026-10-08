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

@Component({
  imports: [NzDividerModule],
  template: `
    <nz-divider id="axis" nzText="T" nzType="vertical" [nzOrientation]="orientation()" />
    <nz-divider id="placement" nzText="T" nzOrientation="left" [nzTitlePlacement]="placement()" />
    <nz-divider id="plain" nzText="T" [nzOrientation]="orientation()" [nzTitlePlacement]="placement()" />
  `
})
class TestDividerUnsetComponent {
  readonly orientation = signal<'horizontal' | 'vertical' | undefined>('horizontal');
  readonly placement = signal<'start' | 'end' | 'center' | undefined>('end');
}

describe('divider: undefined on a new input means unset', () => {
  it('falls back to the deprecated input or the default and does not warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const fixture = TestBed.createComponent(TestDividerUnsetComponent);
      fixture.detectChanges();
      const classes = (id: string): DOMTokenList =>
        (fixture.nativeElement.querySelector(`#${id}`) as HTMLElement).classList;
      expect(classes('axis')).toContain('ant-divider-horizontal');
      expect(classes('placement')).toContain('ant-divider-with-text-end');
      warnSpy.mockClear(); // the aliases warned on first binding; only the unset phase is asserted

      fixture.componentInstance.orientation.set(undefined);
      fixture.componentInstance.placement.set(undefined);
      fixture.detectChanges();

      expect(classes('axis')).toContain('ant-divider-vertical'); // nzType applies again
      expect(classes('placement')).toContain('ant-divider-with-text-start'); // nzOrientation="left" applies again
      expect(classes('placement')).toContain('ant-divider-with-text-left'); // v4 safety: the physical class follows
      expect(classes('plain')).toContain('ant-divider-horizontal'); // defaults
      expect(classes('plain')).toContain('ant-divider-with-text-center');
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });
});
