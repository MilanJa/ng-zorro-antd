/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { ESCAPE } from '@angular/cdk/keycodes';
import { ConnectedOverlayPositionChange, OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, ElementRef, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  provideMockDirectionality,
  updateNonSignalsInput
} from 'ng-zorro-antd/core/testing';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzSubmenuTrigger } from 'ng-zorro-antd/menu/menu.types';
import { NzTooltipComponent, NzTooltipModule } from 'ng-zorro-antd/tooltip';

import { NzMenuItemComponent } from './menu-item.component';
import { NzMenuDirective } from './menu.directive';
import { NzMenuModule } from './menu.module';
import { NzIsMenuInsideDropdownToken } from './menu.token';
import { NzSubMenuComponent } from './submenu.component';

describe('menu', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting(), provideNzNoAnimation(), provideMockDirectionality()]
    });
  });

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    oc.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));

  describe('basic', () => {
    describe('horizontal', () => {
      let fixture: ComponentFixture<NzTestBasicMenuHorizontalComponent>;
      let items: DebugElement[];
      let submenu: DebugElement;
      let menu: DebugElement;
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestBasicMenuHorizontalComponent);
        items = fixture.debugElement.queryAll(By.directive(NzMenuItemComponent));
        submenu = fixture.debugElement.query(By.directive(NzSubMenuComponent));
        menu = fixture.debugElement.query(By.directive(NzMenuDirective));
      });

      it('should className correct', () => {
        fixture.detectChanges();
        expect(items.every(item => item.nativeElement.classList.contains('ant-menu-item'))).toBe(true);
        expect(items[1].nativeElement.classList.contains('ant-menu-item-disabled')).toBe(true);
        expect(submenu.nativeElement.classList.contains('ant-menu-submenu-horizontal')).toBe(true);
        expect(submenu.nativeElement.classList.contains('ant-menu-submenu')).toBe(true);
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-light ant-menu-horizontal');
      });

      it('should menu item select', () => {
        fixture.detectChanges();
        items[0].nativeElement.click();
        fixture.detectChanges();
        expect(items[0].nativeElement.classList.contains('ant-menu-item-selected')).toBe(true);
      });

      it('should menu disabled work', () => {
        fixture.detectChanges();
        items[1].nativeElement.click();
        fixture.detectChanges();
        expect(items[0].nativeElement.classList.contains('ant-menu-item-selected')).toBe(false);
      });

      it('should menu danger work', () => {
        fixture.detectChanges();
        expect(items[3].nativeElement.classList.contains('ant-menu-item-danger')).toBe(true);
      });
    });

    describe('inline', () => {
      let fixture: ComponentFixture<NzTestBasicMenuInlineComponent>;
      let items: DebugElement[];
      let submenus: DebugElement[];
      let menu: DebugElement;
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestBasicMenuInlineComponent);
        items = fixture.debugElement.queryAll(By.directive(NzMenuItemComponent));
        menu = fixture.debugElement.query(By.directive(NzMenuDirective));
        submenus = fixture.debugElement.queryAll(By.directive(NzSubMenuComponent));
      });

      it('should className correct', () => {
        fixture.detectChanges();
        expect(submenus.every(subitem => subitem.nativeElement.classList.contains('ant-menu-submenu'))).toBe(true);
        expect(submenus.every(subitem => subitem.nativeElement.classList.contains('ant-menu-submenu-inline'))).toBe(
          true
        );
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-light ant-menu-inline');
      });

      it('should padding left work', () => {
        fixture.detectChanges();
        const firstLevelItems = items;
        const secondLevelItems = firstLevelItems.splice(6, 2);
        expect(firstLevelItems.every(item => item.nativeElement.style.paddingLeft === '48px')).toBe(true);
        expect(secondLevelItems.every(item => item.nativeElement.style.paddingLeft === '72px')).toBe(true);
      });

      it('should click expand', async () => {
        fixture.detectChanges();
        const ul = submenus[0].nativeElement.querySelector('.ant-menu');
        const title = submenus[0].nativeElement.querySelector('.ant-menu-submenu-title');
        expect(ul.style.height).toBe('0px');
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).not.toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(true);
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(false);
      });
    });

    describe('inline-collapsed', () => {
      let fixture: ComponentFixture<NzTestMenuInlineCollapsedComponent>;
      let testComponent: NzTestMenuInlineCollapsedComponent;
      let submenus: DebugElement[];
      let menu: DebugElement;
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuInlineCollapsedComponent);
        testComponent = fixture.debugElement.componentInstance;
        submenus = fixture.debugElement.queryAll(By.directive(NzSubMenuComponent));
        menu = fixture.debugElement.query(By.directive(NzMenuDirective));
      });

      it('should className correct', () => {
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-dark ant-menu-inline');
        testComponent.isCollapsed.set(true);
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe(
          'ant-menu ant-menu-root ant-menu-dark ant-menu-vertical ant-menu-inline-collapsed'
        );
        testComponent.isCollapsed.set(false);
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-dark ant-menu-inline');
      });

      it('should keep open after change mode', () => {
        fixture.detectChanges();
        let ul = submenus[0].nativeElement.querySelector('.ant-menu');
        const title = submenus[0].nativeElement.querySelector('.ant-menu-submenu-title');
        expect(ul.style.height).toBe('0px');
        testComponent.isCollapsed.set(true);
        fixture.detectChanges();
        testComponent.isCollapsed.set(false);
        fixture.detectChanges();
        ul = submenus[0].nativeElement.querySelector('.ant-menu');
        expect(ul.style.height).toBe('0px');
        title.click();
        fixture.detectChanges();
        expect(ul.style.height).not.toBe('0px');
        testComponent.isCollapsed.set(true);
        fixture.detectChanges();
        testComponent.isCollapsed.set(false);
        fixture.detectChanges();
        expect(ul.style.height).not.toBe('0px');
      });
    });

    describe('slider-current', () => {
      let fixture: ComponentFixture<NzTestMenuSiderCurrentComponent>;
      let submenus: DebugElement[];
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuSiderCurrentComponent);
        submenus = fixture.debugElement.queryAll(By.directive(NzSubMenuComponent));
      });

      it('should collapsed self work', async () => {
        fixture.detectChanges();
        const ul = submenus[0].nativeElement.querySelector('.ant-menu');
        const title = submenus[0].nativeElement.querySelector('.ant-menu-submenu-title');
        expect(ul.style.height).not.toBe('0px');
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(false);
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).not.toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(true);
      });

      it('should collapsed other work', async () => {
        fixture.detectChanges();
        const firstUl = submenus[0].nativeElement.querySelector('.ant-menu');
        const secondUl = submenus[1].nativeElement.querySelector('.ant-menu');
        const secondTitle = submenus[1].nativeElement.querySelector('.ant-menu-submenu-title');
        expect(firstUl.style.height).not.toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(true);
        secondTitle.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(firstUl.style.height).toBe('0px');
        expect(submenus[0].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(false);
        expect(secondUl.style.height).not.toBe('0px');
        expect(submenus[1].nativeElement.classList.contains('ant-menu-submenu-open')).toBe(true);
      });
    });

    describe('theme', () => {
      let fixture: ComponentFixture<NzTestMenuThemeComponent>;
      let testComponent: NzTestMenuThemeComponent;
      let menu: DebugElement;
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuThemeComponent);
        testComponent = fixture.debugElement.componentInstance;
        menu = fixture.debugElement.query(By.directive(NzMenuDirective));
      });

      it('should className correct', () => {
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-dark ant-menu-inline');
        testComponent.theme.set(false);
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-inline ant-menu-light');
      });
    });

    describe('switch-mode', () => {
      let fixture: ComponentFixture<NzTestMenuSwitchModeComponent>;
      let testComponent: NzTestMenuSwitchModeComponent;
      let submenus: DebugElement[];
      let menu: DebugElement;
      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuSwitchModeComponent);
        testComponent = fixture.debugElement.componentInstance;
        submenus = fixture.debugElement.queryAll(By.directive(NzSubMenuComponent));
        menu = fixture.debugElement.query(By.directive(NzMenuDirective));
      });

      it('should className correct', () => {
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-light ant-menu-inline');
        expect(submenus.every(submenu => submenu.nativeElement.classList.contains('ant-menu-submenu-inline'))).toBe(
          true
        );
        testComponent.mode.set(true);
        fixture.detectChanges();
        expect(menu.nativeElement.className).toBe('ant-menu ant-menu-root ant-menu-light ant-menu-vertical');
        expect(submenus.every(submenu => submenu.nativeElement.classList.contains('ant-menu-submenu-inline'))).toBe(
          false
        );
        expect(submenus.every(submenu => submenu.nativeElement.classList.contains('ant-menu-submenu-vertical'))).toBe(
          true
        );
      });
    });
  });

  describe('submenu', () => {
    describe('horizontal submenu', () => {
      let fixture: ComponentFixture<NzTestMenuHorizontalComponent>;
      let testComponent: NzTestMenuHorizontalComponent;
      let submenu: DebugElement;

      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuHorizontalComponent);
        testComponent = fixture.debugElement.componentInstance;
        submenu = fixture.debugElement.query(By.directive(NzSubMenuComponent));
      });

      it('should overlay work', async () => {
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');
        testComponent.open.set(true);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).not.toBe('');
      });

      it('should submenu mouseenter work', () => {
        fixture.detectChanges();
        const mouseenterCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');

        (subs[0].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(mouseenterCallback);
        dispatchFakeEvent(title, 'mouseenter');
        fixture.detectChanges();
        expect(mouseenterCallback).toHaveBeenCalledWith(true);
        expect(mouseenterCallback).toHaveBeenCalledTimes(1);
      });

      it('should have "hover" as default trigger', () => {
        fixture.detectChanges();
        const mouseenterCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');

        (subs[0].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(mouseenterCallback);
        dispatchFakeEvent(title, 'mouseenter');
        fixture.detectChanges();
        expect(mouseenterCallback).toHaveBeenCalledWith(true);
        expect(mouseenterCallback).toHaveBeenCalledTimes(1);
      });

      it('should have not open with mouse hover if trigger is set to "click"', () => {
        testComponent.nzTriggerSubMenuAction.set('click');
        fixture.detectChanges();
        const mouseenterCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');

        (subs[0].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(mouseenterCallback);
        dispatchFakeEvent(title, 'mouseenter');
        fixture.detectChanges();
        expect(mouseenterCallback).toHaveBeenCalledTimes(0);
      });

      it('should open with mouse click if trigger is set to "click"', () => {
        testComponent.nzTriggerSubMenuAction.set('click');
        fixture.detectChanges();
        const mouseenterCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');
        (subs[0].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(mouseenterCallback);
        title.click();
        fixture.detectChanges();
        expect(mouseenterCallback).toHaveBeenCalledTimes(1);
      });

      it('should reopen after the overlay is detached by Escape', async () => {
        testComponent.nzTriggerSubMenuAction.set('click');
        fixture.detectChanges();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');

        title.click();
        await stabilize(fixture, 500);
        expect(testComponent.subs.first.nzOpen).toBe(true);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        await stabilize(fixture, 500);
        expect(testComponent.subs.first.nzOpen).toBe(false);

        title.click();
        await stabilize(fixture, 500);
        expect(testComponent.subs.first.nzOpen).toBe(true);
      });

      it('should submenu mouseleave work', () => {
        fixture.detectChanges();
        const mouseleaveCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');

        (subs[0].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(mouseleaveCallback);
        dispatchFakeEvent(title, 'mouseleave');
        fixture.detectChanges();
        expect(mouseleaveCallback).toHaveBeenCalledWith(false);
        expect(mouseleaveCallback).toHaveBeenCalledTimes(1);
      });

      it('should nested submenu work', () => {
        testComponent.open.set(true);
        fixture.detectChanges();
        const nestedCallback = vi.fn();
        const subs = testComponent.subs.toArray();

        (subs[0].nzSubmenuService as NzSafeAny).isChildSubMenuOpen$.subscribe(nestedCallback);
        subs[1].nzOpen = true;
        subs[1].nzSubmenuService.isCurrentSubMenuOpen$.next(false);
        fixture.detectChanges();
        expect(nestedCallback).toHaveBeenCalledWith(false);
        expect(nestedCallback).toHaveBeenCalledTimes(1);
      });

      it('should nested submenu disabled work', () => {
        testComponent.open.set(true);
        testComponent.disabled.set(true);
        fixture.detectChanges();
        const nestedCallback = vi.fn();
        const subs = testComponent.subs.toArray();

        (subs[0].nzSubmenuService as NzSafeAny).isChildSubMenuOpen$.subscribe(nestedCallback);
        subs[1].nzOpen = true;
        subs[1].nzSubmenuService.isCurrentSubMenuOpen$.next(false);
        fixture.detectChanges();
        expect(nestedCallback).toHaveBeenCalledTimes(1);
      });

      it('should click menu and other submenu menu not active', async () => {
        testComponent.open.set(true);
        fixture.detectChanges();
        const subs = testComponent.subs.toArray();
        dispatchFakeEvent(testComponent.menuitem1.nativeElement, 'mouseenter');
        fixture.detectChanges();
        testComponent.menuitem1.nativeElement.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(subs[1].isActive).toBe(false);
      });

      it('should click submenu menu item close', () => {
        testComponent.open.set(true);
        fixture.detectChanges();
        const nestedCallback = vi.fn();
        const subs = testComponent.subs.toArray();
        subs[1].nzOpen = true;
        fixture.detectChanges();

        (subs[1].nzSubmenuService as NzSafeAny).isChildSubMenuOpen$.subscribe(nestedCallback);
        testComponent.menuitem.nativeElement.click();
        fixture.detectChanges();
        expect(nestedCallback).toHaveBeenCalledWith(false);
        expect(nestedCallback).toHaveBeenCalledTimes(1);
      });

      it('should click submenu disabled menu item not close', () => {
        testComponent.open.set(true);
        fixture.detectChanges();
        const nestedCallback = vi.fn();
        const subs = testComponent.subs.toArray();

        (subs[1].nzSubmenuService as NzSafeAny).isMouseEnterTitleOrOverlay$.subscribe(nestedCallback);
        subs[1].nzOpen = true;
        testComponent.disabledItem.nativeElement.click();
        fixture.detectChanges();
        expect(nestedCallback).toHaveBeenCalledTimes(0);
      });

      it('should width change correct', async () => {
        fixture.detectChanges();
        const submenu = testComponent.subs.first;
        // The overlay width follows the trigger's measured width. Mock the measurement
        // explicitly so the assertion does not depend on browser layout in the test host.
        vi.spyOn(submenu.cdkOverlayOrigin!.nativeElement, 'getBoundingClientRect').mockImplementation(
          () => ({ width: testComponent.width() }) as DOMRect
        );
        testComponent.open.set(true);
        await stabilize(fixture);
        let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(overlayPane.style.width).toBe('200px');
        expect(overlayPane.style.minWidth).toBe('');
        testComponent.open.set(false);
        fixture.detectChanges();
        testComponent.width.set(300);
        fixture.detectChanges();
        testComponent.open.set(true);
        await stabilize(fixture);
        overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect(overlayPane.style.width).toBe('300px');
        expect(overlayPane.style.minWidth).toBe('');
      });

      it('should give the popup a min-width instead of a width when the v6 tokens are present', async () => {
        fixture.detectChanges();
        // The v6 stylesheet defines --ant-menu-* tokens (the v4 one none); this is what the submenu probes.
        (fixture.nativeElement.querySelector('ul[nz-menu]') as HTMLElement).style.setProperty(
          '--ant-menu-dropdown-width',
          '160px'
        );
        const submenu = testComponent.subs.first;
        vi.spyOn(submenu.cdkOverlayOrigin!.nativeElement, 'getBoundingClientRect').mockImplementation(
          () => ({ width: testComponent.width() }) as DOMRect
        );
        testComponent.open.set(true);
        await stabilize(fixture);
        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        expect([overlayPane.style.minWidth, overlayPane.style.width]).toEqual(['200px', '']);
        expect(submenu.stretchMinWidth).toBe(true);
      });

      it('should position change correct', () => {
        const fakeLeftTopEvent = {
          connectionPair: {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top'
          }
        } as ConnectedOverlayPositionChange;
        const fakeRightTopEvent = {
          connectionPair: {
            originX: 'end',
            originY: 'top',
            overlayX: 'start',
            overlayY: 'top'
          }
        } as ConnectedOverlayPositionChange;
        fixture.detectChanges();
        testComponent.open.set(true);
        const subs = testComponent.subs.toArray();
        subs[1].nzOpen = true;
        fixture.detectChanges();
        subs[1].onPositionChange(fakeLeftTopEvent);
        fixture.detectChanges();
        expect(subs[1].position).toBe('left');
        subs[1].onPositionChange(fakeRightTopEvent);
        fixture.detectChanges();
        expect(subs[1].position).toBe('right');
      });

      it('should `nzMenuClassName` work', async () => {
        fixture.detectChanges();
        testComponent.open.set(true);
        fixture.detectChanges();
        await stabilize(fixture);
        expect((overlayContainerElement.querySelector('.submenu') as HTMLUListElement).classList).toContain(
          'ant-menu-sub'
        );
      });

      it('should nested submenu `nzMenuClassName` work', () => {
        testComponent.open.set(true);
        fixture.detectChanges();
        const subs = testComponent.subs.toArray();
        subs[0].nzOpen = true;
        subs[1].nzOpen = true;

        (subs[1] as NzSafeAny).cdr.markForCheck();
        fixture.detectChanges();
        expect((overlayContainerElement.querySelector('.nested-submenu') as HTMLUListElement).classList).toContain(
          'ant-menu-sub'
        );
      });
    });

    describe('inline submenu', () => {
      let fixture: ComponentFixture<NzTestMenuInlineComponent>;
      let testComponent: NzTestMenuInlineComponent;
      let submenu: DebugElement;

      beforeEach(() => {
        fixture = TestBed.createComponent(NzTestMenuInlineComponent);
        testComponent = fixture.debugElement.componentInstance;
        submenu = fixture.debugElement.query(By.directive(NzSubMenuComponent));
      });

      it('should click expand', async () => {
        fixture.detectChanges();
        const ul = submenu.nativeElement.querySelector('.ant-menu');
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');
        expect(ul.style.height).toBe('0px');
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).not.toBe('0px');
        expect(submenu.nativeElement.classList.contains('ant-menu-submenu-open')).toBe(true);
      });

      it('should `nzMenuClassName` work', async () => {
        fixture.detectChanges();
        await stabilize(fixture);
        expect(submenu.nativeElement.querySelector('.ant-menu-sub').className).toContain('submenu');
      });

      it('should `nzMenuClassName` multi class names work', async () => {
        fixture.detectChanges();
        testComponent.submenuClassName.set('submenu submenu-1');
        fixture.detectChanges();
        await stabilize(fixture);
        expect(submenu.nativeElement.querySelector('.ant-menu-sub').className).toContain('submenu');
        expect(submenu.nativeElement.querySelector('.ant-menu-sub').className).toContain('submenu-1');
      });

      it('should disabled work', async () => {
        testComponent.disabled.set(true);
        fixture.detectChanges();
        const ul = submenu.nativeElement.querySelector('.ant-menu');
        const title = submenu.nativeElement.querySelector('.ant-menu-submenu-title');
        expect(ul.style.height).toBe('0px');
        title.click();
        fixture.detectChanges();
        await stabilize(fixture, 500);
        expect(ul.style.height).toBe('0px');
        expect(submenu.nativeElement.classList.contains('ant-menu-submenu-open')).toBe(false);
      });
    });

    describe('submenu default selected', () => {
      it('should default selected active submenu', () => {
        const fixture = TestBed.createComponent(NzTestSubMenuSelectedComponent);
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('.ant-menu-submenu').classList).toContain(
          'ant-menu-submenu-selected'
        );
      });
    });
  });

  describe('RTL', () => {
    let fixture: ComponentFixture<NzTestMenuHorizontalComponent>;
    let testComponent: NzTestMenuHorizontalComponent;
    let submenu: DebugElement;
    let menu: DebugElement;
    let directionality: Directionality;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestMenuHorizontalComponent);
      testComponent = fixture.componentInstance;
      submenu = fixture.debugElement.query(By.directive(NzSubMenuComponent));
      menu = fixture.debugElement.query(By.directive(NzMenuDirective));
      directionality = TestBed.inject(Directionality);

      testComponent.open.set(true);
      directionality.valueSignal.set('rtl');
      fixture.detectChanges();
    });

    it('should className correct on dir change', () => {
      expect(submenu.nativeElement.classList.contains('ant-menu-submenu-rtl')).toBe(true);
      expect(menu.nativeElement.classList.contains('ant-menu-rtl')).toBe(true);

      directionality.valueSignal.set('ltr');
      fixture.detectChanges();

      expect(submenu.nativeElement.classList.contains('ant-menu-submenu-rtl')).toBe(false);
      expect(menu.nativeElement.classList.contains('ant-menu-rtl')).toBe(false);
    });

    it('should nested submenu work', () => {
      const subs = testComponent.subs.toArray();
      subs[0].nzOpen = true;
      fixture.detectChanges();

      expect((overlayContainerElement.querySelector('.ant-menu-submenu') as HTMLUListElement).classList).toContain(
        'ant-menu-submenu-rtl'
      );
    });
  });

  describe('v6 inputs', () => {
    let fixture: ComponentFixture<NzTestMenuV6InputsComponent>;
    let el: HTMLElement;
    const q = (s: string): HTMLElement => el.querySelector(s) as HTMLElement;
    const tooltipTexts = (): string[] =>
      [...overlayContainerElement.querySelectorAll('.ant-tooltip')].map(t => t.textContent!.trim());
    beforeEach(async () => {
      fixture = TestBed.createComponent(NzTestMenuV6InputsComponent);
      el = fixture.nativeElement;
      await stabilize(fixture);
    });

    it('wraps the label and the extra in the title content', async () => {
      const content = q('#extra > .ant-menu-title-content');
      expect(content.classList).toContain('ant-menu-title-content-with-extra');
      expect([...content.children].map(c => c.className)).toEqual(['ant-menu-item-label', 'ant-menu-item-extra']);
      expect([
        q('#extra .ant-menu-item-label').textContent!.trim(),
        q('#extra .ant-menu-item-extra').textContent!.trim()
      ]).toEqual(['Option 2', '⌘P']);
      expect(q('#extraTpl .ant-menu-item-extra b.tpl').textContent).toBe('⌘U');
      fixture.componentInstance.extra.set(null);
      await stabilize(fixture);
      expect(content.classList).not.toContain('ant-menu-title-content-with-extra');
      expect([content.children.length, content.textContent!.trim()]).toEqual([0, 'Option 2']);
    });

    it('renders the nzIcon slot before the title content, never two icons, and keeps projected icons as today', () => {
      const slot = q('#slot').firstElementChild as HTMLElement;
      expect([...slot.classList]).toEqual(expect.arrayContaining(['anticon-user', 'ant-menu-item-icon']));
      expect(slot.nextElementSibling!.classList).toContain('ant-menu-title-content');
      const visible = [...el.querySelectorAll<HTMLElement>('#both .anticon')].filter(i => i.style.display !== 'none');
      expect(visible.map(i => i.classList.contains('anticon-user'))).toEqual([true]);
      // v4 safety: an item without nzIcon keeps its DOM (no slot, icon inside the title content).
      expect(q('#projected').className).toBe('ant-menu-item');
      expect([...q('#projected').children].map(c => c.className)).toEqual(['ant-menu-title-content']);
      expect([...q('#projected > .ant-menu-title-content').children].map(c => c.tagName)).toEqual(['NZ-ICON', 'SPAN']);
    });

    it('keeps the full title as the accessible name of a collapsed submenu showing only its first letter', async () => {
      const subTitle = q('#sub .ant-menu-submenu-title');
      expect(subTitle.getAttribute('aria-label')).toBeNull();
      expect(subTitle.getAttribute('title')).toBeNull();
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      expect(subTitle.getAttribute('aria-label')).toBe('Navigation');
      expect(subTitle.getAttribute('title')).toBe('Navigation');
      fixture.componentInstance.collapsed.set(false);
      await stabilize(fixture);
      expect(subTitle.getAttribute('aria-label')).toBeNull();
      expect(subTitle.getAttribute('title')).toBeNull();
    });

    it('shows the first letter of icon-less first-level items and submenus only while collapsed', async () => {
      expect(el.querySelector('.ant-menu-inline-collapsed-noicon')).toBeNull();
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      const letter = q('#plain > .ant-menu-inline-collapsed-noicon');
      expect([letter.textContent, letter.nextElementSibling!.className]).toEqual(['S', 'ant-menu-title-content']);
      for (const id of [
        '#slot',
        '#projected',
        '#link',
        '#extra',
        '#iconSub .ant-menu-submenu-title',
        '#sub .ant-menu-item'
      ]) {
        // `#sub .ant-menu-item` (the nested item of a non-inline, level-1 flyout submenu) is not
        // stamped at all while the submenu is closed (`cdkConnectedOverlayOpen` false), which also
        // proves it carries no fallback letter.
        expect(q(id)?.querySelector('.ant-menu-inline-collapsed-noicon') ?? null, id).toBeNull();
      }
      const subTitle = q('#sub .ant-menu-submenu-title');
      expect(subTitle.querySelector(':scope > .ant-menu-inline-collapsed-noicon')!.textContent).toBe('N');
      expect(subTitle.querySelector('.ant-menu-title-content')).toBeNull();
      fixture.componentInstance.collapsed.set(false);
      await stabilize(fixture);
      expect(el.querySelector('.ant-menu-inline-collapsed-noicon')).toBeNull();
      expect(subTitle.querySelector('.ant-menu-title-content')!.textContent).toBe('Navigation');
    });

    it('opens the collapsed title tooltip on first-level items unless nzTooltip is false or a tooltip is composed', async () => {
      dispatchFakeEvent(q('#plain'), 'mouseenter');
      await stabilize(fixture);
      expect(tooltipTexts()).toEqual([]); // not collapsed
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      dispatchFakeEvent(q('#plain'), 'mouseenter');
      await stabilize(fixture);
      expect(
        overlayContainerElement.querySelector('.ant-tooltip.ant-menu-inline-collapsed-tooltip')!.textContent!.trim()
      ).toBe('Settings');
      dispatchFakeEvent(q('#plain'), 'mouseleave');
      await stabilize(fixture, 300);
      expect(overlayContainerElement.querySelector('.ant-menu-inline-collapsed-tooltip')).toBeNull();
      dispatchFakeEvent(q('#composed'), 'mouseenter');
      await stabilize(fixture, 300); // nz-tooltip's 0.15s mouseEnterDelay
      expect(tooltipTexts()).toEqual(['Mine']);
      dispatchFakeEvent(q('#composed'), 'mouseleave');
      fixture.componentInstance.tooltip.set(false);
      await stabilize(fixture, 300);
      dispatchFakeEvent(q('#plain'), 'mouseenter');
      await stabilize(fixture);
      expect(overlayContainerElement.querySelector('.ant-menu-inline-collapsed-tooltip')).toBeNull();
    });

    it('disables every item and submenu through the root nzDisabled and marks a dashed divider', async () => {
      fixture.componentInstance.disabled.set(true);
      fixture.componentInstance.dashed.set(true);
      await stabilize(fixture);
      expect(
        [...el.querySelectorAll('.ant-menu-item')].every(i => i.classList.contains('ant-menu-item-disabled'))
      ).toBe(true);
      expect(q('#sub').classList).toContain('ant-menu-submenu-disabled');
      q('#plain').click();
      expect(fixture.componentInstance.clicked).toBe(0);
      expect(q('#divider').className).toBe('ant-dropdown-menu-item-divider ant-menu-item-divider-dashed');
      fixture.componentInstance.disabled.set(false);
      await stabilize(fixture);
      expect([
        q('#plain').classList.contains('ant-menu-item-disabled'),
        q('#own').classList.contains('ant-menu-item-disabled')
      ]).toEqual([false, true]);
      q('#plain').click();
      expect(fixture.componentInstance.clicked).toBe(1);
    });

    it("uses dropdown's vocabulary for a dropdown-hosted item and adds no dashed class there", async () => {
      const dd = TestBed.createComponent(NzTestMenuV6DropdownHostedComponent);
      await stabilize(dd);
      const item = dd.nativeElement.querySelector('#ddItem') as HTMLElement;
      expect(item.firstElementChild!.classList).toContain('ant-dropdown-menu-item-icon');
      expect(item.querySelector('.ant-menu-title-content')!.classList).toContain(
        'ant-dropdown-menu-title-content-with-extra'
      );
      expect(item.querySelector('.ant-dropdown-menu-item-label')).not.toBeNull();
      expect(item.querySelector('.ant-dropdown-menu-item-extra')!.textContent!.trim()).toBe('⌘U');
      expect(dd.nativeElement.querySelector('#ddDivider').className).toBe('ant-dropdown-menu-item-divider');
    });

    it('titles the collapsed tooltip with the label only when nzExtra is set', async () => {
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      dispatchFakeEvent(q('#extra'), 'mouseenter');
      await stabilize(fixture);
      expect(
        overlayContainerElement.querySelector('.ant-tooltip.ant-menu-inline-collapsed-tooltip')!.textContent!.trim()
      ).toBe('Option 2');
    });
  });

  describe('collapsed first letter', () => {
    beforeEach(() => {
      TrackingMutationObserver.live.clear();
      vi.stubGlobal('MutationObserver', TrackingMutationObserver);
    });
    afterEach(() => vi.unstubAllGlobals());

    it('follows a label that changes while collapsed and disconnects its observer', async () => {
      const fixture = TestBed.createComponent(NzTestMenuCollapsedLabelComponent);
      const letter = (): string | null =>
        fixture.nativeElement.querySelector('#dyn > .ant-menu-inline-collapsed-noicon')?.textContent ?? null;
      await stabilize(fixture);
      expect(letter()).toBe('S');
      expect(TrackingMutationObserver.live.size).toBe(1); // the icon item is never observed
      fixture.componentInstance.label.set('Mail');
      await stabilize(fixture);
      expect(letter()).toBe('M');
      fixture.componentInstance.collapsed.set(false);
      await stabilize(fixture);
      expect(letter()).toBeNull();
      expect(TrackingMutationObserver.live.size).toBe(0);
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      expect(TrackingMutationObserver.live.size).toBe(1);
      fixture.destroy();
      expect(TrackingMutationObserver.live.size).toBe(0);
    });
  });

  describe('collapsed tooltip edge cases', () => {
    const hoverPlain = async (fixture: ComponentFixture<NzTestMenuV6InputsComponent>): Promise<void> => {
      fixture.componentInstance.collapsed.set(true);
      await stabilize(fixture);
      dispatchFakeEvent(fixture.nativeElement.querySelector('#plain'), 'mouseenter');
      await stabilize(fixture);
    };

    it('places the collapsed tooltip on the left under RTL', async () => {
      const directionality = TestBed.inject(Directionality) as NzSafeAny;
      directionality.value = 'rtl'; // read by the item when it opens the tooltip
      directionality.valueSignal.set('rtl');
      const fixture = TestBed.createComponent(NzTestMenuV6InputsComponent);
      await hoverPlain(fixture);
      expect(overlayContainerElement.querySelector('.ant-tooltip.ant-menu-inline-collapsed-tooltip')).not.toBeNull();
      const item = fixture.debugElement.query(By.css('#plain')).injector.get(NzMenuItemComponent);
      const tooltip = (item as NzSafeAny).collapsedTooltip.instance as NzTooltipComponent;
      // POSITION_MAP.left; read from the preferred positions, so a narrow test viewport cannot flip it
      expect(tooltip._positions[0]).toEqual(
        expect.objectContaining({ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' })
      );
    });

    it('leaves no collapsed tooltip in the overlay container when destroyed while it shows', async () => {
      const fixture = TestBed.createComponent(NzTestMenuV6InputsComponent);
      await hoverPlain(fixture);
      expect(overlayContainerElement.querySelector('.ant-menu-inline-collapsed-tooltip')).not.toBeNull();
      fixture.destroy();
      expect(overlayContainerElement.querySelector('.ant-menu-inline-collapsed-tooltip')).toBeNull();
    });
  });

  describe('nzExpandIcon', () => {
    let fixture: ComponentFixture<NzTestMenuExpandIconComponent>;
    const title = (): HTMLElement => fixture.nativeElement.querySelector('#expSub .ant-menu-submenu-title');
    beforeEach(async () => {
      fixture = TestBed.createComponent(NzTestMenuExpandIconComponent);
      await stabilize(fixture);
    });

    it('replaces the arrow with the template, passing the open state', async () => {
      const icon = title().lastElementChild as HTMLElement;
      expect(icon.className).toBe('ant-menu-submenu-expand-icon');
      expect(icon.querySelector('.custom-expand')!.textContent).toBe('closed');
      expect(title().querySelector('.ant-menu-submenu-arrow')).toBeNull();
      fixture.componentInstance.open.set(true);
      await stabilize(fixture);
      expect(title().querySelector('.custom-expand')!.textContent).toBe('open');
    });

    it('keeps the default arrow for horizontal submenus and when no template is set', async () => {
      fixture.componentInstance.mode.set('vertical');
      await stabilize(fixture);
      expect(title().querySelector('.ant-menu-submenu-expand-icon .custom-expand')).not.toBeNull();
      fixture.componentInstance.mode.set('horizontal');
      await stabilize(fixture);
      expect([!!title().querySelector('.ant-menu-submenu-arrow'), !!title().querySelector('.custom-expand')]).toEqual([
        true,
        false
      ]);
      fixture.componentInstance.mode.set('inline');
      fixture.componentInstance.custom.set(false);
      await stabilize(fixture);
      // v4 safety: without nzExpandIcon the title ends with today's arrow span.
      expect(title().lastElementChild!.className).toBe('ant-menu-submenu-arrow');
      expect(title().querySelector('.ant-menu-submenu-expand-icon')).toBeNull();
    });

    it("renders the template in dropdown's expand-icon span inside a dropdown", async () => {
      const dd = TestBed.createComponent(NzTestMenuExpandIconDropdownComponent);
      await stabilize(dd);
      const span = dd.nativeElement.querySelector(
        '.ant-dropdown-menu-submenu-title > .ant-dropdown-menu-submenu-expand-icon'
      );
      expect(span.querySelector('.custom-expand')).not.toBeNull();
      expect(span.querySelector('.ant-dropdown-menu-submenu-arrow-icon')).toBeNull();
    });
  });
});

