/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output, TemplateRef, ViewEncapsulation } from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { getEventWithPoint } from 'ng-zorro-antd/resizable';

import { NzSplitterCollapseOption, NzSplitterCollapsibleConfig, NzSplitterShowCollapsibleIcon } from './typings';

@Component({
  selector: '[nz-splitter-bar]',
  imports: [NgTemplateOutlet, NzOutletModule, NzIconModule],
  template: `
    @if (lazy()) {
      @let preview = active() && !!this.constrainedOffset();
      <div
        class="ant-splitter-bar-preview"
        [class.ant-splitter-bar-preview-active]="preview"
        [style.transform]="preview ? previewTransform() : null"
      ></div>
    }

    <div
      class="ant-splitter-bar-dragger"
      [class.ant-splitter-bar-dragger-disabled]="!resizable()"
      [class.ant-splitter-bar-dragger-active]="active()"
      [class.ant-splitter-bar-dragger-customize]="draggerIcon() !== undefined"
      (mousedown)="resizeStartEvent($event)"
      (touchstart)="resizeStartEvent($event)"
      (dblclick)="draggerDoubleClick.emit()"
    >
      @if (draggerIcon() !== undefined) {
        <div class="ant-splitter-bar-dragger-icon">
          <ng-container *nzStringTemplateOutlet="draggerIcon(); let icon"><nz-icon [nzType]="icon" /></ng-container>
        </div>
      }
    </div>

    @for (side of sides; track side) {
      @if (collapsible()?.[side]) {
        @let custom = collapsibleIcon()?.[side];
        <div
          class="ant-splitter-bar-collapse-bar"
          [class]="visibilityClass(side)"
          [class.ant-splitter-bar-collapse-bar-start]="side === 'start'"
          [class.ant-splitter-bar-collapse-bar-end]="side === 'end'"
          [class.ant-splitter-bar-collapse-bar-customize]="custom !== undefined"
          (click)="collapseEvent(side)"
        >
          @if (isTemplate(custom)) {
            <span
              class="ant-splitter-bar-collapse-icon"
              [class.ant-splitter-bar-collapse-start]="side === 'start'"
              [class.ant-splitter-bar-collapse-end]="side === 'end'"
              ><ng-container [ngTemplateOutlet]="custom"
            /></span>
          } @else {
            <nz-icon
              [nzType]="custom ?? defaultIcon(side)"
              class="ant-splitter-bar-collapse-icon"
              [class.ant-splitter-bar-collapse-start]="side === 'start'"
              [class.ant-splitter-bar-collapse-end]="side === 'end'"
            />
          }
        </div>
      }
    }
  `,
  host: {
    role: 'separator',
    class: 'ant-splitter-bar',
    '[attr.aria-valuenow]': 'getValidNumber(ariaNow())',
    '[attr.aria-valuemin]': 'getValidNumber(ariaMin())',
    '[attr.aria-valuemax]': 'getValidNumber(ariaMax())'
  },
  encapsulation: ViewEncapsulation.None
})
export class NzSplitterBarComponent {
  readonly ariaNow = input.required<number>();
  readonly ariaMin = input.required<number>();
  readonly ariaMax = input.required<number>();
  readonly active = input(false);
  readonly resizable = input(true);
  readonly vertical = input<boolean>();
  readonly lazy = input(false);
  readonly collapsible = input<NzSplitterCollapseOption>();
  readonly constrainedOffset = input<number>();
  readonly showStartCollapsibleIcon = input<NzSplitterShowCollapsibleIcon>('auto');
  readonly showEndCollapsibleIcon = input<NzSplitterShowCollapsibleIcon>('auto');
  readonly collapsibleIcon = input<NzSplitterCollapsibleConfig['icon']>();
  readonly draggerIcon = input<string | TemplateRef<void>>();

  readonly offsetStart = output<[x: number, y: number]>();
  readonly collapse = output<'start' | 'end'>();
  readonly draggerDoubleClick = output<void>();

  protected readonly sides = ['start', 'end'] as const;

  protected readonly previewTransform = computed(() => {
    const offset = coerceCssPixelValue(this.constrainedOffset());
    return this.vertical() ? `translateY(${offset})` : `translateX(${offset})`;
  });

  protected resizeStartEvent(event: MouseEvent | TouchEvent): void {
    if (this.resizable()) {
      const { pageX, pageY } = getEventWithPoint(event);
      this.offsetStart.emit([pageX, pageY]);
    }
  }

  protected collapseEvent(type: 'start' | 'end'): void {
    this.collapse.emit(type);
  }

  protected getValidNumber(num: number | undefined): number {
    return typeof num === 'number' && !isNaN(num) ? Math.round(num) : 0;
  }

  protected visibilityClass(side: 'start' | 'end'): string {
    const mode = side === 'start' ? this.showStartCollapsibleIcon() : this.showEndCollapsibleIcon();
    return mode === true
      ? 'ant-splitter-bar-collapse-bar-always-visible'
      : mode === false
        ? 'ant-splitter-bar-collapse-bar-always-hidden'
        : 'ant-splitter-bar-collapse-bar-hover-only';
  }

  protected defaultIcon(side: 'start' | 'end'): string {
    return this.vertical() ? (side === 'start' ? 'up' : 'down') : side === 'start' ? 'left' : 'right';
  }

  protected isTemplate(value: unknown): value is TemplateRef<void> {
    return value instanceof TemplateRef;
  }
}
