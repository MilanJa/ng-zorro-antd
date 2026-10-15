/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MockInstance, vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { sleep } from 'ng-zorro-antd/core/testing';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTabsModule } from './tabs.module';

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs id="by-index" [nzSelectedIndex]="1">
      <nz-tab nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzTitle="Beta">Pane Beta</nz-tab>
      <nz-tab nzTitle="Gamma">Pane Gamma</nz-tab>
    </nz-tabs>
    <nz-tabs id="by-key" [nzSelectedIndex]="index()" [nzActiveKey]="key()">
      <nz-tab nzKey="a" nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzKey="b" nzTitle="Beta">Pane Beta</nz-tab>
      <nz-tab nzKey="c" nzTitle="Gamma">Pane Gamma</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeyAndIndexComponent {
  readonly index = signal<number | null>(null);
  readonly key = signal<string | undefined>(undefined);
}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs nzLinkRouter nzActiveKey="b">
      <nz-tab nzKey="a" nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzKey="b" nzTitle="Beta">Pane Beta</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeyAndRouterComponent {}

const hostOf = (fixture: ComponentFixture<unknown>, id: string): HTMLElement =>
  (fixture.nativeElement as HTMLElement).querySelector(`nz-tabs#${id}`)!;
const activeLabel = (host: Element): string | null =>
  host.querySelector('.ant-tabs-tab-active')?.textContent?.trim() ?? null;
const normalizedInner = (host: HTMLElement): string => host.innerHTML.replace(/nz-tabs-\d+-tab-/g, 'nz-tabs-N-tab-');

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) {
    fixture.detectChanges();
    await fixture.whenStable();
  }
  fixture.detectChanges();
}

describe('tabs key warnings', () => {
  let warnSpy: MockInstance<typeof console.warn>;
  const messages = (): string[] => warnSpy.mock.calls.map(args => args.map(String).join(' '));
  const KEY_AND_INDEX = 'ignores `nzSelectedIndex` while both are bound';
  const KEY_AND_ROUTER = 'ignores `nzActiveKey`';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation(), provideNzIconsTesting()] });
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  // must stay the first test of the file: once printed, a message is never printed again
  it('does not warn for nzActiveKey or nzSelectedIndex alone', async () => {
    const fixture = TestBed.createComponent(TestTabsKeyAndIndexComponent);
    fixture.componentInstance.key.set('b');
    await settle(fixture);
    expect(activeLabel(hostOf(fixture, 'by-key'))).toBe('Beta');

    fixture.componentInstance.key.set(undefined);
    fixture.componentInstance.index.set(2);
    await settle(fixture);
    expect(activeLabel(hostOf(fixture, 'by-key'))).toBe('Gamma');
    expect(messages().filter(m => m.includes(KEY_AND_INDEX) || m.includes(KEY_AND_ROUTER))).toEqual([]);
  });

  it('lets a bound key win over a bound index with exactly one warning, rendering that tab as the index API does', async () => {
    const fixture = TestBed.createComponent(TestTabsKeyAndIndexComponent);
    const host = fixture.componentInstance;
    host.key.set('b');
    host.index.set(2);
    await settle(fixture);
    await sleep(50);
    await settle(fixture);
    const byKey = hostOf(fixture, 'by-key');
    const byIndex = hostOf(fixture, 'by-index');
    expect(activeLabel(byKey)).toBe('Beta');
    expect([...byKey.classList].sort()).toEqual([...byIndex.classList].sort());
    expect(normalizedInner(byKey)).toBe(normalizedInner(byIndex));

    host.index.set(0);
    await settle(fixture);
    expect(activeLabel(byKey)).toBe('Beta');
    host.key.set('c');
    await settle(fixture);
    expect(activeLabel(byKey)).toBe('Gamma');
    expect(messages().filter(m => m.includes(KEY_AND_INDEX)).length).toBe(1);
  });

  it('follows the router and ignores nzActiveKey with nzLinkRouter, with exactly one warning', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(TestTabsKeyAndRouterComponent);
    await settle(fixture);
    await sleep(10);
    await settle(fixture);
    expect(activeLabel(fixture.nativeElement as HTMLElement)).toBe('Alpha');
    await settle(fixture);
    expect(messages().filter(m => m.includes(KEY_AND_ROUTER)).length).toBe(1);
  });
});
