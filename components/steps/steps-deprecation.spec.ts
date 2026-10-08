/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { environment } from 'ng-zorro-antd/core/environments';
import { updateNonSignalsInput } from 'ng-zorro-antd/core/testing';

import { NzStepComponent } from './step.component';
import { NzDirectionType, NzStepsComponent, NzStepsOrientation, NzStepsTitlePlacement } from './steps.component';
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

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps
      id="alias"
      nzDirection="vertical"
      nzLabelPlacement="vertical"
      [nzOrientation]="orientation()"
      [nzTitlePlacement]="titlePlacement()"
    >
      <nz-step nzTitle="x" nzDescription="old" [nzContent]="content()" />
    </nz-steps>
    <nz-steps id="bare" [nzOrientation]="orientation()" [nzTitlePlacement]="titlePlacement()">
      <nz-step nzTitle="y" [nzContent]="content()" />
    </nz-steps>
  `
})
export class NzTestStepsUnsetComponent {
  readonly orientation = signal<NzStepsOrientation | undefined>('horizontal');
  readonly titlePlacement = signal<NzStepsTitlePlacement | undefined>('horizontal');
  readonly content = signal<string | undefined>('new');
}

describe('steps: undefined on a new input means unset', () => {
  it('falls back to the deprecated input or the default and does not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const fixture = TestBed.createComponent(NzTestStepsUnsetComponent);
      await stabilize(fixture);
      const [alias, bare] = fixture.debugElement
        .queryAll(By.directive(NzStepsComponent))
        .map(d => d.componentInstance as NzStepsComponent);
      const [aliasStep, bareStep] = fixture.debugElement
        .queryAll(By.directive(NzStepComponent))
        .map(d => d.componentInstance as NzStepComponent);
      expect([alias.nzOrientation, alias.nzTitlePlacement, aliasStep.nzContent]).toEqual([
        'horizontal',
        'horizontal',
        'new'
      ]);
      warn.mockClear(); // the aliases warned on first binding; only the unset phase is asserted

      fixture.componentInstance.orientation.set(undefined);
      fixture.componentInstance.titlePlacement.set(undefined);
      fixture.componentInstance.content.set(undefined);
      await stabilize(fixture);

      expect([alias.nzOrientation, alias.nzTitlePlacement, aliasStep.nzContent]).toEqual([
        'vertical',
        'vertical',
        'old'
      ]);
      expect(fixture.nativeElement.querySelector('#alias').classList).toContain('ant-steps-vertical');
      expect([bare.nzOrientation, bare.nzTitlePlacement, bareStep.nzContent]).toEqual([
        'horizontal',
        'horizontal',
        undefined
      ]);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
