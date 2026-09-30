/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  booleanAttribute,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import { isPresetColor, isStatusColor, presetColors, statusColors } from 'ng-zorro-antd/core/color';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzTagColor } from './typings';

@Component({
  selector: 'nz-tag',
  exportAs: 'nzTag',
  template: `
    <ng-content />
    @if (nzMode === 'closeable') {
      <nz-icon nzType="close" class="ant-tag-close-icon" tabindex="-1" (click)="closeTag($event)" />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  // `ant-tag-filled` is static, not conditioned on `nzBordered`: antd v6's own resolution
  // (node_modules/antd/es/tag/hooks/useColor.js:14-28) gives a Tag with no `variant` prop
  // 'filled' regardless of `bordered` -- `bordered` is deprecated in favour of `variant` and,
  // even when explicitly `false`, still resolves to 'filled', never 'outlined'. `nz-tag` has no
  // `nzVariant` input, so every tag renders v6's actual default unconditionally; 'outlined' and
  // 'solid' (the `-inverse` colour path) are unreachable under the current API
  // (docs/v6-api-gaps.md).
  host: {
    class: 'ant-tag ant-tag-filled',
    '[style.background-color]': `isPresetColor ? '' : nzColor`,
    '[class.ant-tag-has-color]': `nzColor && !isPresetColor`,
    '[class.ant-tag-checkable]': `nzMode === 'checkable'`,
    '[class.ant-tag-checkable-checked]': `nzChecked`,
    '[class.ant-tag-rtl]': `dir() === 'rtl'`,
    '[class.ant-tag-borderless]': `!nzBordered`,
    '(click)': 'updateCheckedStatus()'
  },
  imports: [NzIconModule]
})
export class NzTagComponent implements OnChanges {
  private renderer = inject(Renderer2);
  private el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly dir = inject(Directionality).valueSignal;

  @Input() nzMode: 'default' | 'closeable' | 'checkable' = 'default';
  @Input() nzColor?: NzTagColor;
  @Input({ transform: booleanAttribute }) nzChecked = false;
  @Input({ transform: booleanAttribute }) nzBordered = true;
  @Output() readonly nzOnClose = new EventEmitter<MouseEvent>();
  @Output() readonly nzCheckedChange = new EventEmitter<boolean>();
  isPresetColor = false;

  updateCheckedStatus(): void {
    if (this.nzMode === 'checkable') {
      this.nzChecked = !this.nzChecked;
      this.nzCheckedChange.emit(this.nzChecked);
    }
  }

  closeTag(e: MouseEvent): void {
    this.nzOnClose.emit(e);
    if (!e.defaultPrevented) {
      this.renderer.removeChild(this.renderer.parentNode(this.el), this.el);
    }
  }

  private clearPresetColor(): void {
    // /(ant-tag-(?:pink|red|...))/g
    const regexp = new RegExp(`(ant-tag-(?:${[...presetColors, ...statusColors].join('|')}))`, 'g');
    const classname = this.el.classList.toString();
    const matches: string[] = [];
    let match: RegExpExecArray | null = regexp.exec(classname);
    while (match !== null) {
      matches.push(match[1]);
      match = regexp.exec(classname);
    }
    this.el.classList.remove(...matches);
  }

  private setPresetColor(): void {
    this.clearPresetColor();
    if (!this.nzColor) {
      this.isPresetColor = false;
    } else {
      this.isPresetColor = isPresetColor(this.nzColor) || isStatusColor(this.nzColor);
    }
    if (this.isPresetColor) {
      this.el.classList.add(`ant-tag-${this.nzColor}`);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzColor } = changes;
    if (nzColor) {
      this.setPresetColor();
    }
  }
}
