/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet, Routes } from '@angular/router';

import { MockInstance, vi } from 'vitest';

import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzDropdownDirective, NzDropdownMenuComponent, NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzBreadCrumbModule } from './breadcrumb.module';
import { NzBreadcrumbItem } from './typings';

@Component({
  imports: [NzBreadCrumbModule, NzDropdownModule],
  template: `
    <nz-breadcrumb
      id="data"
      [nzItems]="items()"
      [nzParams]="params()"
      [nzSeparator]="separator()"
      [nzDropdownIcon]="dropdownIcon()"
      (nzItemClick)="clicked($event)"
    />
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>x</li>
      </ul>
    </nz-dropdown-menu>
  `
})
class TestDataBreadcrumbComponent {
  readonly items = signal<NzBreadcrumbItem[] | null>([]);
  readonly params = signal<Record<string, string | number> | null>(null);
  readonly separator = signal<string | null>('/');
  readonly dropdownIcon = signal<string | TemplateRef<void> | undefined>(undefined);
  readonly menu = viewChild.required<NzDropdownMenuComponent>('menu');
  readonly clicked = vi.fn();
}

@Component({
  imports: [NzBreadCrumbModule, NgTemplateOutlet],
  template: `
    <nz-breadcrumb id="render" [nzItems]="items" [nzParams]="params" [nzItemRender]="render" />
    <ng-template #render let-defaultContent let-item="item" let-params="params" let-items="items" let-paths="paths">
      <b class="custom">{{ item.title }}|{{ paths.join(',') }}|{{ items.length }}|{{ params.id }}</b>
      <ng-container [ngTemplateOutlet]="defaultContent" />
    </ng-template>
  `
})
class TestItemRenderComponent {
  readonly items: NzBreadcrumbItem[] = [
    { title: 'Users', path: 'users' },
    { title: ':id', path: ':id' }
  ];
  readonly params = { id: 3 };
}

@Component({
  imports: [NzBreadCrumbModule, NzDropdownModule],
  template: `
    <nz-breadcrumb id="projected" [nzDropdownIcon]="parentIcon()">
      <nz-breadcrumb-item id="plain">Home</nz-breadcrumb-item>
      <nz-breadcrumb-item id="inherit" [nzOverlay]="menu">A</nz-breadcrumb-item>
      <nz-breadcrumb-item id="own" [nzOverlay]="menu" [nzDropdownIcon]="ownIcon()">B</nz-breadcrumb-item>
      <nz-breadcrumb-item id="tpl" [nzOverlay]="menu" [nzDropdownIcon]="iconTpl">C</nz-breadcrumb-item>
    </nz-breadcrumb>
    <ng-template #iconTpl><span class="custom-icon">v</span></ng-template>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>x</li>
      </ul>
    </nz-dropdown-menu>
  `
})
class TestProjectedDropdownIconComponent {
  readonly parentIcon = signal<string | undefined>(undefined);
  readonly ownIcon = signal<string | undefined>('up');
}

@Component({ template: 'page' })
class TestRoutedPageComponent {}

const ROUTES: Routes = [{ path: 'one', component: TestRoutedPageComponent, data: { breadcrumb: 'Router One' } }];

@Component({
  imports: [RouterOutlet, NzBreadCrumbModule],
  template: `
    <nz-breadcrumb id="mixed" nzAutoGenerate [nzItems]="items()" />
    <router-outlet />
  `
})
class TestItemsWithAutoGenerateComponent {
  readonly items = signal<NzBreadcrumbItem[] | null>([{ title: 'Data A' }, { title: 'Data B' }]);
}

