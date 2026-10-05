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

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzTimelineItemComponent } from './timeline-item.component';
import { TimelineService } from './timeline.service';
import { NzTimelineMode, NzTimelineNodeState, NzTimelineNodeStatus, NzTimelinePosition } from './typings';

@Component({
  selector: 'nz-timeline',
  exportAs: 'nzTimeline',
  encapsulation: ViewEncapsulation.None,
  providers: [TimelineService],
  template: `
    <ul
      class="ant-timeline ant-timeline-vertical ant-timeline-dot ant-timeline-title-horizontal ant-timeline-outlined"
      [class.ant-timeline-layout-alternate]="nzMode === 'alternate' || nzMode === 'custom' || hasLabelItem"
      [class.ant-timeline-label]="hasLabelItem"
      [class.ant-timeline-right]="!hasLabelItem && nzMode === 'right'"
      [class.ant-timeline-alternate]="nzMode === 'alternate' || nzMode === 'custom'"
      [class.ant-timeline-pending]="!!nzPending"
      [class.ant-timeline-reverse]="nzReverse"
      [class.ant-timeline-rtl]="dir() === 'rtl'"
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
          class="ant-timeline-item ant-timeline-item-pending ant-timeline-item-wrapper ant-timeline-item-process ant-timeline-item-custom ant-timeline-item-empty-header"
          [class.ant-timeline-item-active]="pendingNode.active"
        >
          <div
            class="ant-timeline-item-tail"
            [class.ant-timeline-item-rail]="!!pendingNode.rail"
            [class.ant-timeline-item-rail-finish]="pendingNode.rail === 'finish'"
            [class.ant-timeline-item-rail-process]="pendingNode.rail === 'process'"
          ></div>
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
          <div class="ant-timeline-item-content">
            <ng-container *nzStringTemplateOutlet="nzPending">
              {{ isPendingBoolean ? '' : nzPending }}
            </ng-container>
          </div>
        </li>
      }
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

  @Input() nzMode: NzTimelineMode = 'left';
  @Input() nzPending?: string | boolean | TemplateRef<void>;
  @Input() nzPendingDot?: string | TemplateRef<void>;
  @Input({ transform: booleanAttribute }) nzReverse: boolean = false;

  isPendingBoolean: boolean = false;
  timelineItems: NzTimelineItemComponent[] = [];
  hasLabelItem = false;
  protected pendingNode: NzTimelineNodeState = { active: false, rail: null };

  ngOnChanges(changes: SimpleChanges): void {
    const { nzMode, nzReverse, nzPending } = changes;

    if (simpleChangeActivated(nzMode) || simpleChangeActivated(nzReverse) || simpleChangeActivated(nzPending)) {
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
  }

  ngAfterContentInit(): void {
    this.updateChildren();

    this.listOfItems.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateChildren();
    });
  }

  private updateChildren(): void {
    const nodes = timelineNodeStates(this.listOfItems?.length ?? 0, !!this.nzPending, this.nzReverse);
    this.pendingNode = nodes.pending;

    if (this.listOfItems && this.listOfItems.length) {
      const length = this.listOfItems.length;
      let hasLabelItem = false;

      this.listOfItems.forEach((item: NzTimelineItemComponent, index: number) => {
        item.isLast = !this.nzReverse ? index === length - 1 : index === 0;
        item.position = getInferredTimelineItemPosition(index, this.nzMode);
        item.node = nodes.items[this.nzReverse ? length - 1 - index : index];

        if (!hasLabelItem && item.nzLabel) {
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

/**
 * Node states in display order (`items` already reversed when `reverse`), as antd's Timeline passes
 * them to `@rc-component/steps`: the pending node is shown last (first when reversed) with status
 * `process`, every other node `finish`; `current` is the last node shown; a rail under each node but
 * the last takes the next node's status, or the node's own when reversed (`railFollowPrevStatus: reverse`).
 */
function timelineNodeStates(
  itemCount: number,
  pending: boolean,
  reverse: boolean
): { items: NzTimelineNodeState[]; pending: NzTimelineNodeState } {
  const statuses: NzTimelineNodeStatus[] = Array.from({ length: itemCount }, () => 'finish');
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

function getInferredTimelineItemPosition(index: number, mode: NzTimelineMode): NzTimelinePosition | undefined {
  if (mode === 'custom') {
    return undefined;
  } else if (mode === 'left' || mode === 'right') {
    return mode;
  } else {
    return mode === 'alternate' && index % 2 === 0 ? 'left' : 'right';
  }
}
