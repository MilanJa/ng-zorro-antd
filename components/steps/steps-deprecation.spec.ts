/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { environment } from 'ng-zorro-antd/core/environments';
import { updateNonSignalsInput } from 'ng-zorro-antd/core/testing';

import { NzDirectionType } from './steps.component';
import { NzStepsModule } from './steps.module';

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzDirection]="direction()" nzLabelPlacement="vertical" [nzProgressDot]="true">
      <nz-step nzTitle="x" nzDescription="d" /><nz-step nzTitle="y" nzDescription="d" />
    </nz-steps>
  `
})
export class NzTestStepsLegacyComponent {
  readonly direction = signal<NzDirectionType>('horizontal');
}

async function stabilize<T>(fixture: ComponentFixture<T>, ms?: number): Promise<void> {
  fixture.detectChanges();
  await updateNonSignalsInput(fixture, ms);
  fixture.detectChanges();
}

describe('steps deprecation warnings', () => {
  it('warns once per deprecated input', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    environment.isTestMode = false; // `warnDeprecation` is a no-op in test mode
    try {
      const legacy = TestBed.createComponent(NzTestStepsLegacyComponent);
      await stabilize(legacy);
      legacy.componentInstance.direction.set('vertical');
      await stabilize(legacy);
      const messages = warn.mock.calls.map(call => call.join(' '));
      for (const [oldName, cmp, newName] of [
        ['nzDirection', 'nz-steps', 'nzOrientation'],
        ['nzLabelPlacement', 'nz-steps', 'nzTitlePlacement'],
        ['nzProgressDot', 'nz-steps', 'nzType'],
        ['nzDescription', 'nz-step', 'nzContent']
      ]) {
        const text = `\`${oldName}\` on \`${cmp}\` is deprecated, use \`${newName}\` instead.`;
        expect(
          messages.filter(m => m.includes(text)),
          oldName
        ).toHaveLength(1);
      }
    } finally {
      environment.isTestMode = false; // the browser runner's default; never leave it true for the next spec
      warn.mockRestore();
    }
  });
});
