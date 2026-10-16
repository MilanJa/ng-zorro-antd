/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzThemeDirective } from './theme.directive';
import { NzThemeService, NZ_THEME_STYLE_ID } from './theme.service';

@Component({
  imports: [NzThemeDirective],
  template: `<div [nzTheme]="{ cssVar: { prefix: 'scoped-prefix-token' } }"></div>`
})
class ScopedPrefixComponent {}

describe('cssVar.prefix warning', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    document.getElementById(NZ_THEME_STYLE_ID)?.remove();
  });

  // the first test of the file: a warning is printed once per message, so the quiet cases run before any
  // test that prints one for the same prefix
  it('stays quiet for the default prefix, written or not', async () => {
    const service = TestBed.inject(NzThemeService);
    await service.set({});
    await service.set({ cssVar: {} });
    await service.set({ cssVar: { prefix: 'ant' } });
    expect(messages().filter(m => m.includes('cssVar.prefix'))).toEqual([]);
  });

  it('warns once for a custom prefix passed to NzThemeService, however often it is set', async () => {
    const service = TestBed.inject(NzThemeService);
    await service.set({ cssVar: { prefix: 'service-prefix-token' } });
    await service.set({ cssVar: { prefix: 'service-prefix-token' } });
    const found = messages().filter(m => m.includes('cssVar.prefix') && m.includes('service-prefix-token'));
    expect(found.length).toBe(1);
    expect(found[0]).toContain('ant');
  });

  it('warns for a custom prefix on an [nzTheme] scope', async () => {
    TestBed.createComponent(ScopedPrefixComponent).detectChanges();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(messages().filter(m => m.includes('cssVar.prefix') && m.includes('scoped-prefix-token')).length).toBe(1);
  });
});
