/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzFloatButtonModule } from './float-button.module';

@Component({
  imports: [NzFloatButtonModule],
  template: `
    @if (which() === 'button') {
      <nz-float-button nzShape="square" [nzDescription]="description()" />
    }
    @if (which() === 'top') {
      <nz-float-button-top [nzVisibilityHeight]="-1" nzShape="square" [nzDescription]="null" />
    }
    @if (which() === 'group') {
      <nz-float-button-group nzShape="square" [nzDescription]="description()"
        ><nz-float-button
      /></nz-float-button-group>
    }
  `
})
class TestFloatButtonWarnComponent {
  readonly which = signal<'button' | 'top' | 'group'>('button');
  readonly description = signal<string | null>(null);
}

describe('float-button deprecation warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const msg = (selector: string): string =>
    `\`nzDescription\` on \`${selector}\` is deprecated, use \`nzContent\` instead.`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), provideNzNoAnimation()] });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('does not warn for a null nzDescription (the default)', async () => {
    const fixture = TestBed.createComponent(TestFloatButtonWarnComponent);
    fixture.detectChanges();
    fixture.componentInstance.which.set('top');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(messages().filter(m => m.includes('`nzDescription`'))).toEqual([]);
  });

  it('warns once for nz-float-button', async () => {
    const fixture = TestBed.createComponent(TestFloatButtonWarnComponent);
    fixture.componentInstance.description.set('A');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.description.set('B');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(messages().filter(m => m.includes(msg('nz-float-button'))).length).toBe(1);
  });

  it('warns once for nz-float-button-group and not for its inner trigger', async () => {
    const fixture = TestBed.createComponent(TestFloatButtonWarnComponent);
    fixture.componentInstance.which.set('group');
    fixture.componentInstance.description.set('A');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(messages().filter(m => m.includes(msg('nz-float-button-group'))).length).toBe(1);
  });
});

@Component({
  imports: [NzFloatButtonModule],
  template: `<nz-float-button-top [nzVisibilityHeight]="-1" nzShape="square" [nzDescription]="tpl" /><ng-template #tpl
      >T</ng-template
    >`
})
class TestFloatButtonTopWarnComponent {}

describe('float-button-top deprecation warning', () => {
  it('warns once for nz-float-button-top and not for its inner button', async () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), provideNzNoAnimation()] });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const fixture = TestBed.createComponent(TestFloatButtonTopWarnComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const all = warnSpy.mock.calls.map(args => args.map(String).join(' '));
      expect(all.filter(m => m.includes('`nzDescription` on `nz-float-button-top`')).length).toBe(1);
      expect(all.filter(m => m.includes('`nzDescription` on `nz-float-button` '))).toEqual([]);
    } finally {
      warnSpy.mockRestore();
    }
  });
});
