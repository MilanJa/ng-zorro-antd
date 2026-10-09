/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzProgressModule } from './progress.module';
import { NzProgressSize } from './typings';

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress id="a" nzType="circle" [nzPercent]="50" [nzSize]="size()" [nzWidth]="width()" />
    <nz-progress id="b" nzType="dashboard" [nzPercent]="50" [nzSize]="size()" />
  `
})
class TestProgressWarnComponent {
  readonly size = signal<NzProgressSize | undefined>(undefined);
  readonly width = signal<number | undefined>(undefined);
}

describe('progress deprecation and usage warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const WIDTH = '`nzWidth` on `nz-progress` is deprecated, use `nzSize` instead.';
  const OBJECT = 'Type "circle" and "dashboard" do not accept object as `nzSize`';
  const NON_POSITIVE = 'Type "circle" and "dashboard" need a positive `nzSize`';
  const ARRAY = 'Type "circle" and "dashboard" do not accept array as `nzSize`';

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('does not warn while nzWidth is unbound or undefined', () => {
    TestBed.createComponent(TestProgressWarnComponent).detectChanges();
    expect(messages().filter(m => m.includes(WIDTH))).toEqual([]);
  });

  it('warns once for nzWidth', () => {
    const fixture = TestBed.createComponent(TestProgressWarnComponent);
    fixture.componentInstance.width.set(80);
    fixture.detectChanges();
    fixture.componentInstance.width.set(90);
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(WIDTH)).length).toBe(1);
  });

  // An object size on a circle warns once and still renders.
  it('warns once for an object nzSize on circle and dashboard and still renders both', () => {
    const fixture = TestBed.createComponent(TestProgressWarnComponent);
    fixture.componentInstance.size.set({ width: 80, height: 80 });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(messages().filter(m => m.includes(OBJECT)).length).toBe(1);
    for (const id of ['a', 'b']) {
      const body = fixture.nativeElement.querySelector(`#${id} .ant-progress-body`) as HTMLElement;
      expect(body.querySelector('svg.ant-progress-circle')).not.toBeNull();
      expect(body.style.width).toBe('132px');
    }
  });

  it('warns once for an array nzSize on a circle and uses its first number', () => {
    const fixture = TestBed.createComponent(TestProgressWarnComponent);
    fixture.componentInstance.size.set([100, 50]);
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(ARRAY)).length).toBe(1);
    expect((fixture.nativeElement.querySelector('#a .ant-progress-body') as HTMLElement).style.width).toBe('100px');
  });

  it('treats a zero nzSize on a circle as the default size and warns once', () => {
    const fixture = TestBed.createComponent(TestProgressWarnComponent);
    fixture.componentInstance.size.set(0);
    fixture.detectChanges();
    expect(messages().filter(m => m.includes(NON_POSITIVE)).length).toBe(1);
    const body = fixture.nativeElement.querySelector('#a .ant-progress-body') as HTMLElement;
    expect(body.style.width).toBe('132px');
    const strokeWidth = Number(body.querySelector('path')!.getAttribute('stroke-width'));
    expect(Number.isFinite(strokeWidth)).toBe(true);
    expect(body.querySelector('path')!.getAttribute('d')).not.toContain('NaN');
  });
});
