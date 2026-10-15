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
  Injector,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
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
            [nzSelectedIndex]="tabIndex"
            [nzHideAll]="tabIndex === -1"
            [nzSize]="tabSize"
            [nzType]="nzTabProps?.nzType ?? 'line'"
            [nzCentered]="nzTabProps?.nzCentered ?? false"
            [nzAnimated]="nzTabProps?.nzAnimated ?? true"
            [nzTabBarExtraContent]="nzTabBarExtraContent ? cardTabBarExtra : undefined"
            (nzSelectedIndexChange)="onTabsIndexChange($event)"
          >
            @for (item of nzTabList; track item.key) {
              <nz-tab
                [nzTitle]="tabTitle(item)"
                [nzIcon]="item.icon"
                [nzDisabled]="item.disabled"
                (nzClick)="onTabClick($index)"
              />
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
  private readonly injector = inject(Injector);
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
  /** Initial key while `nzActiveTabKey` is not bound (antd `defaultActiveTabKey`). */
  @Input() nzDefaultActiveTabKey: string | null | undefined = null;
  @Input() nzTabBarExtraContent: string | TemplateRef<void> | null | undefined = null;
  @Input() nzTabProps: NzCardTabProps | null | undefined = null;
  @Output() readonly nzActiveTabKeyChange = new EventEmitter<string>();
  /** Fires after the user changes the head tab (antd `onTabChange`), not on programmatic key changes. */
  @Output() readonly nzTabChange = new EventEmitter<string>();
  @ContentChild(NzCardTabComponent, { static: false }) listOfNzCardTabComponent?: NzCardTabComponent;
  @ContentChildren(NzCardGridDirective) listOfNzCardGridDirective!: QueryList<NzCardGridDirective>;
  @ViewChild(NzTabsComponent) private headTabs?: NzTabsComponent;

  private uncontrolledKey: string | null = null;
  private mixedTabsWarned = false;

  constructor() {
    onConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME, () => this.cdr.markForCheck());
  }

  /** The bound key, else the user's last pick, else `nzDefaultActiveTabKey`, else the first item's key. */
  protected get activeKey(): string | null {
    if (this.nzActiveTabKey != null) {
      return this.nzActiveTabKey;
    }
    const items = this.nzTabList ?? [];
    const wanted = this.uncontrolledKey ?? this.nzDefaultActiveTabKey;
    return (items.find(item => item.key === wanted) ?? items[0])?.key ?? null;
  }

  /** Index of the active key in `nzTabList`; `-1` when a bound key matches no item. */
  protected get tabIndex(): number {
    const key = this.activeKey;
    return (this.nzTabList ?? []).findIndex(item => item.key === key);
  }

  /** antd's tab size: `small` for a small card, otherwise `large`, unless `nzTabProps.nzSize` is set. */
  protected get tabSize(): NzSizeLDSType {
    return this.nzTabProps?.nzSize ?? (this.nzSize === 'small' ? 'small' : 'large');
  }

  ngAfterContentChecked(): void {
    if (!this.mixedTabsWarned && this.nzTabList && this.listOfNzCardTabComponent) {
      this.mixedTabsWarned = true;
      warn(MIXED_TABS_WARNING);
    }
  }

  /** nz-tab stamps a title template with a `{ visible }` context, which a `TemplateRef<void>` label ignores. */
  protected tabTitle(item: NzCardTabItem): string | TemplateRef<NzSafeAny> {
    return item.label;
  }

  /** nz-tabs reports the index it now shows; any index other than the one the card asks for is the user's pick. */
  protected onTabsIndexChange(index: number): void {
    if (index !== this.clampTabIndex(this.tabIndex)) {
      this.pick(index);
    }
  }

  /**
   * nz-tabs reports no index change for a click on the tab it already shows. With a bound key that
   * matches no item, that tab is shown without being active, so the click is a pick.
   */
  protected onTabClick(index: number): void {
    if (this.tabIndex === -1 && index === this.headTabs?.nzSelectedIndex) {
      this.pick(index);
    }
  }

  private pick(index: number): void {
    const key = this.nzTabList?.[index]?.key;
    if (key === undefined || key === this.activeKey) {
      return;
    }
    if (this.nzActiveTabKey == null) {
      this.uncontrolledKey = key;
    } else {
      afterNextRender(() => this.followBoundKey(), { injector: this.injector });
    }
    this.nzActiveTabKeyChange.emit(key);
    this.nzTabChange.emit(key);
  }

  /** A bound key that the parent did not update takes the head tabs back after the next render. */
  private followBoundKey(): void {
    const index = this.clampTabIndex(this.tabIndex);
    if (this.headTabs && this.headTabs.nzSelectedIndex !== index) {
      this.headTabs.nzSelectedIndex = index;
      this.cdr.markForCheck();
    }
  }

  /** The index nz-tabs shows for `index`: it clamps into range, so `-1` shows the first tab. */
  private clampTabIndex(index: number): number {
    return Math.min((this.nzTabList?.length ?? 0) - 1, Math.max(index, 0));
  }
}
