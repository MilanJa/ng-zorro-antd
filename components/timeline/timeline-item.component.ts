/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';

import { TimelineService } from './timeline.service';
import { NzTimelineItemColor, NzTimelineNodeState, NzTimelinePosition, TimelineTimeDefaultColors } from './typings';

function isDefaultColor(color?: string): boolean {
  return TimelineTimeDefaultColors.findIndex(i => i === color) !== -1;
}

@Component({
  selector: 'nz-timeline-item, [nz-timeline-item]',
  exportAs: 'nzTimelineItem',
  template: `
    <ng-template #template>
      <li
        class="ant-timeline-item ant-timeline-item-wrapper ant-timeline-item-finish"
        [class.ant-timeline-item-right]="(nzPosition || position) === 'right'"
        [class.ant-timeline-item-left]="(nzPosition || position) === 'left'"
        [class.ant-timeline-item-last]="isLast"
        [class.ant-timeline-item-placement-start]="(nzPosition || position) !== 'right'"
        [class.ant-timeline-item-placement-end]="(nzPosition || position) === 'right'"
        [class.ant-timeline-item-color-red]="nzColor === 'red'"
        [class.ant-timeline-item-color-blue]="nzColor === 'blue'"
        [class.ant-timeline-item-color-green]="nzColor === 'green'"
        [class.ant-timeline-item-color-gray]="nzColor === 'gray' || nzColor === 'grey'"
        [class.ant-timeline-item-custom]="!!nzDot"
        [class.ant-timeline-item-empty-header]="!nzLabel"
        [class.ant-timeline-item-active]="node.active"
        [style.--ant-cmp-steps-item-icon-dot-color]="borderColor"
      >
        @if (nzLabel) {
          <div class="ant-timeline-item-label ant-timeline-item-header ant-timeline-item-title">
            <ng-container *nzStringTemplateOutlet="nzLabel">{{ nzLabel }}</ng-container>
          </div>
        }
        <div
          class="ant-timeline-item-tail"
          [class.ant-timeline-item-rail]="!!node.rail"
          [class.ant-timeline-item-rail-finish]="node.rail === 'finish'"
          [class.ant-timeline-item-rail-process]="node.rail === 'process'"
        ></div>
        <div
          class="ant-timeline-item-head ant-timeline-item-icon"
          [class.ant-timeline-item-head-red]="nzColor === 'red'"
          [class.ant-timeline-item-head-blue]="nzColor === 'blue'"
          [class.ant-timeline-item-head-green]="nzColor === 'green'"
          [class.ant-timeline-item-head-gray]="nzColor === 'gray'"
          [class.ant-timeline-item-head-custom]="!!nzDot"
          [style.border-color]="borderColor"
        >
          <ng-container *nzStringTemplateOutlet="nzDot">{{ nzDot }}</ng-container>
        </div>
        <div class="ant-timeline-item-content">
          <ng-content />
        </div>
      </li>
    </ng-template>
  `,
  imports: [NzOutletModule],
  encapsulation: ViewEncapsulation.None
})
export class NzTimelineItemComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);
  private timelineService = inject(TimelineService);

  @ViewChild('template', { static: false }) template!: TemplateRef<void>;

  @Input() nzPosition?: NzTimelinePosition;
  @Input() nzColor: NzTimelineItemColor = 'blue';
  @Input() nzDot?: string | TemplateRef<void>;
  @Input() nzLabel?: string | TemplateRef<void>;

  isLast = false;
  borderColor: string | null = null;
  position?: NzTimelinePosition;
  node: NzTimelineNodeState = { active: false, rail: null };

  ngOnChanges(changes: SimpleChanges): void {
    this.timelineService.markForCheck();
    const { nzColor } = changes;
    if (nzColor) {
      this.updateCustomColor();
    }
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  private updateCustomColor(): void {
    this.borderColor = isDefaultColor(this.nzColor) ? null : this.nzColor;
  }
}
