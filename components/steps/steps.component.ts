/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { warn } from 'ng-zorro-antd/core/logger';
import { gridResponsiveMap, NzBreakpointEnum, NzBreakpointService } from 'ng-zorro-antd/core/services';
import { BooleanInput, NzSizeDMSType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput, toBoolean } from 'ng-zorro-antd/core/util';

import { planDisplaySteps } from './display-steps';
import { NzStepComponent } from './step.component';

export type NzDirectionType = 'horizontal' | 'vertical';
export type NzStatusType = 'wait' | 'process' | 'finish' | 'error';
export type NzProgressDotTemplate = TemplateRef<{ $implicit: TemplateRef<void>; status: string; index: number }>;
export type NzStepsOrientation = 'horizontal' | 'vertical';
export type NzStepsTitlePlacement = 'horizontal' | 'vertical';
export type NzStepsType = 'default' | 'navigation' | 'dot' | 'inline' | 'panel';
export type NzStepsVariant = 'filled' | 'outlined';

@Component({
  selector: 'nz-steps',
  exportAs: 'nzSteps',
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content />`,
  host: {
    class: 'ant-steps',
    '[class.ant-steps-filled]': `nzVariant === 'filled'`,
    '[class.ant-steps-outlined]': `nzVariant === 'outlined'`,
    '[class.ant-steps-inline]': `mergedType === 'inline'`,
    '[class.ant-steps-panel]': `mergedType === 'panel'`,
    '[class.ant-steps-ellipsis]': 'nzEllipsis',
    '[class.ant-steps-max-count]': 'canApplyMaxCount',
    '[class.ant-steps-horizontal]': `mergedOrientation === 'horizontal'`,
    '[class.ant-steps-vertical]': `mergedOrientation === 'vertical'`,
    '[class.ant-steps-label-horizontal]': `mergedOrientation === 'horizontal'`,
    '[class.ant-steps-label-vertical]': `(isDot || nzTitlePlacement === 'vertical') && mergedOrientation === 'horizontal'`,
    '[class.ant-steps-title-horizontal]': `titlePlacement === 'horizontal'`,
    '[class.ant-steps-title-vertical]': `titlePlacement === 'vertical'`,
    '[class.ant-steps-dot]': 'isDot',
    '[class.ant-steps-small]': `nzSize === 'small'`,
    '[class.ant-steps-navigation]': `nzType === 'navigation'`,
    '[class.ant-steps-rtl]': `dir() === 'rtl'`,
    '[class.ant-steps-with-progress]': 'showProgress'
  }
})
export class NzStepsComponent implements OnChanges, OnInit, AfterContentInit {
  static ngAcceptInputType_nzProgressDot: BooleanInput | NzProgressDotTemplate | undefined | null;

  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  protected readonly dir = inject(Directionality).valueSignal;
  private destroyRef = inject(DestroyRef);

  @ContentChildren(NzStepComponent) steps!: QueryList<NzStepComponent>;

  @Input() nzCurrent = 0;
  @Input() set nzOrientation(value: NzStepsOrientation | undefined) {
    this.orientationExplicit = value !== undefined;
    this.orientation = value ?? this.directionAlias ?? 'horizontal';
  }
  get nzOrientation(): NzStepsOrientation {
    return this.orientation;
  }
  /** @deprecated Use `nzOrientation` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDirection -> nzOrientation
  @Input() set nzDirection(value: NzDirectionType) {
    this.directionAlias = this.aliasDirection(value);
    if (!this.orientationExplicit) this.orientation = this.directionAlias ?? 'horizontal';
  }
  get nzDirection(): NzDirectionType {
    return this.orientation;
  }
  @Input() set nzTitlePlacement(value: NzStepsTitlePlacement | undefined) {
    this.titlePlacementExplicit = value !== undefined;
    this.titlePlacementValue = value ?? this.labelPlacementAlias ?? 'horizontal';
  }
  get nzTitlePlacement(): NzStepsTitlePlacement {
    return this.titlePlacementValue;
  }
  /** @deprecated Use `nzTitlePlacement` instead. This will be removed in v23.0.0. */
  // v6-alias: nzLabelPlacement -> nzTitlePlacement
  @Input() set nzLabelPlacement(value: 'horizontal' | 'vertical') {
    this.labelPlacementAlias = this.aliasLabelPlacement(value);
    if (!this.titlePlacementExplicit) this.titlePlacementValue = this.labelPlacementAlias ?? 'horizontal';
  }
  get nzLabelPlacement(): 'horizontal' | 'vertical' {
    return this.titlePlacementValue;
  }
  @Input() nzType: NzStepsType = 'default';
  @Input() nzVariant: NzStepsVariant = 'filled';
  @Input() nzSize: NzSizeDMSType = 'default';
  @Input() nzStartIndex = 0;
  @Input() nzStatus: NzStatusType = 'process';
  /** Maximum number of steps shown (`>= 3`); hidden ranges collapse into disabled ellipsis steps. */
  @Input() nzMaxCount?: number;
  @Input({ transform: booleanAttribute }) nzEllipsis = false;
  /** Below the `xs` breakpoint the steps render vertically. */
  @Input({ transform: booleanAttribute }) nzResponsive = true;
  canApplyMaxCount = false;
  private isXs = false;
  private readonly breakpointService = inject(NzBreakpointService);

  /** @deprecated Use `nzType="dot"` instead (a template stays the dot renderer). This will be removed in v23.0.0. */
  // v6-alias: nzProgressDot -> nzType
  @Input()
  set nzProgressDot(value: boolean | NzProgressDotTemplate | undefined | null) {
    const { dot, template } = this.aliasProgressDot(value);
    this.legacyDot = dot;
    this.customProcessDotTemplate = template;
    this.updateChildrenSteps();
  }
  get nzProgressDot(): boolean | NzProgressDotTemplate {
    return this.customProcessDotTemplate ?? this.legacyDot;
  }

  @Output() readonly nzIndexChange = new EventEmitter<number>();

  private indexChangeSubscription = Subscription.EMPTY;

  showProgress = false;
  customProcessDotTemplate?: TemplateRef<{ $implicit: TemplateRef<void>; status: string; index: number }>;

  private orientation: NzStepsOrientation = 'horizontal';
  private orientationExplicit = false;
  /** Last value of the deprecated `nzDirection`, the fallback when `nzOrientation` is unset. */
  private directionAlias?: NzDirectionType;
  private titlePlacementValue: NzStepsTitlePlacement = 'horizontal';
  private titlePlacementExplicit = false;
  /** Last value of the deprecated `nzLabelPlacement`, the fallback when `nzTitlePlacement` is unset. */
  private labelPlacementAlias?: 'horizontal' | 'vertical';
  private legacyDot = false;
  private readonly aliasDirection = aliasDeprecatedInput<NzDirectionType>('nz-steps', 'nzDirection', 'nzOrientation');
  private readonly aliasLabelPlacement = aliasDeprecatedInput<'horizontal' | 'vertical'>(
    'nz-steps',
    'nzLabelPlacement',
    'nzTitlePlacement'
  );
  private readonly aliasProgressDot = aliasDeprecatedInput<
    boolean | NzProgressDotTemplate | undefined | null,
    { dot: boolean; template?: NzProgressDotTemplate }
  >('nz-steps', 'nzProgressDot', 'nzType', value =>
    value instanceof TemplateRef ? { dot: true, template: value } : { dot: toBoolean(value) }
  );

  /** antd `mergedType` (`steps/index.tsx`): a non-default `type` wins, else `progressDot` gives `dot`. */
  get mergedType(): NzStepsType {
    return this.nzType !== 'default' ? this.nzType : this.legacyDot ? 'dot' : 'default';
  }
  get isInline(): boolean {
    return this.mergedType === 'inline';
  }
  get isDot(): boolean {
    return this.mergedType === 'dot' || this.mergedType === 'inline';
  }
  /** Kept for code that reads it; follows `isDot`. */
  get showProcessDot(): boolean {
    return this.isDot;
  }
  /** antd `mergedOrientation`: panel is always horizontal; `responsive` turns `xs` screens vertical. */
  get mergedOrientation(): NzStepsOrientation {
    if (this.mergedType === 'panel') return 'horizontal';
    return (this.nzResponsive && this.isXs) || this.orientation === 'vertical' ? 'vertical' : 'horizontal';
  }
  /** antd `mergedTitlePlacement`: dot and vertical steps force it, navigation keeps titles beside the icon. */
  get titlePlacement(): NzStepsTitlePlacement {
    if (this.isDot || this.mergedOrientation === 'vertical') {
      return this.mergedOrientation === 'vertical' ? 'horizontal' : 'vertical';
    }
    return this.nzType === 'navigation' ? 'horizontal' : this.titlePlacementValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzStartIndex, nzDirection, nzOrientation, nzType, nzStatus, nzCurrent, nzSize, nzMaxCount, nzResponsive } =
      changes;
    if (nzMaxCount && this.nzMaxCount !== undefined && this.nzMaxCount < 3) {
      warn('`nzMaxCount` on `nz-steps` should be at least 3; the value is ignored.');
    }
    if (
      nzStartIndex ||
      nzDirection ||
      nzOrientation ||
      nzType ||
      nzStatus ||
      nzCurrent ||
      nzSize ||
      nzMaxCount ||
      nzResponsive
    ) {
      this.updateChildrenSteps();
    }
  }

  ngOnInit(): void {
    this.breakpointService
      .subscribe(gridResponsiveMap)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(breakpoint => {
        const xs = breakpoint === NzBreakpointEnum.xs;
        if (xs !== this.isXs) {
          this.isXs = xs;
          this.updateChildrenSteps();
          this.cdr.markForCheck();
        }
      });
    this.updateChildrenSteps();
  }

  ngAfterContentInit(): void {
    if (this.steps) {
      this.steps.changes.pipe(startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.updateHostProgressClass();
        this.updateChildrenSteps();
      });
    }
  }

  private updateHostProgressClass(): void {
    if (this.steps && !this.isDot) {
      this.showProgress = !!this.steps.toArray().find(step => step.nzPercentage !== null);
    }
  }

  private updateChildrenSteps(): void {
    if (this.steps) {
      const steps = this.steps.toArray();
      const current = this.nzCurrent - this.nzStartIndex;
      const plan = planDisplaySteps(steps.length, current, this.nzMaxCount);
      this.canApplyMaxCount = plan.canApply;
      // antd `getEllipsisStep`: error if a hidden step is explicitly `error`, else finish before current.
      const ellipsisStatus = new Map<number, NzStatusType>();
      for (const { at, prev, next } of plan.ellipses) {
        const hasError = steps.slice(prev + 1, next).some(step => step.isCustomStatus && step.ownStatus === 'error');
        ellipsisStatus.set(at, hasError ? 'error' : next - 1 < current ? 'finish' : 'wait');
      }
      const shown = steps.filter((_, index) => plan.roles[index] !== 'hidden');
      steps.forEach((step, index) => {
        Promise.resolve().then(() => {
          const order = shown.indexOf(step);
          step.displayRole = plan.roles[index];
          step.ellipsisStatus = ellipsisStatus.get(index) ?? null;
          step.nextStep = order >= 0 ? (shown[order + 1] ?? null) : null; // the rail follows the next step shown
          step.nzSize = this.nzSize;
          step.outStatus = this.nzStatus;
          step.showProcessDot = this.isDot;
          step.customProcessTemplate = this.mergedType === 'dot' ? this.customProcessDotTemplate : undefined;
          step.inline = this.isInline;
          step.panel = this.mergedType === 'panel';
          step.clickable = this.nzIndexChange.observers.length > 0;
          step.direction = this.mergedOrientation;
          step.index = index + this.nzStartIndex;
          step.currentIndex = this.nzCurrent;
          step.last = order < 0 || order === shown.length - 1;
          step.markForCheck();
        });
      });
      this.cdr.markForCheck();
      this.indexChangeSubscription.unsubscribe();
      this.indexChangeSubscription = merge(...this.steps.map(step => step.clickOutsideAngular$))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(index => {
          if (this.nzIndexChange.observers.length) {
            this.ngZone.run(() => this.nzIndexChange.emit(index));
          }
        });
    }
  }
}
