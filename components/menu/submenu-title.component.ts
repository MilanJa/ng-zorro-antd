/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TemplateRef, ViewEncapsulation } from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzIsMenuInsideDropdownToken } from './menu.token';
import { NzMenuModeType, NzSubmenuTrigger } from './menu.types';

@Component({
  selector: '[nz-submenu-title]',
  exportAs: 'nzSubmenuTitle',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (nzIcon) {
      <nz-icon
        [nzType]="nzIcon"
        [class.ant-menu-item-icon]="!isMenuInsideDropdown"
        [class.ant-dropdown-menu-item-icon]="isMenuInsideDropdown"
      />
    }
    @if (noIconLetter) {
      <div class="ant-menu-inline-collapsed-noicon">{{ noIconLetter }}</div>
    } @else {
      <ng-container *nzStringTemplateOutlet="nzTitle"
        ><span class="ant-menu-title-content">{{ nzTitle }}</span></ng-container
      >
    }
    <ng-content />
    @if (isMenuInsideDropdown) {
      <span class="ant-dropdown-menu-submenu-expand-icon">
        @if (expandIcon) {
          <ng-container [ngTemplateOutlet]="expandIcon" [ngTemplateOutletContext]="{ $implicit: open }" />
        } @else {
          <nz-icon [nzType]="dir() === 'rtl' ? 'left' : 'right'" class="ant-dropdown-menu-submenu-arrow-icon" />
        }
      </span>
    } @else if (expandIcon && mode !== 'horizontal') {
      <span class="ant-menu-submenu-expand-icon">
        <ng-container [ngTemplateOutlet]="expandIcon" [ngTemplateOutletContext]="{ $implicit: open }" />
      </span>
    } @else {
      <span class="ant-menu-submenu-arrow"></span>
    }
  `,
  host: {
    '[class.ant-dropdown-menu-submenu-title]': 'isMenuInsideDropdown',
    '[class.ant-menu-submenu-title]': '!isMenuInsideDropdown',
    // While the first letter replaces the title content, the full title stays the accessible name.
    '[attr.aria-label]': 'letterOnlyTitle',
    '[attr.title]': 'letterOnlyTitle',
    '[style.padding-inline-start.px]': 'paddingLeft',
    '(click)': 'clickTitle()',
    '(mouseenter)': 'setMouseState(true)',
    '(mouseleave)': 'setMouseState(false)'
  },
  imports: [NgTemplateOutlet, NzIconModule, NzOutletModule]
})
export class NzSubMenuTitleComponent {
  protected readonly isMenuInsideDropdown = inject(NzIsMenuInsideDropdownToken);
  protected readonly dir = inject(Directionality).valueSignal;

  @Input() nzIcon: string | null = null;
  @Input() nzTitle: string | TemplateRef<void> | null = null;
  @Input() nzDisabled = false;
  @Input() noIconLetter: string | null = null;
  @Input() expandIcon: TemplateRef<{ $implicit: boolean }> | null = null;
  @Input() open = false;
  @Input() paddingLeft: number | null = null;
  @Input() mode: NzMenuModeType = 'vertical';
  @Input() nzTriggerSubMenuAction: NzSubmenuTrigger = 'hover';
  @Output() readonly toggleSubMenu = new EventEmitter();
  @Output() readonly subMenuMouseState = new EventEmitter<boolean>();

  protected get letterOnlyTitle(): string | null {
    return this.noIconLetter && typeof this.nzTitle === 'string' ? this.nzTitle : null;
  }

  protected setMouseState(state: boolean): void {
    if (!this.nzDisabled && this.nzTriggerSubMenuAction === 'hover') {
      this.subMenuMouseState.next(state);
    }
  }

  protected clickTitle(): void {
    if ((this.mode === 'inline' || this.nzTriggerSubMenuAction === 'click') && !this.nzDisabled) {
      this.subMenuMouseState.next(true);
      this.toggleSubMenu.emit();
    }
  }
}
