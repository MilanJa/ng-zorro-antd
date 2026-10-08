/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  viewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgClassType, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput, fromEventOutsideAngular } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressFormatter, NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { NzStepDisplayRole } from './display-steps';

@Component({
  selector: 'nz-step',
  exportAs: 'nzStep',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #body>
      @if (!last) {
        <!-- The rail takes the status of the step it leads to, as antd's rc-steps does. -->
        <div
          class="ant-steps-item-tail ant-steps-item-rail"
          [class.ant-steps-item-rail-wait]="railStatus === 'wait'"
          [class.ant-steps-item-rail-process]="railStatus === 'process'"
          [class.ant-steps-item-rail-finish]="railStatus === 'finish'"
          [class.ant-steps-item-rail-error]="railStatus === 'error'"
        ></div>
      }
      <div class="ant-steps-item-icon">
        @if (isEllipsis) {
          <span class="ant-steps-icon"><nz-icon nzType="ellipsis" /></span>
        } @else {
          @if (!showProcessDot) {
            @if (showProgress) {
              <div class="ant-steps-progress-icon">
                <nz-progress
                  [nzPercent]="nzPercentage"
                  nzType="circle"
                  [nzWidth]="nzSize === 'small' ? 32 : 40"
                  [nzFormat]="nullProcessFormat"
                  [nzStrokeWidth]="4"
                />
              </div>
            }
            @if (nzStatus === 'finish' && !nzIcon) {
              <span class="ant-steps-icon"><nz-icon nzType="check" /></span>
            }
            @if (nzStatus === 'error') {
              <span class="ant-steps-icon"><nz-icon nzType="close" /></span>
            }
            @if ((nzStatus === 'process' || nzStatus === 'wait') && !nzIcon) {
              <span class="ant-steps-icon">
                {{ index + 1 }}
              </span>
            }
            @if (nzIcon) {
              <span class="ant-steps-icon">
                <ng-container *nzStringTemplateOutlet="nzIcon; let icon">
                  <nz-icon [nzType]="icon" />
                </ng-container>
              </span>
            }
          }
          @if (showProcessDot) {
            <span class="ant-steps-icon">
              <ng-template #processDotTemplate>
                <span class="ant-steps-icon-dot"></span>
              </ng-template>
              <ng-template
                [ngTemplateOutlet]="customProcessTemplate || processDotTemplate"
                [ngTemplateOutletContext]="{
                  $implicit: processDotTemplate,
                  status: nzStatus,
                  index: index
                }"
              />
            </span>
          }
        }
      </div>
      <div class="ant-steps-item-content ant-steps-item-section">
        <div class="ant-steps-item-title">
          <ng-container *nzStringTemplateOutlet="displayTitle">{{ displayTitle }}</ng-container>
          @if (displaySubtitle) {
            <div class="ant-steps-item-subtitle">
              <ng-container *nzStringTemplateOutlet="displaySubtitle">{{ displaySubtitle }}</ng-container>
            </div>
          }
        </div>
        <div class="ant-steps-item-description">
          <ng-container *nzStringTemplateOutlet="displayContent">{{ displayContent }}</ng-container>
        </div>
      </div>
    </ng-template>
    <!-- The tooltip (the full content of an inline step) is only created for the inline type. -->
    @if (inline) {
      <div
        #itemContainer
        class="ant-steps-item-container ant-steps-item-wrapper"
        [attr.role]="isClickable ? 'button' : null"
        [tabindex]="isClickable ? 0 : null"
        nz-tooltip
        [nzTooltipTitle]="displayContent"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </div>
    } @else {
      <div
        #itemContainer
        class="ant-steps-item-container ant-steps-item-wrapper"
        [attr.role]="isClickable ? 'button' : null"
        [tabindex]="isClickable ? 0 : null"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </div>
    }
    @if (panel) {
      <svg
        class="ant-steps-panel-arrow"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        display="none"
      >
        <path d="M 0 0 L 100 50 L 0 100" />
      </svg>
    }
  `,
  host: {
    class: 'ant-steps-item',
    '[class.ant-steps-item-wait]': 'nzStatus === "wait"',
    '[class.ant-steps-item-process]': 'nzStatus === "process"',
    '[class.ant-steps-item-finish]': 'nzStatus === "finish"',
    '[class.ant-steps-item-error]': 'nzStatus === "error"',
    '[class.ant-steps-item-active]': 'currentIndex === index',
    '[class.ant-steps-item-disabled]': 'nzDisabled || isEllipsis',
    '[class.ant-steps-item-custom]': '!!nzIcon || isEllipsis',
    // rc-steps counts antd's ellipsis `title: ''` as a title, so the ellipsis item is never `-empty-header`.
    '[class.ant-steps-item-empty-header]': '!isEllipsis && !nzTitle && !nzSubtitle',
    '[class.ant-steps-item-ellipsis]': 'isEllipsis',
    '[class.ant-steps-next-error]': '(outStatus === "error") && (currentIndex === index + 1)',
    '[style.display]': `displayRole === 'hidden' ? 'none' : null`
  },
  imports: [NzProgressModule, NzIconModule, NzOutletModule, NgTemplateOutlet, NzTooltipDirective]
})
export class NzStepComponent {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('processDotTemplate', { static: false }) processDotTemplate?: TemplateRef<void>;
  /** The container exists in one of two `@if` branches (tooltip or not), so it is tracked reactively. */
  private itemContainer = viewChild<ElementRef<HTMLElement>>('itemContainer');

  @Input() nzTitle?: string | TemplateRef<void>;
  @Input() nzSubtitle?: string | TemplateRef<void>;
  @Input() set nzContent(value: string | TemplateRef<void> | undefined) {
    this.contentExplicit = value !== undefined;
    this.content = value ?? this.descriptionAlias;
  }
  get nzContent(): string | TemplateRef<void> | undefined {
    return this.content;
  }
  /** @deprecated Use `nzContent` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDescription -> nzContent
  @Input() set nzDescription(value: string | TemplateRef<void> | undefined) {
    this.descriptionAlias = this.aliasDescription(value);
    if (!this.contentExplicit) this.content = this.descriptionAlias;
  }
  get nzDescription(): string | TemplateRef<void> | undefined {
    return this.content;
  }
  /** Emits the step's index (including `nzStartIndex`) when a step that is not disabled is clicked. */
  @Output() readonly nzClick = new EventEmitter<number>();
  content?: string | TemplateRef<void>;
  private contentExplicit = false;
  /** Last value of the deprecated `nzDescription`, the fallback when `nzContent` is unset. */
  private descriptionAlias?: string | TemplateRef<void>;
  private readonly aliasDescription = aliasDeprecatedInput<string | TemplateRef<void> | undefined>(
    'nz-step',
    'nzDescription',
    'nzContent'
  );
  private readonly ngZone = inject(NgZone);
  /** rc-steps `Step.js`: an item is a button when it has a click handler and is not disabled. */
  get isClickable(): boolean {
    return (this.clickable || this.nzClick.observed) && !this.nzDisabled && !this.isEllipsis;
  }
  @Input({ transform: booleanAttribute }) nzDisabled = false;
  @Input() nzPercentage: number | null = null;
  @Input() nzSize: NzSizeDSType = 'default';

  @Input()
  get nzStatus(): string {
    return this.ellipsisStatus ?? this._status;
  }

  set nzStatus(status: string) {
    this._status = status;
    this.isCustomStatus = true;
  }

  isCustomStatus = false;
  private _status = 'wait';
  displayRole: NzStepDisplayRole = 'visible';
  /** Set by the parent on the step that stands for a collapsed range. */
  ellipsisStatus: string | null = null;
  inline = false;
  panel = false;
  /** The status without the ellipsis override, read when the parent collapses a range. */
  get ownStatus(): string {
    return this._status;
  }
  get isEllipsis(): boolean {
    return this.displayRole === 'ellipsis';
  }
  get displayTitle(): string | TemplateRef<void> | undefined {
    return this.isEllipsis ? '' : this.nzTitle;
  }
  get displaySubtitle(): string | TemplateRef<void> | undefined {
    return this.isEllipsis ? undefined : this.nzSubtitle;
  }
  get displayContent(): string | TemplateRef<void> | undefined {
    return this.isEllipsis ? undefined : this.content;
  }

  @Input()
  get nzIcon(): NgClassType | TemplateRef<void> | undefined {
    return this._icon;
  }

  set nzIcon(value: NgClassType | TemplateRef<void> | undefined) {
    if (!(value instanceof TemplateRef)) {
      this.oldAPIIcon = typeof value === 'string' && value.indexOf('anticon') > -1;
    }
    this._icon = value;
  }

  oldAPIIcon = true;
  private _icon?: NgClassType | TemplateRef<void>;

  customProcessTemplate?: TemplateRef<{ $implicit: TemplateRef<void>; status: string; index: number }>; // Set by parent.
  direction = 'horizontal';
  index = 0;
  last = false;
  /** The following step, set by the parent; its status colours this step's rail. */
  nextStep: NzStepComponent | null = null;
  outStatus = 'process';
  showProcessDot = false;
  clickable = false;

  clickOutsideAngular$ = new Subject<number>();

  readonly nullProcessFormat: NzProgressFormatter = () => null;

  get showProgress(): boolean {
    return (
      this.nzPercentage !== null &&
      !this.nzIcon &&
      this.nzStatus === 'process' &&
      this.nzPercentage >= 0 &&
      this.nzPercentage <= 100
    );
  }

  get railStatus(): string | null {
    return this.nextStep ? this.nextStep.nzStatus : null;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  set currentIndex(current: number) {
    this._currentIndex = current;
    if (!this.isCustomStatus) {
      this._status = current > this.index ? 'finish' : current === this.index ? this.outStatus || '' : 'wait';
    }
  }

  private _currentIndex = 0;

  constructor() {
    effect(onCleanup => {
      const container = this.itemContainer()?.nativeElement;
      if (!container) return;
      const subscription = fromEventOutsideAngular(container, 'click')
        .pipe(filter(() => !this.nzDisabled && !this.isEllipsis))
        .subscribe(() => {
          // rc-steps calls the item's `onClick` first, then the root `onChange`.
          if (this.nzClick.observed) this.ngZone.run(() => this.nzClick.emit(this.index));
          if (this.clickable && this.currentIndex !== this.index) this.clickOutsideAngular$.next(this.index);
        });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  enable(): void {
    this.nzDisabled = false;
    this.cdr.markForCheck();
  }

  disable(): void {
    this.nzDisabled = true;
    this.cdr.markForCheck();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
