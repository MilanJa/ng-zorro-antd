/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { warnDeprecation } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { aliasDeprecatedInput } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzTimelineItemComponent } from './timeline-item.component';
import { TimelineService } from './timeline.service';
import {
  NzTimelineMode,
  NzTimelineNodeState,
  NzTimelineNodeStatus,
  NzTimelineOrientation,
  NzTimelinePlacement,
  NzTimelineVariant,
  toTimelinePlacement
} from './typings';

@Component({
  selector: 'nz-timeline',
  exportAs: 'nzTimeline',
  encapsulation: ViewEncapsulation.None,
  providers: [TimelineService],
  template: `
    <ul
      class="ant-timeline ant-timeline-dot"
      [class.ant-timeline-vertical]="!horizontal"
      [class.ant-timeline-horizontal]="horizontal"
      [class.ant-timeline-title-horizontal]="!horizontal"
      [class.ant-timeline-title-vertical]="horizontal"
      [class.ant-timeline-outlined]="nzVariant !== 'filled'"
      [class.ant-timeline-filled]="nzVariant === 'filled'"
      [class.ant-timeline-layout-alternate]="
        mode === 'alternate' || (!horizontal && (mode === 'custom' || hasLabelItem))
      "
      [class.ant-timeline-label]="hasLabelItem"
      [class.ant-timeline-right]="!hasLabelItem && mode === 'end'"
      [class.ant-timeline-alternate]="mode === 'alternate' || mode === 'custom'"
      [class.ant-timeline-pending]="!!nzPending"
      [class.ant-timeline-reverse]="nzReverse"
      [class.ant-timeline-rtl]="dir() === 'rtl'"
      [style.--ant-timeline-head-span]="headSpan"
      [style.--ant-timeline-head-span-ptg]="headSpanPtg"
    >
      <!-- pending dot (reversed) -->
      @if (nzReverse) {
        <ng-container [ngTemplateOutlet]="pendingTemplate" />
      }
      <!-- timeline items -->
      @for (item of timelineItems; track item) {
        <ng-template [ngTemplateOutlet]="item.template" />
      }
      @if (!nzReverse) {
        <ng-container [ngTemplateOutlet]="pendingTemplate" />
      }
      <!-- pending dot -->
    </ul>
    <ng-template #pendingTemplate>
      @if (nzPending) {
        <li
          class="ant-timeline-item ant-timeline-item-pending ant-timeline-item-process ant-timeline-item-custom ant-timeline-item-empty-header"
          [class.ant-timeline-item-wrapper]="!horizontal"
          [class.ant-timeline-item-active]="pendingNode.active"
        >
          @if (horizontal) {
            <div class="ant-timeline-item-wrapper">
              <ng-container [ngTemplateOutlet]="pendingIconTpl" />
              <div class="ant-timeline-item-section">
                <div class="ant-timeline-item-header">
                  @if (pendingNode.rail) {
                    <div
                      class="ant-timeline-item-rail ant-timeline-item-tail"
                      [class]="'ant-timeline-item-rail-' + pendingNode.rail"
                    ></div>
                  }
                </div>
                <div class="ant-timeline-item-content"><ng-container [ngTemplateOutlet]="pendingContentTpl" /></div>
              </div>
            </div>
          } @else {
            <div
              class="ant-timeline-item-tail"
              [class.ant-timeline-item-rail]="!!pendingNode.rail"
              [class.ant-timeline-item-rail-finish]="pendingNode.rail === 'finish'"
              [class.ant-timeline-item-rail-process]="pendingNode.rail === 'process'"
            ></div>
            <ng-container [ngTemplateOutlet]="pendingIconTpl" />
            <div class="ant-timeline-item-content"><ng-container [ngTemplateOutlet]="pendingContentTpl" /></div>
          }
        </li>
      }
    </ng-template>
    <ng-template #pendingIconTpl>
      <div
        class="ant-timeline-item-head ant-timeline-item-head-custom ant-timeline-item-head-blue ant-timeline-item-icon"
      >
        <ng-container *nzStringTemplateOutlet="nzPendingDot">
          {{ nzPendingDot }}
          @if (!nzPendingDot) {
            <nz-icon nzType="loading" />
          }
        </ng-container>
      </div>
    </ng-template>
    <ng-template #pendingContentTpl>
      <ng-container *nzStringTemplateOutlet="nzPending">
        {{ isPendingBoolean ? '' : nzPending }}
      </ng-container>
    </ng-template>
    <!-- Grasp items -->
    <ng-content />
  `,
  imports: [NgTemplateOutlet, NzOutletModule, NzIconModule]
})
export class NzTimelineComponent implements AfterContentInit, OnChanges, OnInit {
  private cdr = inject(ChangeDetectorRef);
  private timelineService = inject(TimelineService);
  protected readonly dir = inject(Directionality).valueSignal;
  private destroyRef = inject(DestroyRef);

