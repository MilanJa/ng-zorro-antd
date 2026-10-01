/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  booleanAttribute,
  Component,
  inject,
  Input,
  numberAttribute,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { NzNoAnimationDirective } from 'ng-zorro-antd/core/animation';
import { NgStyleInterface, NzSafeAny, NzSizeDSType } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'nz-badge-sup',
  exportAs: 'nzBadgeSup',
  encapsulation: ViewEncapsulation.None,
  imports: [NzNoAnimationDirective],
  template: `
    @if (count <= nzOverflowCount) {
      @for (n of maxNumberArray; track n; let i = $index) {
        <span
          [nzNoAnimation]="!!noAnimation?.nzNoAnimation?.()"
          class="ant-scroll-number-only"
          [style.transform]="'translateY(' + -countArray[i] * 100 + '%)'"
        >
          @if (!nzDot && countArray[i] !== undefined) {
            @for (p of countSingleArray; track p) {
              <p class="ant-scroll-number-only-unit" [class.current]="p === countArray[i]">
                {{ p }}
              </p>
            }
          }
        </span>
      }
    } @else {
      {{ nzOverflowCount }}+
    }
  `,
  host: {
    class: 'ant-scroll-number',
    // `nzColor` here is `nzStatus || presetColor || nzColor` from the parent badge, so it also
    // carries a plain custom colour (e.g. `#f50`) when neither a status nor a preset matched, and
    // it carries a status word (e.g. `success`) whether that word came from `nzStatus` or was
    // passed as `nzColor` directly -- the merged string alone cannot tell the two apart, which is
    // why `isStatusColor` is a separate flag set by the parent from `!!nzStatus`, not a lookup of
    // `nzColor` against the status-name list (a `nzColor="success"` badge is a custom colour that
    // happens to share a name with a status, not a status). antd v6's Badge.js gives the
    // preset-colour case `${prefixCls}-color-${color}` and the status case
    // `${prefixCls}-status-${status}` -- two different class prefixes, not one -- and emits
    // NEITHER for a custom colour (`isPresetColor(color, false)` is false, so only the inline
    // background/colour style applies). The compiled v4 CSS styles
    // `.ant-badge-status-<preset colour>` (there is no `.ant-badge-color-*` rule in v4) and the
    // inline `background-color` is intentionally omitted for a preset colour (the parent's
    // `mergedStyle`), so `ant-badge-status-<colour>` is kept -- v4-compat, replacement
    // `ant-badge-color-<colour>` -- for the status and preset cases only; `isStatusOrPresetColor`
    // keeps a bare custom colour from getting either class.
    '[class]': `isStatusOrPresetColor ? 'ant-badge-status-' + nzColor + (isPresetColor ? ' ant-badge-color-' + nzColor : '') : ''`,
    '[attr.title]': `nzTitle === null ? '' : nzTitle || nzCount`,
    '[style]': `nzStyle`,
    '[style.right.px]': `nzOffset && nzOffset[0] ? -nzOffset[0] : null`,
    '[style.margin-top.px]': `nzOffset && nzOffset[1] ? nzOffset[1] : null`,
    '[class.ant-badge-count]': `!nzDot`,
    '[class.ant-badge-count-sm]': `nzSize === 'small'`,
    '[class.ant-badge-dot]': `nzDot`,
    '[class.ant-badge-multiple-words]': `countArray.length >= 2`
  }
})
export class NzBadgeSupComponent implements OnInit, OnChanges {
  protected readonly noAnimation = inject(NzNoAnimationDirective, { host: true, optional: true });

  @Input() nzOffset?: [number, number];
  @Input() nzTitle?: string | null;
  @Input() nzStyle: NgStyleInterface | null = null;
  @Input() nzDot = false;
  @Input({ transform: numberAttribute }) nzOverflowCount = 99;
  @Input() nzCount?: number | TemplateRef<NzSafeAny>;
  @Input() nzSize: NzSizeDSType = 'default';
  @Input({ transform: booleanAttribute }) isPresetColor = false;
  // Set by the parent from `!!nzStatus`, not derived from `nzColor`'s value: a status word
  // reaching this component through `nzColor` (no `nzStatus` set) is a custom colour, not a
  // status, and must not be mistaken for one just because the two share a name.
  @Input({ transform: booleanAttribute }) isStatusColor = false;
  @Input() nzColor?: string;

  protected get isStatusOrPresetColor(): boolean {
    return !!this.nzColor && (this.isPresetColor || this.isStatusColor);
  }

  maxNumberArray: string[] = [];
  countArray: number[] = [];
  count: number = 0;
  protected readonly countSingleArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  private generateMaxNumberArray(): void {
    this.maxNumberArray = this.nzOverflowCount
      .toString()
      .split('')
      .map((value, index) => `${value}-${index}`);
  }

  ngOnInit(): void {
    this.generateMaxNumberArray();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzOverflowCount, nzCount } = changes;
    if (nzCount && typeof nzCount.currentValue === 'number') {
      this.count = Math.max(0, nzCount.currentValue);
      this.countArray = this.count
        .toString()
        .split('')
        .map(item => +item);
    }
    if (nzOverflowCount) {
      this.generateMaxNumberArray();
    }
  }
}