async function stabilize(fixture: ComponentFixture<NzSafeAny>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

const hostOf = (fixture: ComponentFixture<unknown>, id: string): HTMLElement =>
  (fixture.nativeElement as HTMLElement).querySelector(`#${id}`) as HTMLElement;
const childTags = (host: HTMLElement): string[] => [...host.children].map(c => c.tagName.toLowerCase());
const crumbs = (host: HTMLElement): HTMLElement[] => [
  ...host.querySelectorAll<HTMLElement>(':scope > nz-breadcrumb-item')
];
const linkTexts = (host: HTMLElement): string[] =>
  crumbs(host).map(item => item.querySelector('.ant-breadcrumb-link')!.textContent!.trim());
const hrefs = (host: HTMLElement): Array<string | null> =>
  crumbs(host).map(item => item.querySelector('.ant-breadcrumb-link > a')?.getAttribute('href') ?? null);

/** Records whether the click reached the document already prevented, then prevents it so no hash navigation runs. */
function clickAndRecordPrevented(target: HTMLElement): boolean {
  let prevented: boolean | null = null;
  const record = (event: Event): void => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', record);
  try {
    target.click();
  } finally {
    document.removeEventListener('click', record);
  }
  return prevented!;
}

describe('breadcrumb nzItems', () => {
  let fixture: ComponentFixture<TestDataBreadcrumbComponent>;
  let host: HTMLElement;

  function create(): void {
    fixture = TestBed.createComponent(TestDataBreadcrumbComponent);
    fixture.detectChanges();
    host = hostOf(fixture, 'data');
  }
  function setItems(items: NzBreadcrumbItem[] | null): void {
    fixture.componentInstance.items.set(items);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  it('renders each entry as a direct nz-breadcrumb-item child with the router-crumb link shape', () => {
    create();
    setItems([{ title: 'Home' }, { title: 'Apps', href: '/apps' }, { title: 'App', path: 'app' }]);
    expect(childTags(host)).toEqual(['nz-breadcrumb-item', 'nz-breadcrumb-item', 'nz-breadcrumb-item']);
    expect(linkTexts(host)).toEqual(['Home', 'Apps', 'App']);
    expect(hrefs(host)).toEqual([null, '/apps', '#/app']);
    for (const item of crumbs(host)) {
      expect(item.className).toBe('ant-breadcrumb-item');
      expect(item.firstElementChild!.className).toBe('ant-breadcrumb-link');
      expect(item.children[1].tagName.toLowerCase()).toBe('nz-breadcrumb-separator');
      expect(item.children[1].textContent!.trim()).toBe('/');
    }
  });

  it('joins each path with the earlier ones and substitutes :params in paths and titles', () => {
    create();
    fixture.componentInstance.params.set({ id: 7, org: 'ant' });
    setItems([
      { title: 'Users', path: '/users' },
      { title: ':id', path: ':id' },
      { title: 'Edit :id of :org', path: 'edit' }
    ]);
    expect(hrefs(host)).toEqual(['#/users', '#/users/7', '#/users/7/edit']);
    expect(linkTexts(host)).toEqual(['Users', '7', 'Edit 7 of ant']);

    fixture.componentInstance.params.set({ id: 8 });
    fixture.detectChanges();
    expect(hrefs(host)).toEqual(['#/users', '#/users/8', '#/users/8/edit']);
    expect(linkTexts(host)).toEqual(['Users', '8', 'Edit 8 of :org']);
  });

  it('lets a literal href win over path, and renders separator entries as direct nz-breadcrumb-separator children', () => {
    create();
    setItems([
      { title: 'A', path: 'a' },
      { type: 'separator', separator: ':' },
      { title: 'B', href: '/b', path: 'b' },
      { type: 'separator' },
      { title: 'C', path: 'c' }
    ]);
    expect(childTags(host)).toEqual([
      'nz-breadcrumb-item',
      'nz-breadcrumb-separator',
      'nz-breadcrumb-item',
      'nz-breadcrumb-separator',
      'nz-breadcrumb-item'
    ]);
    expect(hrefs(host)).toEqual(['#/a', '/b', '#/a/b/c']);
    const standalone = (): string[] =>
      [...host.querySelectorAll(':scope > nz-breadcrumb-separator')].map(s => s.textContent!.trim());
    expect(standalone()).toEqual([':', '/']);
    expect(host.querySelector(':scope > nz-breadcrumb-separator')!.className).toBe('ant-breadcrumb-separator');

    fixture.componentInstance.separator.set(null);
    fixture.detectChanges();
    expect(standalone()).toEqual([':', '/']);
    expect(host.querySelectorAll('nz-breadcrumb-item nz-breadcrumb-separator').length).toBe(0);

    fixture.componentInstance.separator.set('>');
    fixture.detectChanges();
    expect(standalone()).toEqual([':', '>']);
  });

  it('without a configured router keeps the #/ href, does not prevent the click and does not throw', () => {
    create();
    setItems([
      { title: 'A', path: 'a' },
      { title: 'B', path: 'b' }
    ]);
    const anchor = crumbs(host)[1].querySelector('a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('#/a/b');
    let prevented = true;
    expect(() => (prevented = clickAndRecordPrevented(anchor))).not.toThrow();
    expect(prevented).toBe(false);
    expect(fixture.componentInstance.clicked).toHaveBeenCalledTimes(1);
  });

  it('with the router configured navigates a path crumb through Router.navigateByUrl and prevents the default', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    create();
    setItems([
      { title: 'A', path: 'a' },
      { title: 'B', path: 'b' },
      { title: 'C', href: '/c' }
    ]);
    expect(clickAndRecordPrevented(crumbs(host)[1].querySelector('a')!)).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/a/b');

    expect(clickAndRecordPrevented(crumbs(host)[2].querySelector('a')!)).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('calls the entry onClick, then emits nzItemClick; a click outside the crumb link does nothing', () => {
    create();
    const onClick = vi.fn();
    const items: NzBreadcrumbItem[] = [{ title: 'Plain', onClick }, { title: 'Last' }];
    setItems(items);
    const [first] = crumbs(host);
    (first.querySelector('.ant-breadcrumb-link') as HTMLElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    expect(fixture.componentInstance.clicked).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.clicked).toHaveBeenCalledWith({ item: items[0], event: onClick.mock.calls[0][0] });
    expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(
      fixture.componentInstance.clicked.mock.invocationCallOrder[0]
    );

    (first.querySelector('nz-breadcrumb-separator') as HTMLElement).click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.clicked).toHaveBeenCalledTimes(1);
  });

  it('opens an entry menu through nz-breadcrumb-item with the dropdownProps placement and trigger and the parent icon', () => {
    create();
    const menu = fixture.componentInstance.menu();
    setItems([
      { title: 'Menu', menu, dropdownProps: { nzPlacement: 'bottomCenter', nzTrigger: 'click' } },
      { title: 'Plain menu', menu },
      { title: 'No menu' }
    ]);
    const dropdownOf = (index: number): NzDropdownDirective => {
      const item = fixture.debugElement.queryAll(By.css('#data > nz-breadcrumb-item'))[index];
      return item.query(By.css('.ant-breadcrumb-overlay-link')).injector.get(NzDropdownDirective);
    };
    expect(dropdownOf(0).nzPlacement).toBe('bottomCenter');
    expect(dropdownOf(0).nzTrigger).toBe('click');
    expect(dropdownOf(1).nzPlacement).toBe('bottomLeft');
    expect(dropdownOf(1).nzTrigger).toBe('hover');
    expect(crumbs(host)[2].querySelector('.ant-breadcrumb-overlay-link')).toBeNull();

    const iconClass = (index: number): string =>
      crumbs(host)[index].querySelector('.ant-breadcrumb-overlay-link > nz-icon')!.className;
    expect(iconClass(0)).toBe('anticon anticon-down');
    fixture.componentInstance.dropdownIcon.set('caret-down');
    fixture.detectChanges();
    expect(iconClass(0)).toBe('anticon anticon-caret-down');
    fixture.componentInstance.dropdownIcon.set(undefined);
    fixture.detectChanges();
    expect(iconClass(1)).toBe('anticon anticon-down');
  });

  it('applies className and style to the nz-breadcrumb-item, and leaves an entry without them bare', () => {
    create();
    setItems([{ title: 'A', className: 'crumb-a', style: { color: 'red' } }, { title: 'B' }]);
    const [a, b] = crumbs(host);
    expect([...a.classList].sort()).toEqual(['ant-breadcrumb-item', 'crumb-a']);
    expect(a.style.color).toBe('red');
    expect(b.className).toBe('ant-breadcrumb-item');
    expect(b.style.cssText).toBe('');
  });

  it('renders nothing extra while nzItems is null or empty', () => {
    create();
    expect(host.className).toBe('ant-breadcrumb');
    expect(host.children.length).toBe(0);
    setItems(null);
    expect(host.children.length).toBe(0);
  });
});

describe('breadcrumb nzItemRender', () => {
  it('replaces the crumb content and passes the default content, item, params, items and paths', () => {
    const fixture = TestBed.createComponent(TestItemRenderComponent);
    fixture.detectChanges();
    const items = crumbs(hostOf(fixture, 'render'));
    expect(items.length).toBe(2);
    const link = items[1].querySelector('.ant-breadcrumb-link') as HTMLElement;
    expect(link.querySelector('b.custom')!.textContent).toBe(':id|users,3|2|3');
    const anchor = link.querySelector('b.custom + a') as HTMLAnchorElement;
    expect(anchor.getAttribute('href')).toBe('#/users/3');
    expect(anchor.textContent!.trim()).toBe('3');
    expect(items[0].querySelector('b.custom')!.textContent).toBe('Users|users|2|3');
  });
});

describe('breadcrumb item nzDropdownIcon', () => {
  let fixture: ComponentFixture<TestProjectedDropdownIconComponent>;
  const iconClass = (id: string): string | undefined =>
    (fixture.nativeElement as HTMLElement).querySelector(`#${id} .ant-breadcrumb-overlay-link > nz-icon`)?.className;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestProjectedDropdownIconComponent);
    fixture.detectChanges();
  });

  it('keeps the projected DOM exact when nothing is bound (default down icon)', () => {
    const host = hostOf(fixture, 'projected');
    expect(host.className).toBe('ant-breadcrumb');
    expect(childTags(host)).toEqual([
      'nz-breadcrumb-item',
      'nz-breadcrumb-item',
      'nz-breadcrumb-item',
      'nz-breadcrumb-item'
    ]);
    const plain = hostOf(fixture, 'plain');
    expect(plain.className).toBe('ant-breadcrumb-item');
    expect(plain.style.cssText).toBe('');
    expect([...plain.children].map(c => `${c.tagName.toLowerCase()}.${c.className}`)).toEqual([
      'span.ant-breadcrumb-link',
      'nz-breadcrumb-separator.ant-breadcrumb-separator'
    ]);
    const overlayLink = host.querySelector('#inherit .ant-breadcrumb-overlay-link') as HTMLElement;
    expect([...overlayLink.children].map(c => `${c.tagName.toLowerCase()}.${c.className}`)).toEqual([
      'span.ant-breadcrumb-link',
      'nz-icon.anticon anticon-down'
    ]);
    expect(
      fixture.debugElement.query(By.css('#inherit .ant-breadcrumb-overlay-link')).injector.get(NzDropdownDirective)
        .nzTrigger
    ).toBe('hover');
  });

  it('inherits the parent nzDropdownIcon unless the item sets its own; undefined falls back', () => {
    expect(iconClass('inherit')).toBe('anticon anticon-down');
    expect(iconClass('own')).toBe('anticon anticon-up');

    fixture.componentInstance.parentIcon.set('caret-down');
    fixture.detectChanges();
    expect(iconClass('inherit')).toBe('anticon anticon-caret-down');
    expect(iconClass('own')).toBe('anticon anticon-up');

    fixture.componentInstance.ownIcon.set(undefined);
    fixture.detectChanges();
    expect(iconClass('own')).toBe('anticon anticon-caret-down');
  });

  it('renders a template icon in place of nz-icon', () => {
    const link = (fixture.nativeElement as HTMLElement).querySelector(
      '#tpl .ant-breadcrumb-overlay-link'
    ) as HTMLElement;
    expect(link.querySelector('nz-icon')).toBeNull();
    expect(link.querySelector('.ant-breadcrumb-link + .custom-icon')!.textContent).toBe('v');
  });
});

