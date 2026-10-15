/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockInstance, vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { NzCardModule } from './card.module';
import { NzCardTabItem } from './typings';

@Component({
  imports: [NzCardModule, NzTabsModule],
  template: `
    <nz-card nzTitle="Mixed" [nzTabList]="items()">
      <nz-card-tab>
        <nz-tabs id="projected"><nz-tab nzTitle="Projected" /></nz-tabs>
      </nz-card-tab>
      body
    </nz-card>
  `
})
class TestCardMixedTabsComponent {
  readonly items = signal<NzCardTabItem[] | null>(null);
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('card tab warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const MIXED = 'ignores the projected `nz-card-tab`';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation(), provideNzIconsTesting()] });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  it('does not warn for a projected nz-card-tab alone, which renders as before', async () => {
    const fixture = TestBed.createComponent(TestCardMixedTabsComponent);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#projected')).not.toBeNull();
    expect(root.querySelector('.ant-card-head-tabs')).toBeNull();
    expect(messages().filter(m => m.includes(MIXED))).toEqual([]);
  });

  // The only test that prints this message: the logger dedupes per app, so it must be the first in the file to print it.
  it('renders nzTabList once, ignores the projected nz-card-tab and warns exactly once', async () => {
    const fixture = TestBed.createComponent(TestCardMixedTabsComponent);
    fixture.componentInstance.items.set([
      { key: 'a', label: 'Data A' },
      { key: 'b', label: 'Data B' }
    ]);
    await settle(fixture);
    await settle(fixture);
    fixture.componentInstance.items.set([
      { key: 'a', label: 'Data A' },
      { key: 'b', label: 'Data B' }
    ]);
    await settle(fixture);

    const root = fixture.nativeElement as HTMLElement;
    const rendered = root.querySelectorAll('nz-tabs');
    expect(rendered.length).toBe(1);
    expect(rendered[0].classList).toContain('ant-card-head-tabs');
    expect(Array.from(rendered[0].querySelectorAll('.ant-tabs-tab')).map(t => t.textContent!.trim())).toEqual([
      'Data A',
      'Data B'
    ]);
    expect(root.querySelector('#projected')).toBeNull();
    expect(root.textContent).not.toContain('Projected');
    expect(messages().filter(m => m.includes(MIXED)).length).toBe(1);
  });
});
