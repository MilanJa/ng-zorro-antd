/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { environment } from 'ng-zorro-antd/core/environments';

import { NzSplitterModule } from './splitter.module';
import { NzSplitterLayout } from './typings';

@Component({
  imports: [NzSplitterModule],
  template: `
    <nz-splitter [nzLayout]="layout()">
      <nz-splitter-panel>0</nz-splitter-panel>
      <nz-splitter-panel>1</nz-splitter-panel>
    </nz-splitter>
  `
})
class SplitterLayoutWarnComponent {
  readonly layout = signal<NzSplitterLayout | undefined>(undefined);
}

describe('splitter deprecation warnings', () => {
  let fixture: ComponentFixture<SplitterLayoutWarnComponent>;

  beforeEach(() => {
    environment.isTestMode = false;
    fixture = TestBed.createComponent(SplitterLayoutWarnComponent);
  });

  afterEach(() => {
    environment.isTestMode = false; // restore the browser runner's default
  });

  // this must stay the first (and only) test of the file: the global once-per-message dedup in
  // ng-zorro-antd/core/logger prevents a second `console.warn` call for the same deprecation message.
  it('warns once when the deprecated nzLayout is bound', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => void 0);
    try {
      fixture.componentInstance.layout.set('vertical');
      await fixture.whenStable();
      fixture.componentInstance.layout.set('horizontal');
      await fixture.whenStable();
      const message = '`nzLayout` on `nz-splitter` is deprecated, use `nzOrientation` instead.';
      expect(warn.mock.calls.filter(args => args.some(a => String(a).includes(message)))).toHaveLength(1);
    } finally {
      warn.mockRestore();
    }
  });
});
