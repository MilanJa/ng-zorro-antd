/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { vi } from 'vitest';

import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzBreadCrumbModule } from './breadcrumb.module';
import { NzBreadcrumbItem, NzBreadcrumbItemMenu, NzBreadcrumbItemOption } from './typings';

const COMPONENTS_MENU: NzBreadcrumbItemMenu = {
  items: [
    { key: 'general', title: 'General', path: 'general' },
    { key: 'layout', title: 'Layout', path: '/layout' },
    { key: 'site', title: 'Site', href: 'https://ng.ant.design/' },
    { key: 'plain', title: 'Plain' },
    { key: 'off', title: 'Off', path: 'off', disabled: true }
  ]
};

const MENU_CRUMBS: NzBreadcrumbItem[] = [
  { title: 'Home', path: 'home' },
  { title: 'Components', path: 'components', dropdownProps: { nzTrigger: 'click' }, menu: COMPONENTS_MENU },
  {
    title: 'Docs',
    href: '/docs',
    dropdownProps: { nzTrigger: 'click' },
    menu: { items: [{ key: 'intro', title: 'Intro', path: 'intro' }] }
  },
  { title: 'Bare', dropdownProps: { nzTrigger: 'click' }, menu: { items: [{ key: 'x', title: 'X', path: 'x' }] } }
];

@Component({
  imports: [NzBreadCrumbModule, NzDropdownModule],
  template: `
    <nz-breadcrumb
      id="data"
      [nzItems]="items()"
      (nzItemClick)="itemClick($event)"
      (nzMenuItemClick)="menuItemClick($event)"
    />
    <nz-breadcrumb id="projected">
      <nz-breadcrumb-item [nzOverlay]="menu" nzOverlayTrigger="click">Projected</nz-breadcrumb-item>
    </nz-breadcrumb>
    <nz-dropdown-menu #menu="nzDropdownMenu">
      <ul nz-menu>
        <li nz-menu-item>General</li>
      </ul>
    </nz-dropdown-menu>
  `
})
class TestBreadcrumbMenuComponent {
  readonly items = signal<NzBreadcrumbItem[] | null>(MENU_CRUMBS);
  readonly itemClick = vi.fn();
  readonly menuItemClick = vi.fn();
}

const childTags = (host: HTMLElement): string[] => [...host.children].map(c => c.tagName.toLowerCase());
const crumbsOf = (host: HTMLElement): HTMLElement[] => [
  ...host.querySelectorAll<HTMLElement>(':scope > nz-breadcrumb-item')
];
const overlayLinkOf = (crumb: HTMLElement): HTMLElement =>
  crumb.querySelector(':scope > .ant-breadcrumb-overlay-link') as HTMLElement;
const entriesOf = (menu: HTMLElement): HTMLElement[] => [...menu.querySelectorAll<HTMLElement>(':scope > li')];

/** Dispatches a click and records whether it reached the document already prevented, then prevents it. */
function clickAndRecordPrevented(target: HTMLElement, init: MouseEventInit = {}): boolean {
  let prevented: boolean | null = null;
  const record = (event: Event): void => {
    prevented = event.defaultPrevented;
    event.preventDefault();
  };
  document.addEventListener('click', record);
  try {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
  } finally {
    document.removeEventListener('click', record);
  }
  return prevented!;
}