  @ContentChildren(NzTimelineItemComponent) listOfItems!: QueryList<NzTimelineItemComponent>;

  // v6-alias: nzMode -> nzMode
  @Input() set nzMode(value: NzTimelineMode) {
    this.modeInput = value;
    if (value === 'left' || value === 'right') this.aliasModeValue(value);
    this.mode = value === 'left' || value === 'right' ? toTimelinePlacement(value) : (value ?? 'start');
  }
  get nzMode(): NzTimelineMode {
    return this.modeInput;
  }
  @Input() nzOrientation: NzTimelineOrientation = 'vertical';
  @Input() nzVariant: NzTimelineVariant = 'outlined';
  @Input() nzTitleSpan?: number | string;
  /** @deprecated Add a last `nz-timeline-item` with `nzLoading` instead. This will be removed in v23.0.0. */
  // v6-alias: nzPending -> nzLoading
  @Input() set nzPending(value: string | boolean | TemplateRef<void> | undefined) {
    if (value) warnPendingDeprecation('nzPending');
    this.pending = value;
  }
  get nzPending(): string | boolean | TemplateRef<void> | undefined {
    return this.pending;
  }
  /** @deprecated Set `nzIcon` on a last `nz-timeline-item` with `nzLoading` instead. This will be removed in v23.0.0. */
  // v6-alias: nzPendingDot -> nzIcon
  @Input() set nzPendingDot(value: string | TemplateRef<void> | undefined) {
    if (value) warnPendingDeprecation('nzPendingDot');
    this.pendingDot = value;
  }
  get nzPendingDot(): string | TemplateRef<void> | undefined {
    return this.pendingDot;
  }
  @Input({ transform: booleanAttribute }) nzReverse: boolean = false;

  protected mode: NzTimelinePlacement | 'alternate' | 'custom' = 'start';
  private modeInput: NzTimelineMode = 'start';
  private pending?: string | boolean | TemplateRef<void>;
  private pendingDot?: string | TemplateRef<void>;
  private readonly aliasModeValue = aliasDeprecatedInput<NzTimelineMode>(
    'nz-timeline',
    'nzMode="left|right"',
    'nzMode="start|end"'
  );

  protected get horizontal(): boolean {
    return this.nzOrientation === 'horizontal';
  }
  protected get headSpan(): string | null {
    return this.mode !== 'alternate' && typeof this.nzTitleSpan === 'number' ? String(this.nzTitleSpan) : null;
  }
  protected get headSpanPtg(): string | null {
    return this.mode !== 'alternate' && typeof this.nzTitleSpan === 'string' ? this.nzTitleSpan : null;
  }

  isPendingBoolean: boolean = false;
  timelineItems: NzTimelineItemComponent[] = [];
  hasLabelItem = false;
  protected pendingNode: NzTimelineNodeState = { active: false, rail: null };