@Component({
  selector: 'nz-test-menu-horizontal',
  imports: [NzIconModule, NzMenuModule],
  template: `
    <ul nz-menu nzMode="horizontal">
      <li
        nz-submenu
        [nzTriggerSubMenuAction]="nzTriggerSubMenuAction()"
        nzMenuClassName="submenu"
        [nzOpen]="open()"
        [style.width.px]="width()"
      >
        <span title>
          <nz-icon nzType="setting" />
          Navigation Three - Submenu
        </span>
        <ul>
          <li nz-menu-group>
            <span title>Item 1</span>
            <ul>
              <li nz-menu-item>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group>
            <span title>Item 2</span>
            <ul>
              <li nz-menu-item #menuitem1>Option 3</li>
              <li nz-menu-item>Option 4</li>
              <li nz-submenu nzMenuClassName="nested-submenu" [nzDisabled]="disabled()">
                <span title>Sub Menu</span>
                <ul>
                  <li nz-menu-item #menuitem>Option 5</li>
                  <li nz-menu-item #disabledItem nzDisabled>Option 6</li>
                </ul>
              </li>
              <li nz-submenu nzDisabled>
                <span title>Disabled Sub Menu</span>
                <ul>
                  <li nz-menu-item>Option 5</li>
                  <li nz-menu-item>Option 6</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestMenuHorizontalComponent {
  readonly width = signal(200);
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly nzTriggerSubMenuAction = signal<NzSubmenuTrigger>('hover');
  @ViewChildren(NzSubMenuComponent) subs!: QueryList<NzSubMenuComponent>;
  @ViewChild('menuitem', { static: false, read: ElementRef }) menuitem!: ElementRef;
  @ViewChild('menuitem1', { static: false, read: ElementRef }) menuitem1!: ElementRef;
  @ViewChild('disabledItem', { static: false, read: ElementRef }) disabledItem!: ElementRef;
}

@Component({
  imports: [NzIconModule, NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapse()">
      <li nz-submenu [nzMenuClassName]="submenuClassName()" [nzDisabled]="disabled()">
        <span title>
          <nz-icon nzType="mail" />
          Navigation One
        </span>
        <ul>
          <li nz-menu-item style="padding-left:0">Option 1</li>
          <li nz-menu-item>Option 2</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestMenuInlineComponent {
  readonly disabled = signal(false);
  readonly collapse = signal(false);
  readonly submenuClassName = signal('submenu');
  @ViewChild(NzSubMenuComponent, { static: true }) submenu!: NzSubMenuComponent;
}

@Component({
  imports: [NzIconModule, NzMenuModule],
  template: `
    <ul nz-menu nzMode="horizontal">
      <li nz-menu-item>
        <nz-icon nzType="mail" />
        Navigation One
      </li>
      <li nz-menu-item nzDisabled>
        <nz-icon nzType="appstore" />
        Navigation Two
      </li>
      <li nz-submenu nzTitle="Navigation Three - Submenu" nzIcon="setting">
        <ul>
          <li nz-menu-group nzTitle="Item 1">
            <ul>
              <li nz-menu-item>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group nzTitle="Item 2">
            <ul>
              <li nz-menu-item>Option 3</li>
              <li nz-menu-item>Option 4</li>
              <li nz-submenu nzTitle="Sub Menu">
                <ul>
                  <li nz-menu-item nzDisabled>Option 5</li>
                  <li nz-menu-item>Option 6</li>
                </ul>
              </li>
              <li nz-submenu nzDisabled nzTitle="Disabled Sub Menu">
                <ul>
                  <li nz-menu-item>Option 5</li>
                  <li nz-menu-item>Option 6</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-menu-item>
        <a href="https://ng.ant.design" target="_blank" rel="noopener noreferrer">Navigation Four - Link</a>
      </li>
      <li nz-menu-item nzDanger>Navigation Five</li>
    </ul>
  `
})
export class NzTestBasicMenuHorizontalComponent {}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline">
      <li nz-submenu nzTitle="Navigation One" nzIcon="mail">
        <ul>
          <li nz-menu-group nzTitle="Item 1">
            <ul>
              <li nz-menu-item>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group nzTitle="Item 2">
            <ul>
              <li nz-menu-item>Option 3</li>
              <li nz-menu-item>Option 4</li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item>Option 5</li>
          <li nz-menu-item>Option 6</li>
          <li nz-submenu nzTitle="Submenu">
            <ul>
              <li nz-menu-item>Option 7</li>
              <li nz-menu-item>Option 8</li>
              <li nz-submenu nzTitle="Submenu">
                <ul>
                  <li nz-menu-item>Option 9</li>
                  <li nz-menu-item>Option 10</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Three" nzIcon="setting">
        <ul>
          <li nz-menu-item>Option 11</li>
          <li nz-menu-item>Option 12</li>
          <li nz-menu-item>Option 13</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestBasicMenuInlineComponent {}

// https://github.com/NG-ZORRO/ng-zorro-antd/issues/3345
@Component({
  imports: [NzIconModule, NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" nzTheme="dark" nzInlineCollapsed>
      <li nz-menu-item>
        <nz-icon nzType="mail" />
        <span>Navigation One</span>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item nzSelected>Option 5</li>
          <li nz-menu-item>Option 6</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestSubMenuSelectedComponent {}

@Component({
  imports: [NzButtonModule, NzIconModule, NzMenuModule],
  template: `
    <div class="wrapper">
      <button nz-button nzType="primary" (click)="toggleCollapsed()">
        <nz-icon [nzType]="isCollapsed() ? 'menu-unfold' : 'menu-fold'" />
      </button>
      <ul nz-menu nzMode="inline" nzTheme="dark" [nzInlineCollapsed]="isCollapsed()">
        <li nz-menu-item nzSelected>
          <nz-icon nzType="mail" />
          <span>Navigation One</span>
        </li>
        <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
          <ul>
            <li nz-menu-item>Option 5</li>
            <li nz-menu-item>Option 6</li>
            <li nz-submenu nzTitle="Submenu">
              <ul>
                <li nz-menu-item>Option 7</li>
                <li nz-menu-item>Option 8</li>
              </ul>
            </li>
          </ul>
        </li>
        <li nz-submenu nzTitle="Navigation Three" nzIcon="setting">
          <ul>
            <li nz-menu-item>Option 9</li>
            <li nz-menu-item>Option 10</li>
            <li nz-menu-item>Option 11</li>
          </ul>
        </li>
      </ul>
    </div>
  `
})
export class NzTestMenuInlineCollapsedComponent {
  readonly isCollapsed = signal(false);

  toggleCollapsed(): void {
    this.isCollapsed.update(v => !v);
  }
}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" style="width: 240px;">
      <li
        nz-submenu
        [(nzOpen)]="openMap.sub1"
        (nzOpenChange)="openHandler('sub1')"
        nzTitle="Navigation One"
        nzIcon="mail"
      >
        <ul>
          <li nz-menu-group nzTitle="Item 1">
            <ul>
              <li nz-menu-item>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group nzTitle="Item 2">
            <ul>
              <li nz-menu-item>Option 3</li>
              <li nz-menu-item>Option 4</li>
            </ul>
          </li>
        </ul>
      </li>
      <li
        nz-submenu
        [(nzOpen)]="openMap.sub2"
        (nzOpenChange)="openHandler('sub2')"
        nzTitle="Navigation Two"
        nzIcon="appstore"
      >
        <ul>
          <li nz-menu-item>Option 5</li>
          <li nz-menu-item>Option 6</li>
          <li nz-submenu nzTitle="Submenu">
            <ul>
              <li nz-menu-item>Option 7</li>
              <li nz-menu-item>Option 8</li>
            </ul>
          </li>
        </ul>
      </li>
      <li
        nz-submenu
        [(nzOpen)]="openMap.sub3"
        (nzOpenChange)="openHandler('sub3')"
        nzTitle="Navigation Three"
        nzIcon="setting"
      >
        <ul>
          <li nz-menu-item>Option 9</li>
          <li nz-menu-item>Option 10</li>
          <li nz-menu-item>Option 11</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestMenuSiderCurrentComponent {
  openMap: Record<string, boolean> = {
    sub1: true,
    sub2: false,
    sub3: false
  };

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[key] = false;
      }
    }
  }
}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu [nzMode]="mode() ? 'vertical' : 'inline'" [nzTheme]="dark() ? 'dark' : 'light'">
      <li nz-submenu nzTitle="Navigation One" nzIcon="mail">
        <ul>
          <li nz-menu-group nzTitle="Item 1">
            <ul>
              <li nz-menu-item>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group nzTitle="Item 2">
            <ul>
              <li nz-menu-item>Option 3</li>
              <li nz-menu-item>Option 4</li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item>Option 5</li>
          <li nz-menu-item>Option 6</li>
          <li nz-submenu nzTitle="Submenu">
            <ul>
              <li nz-menu-item>Option 7</li>
              <li nz-menu-item>Option 8</li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Three" nzIcon="setting">
        <ul>
          <li nz-menu-item>Option 9</li>
          <li nz-menu-item>Option 10</li>
          <li nz-menu-item>Option 11</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestMenuSwitchModeComponent {
  readonly mode = signal(false);
  readonly dark = signal(false);
}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" style="width: 240px;" [nzTheme]="theme() ? 'dark' : 'light'">
      <li nz-submenu nzOpen nzTitle="Navigation One" nzIcon="mail">
        <ul>
          <li nz-menu-group nzTitle="Item 1">
            <ul>
              <li nz-menu-item nzSelected>Option 1</li>
              <li nz-menu-item>Option 2</li>
            </ul>
          </li>
          <li nz-menu-group nzTitle="Item 2">
            <ul>
              <li nz-menu-item>Option 3</li>
              <li nz-menu-item>Option 4</li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Two" nzIcon="appstore">
        <ul>
          <li nz-menu-item>Option 5</li>
          <li nz-menu-item>Option 6</li>
          <li nz-submenu nzTitle="Submenu">
            <ul>
              <li nz-menu-item>Option 7</li>
              <li nz-menu-item>Option 8</li>
            </ul>
          </li>
        </ul>
      </li>
      <li nz-submenu nzTitle="Navigation Three" nzIcon="setting">
        <ul>
          <li nz-menu-item>Option 9</li>
          <li nz-menu-item>Option 10</li>
          <li nz-menu-item>Option 11</li>
        </ul>
      </li>
    </ul>
  `
})
export class NzTestMenuThemeComponent {
  readonly theme = signal(true);
}

