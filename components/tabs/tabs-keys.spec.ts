/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ENTER, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { dispatchFakeEvent, dispatchKeyboardEvent, sleep } from 'ng-zorro-antd/core/testing';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTabChangeEvent, NzTabsCanDeactivateFn, NzTabType } from './interfaces';
import { NzTabsComponent } from './tabs.component';
import { NzTabsModule } from './tabs.module';

interface KeyedTab {
  key: string;
  title: string;
  disabled?: boolean;
}

const TABS: KeyedTab[] = [
  { key: 'a', title: 'Alpha' },
  { key: 'b', title: 'Beta' },
  { key: 'c', title: 'Gamma' },
  { key: 'd', title: 'Delta', disabled: true }
];

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs
      [nzType]="type()"
      [nzActiveKey]="activeKey()"
      [nzDefaultActiveKey]="defaultKey()"
      [nzCanDeactivate]="canDeactivate()"
      (nzActiveKeyChange)="keyChange($event)"
      (nzSelectChange)="selectChange($event)"
      (nzSelectedIndexChange)="indexChange($event)"
      (nzClose)="close($event)"
    >
      @for (tab of tabs(); track tab.key) {
        <nz-tab nzClosable [nzKey]="tab.key" [nzTitle]="tab.title" [nzDisabled]="!!tab.disabled">
          Pane {{ tab.title }}
        </nz-tab>
      }
      <nz-tab nzClosable nzTitle="Keyless">Pane Keyless</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeysComponent {
  readonly tabs = signal<KeyedTab[]>(TABS);
  readonly type = signal<NzTabType>('line');
  readonly activeKey = signal<string | null | undefined>(undefined);
  readonly defaultKey = signal<string | null | undefined>(undefined);
  readonly canDeactivate = signal<NzTabsCanDeactivateFn | null>(null);
  readonly keyChange = vi.fn();
  readonly selectChange = vi.fn<(event: NzTabChangeEvent) => void>();
  readonly indexChange = vi.fn();
  readonly close = vi.fn();
}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs [(nzActiveKey)]="key">
      <nz-tab nzKey="a" nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzKey="b" nzTitle="Beta">Pane Beta</nz-tab>
      <nz-tab nzKey="c" nzTitle="Gamma">Pane Gamma</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeysTwoWayComponent {
  key = 'b';
}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs id="plain" [nzSelectedIndex]="1">
      <nz-tab nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzTitle="Beta">Pane Beta</nz-tab>
      <nz-tab nzTitle="Gamma">Pane Gamma</nz-tab>
    </nz-tabs>
    <nz-tabs id="keyed" [nzSelectedIndex]="1">
      <nz-tab nzKey="a" nzTitle="Alpha">Pane Alpha</nz-tab>
      <nz-tab nzKey="b" nzTitle="Beta">Pane Beta</nz-tab>
      <nz-tab nzKey="c" nzTitle="Gamma">Pane Gamma</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeysUnboundComponent {}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs
      [nzActiveKey]="key()"
      [nzSelectedIndex]="index()"
      (nzActiveKeyChange)="keyChange($event)"
      (nzSelectChange)="selectChange($event)"
      (nzSelectedIndexChange)="indexChange($event)"
    >
      @for (tab of tabs(); track tab) {
        <nz-tab [nzKey]="tab" [nzTitle]="tab" (nzSelect)="select(tab)" (nzDeselect)="deselect(tab)"
          >Pane {{ tab }}</nz-tab
        >
      }
    </nz-tabs>
  `
})
class TestTabsKeyAndIndexComponent {
  readonly tabs = signal<string[]>(['a', 'b', 'c']);
  readonly key = signal<string | null | undefined>(undefined);
  readonly index = signal<number | null>(null);
  readonly keyChange = vi.fn();
  readonly selectChange = vi.fn();
  readonly indexChange = vi.fn();
  readonly select = vi.fn();
  readonly deselect = vi.fn();
}

@Component({
  imports: [NzTabsModule],
  template: `
    <div style="width: 200px; height: 200px">
      <nz-tabs style="width: 200px; height: 200px" [nzActiveKey]="key()" (nzActiveKeyChange)="keyChange($event)">
        @for (tab of tabs; track tab) {
          <nz-tab [nzKey]="tab" [nzTitle]="'Title ' + tab">Pane {{ tab }}</nz-tab>
        }
      </nz-tabs>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    @import './style/testing.less';
  `
})
class TestTabsKeysOverflowComponent {
  readonly tabs = Array.from({ length: 30 }, (_, i) => `k${i}`);
  readonly key = signal<string | null>('k0');
  readonly keyChange = vi.fn();
}

@Component({
  imports: [NzTabsModule],
  template: `
    <nz-tabs [nzActiveKey]="key()" (nzActiveKeyChange)="keyChange($event)">
      <nz-tab nzKey="a" nzTitle="First">Pane First</nz-tab>
      <nz-tab nzKey="b" nzTitle="Second">Pane Second</nz-tab>
      <nz-tab nzKey="a" nzTitle="Duplicate">Pane Duplicate</nz-tab>
    </nz-tabs>
  `
})
class TestTabsKeysDuplicateComponent {
  readonly key = signal<string | null>('a');
  readonly keyChange = vi.fn();
}

const tabsHost = (fixture: ComponentFixture<unknown>, id?: string): HTMLElement =>
  (fixture.nativeElement as HTMLElement).querySelector(id ? `nz-tabs#${id}` : 'nz-tabs')!;
