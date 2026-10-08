/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ComponentRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  NgZone,
  signal,
  DestroyRef,
  ChangeDetectorRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

import { warn } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { numberAttributeWithZeroFallback } from 'ng-zorro-antd/core/util';
import { NzIconDirective, NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipComponent, NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { MenuService } from './menu.service';
import { NzIsMenuInsideDropdownToken } from './menu.token';
import { NzSubmenuService } from './submenu.service';

@Component({
  selector: '[nz-menu-item]',
  exportAs: 'nzMenuItem',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (nzIcon) {
      <nz-icon
        [nzType]="nzIcon"
        [class.ant-menu-item-icon]="!isMenuInsideDropdown"
        [class.ant-dropdown-menu-item-icon]="isMenuInsideDropdown"
      />
    }
    @if (noIconLetter(); as letter) {
      <div class="ant-menu-inline-collapsed-noicon">{{ letter }}</div>
    }
    <span
      #titleContent
      class="ant-menu-title-content"
      [class.ant-menu-title-content-with-extra]="hasExtra && !isMenuInsideDropdown"
      [class.ant-dropdown-menu-title-content-with-extra]="hasExtra && isMenuInsideDropdown"
    >
      @if (hasExtra) {
        <span
          [class.ant-menu-item-label]="!isMenuInsideDropdown"
          [class.ant-dropdown-menu-item-label]="isMenuInsideDropdown"
        >
          <ng-container [ngTemplateOutlet]="label" />
        </span>
        <span
          [class.ant-menu-item-extra]="!isMenuInsideDropdown"
          [class.ant-dropdown-menu-item-extra]="isMenuInsideDropdown"
        >
          <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
        </span>
      } @else {
        <ng-container [ngTemplateOutlet]="label" />
      }
    </span>
    <ng-template #label><ng-content /></ng-template>
  `,
  imports: [NgTemplateOutlet, NzIconModule, NzOutletModule],
  host: {
    '[class.ant-dropdown-menu-item]': `isMenuInsideDropdown`,
    '[class.ant-dropdown-menu-item-selected]': `isMenuInsideDropdown && nzSelected`,
    '[class.ant-dropdown-menu-item-danger]': `isMenuInsideDropdown && nzDanger`,
    '[class.ant-dropdown-menu-item-disabled]': `isMenuInsideDropdown && mergedDisabled`,
    '[class.ant-menu-item]': `!isMenuInsideDropdown`,
    '[class.ant-menu-item-selected]': `!isMenuInsideDropdown && nzSelected`,
    '[class.ant-menu-item-danger]': `!isMenuInsideDropdown && nzDanger`,
    '[class.ant-menu-item-disabled]': `!isMenuInsideDropdown && mergedDisabled`,
    '[style.padding-inline-start.px]': 'nzPaddingLeft || inlinePaddingLeft',
    '(click)': 'clickMenuItem($event)',
    '(mouseenter)': 'showCollapsedTooltip()',
    '(mouseleave)': 'hideCollapsedTooltip()'
  }
})
export class NzMenuItemComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit {
  private readonly nzMenuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly nzSubmenuService = inject(NzSubmenuService, { optional: true });
  private readonly routerLink = inject(RouterLink, { optional: true });
  private readonly router = inject(Router, { optional: true });
  protected readonly isMenuInsideDropdown = inject(NzIsMenuInsideDropdownToken);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly directionality = inject(Directionality);
  /** A tooltip composed on the item itself (`<li nz-menu-item nz-tooltip>`) replaces the automatic one. */
  private readonly composedTooltip = inject(NzTooltipDirective, { self: true, optional: true });

  level = this.nzSubmenuService ? this.nzSubmenuService.level + 1 : 1;
  selected$ = new Subject<boolean>();
  inlinePaddingLeft: number | null = null;
  @Input({ transform: numberAttributeWithZeroFallback }) nzPaddingLeft?: number;
  @Input({ transform: booleanAttribute }) nzDisabled = false;
  @Input({ transform: booleanAttribute }) nzSelected = false;
  @Input({ transform: booleanAttribute }) nzDanger = false;
  @Input({ transform: booleanAttribute }) nzMatchRouterExact = false;
  @Input({ transform: booleanAttribute }) nzMatchRouter = false;
  @Input() nzIcon: string | null = null;
  @Input() nzExtra: string | TemplateRef<void> | null = null;
  @ViewChild('titleContent', { static: true }) titleContent!: ElementRef<HTMLElement>;
  @ContentChildren(RouterLink, { descendants: true }) listOfRouterLink!: QueryList<RouterLink>;
  @ContentChildren(NzIconDirective, { read: ElementRef }) listOfProjectedIcon!: QueryList<ElementRef<HTMLElement>>;
  protected readonly noIconLetter = signal<string | null>(null);
  private inlineCollapsed = false;
  private menuDisabled = false;
  private menuTooltip = true;
  private viewInit = false;
  private warnedDoubleIcon = false;
  private collapsedTooltip: ComponentRef<NzTooltipComponent> | null = null;
  private readonly ngZone = inject(NgZone);
  /** Watches the title content while the collapsed first letter is derived from it; `null` otherwise. */
  private titleObserver: MutationObserver | null = null;

  get mergedDisabled(): boolean {
    return this.nzDisabled || this.menuDisabled;
  }

  protected get hasExtra(): boolean {
    return this.nzExtra !== null && this.nzExtra !== undefined && this.nzExtra !== '';
  }

  /** antd's collapsed first-level item tooltip (`MenuItem.tsx`); the component is created on first hover. */
  protected showCollapsedTooltip(): void {
    // With `nzExtra` the title content holds the label and the extra; antd titles the tooltip with the label only.
    const labelEl = this.hasExtra ? this.titleContent.nativeElement.querySelector('.ant-menu-item-label') : null;
    const title = ((labelEl ?? this.titleContent.nativeElement).textContent ?? '').trim();
    if (
      !this.inlineCollapsed ||
      !this.menuTooltip ||
      this.level !== 1 ||
      this.composedTooltip ||
      this.isMenuInsideDropdown ||
      !title
    ) {
      return;
    }
    if (!this.collapsedTooltip) {
      this.collapsedTooltip = this.viewContainerRef.createComponent(NzTooltipComponent);
      // The component's host only anchors the CDK overlay; keep it out of the menu list.
      this.renderer.removeChild(
        this.renderer.parentNode(this.elementRef.nativeElement),
        this.collapsedTooltip.location.nativeElement
      );
      this.collapsedTooltip.instance.setOverlayOrigin(this.elementRef);
      this.collapsedTooltip.instance.nzOverlayClassName = 'ant-menu-inline-collapsed-tooltip';
      this.collapsedTooltip.instance.nzTrigger = null;
    }
    const tooltip = this.collapsedTooltip.instance;
    tooltip.nzTitle = title;
    tooltip.nzPlacement = [this.directionality.value === 'rtl' ? 'left' : 'right'];
    tooltip.updateByDirective();
    tooltip.show();
  }

  protected hideCollapsedTooltip(): void {
    this.collapsedTooltip?.instance.hide();
  }

  /** First letter of a plain-text label of an icon-less first-level item while collapsed (`MenuItem.tsx`). */
  private updateCollapsedFallback(): void {
    if (!this.viewInit) {
      return;
    }
    this.noIconLetter.set(this.collapsedLetter());
    this.syncTitleObserver();
  }

  private collapsedLetter(): string | null {
    const content = this.titleContent.nativeElement;
    const text = content.children.length === 0 ? (content.textContent ?? '').trim() : '';
    return this.inlineCollapsed && this.level === 1 && !this.nzIcon && text ? text.charAt(0) : null;
  }

  /** While the letter can show, a label changed later (an interpolation, a translation) must refresh it. */
  private syncTitleObserver(): void {
    const watch = this.inlineCollapsed && this.level === 1 && !this.nzIcon && typeof MutationObserver !== 'undefined';
    if (watch && !this.titleObserver) {
      this.ngZone.runOutsideAngular(() => {
        this.titleObserver = new MutationObserver(() => {
          const letter = this.collapsedLetter();
          if (letter !== this.noIconLetter()) {
            this.ngZone.run(() => this.noIconLetter.set(letter));
          }
        });
        this.titleObserver.observe(this.titleContent.nativeElement, {
          characterData: true,
          childList: true,
          subtree: true
        });
      });
    } else if (!watch) {
      this.disconnectTitleObserver();
    }
  }

  private disconnectTitleObserver(): void {
    this.titleObserver?.disconnect();
    this.titleObserver = null;
  }

  /** With `nzIcon` set, a directly projected `<nz-icon>` would be a second icon; hide it. */
  private updateProjectedIcons(): void {
    this.listOfProjectedIcon?.forEach(({ nativeElement }) =>
      this.nzIcon
        ? this.renderer.setStyle(nativeElement, 'display', 'none')
        : this.renderer.removeStyle(nativeElement, 'display')
    );
    if (this.nzIcon && this.listOfProjectedIcon?.length && !this.warnedDoubleIcon) {
      this.warnedDoubleIcon = true;
      warn('`nz-menu-item` has `nzIcon` and a projected `<nz-icon>`; the projected icon is hidden.');
    }
  }

  /** clear all item selected status except this */
  clickMenuItem(e: MouseEvent): void {
    if (this.mergedDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.nzMenuService.onDescendantMenuItemClick(this);
    if (this.nzSubmenuService) {
      /** menu item inside the submenu **/
      this.nzSubmenuService.onChildMenuItemClick(this);
    } else {
      /** menu item inside the root menu **/
      this.nzMenuService.onChildMenuItemClick(this);
    }
  }

  setSelectedState(value: boolean): void {
    this.nzSelected = value;
    this.selected$.next(value);
  }

  private updateRouterActive(): void {
    if (!this.listOfRouterLink || !this.router || !this.router.navigated || !this.nzMatchRouter) {
      return;
    }
    Promise.resolve().then(() => {
      const hasActiveLinks = this.hasActiveLinks();
      if (this.nzSelected !== hasActiveLinks) {
        this.nzSelected = hasActiveLinks;
        this.setSelectedState(this.nzSelected);
        this.cdr.markForCheck();
      }
    });
  }

  private hasActiveLinks(): boolean {
    const isActiveCheckFn = this.isLinkActive(this.router!);
    return (this.routerLink && isActiveCheckFn(this.routerLink)) || this.listOfRouterLink.some(isActiveCheckFn);
  }

  private isLinkActive(router: Router): (link: RouterLink) => boolean {
    return (link: RouterLink) =>
      router.isActive(link.urlTree || '', {
        paths: this.nzMatchRouterExact ? 'exact' : 'subset',
        queryParams: this.nzMatchRouterExact ? 'exact' : 'subset',
        fragment: 'ignored',
        matrixParams: 'ignored'
      });
  }

  constructor() {
    this.router?.events
      .pipe(
        takeUntilDestroyed(),
        filter(e => e instanceof NavigationEnd)
      )
      .subscribe(() => this.updateRouterActive());
    this.destroyRef.onDestroy(() => this.disconnectTitleObserver());
  }

  ngOnInit(): void {
    /** store origin padding in padding */
    combineLatest([this.nzMenuService.mode$, this.nzMenuService.inlineIndent$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([mode, inlineIndent]) => {
        this.inlinePaddingLeft = mode === 'inline' ? this.level * inlineIndent : null;
      });

    combineLatest([this.nzMenuService.inlineCollapsed$, this.nzMenuService.disabled$, this.nzMenuService.tooltip$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([inlineCollapsed, disabled, tooltip]) => {
        [this.inlineCollapsed, this.menuDisabled, this.menuTooltip] = [inlineCollapsed, disabled, tooltip];
        if (!inlineCollapsed || !tooltip) {
          this.hideCollapsedTooltip();
        }
        this.updateCollapsedFallback();
        this.cdr.markForCheck();
      });
  }

  ngAfterViewInit(): void {
    this.viewInit = true;
    this.updateCollapsedFallback();
  }

  ngAfterContentInit(): void {
    this.listOfRouterLink.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateRouterActive());
    this.updateRouterActive();
    this.updateProjectedIcons();
    this.listOfProjectedIcon.changes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateProjectedIcons());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzSelected, nzIcon } = changes;
    if (nzSelected) {
      this.setSelectedState(this.nzSelected);
    }
    if (nzIcon) {
      this.updateProjectedIcons();
      this.updateCollapsedFallback();
    }
  }
}
