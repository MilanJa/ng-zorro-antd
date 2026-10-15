/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { NzSizeDSType } from 'ng-zorro-antd/core/types';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { NzCardModule } from './card.module';
import { NzCardTabItem, NzCardTabProps } from './typings';

const ITEMS: NzCardTabItem[] = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta', icon: 'apple' },
  { key: 'c', label: 'Gamma' },
  { key: 'd', label: 'Delta', disabled: true }
];

@Component({
  imports: [NzCardModule],
  template: `
    <nz-card
      [nzTitle]="title()"
      [nzSize]="size()"
      [nzTabList]="tabList()"
      [nzActiveTabKey]="activeKey()"
      [nzDefaultActiveTabKey]="defaultKey()"
      [nzTabBarExtraContent]="extra()"
      [nzTabProps]="tabProps()"
      (nzActiveTabKeyChange)="keyChange($event)"
      (nzTabChange)="tabChange($event)"
    >
      body
    </nz-card>
    <ng-template #labelTpl><b class="tpl-label">Templated</b></ng-template>
    <ng-template #extraTpl><a class="tpl-extra">More</a></ng-template>
  `
})
class TestCardTabListComponent {
  readonly labelTpl = viewChild.required<TemplateRef<void>>('labelTpl');
  readonly extraTpl = viewChild.required<TemplateRef<void>>('extraTpl');
  readonly title = signal<string | undefined>('Card title');
  readonly size = signal<NzSizeDSType>('default');
  readonly tabList = signal<NzCardTabItem[] | null>(ITEMS);
  readonly activeKey = signal<string | null | undefined>(undefined);
  readonly defaultKey = signal<string | null | undefined>(undefined);
  readonly extra = signal<string | TemplateRef<void> | null>(null);
  readonly tabProps = signal<NzCardTabProps | null>(null);
  readonly keyChange = vi.fn();
  readonly tabChange = vi.fn();
}

@Component({
  imports: [NzCardModule],
  template: ` <nz-card [nzTabList]="items" [(nzActiveTabKey)]="key" (nzTabChange)="tabChange($event)">body</nz-card> `
})
class TestCardTwoWayComponent {
  readonly items = ITEMS;
  key = 'b';
  readonly tabChange = vi.fn();
}

@Component({
  imports: [NzCardModule, NzTabsModule],
  template: `
    <nz-card nzTitle="Card title">
      <nz-card-tab>
        <nz-tabs nzSize="large" [(nzSelectedIndex)]="index">
          <nz-tab nzTitle="tab1" />
          <nz-tab nzTitle="tab2" />
        </nz-tabs>
      </nz-card-tab>
      content
    </nz-card>
    <nz-card id="plain" nzTitle="Plain">content</nz-card>
  `
})
class TestCardProjectedTabComponent {
  index = 0;
}

const cardOf = (fixture: ComponentFixture<unknown>): HTMLElement =>
  (fixture.nativeElement as HTMLElement).querySelector('nz-card')!;
const headTabsOf = (fixture: ComponentFixture<unknown>): HTMLElement | null =>
  cardOf(fixture).querySelector(':scope > .ant-card-head > nz-tabs');
const tabsOf = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from(cardOf(fixture).querySelectorAll<HTMLElement>('.ant-card-head-tabs .ant-tabs-tab'));
const activeLabelOf = (fixture: ComponentFixture<unknown>): string | null =>
  cardOf(fixture).querySelector('.ant-card-head-tabs .ant-tabs-tab-active')?.textContent?.trim() ?? null;
const sortedClasses = (el: Element): string[] => [...el.classList].sort();
const headChildrenOf = (card: HTMLElement): string[] =>
  Array.from(card.querySelector(':scope > .ant-card-head')!.children).map(c =>
    [c.tagName.toLowerCase(), ...sortedClasses(c)].join('.')
  );

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  for (let i = 0; i < 3; i++) {
    fixture.detectChanges();
    await fixture.whenStable();
  }
  fixture.detectChanges();
}