describe('breadcrumb data menus', () => {
  let fixture: ComponentFixture<TestBreadcrumbMenuComponent>;
  let host: HTMLElement;

  function create(): void {
    fixture = TestBed.createComponent(TestBreadcrumbMenuComponent);
    fixture.detectChanges();
    host = (fixture.nativeElement as HTMLElement).querySelector('#data') as HTMLElement;
  }

  /** Opens the dropdown of `trigger` and returns the newest open menu. */
  async function openMenu(trigger: HTMLElement): Promise<HTMLElement> {
    // let a close triggered by an earlier entry click settle, or this click would toggle the menu shut
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();
    trigger.click();
    // the dropdown directive passes its open and close state through `auditTime(150)`
    await new Promise(resolve => setTimeout(resolve, 200));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const menus = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelectorAll<HTMLElement>('.ant-dropdown-menu');
    return menus[menus.length - 1];
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  afterEach(() => {
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders a data-menu crumb as an overlay crumb and leaves no menu element among the crumbs', () => {
    create();
    expect(childTags(host)).toEqual([
      'nz-breadcrumb-item',
      'nz-breadcrumb-item',
      'nz-breadcrumb-item',
      'nz-breadcrumb-item'
    ]);
    expect(host.querySelector('nz-dropdown-menu')).toBeNull();
    expect(overlayLinkOf(crumbsOf(host)[0])).toBeNull();
    const link = overlayLinkOf(crumbsOf(host)[1]);
    expect([...link.children].map(c => `${c.tagName.toLowerCase()}.${c.className}`)).toEqual([
      'span.ant-breadcrumb-link',
      'nz-icon.anticon anticon-down'
    ]);
    expect(link.querySelector('.ant-breadcrumb-link > a')!.getAttribute('href')).toBe('#/home/components');
  });

  it('renders the entries with the menu DOM a projected nz-dropdown-menu gives', async () => {
    create();
    const projected = await openMenu(overlayLinkOf(document.querySelector('#projected > nz-breadcrumb-item')!));
    const projectedMenuClass = projected.className;
    const projectedItemClass = entriesOf(projected)[0].className;

    const data = await openMenu(overlayLinkOf(crumbsOf(host)[1]));
    expect(data.className).toBe(projectedMenuClass);
    const entries = entriesOf(data);
    expect(entries.map(li => li.textContent!.trim())).toEqual(['General', 'Layout', 'Site', 'Plain', 'Off']);
    expect(entries[0].className).toBe(projectedItemClass);
    expect(entries[4].classList).toContain('ant-dropdown-menu-item-disabled');
  });

  it('links a path entry under the crumb link, lets an entry href win and leaves a bare entry as text', async () => {
    create();
    const hrefs = async (index: number): Promise<Array<string | null>> =>
      entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[index]))).map(
        li => li.querySelector('a')?.getAttribute('href') ?? null
      );
    expect(await hrefs(1)).toEqual([
      '#/home/components/general',
      '#/home/components/layout',
      'https://ng.ant.design/',
      null,
      '#/home/components/off'
    ]);
    expect(await hrefs(2)).toEqual(['/docs/intro']);
    expect(await hrefs(3)).toEqual(['#/x']);
  });

  it('emits nzMenuItemClick, not nzItemClick, and leaves the click alone without a router', async () => {
    create();
    const host$ = fixture.componentInstance;
    let entries = entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[1])));
    expect(clickAndRecordPrevented(entries[0].querySelector('a')!)).toBe(false);
    expect(host$.menuItemClick).toHaveBeenCalledTimes(1);
    const [payload] = host$.menuItemClick.mock.calls[0];
    expect(payload.item).toBe(MENU_CRUMBS[1] as NzBreadcrumbItemOption);
    expect(payload.menuItem).toBe(COMPONENTS_MENU.items[0]);
    expect(payload.event).toBeInstanceOf(MouseEvent);
    expect(host$.itemClick).not.toHaveBeenCalled();

    entries = entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[1])));
    // nz-menu-item prevents the default and stops the propagation of a disabled entry's click
    const disabledClick = new MouseEvent('click', { bubbles: true, cancelable: true });
    entries[4].dispatchEvent(disabledClick);
    expect(disabledClick.defaultPrevented).toBe(true);
    expect(host$.menuItemClick).toHaveBeenCalledTimes(1);
    expect(host$.itemClick).not.toHaveBeenCalled();
  });

  it('navigates a path entry through the router when one is configured, except on a modifier click', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    create();
    let entries = entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[1])));
    const general = entries[0].querySelector('a') as HTMLAnchorElement;
    expect(general.getAttribute('href')).toBe('/home/components/general');
    expect(clickAndRecordPrevented(general)).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/home/components/general');

    entries = entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[1])));
    expect(clickAndRecordPrevented(entries[1].querySelector('a')!, { ctrlKey: true })).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);

    entries = entriesOf(await openMenu(overlayLinkOf(crumbsOf(host)[2])));
    expect(clickAndRecordPrevented(entries[0].querySelector('a')!)).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.menuItemClick).toHaveBeenCalledTimes(3);
  });

  it('drops the overlay when the entry menu is cleared', () => {
    create();
    fixture.componentInstance.items.set([{ title: 'Components', path: 'components', menu: null }]);
    fixture.detectChanges();
    expect(overlayLinkOf(crumbsOf(host)[0])).toBeNull();
    expect(crumbsOf(host)[0].querySelector('.ant-breadcrumb-link > a')!.getAttribute('href')).toBe('#/components');
  });
});