@Component({
  imports: [NzIconModule, NzMenuModule, NzTooltipModule],
  template: `
    <ul
      nz-menu
      nzMode="inline"
      [nzInlineCollapsed]="collapsed()"
      [nzDisabled]="disabled()"
      [nzTooltip]="tooltip()"
      (nzClick)="clicked = clicked + 1"
    >
      <li nz-menu-item id="extra" [nzExtra]="extra()">Option 2</li>
      <li nz-menu-item id="extraTpl" [nzExtra]="extraTpl">Users</li>
      <li nz-menu-item id="slot" nzIcon="user">Profile</li>
      <li nz-menu-item id="both" nzIcon="user"><nz-icon nzType="mail" /><span>Both</span></li>
      <li nz-menu-item id="projected"><nz-icon nzType="mail" /><span>Projected</span></li>
      <li nz-menu-item id="plain">Settings</li>
      <li nz-menu-item id="link"><a href="#x">Link</a></li>
      <li nz-menu-item id="composed" nz-tooltip nzTooltipTitle="Mine" nzTooltipPlacement="right">Composed</li>
      <li nz-menu-item id="own" nzDisabled>Own</li>
      <li nz-submenu id="sub" nzTitle="Navigation"
        ><ul
          ><li nz-menu-item>Nested</li></ul
        ></li
      >
      <li nz-submenu id="iconSub" nzTitle="Apps" nzIcon="appstore"
        ><ul
          ><li nz-menu-item>Nested 2</li></ul
        ></li
      >
      <li nz-menu-divider id="divider" [nzDashed]="dashed()"></li>
    </ul>
    <ng-template #extraTpl><b class="tpl">⌘U</b></ng-template>
  `
})
export class NzTestMenuV6InputsComponent {
  readonly collapsed = signal(false);
  readonly disabled = signal(false);
  readonly tooltip = signal(true);
  readonly extra = signal<string | null>('⌘P');
  readonly dashed = signal(false);
  clicked = 0;
}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu nzMode="inline" [nzInlineCollapsed]="collapsed()">
      <li nz-menu-item id="dyn">{{ label() }}</li>
      <li nz-menu-item id="dynIcon" nzIcon="user">{{ label() }}</li>
    </ul>
  `
})
export class NzTestMenuCollapsedLabelComponent {
  readonly collapsed = signal(true);
  readonly label = signal('Settings');
}

/** Records which observers are live, so a spec can prove an observer is disconnected. */
const NativeMutationObserver = MutationObserver;
class TrackingMutationObserver extends NativeMutationObserver {
  static readonly live = new Set<TrackingMutationObserver>();
  override observe(target: Node, options?: MutationObserverInit): void {
    TrackingMutationObserver.live.add(this);
    super.observe(target, options);
  }
  override disconnect(): void {
    TrackingMutationObserver.live.delete(this);
    super.disconnect();
  }
}

@Component({
  imports: [NzMenuModule],
  providers: [{ provide: NzIsMenuInsideDropdownToken, useValue: true }],
  template: `<ul nz-menu
    ><li nz-menu-item id="ddItem" nzIcon="user" nzExtra="⌘U">Users</li
    ><li nz-menu-divider id="ddDivider" nzDashed></li
  ></ul>`
})
export class NzTestMenuV6DropdownHostedComponent {}

@Component({
  imports: [NzMenuModule],
  template: `
    <ul nz-menu [nzMode]="mode()" [nzExpandIcon]="custom() ? icon : null">
      <li nz-submenu id="expSub" nzTitle="Navigation One" [nzOpen]="open()">
        <ul>
          <li nz-menu-item>Option 1</li>
        </ul>
      </li>
    </ul>
    <ng-template #icon let-open
      ><span class="custom-expand">{{ open ? 'open' : 'closed' }}</span></ng-template
    >
  `
})
export class NzTestMenuExpandIconComponent {
  readonly mode = signal<'inline' | 'vertical' | 'horizontal'>('inline');
  readonly open = signal(false);
  readonly custom = signal(true);
}

@Component({
  imports: [NzMenuModule],
  providers: [{ provide: NzIsMenuInsideDropdownToken, useValue: true }],
  template: `
    <ul nz-menu [nzExpandIcon]="icon">
      <li nz-submenu nzTitle="More">
        <ul>
          <li nz-menu-item>Nested</li>
        </ul>
      </li>
    </ul>
    <ng-template #icon><span class="custom-expand">›</span></ng-template>
  `
})
export class NzTestMenuExpandIconDropdownComponent {}

async function stabilize<T>(fixture: ComponentFixture<T>, ms?: number): Promise<void> {
  fixture.detectChanges();
  await updateNonSignalsInput(fixture, ms);
  fixture.detectChanges();
}