describe('nz-card nzTabList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation(), provideNzIconsTesting()] });
  });

  it('renders nz-tabs.ant-card-head-tabs after the head wrapper, one tab per item', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    await settle(fixture);
    const card = cardOf(fixture);
    expect(headChildrenOf(card)).toEqual([
      'div.ant-card-head-wrapper',
      'nz-tabs.ant-card-head-tabs.ant-tabs.ant-tabs-large.ant-tabs-top'
    ]);
    expect(tabsOf(fixture).map(t => t.textContent!.trim())).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta']);
    expect(card.classList).toContain('ant-card-contain-tabs');
    expect(activeLabelOf(fixture)).toBe('Alpha');
    expect(tabsOf(fixture)[1].querySelector('.ant-tabs-tab-icon nz-icon')).not.toBeNull();
    expect(tabsOf(fixture)[3].classList).toContain('ant-tabs-tab-disabled');
  });

  it('renders the head for tabs alone, and a template label', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    fixture.componentInstance.title.set(undefined);
    await settle(fixture);
    fixture.componentInstance.tabList.set([{ key: 't', label: fixture.componentInstance.labelTpl() }]);
    await settle(fixture);
    expect(headChildrenOf(cardOf(fixture))).toEqual([
      'div.ant-card-head-wrapper',
      'nz-tabs.ant-card-head-tabs.ant-tabs.ant-tabs-large.ant-tabs-top'
    ]);
    expect(tabsOf(fixture)[0].querySelector('.tpl-label')!.textContent).toBe('Templated');
  });

  it('renders nz-tabs for an empty list without ant-card-contain-tabs, as antd does', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    fixture.componentInstance.tabList.set([]);
    await settle(fixture);
    expect(headTabsOf(fixture)).not.toBeNull();
    expect(tabsOf(fixture)).toEqual([]);
    expect(cardOf(fixture).classList).not.toContain('ant-card-contain-tabs');
  });

  it('renders no head without title, extra or tabs', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    fixture.componentInstance.title.set(undefined);
    fixture.componentInstance.tabList.set(null);
    await settle(fixture);
    expect(cardOf(fixture).querySelector('.ant-card-head')).toBeNull();
    expect(cardOf(fixture).classList).not.toContain('ant-card-contain-tabs');
  });

  it('uncontrolled: starts at nzDefaultActiveTabKey and emits the picked key once', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    host.defaultKey.set('c');
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Gamma');

    tabsOf(fixture)[0].click();
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Alpha');
    expect(host.keyChange.mock.calls).toEqual([['a']]);
    expect(host.tabChange.mock.calls).toEqual([['a']]);

    tabsOf(fixture)[0].click();
    tabsOf(fixture)[3].click();
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Alpha');
    expect(host.tabChange).toHaveBeenCalledTimes(1);
    expect(host.keyChange).toHaveBeenCalledTimes(1);
  });

  it('uncontrolled: an nzDefaultActiveTabKey that matches no item falls back to the first item', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    fixture.componentInstance.defaultKey.set('zzz');
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Alpha');
    expect(cardOf(fixture).querySelector('.ant-card-head-tabs [aria-selected="true"]')!.textContent!.trim()).toBe(
      'Alpha'
    );
    expect(fixture.componentInstance.tabChange).not.toHaveBeenCalled();
  });

  it('controlled: a programmatic key change moves the tab without emitting', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('b');
    host.defaultKey.set('c');
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Beta');

    host.activeKey.set('c');
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Gamma');
    host.activeKey.set('a');
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Alpha');
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(host.tabChange).not.toHaveBeenCalled();
  });

  it('controlled: a bound key the parent does not update takes the tab back, emitting once', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('b');
    await settle(fixture);

    tabsOf(fixture)[2].click();
    await settle(fixture);
    await settle(fixture);
    expect(host.keyChange.mock.calls).toEqual([['c']]);
    expect(host.tabChange.mock.calls).toEqual([['c']]);
    expect(activeLabelOf(fixture)).toBe('Beta');
  });

  it('two-way [(nzActiveTabKey)] follows the user pick', async () => {
    const fixture = TestBed.createComponent(TestCardTwoWayComponent);
    await settle(fixture);
    expect(activeLabelOf(fixture)).toBe('Beta');

    tabsOf(fixture)[2].click();
    await settle(fixture);
    await settle(fixture);
    expect(fixture.componentInstance.key).toBe('c');
    expect(activeLabelOf(fixture)).toBe('Gamma');
    expect(fixture.componentInstance.tabChange.mock.calls).toEqual([['c']]);
  });

  it('a bound nzActiveTabKey that matches no item selects no tab and emits nothing', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    host.activeKey.set('zzz');
    await expect(settle(fixture)).resolves.toBeUndefined();
    const headTabs = headTabsOf(fixture)!;
    expect(cardOf(fixture).querySelector('.ant-tabs-tab-active')).toBeNull();
    expect(headTabs.querySelector('[aria-selected="true"]')).toBeNull();
    expect((headTabs.querySelector('[nz-tabs-ink-bar]') as HTMLElement).hidden).toBe(true);
    expect(host.keyChange).not.toHaveBeenCalled();
    expect(host.tabChange).not.toHaveBeenCalled();

    // with no tab active, clicking the first tab is a pick
    tabsOf(fixture)[0].click();
    await settle(fixture);
    expect(host.tabChange.mock.calls).toEqual([['a']]);

    tabsOf(fixture)[2].click();
    await settle(fixture);
    await settle(fixture);
    expect(host.tabChange.mock.calls).toEqual([['a'], ['c']]);
    expect(host.keyChange.mock.calls).toEqual([['a'], ['c']]);
    expect(headTabs.querySelector('[aria-selected="true"]')).toBeNull();
    expect(cardOf(fixture).querySelector('.ant-tabs-tab-active')).toBeNull();
  });

  it('derives the head tab size from nzSize, and nzTabProps.nzSize overrides it', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-large');

    host.size.set('small');
    await settle(fixture);
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-small');
    expect(headTabsOf(fixture)!.classList).not.toContain('ant-tabs-large');

    host.tabProps.set({ nzSize: 'default' });
    await settle(fixture);
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-default');
    expect(headTabsOf(fixture)!.classList).not.toContain('ant-tabs-small');

    host.size.set('default');
    host.tabProps.set({ nzSize: 'small' });
    await settle(fixture);
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-small');
    expect(headTabsOf(fixture)!.classList).not.toContain('ant-tabs-large');
  });

  it('forwards nzTabProps nzType and nzCentered', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    fixture.componentInstance.tabProps.set({ nzType: 'card', nzCentered: true });
    await settle(fixture);
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-card');
    expect(headTabsOf(fixture)!.classList).toContain('ant-tabs-centered');
  });

  it('renders nzTabBarExtraContent as a string or a template', async () => {
    const fixture = TestBed.createComponent(TestCardTabListComponent);
    const host = fixture.componentInstance;
    await settle(fixture);
    expect(headTabsOf(fixture)!.querySelector('.ant-tabs-extra-content')).toBeNull();

    host.extra.set('Extra text');
    await settle(fixture);
    expect(headTabsOf(fixture)!.querySelector('.ant-tabs-extra-content')!.textContent!.trim()).toBe('Extra text');

    host.extra.set(host.extraTpl());
    await settle(fixture);
    expect(headTabsOf(fixture)!.querySelector('.ant-tabs-extra-content .tpl-extra')!.textContent).toBe('More');
  });

  it('leaves a projected nz-card-tab and a plain card exactly as before', async () => {
    const fixture = TestBed.createComponent(TestCardProjectedTabComponent);
    await settle(fixture);
    const projected = cardOf(fixture);
    expect(sortedClasses(projected)).toEqual(['ant-card', 'ant-card-bordered', 'ant-card-contain-tabs']);
    expect(headChildrenOf(projected)).toEqual([
      'div.ant-card-head-wrapper',
      'nz-tabs.ant-tabs.ant-tabs-large.ant-tabs-top'
    ]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.ant-card-head-tabs')).toBeNull();

    const plain = (fixture.nativeElement as HTMLElement).querySelector('#plain') as HTMLElement;
    expect(sortedClasses(plain)).toEqual(['ant-card', 'ant-card-bordered']);
    expect(headChildrenOf(plain)).toEqual(['div.ant-card-head-wrapper']);
  });
});
