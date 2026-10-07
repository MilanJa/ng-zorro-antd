/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzMenuModule } from './menu.module';

@Component({
  imports: [NzMenuModule, NzIconModule],
  template: `
    <ul nz-menu nzMode="inline">
      <li nz-menu-item id="first" nzIcon="user"><nz-icon nzType="mail" />First</li>
      <li nz-menu-item id="second" nzIcon="user"><nz-icon nzType="mail" />Second</li>
    </ul>
  `
})
class TestMenuDoubleIconComponent {}

describe('menu warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const DOUBLE_ICON = '`nz-menu-item` has `nzIcon` and a projected `<nz-icon>`; the projected icon is hidden.';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  // Every item of this file's host binds both `nzIcon` and a projected `<nz-icon>`; this must stay
  // the only test that creates it, since the logger dedups a message once per page, not per component.
  it('warns once when both nzIcon and a projected <nz-icon> are bound, even across several items', () => {
    TestBed.createComponent(TestMenuDoubleIconComponent).detectChanges();
    expect(messages().filter(m => m.includes(DOUBLE_ICON)).length).toBe(1);
  });
});
