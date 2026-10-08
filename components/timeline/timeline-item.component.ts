/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute
} from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { aliasDeprecatedInput } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { TimelineService } from './timeline.service';
import {
  NzTimelineItemColor,
  NzTimelineNodeState,
  NzTimelinePlacement,
  NzTimelinePosition,
  TimelineTimeDefaultColors,
  toTimelinePlacement
} from './typings';

function isDefaultColor(color?: string): boolean {
  return TimelineTimeDefaultColors.findIndex(i => i === color) !== -1;
}

@Component({
  selector: 'nz-timeline-item, [nz-timeline-item]',
  exportAs: 'nzTimelineItem',
  template: `
    <ng-template #template>
      <li
        class="ant-timeline-item"
        [class.ant-timeline-item-wrapper]="!horizontal"
        [class.ant-timeline-item-finish]="!nzLoading"
        [class.ant-timeline-item-process]="nzLoading"
        [class.ant-timeline-item-right]="resolvedPlacement === 'end'"
        [class.ant-timeline-item-left]="resolvedPlacement === 'start'"
        [class.ant-timeline-item-last]="isLast"
        [class.ant-timeline-item-placement-start]="resolvedPlacement !== 'end'"
        [class.ant-timeline-item-placement-end]="resolvedPlacement === 'end'"
        [class.ant-timeline-item-color-red]="nzColor === 'red'"
        [class.ant-timeline-item-color-blue]="nzColor === 'blue'"
        [class.ant-timeline-item-color-green]="nzColor === 'green'"
        [class.ant-timeline-item-color-gray]="nzColor === 'gray' || nzColor === 'grey'"
        [class.ant-timeline-item-custom]="!!nzIcon || nzLoading"
        [class.ant-timeline-item-empty-header]="!nzTitle"
        [class.ant-timeline-item-active]="node.active"
        [style.--ant-cmp-steps-item-icon-dot-color]="borderColor"
      >
        @if (horizontal) {
          <div class="ant-timeline-item-wrapper">
            <ng-container [ngTemplateOutlet]="iconTpl" />
            <div class="ant-timeline-item-section">
              <div class="ant-timeline-item-header">
                @if (nzTitle) {
                  <div class="ant-timeline-item-title ant-timeline-item-label">
                    <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
                  </div>
                }
                @if (node.rail) {
                  <div
                    class="ant-timeline-item-rail ant-timeline-item-tail"
                    [class]="'ant-timeline-item-rail-' + node.rail"
                  ></div>
                }
              </div>
              <div class="ant-timeline-item-content"><ng-container [ngTemplateOutlet]="contentTpl" /></div>
            </div>
          </div>
        } @else {
          @if (nzTitle) {
            <div class="ant-timeline-item-label ant-timeline-item-header ant-timeline-item-title">
              <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
            </div>
          }
          <div
            class="ant-timeline-item-tail"
            [class.ant-timeline-item-rail]="!!node.rail"
            [class.ant-timeline-item-rail-finish]="node.rail === 'finish'"
            [class.ant-timeline-item-rail-process]="node.rail === 'process'"
          ></div>
          <ng-container [ngTemplateOutlet]="iconTpl" />
          <div class="ant-timeline-item-content"><ng-container [ngTemplateOutlet]="contentTpl" /></div>
        }
      </li>
    </ng-template>
    <ng-template #iconTpl>
      <div
        class="ant-timeline-item-head ant-timeline-item-icon"
        [class.ant-timeline-item-head-red]="nzColor === 'red'"
        [class.ant-timeline-item-head-blue]="nzColor === 'blue'"
        [class.ant-timeline-item-head-green]="nzColor === 'green'"
        [class.ant-timeline-item-head-gray]="nzColor === 'gray'"
        [class.ant-timeline-item-head-custom]="!!nzIcon || nzLoading"
        [style.border-color]="borderColor"
      >
        <ng-container *nzStringTemplateOutlet="nzIcon">{{ nzIcon }}</ng-container>
        @if (!nzIcon && nzLoading) {
          <nz-icon nzType="loading" />
        }
      </div>
    </ng-template>
    <ng-template #contentTpl><ng-content /></ng-template>
  `,
  imports: [NgTemplateOutlet, NzOutletModule, NzIconModule],
  encapsulation: ViewEncapsulation.None
})
export class NzTimelineItemComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);
  private timelineService = inject(TimelineService);

  @ViewChild('template', { static: false }) template!: TemplateRef<void>;

  @Input() set nzTitle(value: string | TemplateRef<void> | undefined) {
    this.titleExplicit = value !== undefined;
    this.title = value ?? this.labelAlias;
  }
  get nzTitle(): string | TemplateRef<void> | undefined {
    return this.title;
  }
  /** @deprecated Use `nzTitle` instead. This will be removed in v23.0.0. */
  // v6-alias: nzLabel -> nzTitle
  @Input() set nzLabel(value: string | TemplateRef<void> | undefined) {
    this.aliasLabel(value);
    this.labelAlias = value;
    if (!this.titleExplicit) this.title = value;
  }
  get nzLabel(): string | TemplateRef<void> | undefined {
    return this.title;
  }

  @Input() set nzIcon(value: string | TemplateRef<void> | undefined) {
    this.iconExplicit = value !== undefined;
    this.icon = value ?? this.dotAlias;
  }
  get nzIcon(): string | TemplateRef<void> | undefined {
    return this.icon;
  }
  /** @deprecated Use `nzIcon` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDot -> nzIcon
  @Input() set nzDot(value: string | TemplateRef<void> | undefined) {
    this.aliasDot(value);
    this.dotAlias = value;
    if (!this.iconExplicit) this.icon = value;
  }
  get nzDot(): string | TemplateRef<void> | undefined {
    return this.icon;
  }

  // Same-name marker: the input stays, only its left/right values are deprecated (see docs/v6-migration-notes.md).
  // v6-alias: nzPlacement -> nzPlacement
  @Input() set nzPlacement(value: NzTimelinePlacement | NzTimelinePosition | undefined) {
    this.placementExplicit = value !== undefined;
    if (value === 'left' || value === 'right') this.aliasPlacementValue(value);
    this.placement = value ? toTimelinePlacement(value) : this.positionAlias;
  }
  get nzPlacement(): NzTimelinePlacement | undefined {
    return this.placement;
  }
  /** @deprecated Use `nzPlacement` instead. This will be removed in v23.0.0. */
  // v6-alias: nzPosition -> nzPlacement
  @Input() set nzPosition(value: NzTimelinePosition | NzTimelinePlacement | undefined) {
    this.aliasPosition(value);
    this.positionAlias = value && toTimelinePlacement(value);
    if (!this.placementExplicit) this.placement = this.positionAlias;
  }
  get nzPosition(): NzTimelinePlacement | undefined {
    return this.placement;
  }

  @Input() nzColor: NzTimelineItemColor = 'blue';
  @Input({ transform: booleanAttribute }) nzLoading = false;

  private title?: string | TemplateRef<void>;
  private icon?: string | TemplateRef<void>;
  private placement?: NzTimelinePlacement;
  private titleExplicit = false;
  private iconExplicit = false;
  private placementExplicit = false;
  /** Last values of the deprecated `nzLabel`, `nzDot` and `nzPosition`, the fallbacks when the new input is unset. */
  private labelAlias?: string | TemplateRef<void>;
  private dotAlias?: string | TemplateRef<void>;
  private positionAlias?: NzTimelinePlacement;
  private readonly aliasLabel = aliasDeprecatedInput<string | TemplateRef<void> | undefined>(
    'nz-timeline-item',
    'nzLabel',
    'nzTitle'
  );
  private readonly aliasDot = aliasDeprecatedInput<string | TemplateRef<void> | undefined>(
    'nz-timeline-item',
    'nzDot',
    'nzIcon'
  );
  private readonly aliasPosition = aliasDeprecatedInput<NzTimelinePosition | NzTimelinePlacement | undefined>(
    'nz-timeline-item',
    'nzPosition',
    'nzPlacement'
  );
  private readonly aliasPlacementValue = aliasDeprecatedInput<NzTimelinePosition>(
    'nz-timeline-item',
    'nzPlacement="left|right"',
    'nzPlacement="start|end"'
  );

  isLast = false;
  borderColor: string | null = null;
  /** Placement the parent derives from `nzMode`. @internal */
  inferredPlacement?: NzTimelinePlacement;
  /** Set by the parent from `nzOrientation`. @internal */
  horizontal = false;
  /**
   * Steps state antd 6 gives this node (active, rail status), set by the parent timeline.
   * @internal
   */
  node: NzTimelineNodeState = { active: false, rail: null };

  protected get resolvedPlacement(): NzTimelinePlacement | undefined {
    return this.placement ?? this.inferredPlacement;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.timelineService.markForCheck();
    const { nzColor, nzLoading } = changes;
    if (nzColor) {
      this.updateCustomColor();
    }
    if (nzLoading && !nzLoading.firstChange) {
      this.timelineService.refresh();
    }
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  private updateCustomColor(): void {
    this.borderColor = isDefaultColor(this.nzColor) ? null : this.nzColor;
  }
}