const tabEls = (host: HTMLElement): HTMLElement[] => Array.from(host.querySelectorAll<HTMLElement>('.ant-tabs-tab'));
const activeLabel = (host: HTMLElement): string | null =>
  host.querySelector('.ant-tabs-tab-active')?.textContent?.trim() ?? null;
const selectedLabels = (host: HTMLElement): string[] =>
  Array.from(host.querySelectorAll('[role="tab"][aria-selected="true"]')).map(el => el.textContent!.trim());
const activePane = (host: HTMLElement): string | null =>
  host.querySelector('.ant-tabs-tabpane-active')?.textContent?.trim() ?? null;
const inkBar = (host: HTMLElement): HTMLElement => host.querySelector('.ant-tabs-ink-bar') as HTMLElement;
const sortedClasses = (el: Element): string[] => [...el.classList].sort();
const normalizedInner = (host: HTMLElement): string => host.innerHTML.replace(/nz-tabs-\d+-tab-/g, 'nz-tabs-N-tab-');

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) {
    fixture.detectChanges();
    await fixture.whenStable();
  }
  fixture.detectChanges();
}

describe('nz-tabs string keys', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation(), provideNzIconsTesting()] });
  });

  it('selects the tab whose nzKey equals nzActiveKey; a programmatic key change does not emit nzActiveKeyChange', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('b');
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('Beta');
    expect(selectedLabels(el)).toEqual(['Beta']);
    expect(activePane(el)).toBe('Pane Beta');
    expect(host.selectChange).not.toHaveBeenCalled();

    host.activeKey.set('c');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Gamma');
    expect(activePane(el)).toBe('Pane Gamma');
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(host.selectChange.mock.lastCall![0]).toMatchObject({ index: 2, key: 'c' });
    expect(host.indexChange.mock.lastCall).toEqual([2]);
  });

  it('a bound nzActiveKey that matches no tab leaves nothing active, and a known key restores it', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('zzz');
    await expect(settle(fixture)).resolves.toBeUndefined();
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBeNull();
    expect(inkBar(el).hidden).toBe(true);
    expect(selectedLabels(el)).toEqual([]);
    expect(activePane(el)).toBeNull();

    // the held index is 0, so a known key on the same index must restore everything
    host.activeKey.set('a');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Alpha');
    expect(inkBar(el).hidden).toBe(false);
    expect(selectedLabels(el)).toEqual(['Alpha']);
    expect(activePane(el)).toBe('Pane Alpha');

    host.activeKey.set(null);
    await settle(fixture);
    expect(activeLabel(el)).toBeNull();
    expect(inkBar(el).hidden).toBe(true);
    expect(selectedLabels(el)).toEqual([]);
    expect(activePane(el)).toBeNull();

    host.activeKey.set('c');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Gamma');
    expect(inkBar(el).hidden).toBe(false);
    expect(selectedLabels(el)).toEqual(['Gamma']);
    expect(activePane(el)).toBe('Pane Gamma');
    expect(host.keyChange).not.toHaveBeenCalled();
  });

  it('is strictly controlled: a click emits the key, and the tab moves only when the key is written back', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('a');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[2].click();
    await settle(fixture);
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['c']]);
    expect(activeLabel(el)).toBe('Alpha');
    expect(selectedLabels(el)).toEqual(['Alpha']);
    expect(activePane(el)).toBe('Pane Alpha');
    expect(host.selectChange).not.toHaveBeenCalled();
    expect(host.indexChange).not.toHaveBeenCalled();

    host.activeKey.set('c');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Gamma');

    tabEls(el)[2].click();
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['c']]);
  });

  it('two-way [(nzActiveKey)] follows the user pick', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysTwoWayComponent);
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('Beta');

    tabEls(el)[2].click();
    await settle(fixture);
    await settle(fixture);
    expect(fixture.componentInstance.key).toBe('c');
    expect(activeLabel(el)).toBe('Gamma');
    expect(activePane(el)).toBe('Pane Gamma');
  });

  it('reports a keyboard pick while controlled without moving the tab', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('a');
    await settle(fixture);
    const el = tabsHost(fixture);
    const navWrap = el.querySelector('.ant-tabs-nav-wrap') as HTMLElement;
    const trigger = tabEls(el)[0];

    dispatchKeyboardEvent(navWrap, 'keydown', RIGHT_ARROW, trigger);
    fixture.detectChanges();
    dispatchKeyboardEvent(navWrap, 'keydown', ENTER, trigger);
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['b']]);
    expect(activeLabel(el)).toBe('Alpha');
  });

  it('treats a click on any enabled keyed tab as a pick while nothing is active, the held index included', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('zzz');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[0].click();
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['a']]);
    expect(activeLabel(el)).toBeNull();
  });

  it('never picks a disabled tab, but a key can make a disabled tab active', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('a');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[3].click();
    await settle(fixture);
    expect(host.keyChange).not.toHaveBeenCalled();

    host.activeKey.set('d');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Delta');
    expect(activePane(el)).toBe('Pane Delta');
  });

  it('does not report a click on a tab without nzKey while nzActiveKey is bound', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('a');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[4].click();
    await settle(fixture);
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(activeLabel(el)).toBe('Alpha');
  });

  it('uncontrolled: nzDefaultActiveKey seeds the first selection, and picks apply at once and emit their key', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    host.defaultKey.set('c');
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('Gamma');
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(host.selectChange).not.toHaveBeenCalled();

    tabEls(el)[0].click();
    await settle(fixture);
    expect(activeLabel(el)).toBe('Alpha');
    expect(host.keyChange.mock.calls).toEqual([['a']]);
    expect(host.indexChange.mock.lastCall).toEqual([0]);

    tabEls(el)[4].click();
    await settle(fixture);
    expect(activeLabel(el)).toBe('Keyless');
    expect(host.keyChange).toHaveBeenCalledTimes(1);
    expect(host.indexChange.mock.lastCall).toEqual([4]);

    host.defaultKey.set('b');
    await settle(fixture);
    expect(activeLabel(el)).toBe('Keyless');
  });

  it('uncontrolled: an nzDefaultActiveKey that matches no tab keeps the first tab', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    fixture.componentInstance.defaultKey.set('zzz');
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('Alpha');
    expect(inkBar(el).hidden).toBe(false);
    expect(selectedLabels(el)).toEqual(['Alpha']);
  });

  it('adds keys to nzSelectChange, nzClose and nzCanDeactivate', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    const guard = vi.fn<NzTabsCanDeactivateFn>(() => true);
    host.canDeactivate.set(guard);
    host.type.set('editable-card');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[1].click();
    await settle(fixture);
    expect(guard).toHaveBeenCalledWith(0, 1, { fromKey: 'a', toKey: 'b' });
    expect(host.selectChange.mock.lastCall![0]).toMatchObject({ index: 1, key: 'b' });

    // Delta is disabled and has no close button: Alpha, Beta, Gamma, Keyless
    const removes = Array.from(el.querySelectorAll<HTMLElement>('.ant-tabs-tab-remove'));
    expect(removes.length).toBe(4);
    removes[2].click();
    fixture.detectChanges();
    expect(host.close.mock.lastCall).toEqual([{ index: 2, key: 'c' }]);
    removes[3].click();
    fixture.detectChanges();
    const keyless = host.close.mock.lastCall![0];
    expect(Object.keys(keyless)).toEqual(['index']);
    expect(keyless.index).toBe(4);
  });

  it('leaves the key off the change event of a keyless tab', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    const els = tabEls(tabsHost(fixture));

    els[1].click();
    await settle(fixture);
    expect(Object.prototype.hasOwnProperty.call(host.selectChange.mock.lastCall![0], 'key')).toBe(true);

    els[els.length - 1].click();
    await settle(fixture);
    const keyless: NzTabChangeEvent = host.selectChange.mock.lastCall![0];
    expect(keyless.index).toBe(4);
    expect(Object.prototype.hasOwnProperty.call(keyless, 'key')).toBe(false);
  });

  it('runs nzCanDeactivate before a controlled pick is reported', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    const guard = vi.fn<NzTabsCanDeactivateFn>(() => false);
    host.canDeactivate.set(guard);
    host.activeKey.set('a');
    await settle(fixture);
    const el = tabsHost(fixture);

    tabEls(el)[1].click();
    await settle(fixture);
    expect(guard).toHaveBeenCalledWith(0, 1, { fromKey: 'a', toKey: 'b' });
    expect(host.keyChange).not.toHaveBeenCalled();

    host.activeKey.set('zzz');
    await settle(fixture);
    tabEls(el)[1].click();
    await settle(fixture);
    expect(guard).toHaveBeenLastCalledWith(0, 1, { fromKey: undefined, toKey: 'b' });
    expect(host.keyChange).not.toHaveBeenCalled();
  });

  it('keeps programmatic setSelectedIndex silent on nzActiveKeyChange, while a click still emits', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    const el = tabsHost(fixture);
    const tabs: NzTabsComponent = fixture.debugElement.query(By.directive(NzTabsComponent)).componentInstance;

    tabs.setSelectedIndex(1);
    await settle(fixture);
    expect(activeLabel(el)).toBe('Beta');
    expect(host.indexChange.mock.lastCall).toEqual([1]);
    expect(host.keyChange).not.toHaveBeenCalled();

    tabEls(el)[2].click();
    await settle(fixture);
    expect(activeLabel(el)).toBe('Gamma');
    expect(host.keyChange.mock.calls).toEqual([['c']]);
  });

  it('reports no selected index while nothing is active and ignores bound index changes', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const fixture = TestBed.createComponent(TestTabsKeyAndIndexComponent);
      const host = fixture.componentInstance;
      const tabs: NzTabsComponent = fixture.debugElement.query(By.directive(NzTabsComponent)).componentInstance;
      host.key.set('c');
      await settle(fixture);
      expect(tabs.nzSelectedIndex).toBe(2);

      host.key.set('zzz');
      await settle(fixture);
      expect(tabs.nzSelectedIndex).toBe(-1);
      const el = tabsHost(fixture);
      expect(activeLabel(el)).toBeNull();
      host.selectChange.mockClear();
      host.indexChange.mockClear();
      host.select.mockClear();
      host.deselect.mockClear();

      host.index.set(0);
      await settle(fixture);
      expect(tabs.nzSelectedIndex).toBe(-1);
      expect(activeLabel(el)).toBeNull();

      // a clamp after removing the held tab moves nothing visible and emits nothing
      host.tabs.set(['a', 'b']);
      await settle(fixture);
      expect(tabs.nzSelectedIndex).toBe(-1);
      expect(host.selectChange).not.toHaveBeenCalled();
      expect(host.indexChange).not.toHaveBeenCalled();
      expect(host.select).not.toHaveBeenCalled();
      expect(host.deselect).not.toHaveBeenCalled();

      host.key.set('b');
      await settle(fixture);
      expect(tabs.nzSelectedIndex).toBe(1);
      expect(activeLabel(el)).toBe('b');
      expect(host.keyChange).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it('restores the held tab when a known key returns after an unknown one', async () => {
    const fixture = TestBed.createComponent(TestTabsKeyAndIndexComponent);
    const host = fixture.componentInstance;
    host.key.set('b');
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('b');

    host.key.set('zzz');
    await settle(fixture);
    expect(activeLabel(el)).toBeNull();
    expect(selectedLabels(el)).toEqual([]);
    expect(inkBar(el).hidden).toBe(true);

    host.key.set('b');
    await settle(fixture);
    expect(activeLabel(el)).toBe('b');
    expect(selectedLabels(el)).toEqual(['b']);
    expect(inkBar(el).hidden).toBe(false);
    expect(activePane(el)).toBe('Pane b');
    expect(host.keyChange).not.toHaveBeenCalled();
  });

  it('keeps the bound key active when a keyed tab is added before it, and clears when it is removed', async () => {
    const fixture = TestBed.createComponent(TestTabsKeyAndIndexComponent);
    const host = fixture.componentInstance;
    host.key.set('b');
    await settle(fixture);
    const el = tabsHost(fixture);
    host.selectChange.mockClear();

    host.tabs.set(['z', 'a', 'b', 'c']);
    await settle(fixture);
    expect(activeLabel(el)).toBe('b');
    expect(selectedLabels(el)).toEqual(['b']);
    expect(activePane(el)).toBe('Pane b');

    host.tabs.set(['z', 'a', 'c']);
    await settle(fixture);
    expect(activeLabel(el)).toBeNull();
    expect(selectedLabels(el)).toEqual([]);
    expect(activePane(el)).toBeNull();
    expect(inkBar(el).hidden).toBe(true);
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(host.select).not.toHaveBeenCalled();
  });

  it('lets the first of duplicate keys win and does not report a click on a duplicate of the active key', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysDuplicateComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    const el = tabsHost(fixture);
    expect(activeLabel(el)).toBe('First');
    expect(selectedLabels(el)).toEqual(['First']);

    tabEls(el)[2].click();
    await settle(fixture);
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(activeLabel(el)).toBe('First');

    tabEls(el)[1].click();
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['b']]);
  });

  it('reports an overflow-menu pick once through nzActiveKeyChange', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysOverflowComponent);
    const host = fixture.componentInstance;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    await settle(fixture);
    await sleep(32);
    await settle(fixture);
    const el = tabsHost(fixture);

    dispatchFakeEvent(el.querySelector('nz-tab-nav-operation button')!, 'mouseenter');
    await sleep(200);
    await settle(fixture);
    const items = Array.from(overlay.querySelectorAll<HTMLElement>('.ant-tabs-dropdown-menu-item'));
    expect(items.length).toBeGreaterThan(0);
    const last = items[items.length - 1];
    expect(last.textContent!.trim()).toBe('Title k29');

    last.click();
    await sleep(32);
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['k29']]);
    expect(activeLabel(el)).toBe('Title k0');
  });

  it('renders keyed tabs exactly like index-only tabs while no key input is bound', async () => {
    const fixture = TestBed.createComponent(TestTabsKeysUnboundComponent);
    await settle(fixture);
    await sleep(50);
    await settle(fixture);
    const plain = tabsHost(fixture, 'plain');
    const keyed = tabsHost(fixture, 'keyed');

    for (const el of [plain, keyed]) {
      expect(tabEls(el).map(tab => tab.className)).toEqual([
        'ant-tabs-tab',
        'ant-tabs-tab ant-tabs-tab-active',
        'ant-tabs-tab'
      ]);
      expect(tabEls(el).map(tab => tab.style.cssText)).toEqual(['', '', '']);
      expect(Array.from(el.querySelectorAll('[role="tab"]')).map(tab => tab.getAttribute('aria-selected'))).toEqual([
        'false',
        'true',
        'false'
      ]);
      expect(inkBar(el).hidden).toBe(false);
    }
    expect(sortedClasses(keyed)).toEqual(sortedClasses(plain));
    expect(normalizedInner(keyed)).toBe(normalizedInner(plain));
  });
});