  ngOnChanges(changes: SimpleChanges): void {
    const { nzMode, nzReverse, nzPending, nzOrientation } = changes;

    if ([nzMode, nzReverse, nzPending, nzOrientation].some(simpleChangeActivated)) {
      this.updateChildren();
    }

    if (nzPending) {
      this.isPendingBoolean = nzPending.currentValue === true;
    }
  }

  ngOnInit(): void {
    this.timelineService.check$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cdr.markForCheck();
    });
    this.timelineService.refresh$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateChildren();
    });
  }

  ngAfterContentInit(): void {
    this.updateChildren();

    this.listOfItems.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateChildren();
    });
  }

  private updateChildren(): void {
    const statuses = (this.listOfItems?.toArray() ?? []).map((item): NzTimelineNodeStatus =>
      item.nzLoading ? 'process' : 'finish'
    );
    const nodes = timelineNodeStates(statuses, !!this.nzPending, this.nzReverse);
    this.pendingNode = nodes.pending;

    if (this.listOfItems && this.listOfItems.length) {
      const length = this.listOfItems.length;
      let hasLabelItem = false;

      this.listOfItems.forEach((item: NzTimelineItemComponent, index: number) => {
        item.isLast = !this.nzReverse ? index === length - 1 : index === 0;
        item.inferredPlacement = getInferredTimelinePlacement(index, this.mode);
        item.horizontal = this.horizontal;
        item.node = nodes.items[this.nzReverse ? length - 1 - index : index];

        if (!hasLabelItem && item.nzTitle) {
          hasLabelItem = true;
        }

        item.detectChanges();
      });

      this.timelineItems = this.nzReverse ? this.listOfItems.toArray().reverse() : this.listOfItems.toArray();
      this.hasLabelItem = hasLabelItem;
    } else {
      this.timelineItems = [];
      this.hasLabelItem = false;
    }

    this.cdr.markForCheck();
  }
}

function warnPendingDeprecation(name: 'nzPending' | 'nzPendingDot'): void {
  warnDeprecation(
    `\`${name}\` on \`nz-timeline\` is deprecated, add a last item with nzLoading instead. This will be removed in v23.0.0.`
  );
}

/**
 * Node states in display order (`items` already reversed when `reverse`), as antd's Timeline passes
 * them to `@rc-component/steps`: the pending node is shown last (first when reversed) with status
 * `process`, every other node keeps its own status (`finish`, or `process` for a loading item); a rail
 * under each node but the last takes the next node's status, or the node's own when reversed
 * (`railFollowPrevStatus: reverse`).
 */
function timelineNodeStates(
  itemStatuses: NzTimelineNodeStatus[],
  pending: boolean,
  reverse: boolean
): { items: NzTimelineNodeState[]; pending: NzTimelineNodeState } {
  const statuses = reverse ? [...itemStatuses].reverse() : [...itemStatuses];
  if (pending) {
    if (reverse) {
      statuses.unshift('process');
    } else {
      statuses.push('process');
    }
  }
  const states = statuses.map((status, index): NzTimelineNodeState => {
    const last = index === statuses.length - 1;
    return { active: last, rail: last ? null : reverse ? status : statuses[index + 1] };
  });
  const pendingState = pending ? (reverse ? states.shift()! : states.pop()!) : { active: false, rail: null };
  return { items: states, pending: pendingState };
}

function simpleChangeActivated(simpleChange?: SimpleChange): boolean {
  return !!(simpleChange && (simpleChange.previousValue !== simpleChange.currentValue || simpleChange.isFirstChange()));
}

function getInferredTimelinePlacement(
  index: number,
  mode: NzTimelinePlacement | 'alternate' | 'custom'
): NzTimelinePlacement | undefined {
  if (mode === 'custom') {
    return undefined;
  } else if (mode === 'start' || mode === 'end') {
    return mode;
  } else {
    return index % 2 === 0 ? 'start' : 'end';
  }
}