describe('breadcrumb nzItems with nzAutoGenerate', () => {
  const MIXED =
    '`nzItems` and `nzAutoGenerate` are both set on `nz-breadcrumb`; `nzItems` wins and the router crumbs are not rendered.';
  let warnSpy: MockInstance<typeof console.warn>;
  const warnings = (): string[] =>
    warnSpy.mock.calls.map(args => args.map(String).join(' ')).filter(message => message.includes(MIXED));

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => warnSpy.mockRestore());

  // The only test that prints this message: once printed, the logger never prints it again.
  it('renders the data items instead of the router crumbs and warns once', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(ROUTES)] });
    const fixture = TestBed.createComponent(TestItemsWithAutoGenerateComponent);
    const router = TestBed.inject(Router);
    router.initialNavigation();
    await router.navigateByUrl('/one');
    await stabilize(fixture);
    const host = hostOf(fixture, 'mixed');
    expect(linkTexts(host)).toEqual(['Data A', 'Data B']);

    fixture.componentInstance.items.set([{ title: 'Data C' }]);
    await stabilize(fixture);
    expect(linkTexts(host)).toEqual(['Data C']);
    expect(warnings().length).toBe(1);

    fixture.componentInstance.items.set(null);
    await stabilize(fixture);
    expect(linkTexts(host)).toEqual(['Router One']);
    expect(warnings().length).toBe(1);
  });
});
