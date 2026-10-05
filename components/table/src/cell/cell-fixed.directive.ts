/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Directive, effect, ElementRef, inject, Input, OnChanges, Renderer2, untracked } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
  selector: 'td[nzRight],th[nzRight],td[nzLeft],th[nzLeft]',
  host: {
    '[class.ant-table-cell-fix-right]': `isFixedRight`,
    '[class.ant-table-cell-fix-left]': `isFixedLeft`,
    // v6's `@rc-component/table` `Cell/index.js` draws the sticky box (position, z-index,
    // background) off `ant-table-cell-fix`/`-fix-start`/`-fix-end` rather than the v4
    // `-fix-left`/`-fix-right` pair, which v6 keeps only for a few compat selectors
    // (selection header background, sorter hover background) with no position/background rule
    // of their own. Unlike `-fix-left`/`-fix-right`, which stay physical, `-fix-start`/`-fix-end`
    // follow rc-table's own logical notion of "start"/"end" (`isFixedStart`/`isFixedEnd` below),
    // which swaps under `dir="rtl"`.
    '[class.ant-table-cell-fix]': `isFixed`,
    '[class.ant-table-cell-fix-start]': `isFixedStart`,
    '[class.ant-table-cell-fix-end]': `isFixedEnd`,
    '[style.position]': `isFixed? 'sticky' : null`
  }
})
export class NzCellFixedDirective implements OnChanges {
  private renderer = inject(Renderer2);
  private el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  private directionality = inject(Directionality);

  @Input() nzRight: string | boolean = false;
  @Input() nzLeft: string | boolean = false;
  @Input() colspan: number | null = null;
  @Input() colSpan: number | null = null;
  changes$ = new Subject<void>();
  isAutoLeft = false;
  isAutoRight = false;
  isFixedLeft = false;
  isFixedRight = false;
  isFixed = false;
  private isFirstRight = false;
  private isLastLeft = false;

  constructor() {
    // The shadow-eligibility classes depend on the direction (`isFixedStart`/`isFixedEnd`) but are
    // set imperatively, only when the row recomputes its boundary cells; re-derive them when the
    // direction changes at runtime so they follow the `-fix-start`/`-fix-end` host bindings.
    effect(() => {
      this.directionality.valueSignal();
      untracked(() => this.updateShadowClasses());
    });
  }

  /**
   * rc-table's own notion of "start"/"end" (`Cell/index.js`'s `isFixedStart`/`isFixedEnd`): the
   * physically-left fixed side in ltr, the physically-right one in rtl (and the other way for
   * `isFixedEnd`) -- used by the `-fix-start`/`-fix-end` host classes above and by
   * `setIsFirstRight`/`setIsLastLeft` below to pick which shadow-eligibility class a physical
   * boundary cell gets.
   */
  get isFixedStart(): boolean {
    return this.directionality.valueSignal() === 'rtl' ? this.isFixedRight : this.isFixedLeft;
  }

  get isFixedEnd(): boolean {
    return this.directionality.valueSignal() === 'rtl' ? this.isFixedLeft : this.isFixedRight;
  }

  setAutoLeftWidth(autoLeft: string | null): void {
    this.renderer.setStyle(this.el, 'left', autoLeft);
  }

  setAutoRightWidth(autoRight: string | null): void {
    this.renderer.setStyle(this.el, 'right', autoRight);
  }

  setIsFirstRight(isFirstRight: boolean): void {
    this.isFirstRight = isFirstRight;
    this.setFixClass(isFirstRight, 'ant-table-cell-fix-right-first');
    this.updateShadowClasses();
  }

  setIsLastLeft(isLastLeft: boolean): void {
    this.isLastLeft = isLastLeft;
    this.setFixClass(isLastLeft, 'ant-table-cell-fix-left-last');
    this.updateShadowClasses();
  }

  /**
   * v6's `fixedStartShadow`/`fixedEndShadow` props (eligibility for the scroll shadow) are true for a
   * physical boundary cell on rc-table's logical side: the first fixed-right cell is the logical end
   * in ltr and the start in rtl, the last fixed-left cell the other way round. The `-show` half
   * that the ping state gates is toggled separately in
   * `NzTableInnerScrollComponent.setScrollPositionClassName`.
   */
  private updateShadowClasses(): void {
    const isBoundary = this.isFirstRight || this.isLastLeft;
    this.setFixClass(isBoundary && this.isFixedStart, 'ant-table-cell-fix-start-shadow');
    this.setFixClass(isBoundary && this.isFixedEnd, 'ant-table-cell-fix-end-shadow');
  }

  private setFixClass(flag: boolean, className: string): void {
    // the setFixClass function may call many times, so remove it first.
    this.renderer.removeClass(this.el, className);

    if (flag) {
      this.renderer.addClass(this.el, className);
    }
  }

  ngOnChanges(): void {
    this.setIsFirstRight(false);
    this.setIsLastLeft(false);
    this.isAutoLeft = this.nzLeft === '' || this.nzLeft === true;
    this.isAutoRight = this.nzRight === '' || this.nzRight === true;
    this.isFixedLeft = this.nzLeft !== false;
    this.isFixedRight = this.nzRight !== false;
    this.isFixed = this.isFixedLeft || this.isFixedRight;
    const validatePx = (value: string | boolean): string | null => {
      if (typeof value === 'string' && value !== '') {
        return value;
      } else {
        return null;
      }
    };
    this.setAutoLeftWidth(validatePx(this.nzLeft));
    this.setAutoRightWidth(validatePx(this.nzRight));
    this.changes$.next();
  }
}
