/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  inject
} from '@angular/core';

import { NzConfigKey, onConfigChangeEventForComponent, WithConfig } from 'ng-zorro-antd/core/config';
import { warn } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgStyleInterface, NzSafeAny, NzSizeDSType, NzSizeLDSType } from 'ng-zorro-antd/core/types';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabComponent, NzTabsComponent } from 'ng-zorro-antd/tabs';

import { NzCardGridDirective } from './card-grid.directive';
import { NzCardTabComponent } from './card-tab.component';
import { NzCardTabItem, NzCardTabProps } from './typings';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'card';
const MIXED_TABS_WARNING = '`nz-card` renders `nzTabList` and ignores the projected `nz-card-tab`; use one of them.';

@Component({
  selector: 'nz-card',
  exportAs: 'nzCard',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (nzTitle || nzExtra || nzTabList || listOfNzCardTabComponent) {
      <div class="ant-card-head">
        <div class="ant-card-head-wrapper">
          @if (nzTitle) {
            <div class="ant-card-head-title">
              <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
            </div>
          }
          @if (nzExtra) {
            <div class="ant-card-extra">
              <ng-container *nzStringTemplateOutlet="nzExtra">{{ nzExtra }}</ng-container>
            </div>
          }
        </div>
        @if (nzTabList) {
          <nz-tabs
            class="ant-card-head-tabs"
            [nzActiveKey]="activeKey"
            [nzSize]="tabSize"
            [nzType]="nzTabProps?.nzType ?? 'line'"
            [nzCentered]="nzTabProps?.nzCentered ?? false"
            [nzAnimated]="nzTabProps?.nzAnimated ?? true"
            [nzTabBarExtraContent]="nzTabBarExtraContent ? cardTabBarExtra : undefined"
            (nzActiveKeyChange)="onActiveKeyChange($event)"
          >
            @for (item of nzTabList; track item.key) {
              <nz-tab [nzKey]="item.key" [nzTitle]="tabTitle(item)" [nzIcon]="item.icon" [nzDisabled]="item.disabled" />
            }
          </nz-tabs>
          <ng-template #cardTabBarExtra>
            <ng-container *nzStringTemplateOutlet="nzTabBarExtraContent">{{ nzTabBarExtraContent }}</ng-container>
          </ng-template>
        } @else if (listOfNzCardTabComponent) {
          <ng-template [ngTemplateOutlet]="listOfNzCardTabComponent.template" />
        }
      </div>
    }

    @if (nzCover) {
      <div class="ant-card-cover">
        <ng-template [ngTemplateOutlet]="nzCover" />
      </div>
    }

    <div class="ant-card-body" [style]="nzBodyStyle">
      @if (nzLoading) {
        <nz-skeleton [nzActive]="true" [nzTitle]="false" [nzParagraph]="{ rows: 4 }" />
      } @else {
        <ng-content />
      }
    </div>
    @if (nzActions.length) {
      <ul class="ant-card-actions">
        @for (action of nzActions; track $index) {
          <li [style.width.%]="100 / $count">
            <span><ng-template [ngTemplateOutlet]="action" /></span>
          </li>
        }
      </ul>
    }
  `,
  host: {
    class: 'ant-card',
    '[class.ant-card-loading]': 'nzLoading',
    '[class.ant-card-bordered]': 'nzBordered',
    '[class.ant-card-hoverable]': 'nzHoverable',
    '[class.ant-card-small]': 'nzSize === "small"',
    '[class.ant-card-contain-grid]': 'listOfNzCardGridDirective && listOfNzCardGridDirective.length',
    '[class.ant-card-type-inner]': 'nzType === "inner"',
    '[class.ant-card-contain-tabs]': '!!nzTabList?.length || !!listOfNzCardTabComponent',
    '[class.ant-card-rtl]': `dir() === 'rtl'`
  },
  imports: [NzOutletModule, NgTemplateOutlet, NzSkeletonModule, NzTabsComponent, NzTabComponent]
})
export class NzCardComponent implements AfterContentChecked {
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly dir = inject(Directionality).valueSignal;

  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  @Input({ transform: booleanAttribute }) @WithConfig() nzBordered: boolean = true;
  @Input({ transform: booleanAttribute }) nzLoading = false;
  @Input({ transform: booleanAttribute }) @WithConfig() nzHoverable: boolean = false;
  @Input() nzBodyStyle: NgStyleInterface | null = null;
  @Input() nzCover?: TemplateRef<void>;
  @Input() nzActions: Array<TemplateRef<void>> = [];
  @Input() nzType: string | 'inner' | null = null;
  @Input() @WithConfig() nzSize: NzSizeDSType = 'default';
  @Input() nzTitle?: string | TemplateRef<void>;
  @Input() nzExtra?: string | TemplateRef<void>;
  /** Head tabs (antd `tabList`); while set, a projected `nz-card-tab` is ignored. */
  @Input() nzTabList: NzCardTabItem[] | null | undefined = null;
  /** Controlled key of the active head tab (antd `activeTabKey`). */
  @Input() nzActiveTabKey: string | null | undefined = null;
  /** Initial key while `nzActiveTabKey` is not bound (antd `defaultActiveTabKey`); read once, when `nzTabList` first appears. */
  @Input() nzDefaultActiveTabKey: string | null | undefined = null;
  @Input() nzTabBarExtraContent: string | TemplateRef<void> | null | undefined = null;
  @Input() nzTabProps: NzCardTabProps | null | undefined = null;
  @Output() readonly nzActiveTabKeyChange = new EventEmitter<string>();
  /** Fires after the user changes the head tab (antd `onTabChange`), not on programmatic key changes. */
  @Output() readonly nzTabChange = new EventEmitter<string>();
  @ContentChild(NzCardTabComponent, { static: false }) listOfNzCardTabComponent?: NzCardTabComponent;
  @ContentChildren(NzCardGridDirective) listOfNzCardGridDirective!: QueryList<NzCardGridDirective>;

  private uncontrolledKey: string | null = null;
  private defaultKeyLatched = false;
  private latchedDefaultKey: string | null | undefined = null;
  private mixedTabsWarned = false;

  constructor() {
    onConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME, () => this.cdr.markForCheck());
  }

  /**
   * The key the head tabs show: the bound key, else the user's last pick, else `nzDefaultActiveTabKey`
   * as it was when the tab list first appeared, else the first item's key. A bound key that matches no item shows no active tab.
   */
  protected get activeKey(): string | null {
    if (this.nzActiveTabKey != null) {
      return this.nzActiveTabKey;
    }
    const items = this.nzTabList ?? [];
    const wanted = this.uncontrolledKey ?? this.latchedDefaultKey;
    return (items.find(item => item.key === wanted) ?? items[0])?.key ?? null;
  }

  /** antd's tab size: `small` for a small card, otherwise `large`, unless `nzTabProps.nzSize` is set. */
  protected get tabSize(): NzSizeLDSType {
    return this.nzTabProps?.nzSize ?? (this.nzSize === 'small' ? 'small' : 'large');
  }

  ngAfterContentChecked(): void {
    if (!this.defaultKeyLatched && this.nzTabList) {
      this.defaultKeyLatched = true;
      this.latchedDefaultKey = this.nzDefaultActiveTabKey;
    }
    if (!this.mixedTabsWarned && this.nzTabList && this.listOfNzCardTabComponent) {
      this.mixedTabsWarned = true;
      warn(MIXED_TABS_WARNING);
    }
  }

  /** nz-tab stamps a title template with a `{ visible }` context, which a `TemplateRef<void>` label ignores. */
  protected tabTitle(item: NzCardTabItem): string | TemplateRef<NzSafeAny> {
    return item.label;
  }

  /**
   * The head tabs report user picks only and keep showing the bound key, so a bound `nzActiveTabKey`
   * moves only when the parent writes the pick back; without one the card follows the pick itself.
   */
  protected onActiveKeyChange(key: string): void {
    if (this.nzActiveTabKey == null) {
      this.uncontrolledKey = key;
    }
    this.nzActiveTabKeyChange.emit(key);
    this.nzTabChange.emit(key);
  }
}
