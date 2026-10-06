/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  AfterContentInit,
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

import { BooleanInput, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput, toBoolean } from 'ng-zorro-antd/core/util';

import { NzStepComponent } from './step.component';

export type NzDirectionType = 'horizontal' | 'vertical';
export type NzStatusType = 'wait' | 'process' | 'finish' | 'error';
export type NzProgressDotTemplate = TemplateRef<{ $implicit: TemplateRef<void>; status: string; index: number }>;
export type NzStepsOrientation = 'horizontal' | 'vertical';
export type NzStepsTitlePlacement = 'horizontal' | 'vertical';
export type NzStepsType = 'default' | 'navigation' | 'dot';
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
  @Input() set nzOrientation(value: NzStepsOrientation) {
    this.orientationExplicit = true;
    this.orientation = value;
  }
  get nzOrientation(): NzStepsOrientation {
    return this.orientation;
  }
  /** @deprecated Use `nzOrientation` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDirection -> nzOrientation
  @Input() set nzDirection(value: NzDirectionType) {
    const mapped = this.aliasDirection(value);
    if (!this.orientationExplicit) this.orientation = mapped;
  }
  get nzDirection(): NzDirectionType {
    return this.orientation;
  }
  @Input() set nzTitlePlacement(value: NzStepsTitlePlacement) {
    this.titlePlacementExplicit = true;
    this.titlePlacementValue = value;
  }
  get nzTitlePlacement(): NzStepsTitlePlacement {
    return this.titlePlacementValue;
  }
  /** @deprecated Use `nzTitlePlacement` instead. This will be removed in v23.0.0. */
  // v6-alias: nzLabelPlacement -> nzTitlePlacement
  @Input() set nzLabelPlacement(value: 'horizontal' | 'vertical') {
    const mapped = this.aliasLabelPlacement(value);
    if (!this.titlePlacementExplicit) this.titlePlacementValue = mapped;
  }
  get nzLabelPlacement(): 'horizontal' | 'vertical' {
    return this.titlePlacementValue;
  }
  @Input() nzType: NzStepsType = 'default';
  @Input() nzVariant: NzStepsVariant = 'filled';
  @Input() nzSize: NzSizeDSType = 'default';
  @Input() nzStartIndex = 0;
  @Input() nzStatus: NzStatusType = 'process';

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
  private titlePlacementValue: NzStepsTitlePlacement = 'horizontal';
  private titlePlacementExplicit = false;
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
  get isDot(): boolean {
    return this.mergedType === 'dot';
  }
  /** Kept for code that reads it; follows `isDot`. */
  get showProcessDot(): boolean {
    return this.isDot;
  }
  get mergedOrientation(): NzStepsOrientation {
    return this.orientation;
  }
  /** antd `mergedTitlePlacement`: dot and vertical steps force it, navigation keeps titles beside the icon. */
  get titlePlacement(): NzStepsTitlePlacement {
    if (this.isDot || this.mergedOrientation === 'vertical') {
      return this.mergedOrientation === 'vertical' ? 'horizontal' : 'vertical';
    }
    return this.nzType === 'navigation' ? 'horizontal' : this.titlePlacementValue;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzStartIndex, nzDirection, nzOrientation, nzType, nzStatus, nzCurrent, nzSize } = changes;
    if (nzStartIndex || nzDirection || nzOrientation || nzType || nzStatus || nzCurrent || nzSize) {
      this.updateChildrenSteps();
    }
  }

  ngOnInit(): void {
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
      const length = this.steps.length;
      const steps = this.steps.toArray();
      steps.forEach((step, index) => {
        Promise.resolve().then(() => {
          step.nextStep = steps[index + 1] ?? null;
          step.nzSize = this.nzSize;
          step.outStatus = this.nzStatus;
          step.showProcessDot = this.isDot;
          // antd uses the legacy `progressDot` render only while the merged type is `dot`.
          step.customProcessTemplate = this.isDot ? this.customProcessDotTemplate : undefined;
          step.clickable = this.nzIndexChange.observers.length > 0;
          step.direction = this.mergedOrientation;
          step.index = index + this.nzStartIndex;
          step.currentIndex = this.nzCurrent;
          step.last = length === index + 1;
          step.markForCheck();
        });
      });
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
