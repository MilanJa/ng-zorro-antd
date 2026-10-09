/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  numberAttribute,
  inject,
  signal
} from '@angular/core';

import { NzConfigKey, NzConfigService, onConfigChangeEventForComponent, WithConfig } from 'ng-zorro-antd/core/config';
import { warn } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgStyleInterface } from 'ng-zorro-antd/core/types';
import {
  aliasDeprecatedInput,
  isNotNil,
  isPlainObject,
  numberAttributeWithZeroFallback
} from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';

import {
  NzProgressCirclePath,
  NzProgressColorGradient,
  NzProgressFormatter,
  NzProgressGapPositionType,
  NzProgressGradientProgress,
  NzProgressPercentPosition,
  NzProgressSize,
  NzProgressStatusType,
  NzProgressStepItem,
  NzProgressStrokeColorType,
  NzProgressStrokeLinecapType,
  NzProgressTypeType
} from './typings';
import { getSize, handleCircleGradient, handleLinearGradient, isBrightColor } from './utils';

let gradientIdSeed = 0;

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'progress';
const DEFAULT_CIRCLE_WIDTH = 132;
/** antd `Circle.tsx` `CIRCLE_MIN_STROKE_WIDTH` (px). */
const CIRCLE_MIN_STROKE_WIDTH = 3;
/** A v6-only token on `:root`: present only when the v6 stylesheet is loaded. */
const V6_PROBE_TOKEN = '--ant-progress-remaining-color';
const statusIconNameMap = new Map([
  ['success', 'check'],
  ['exception', 'close']
]);
const statusColorMap = new Map([
  ['normal', '#108ee9'],
  ['exception', '#ff5500'],
  ['success', '#87d068']
]);
const defaultFormatter: NzProgressFormatter = (p: number): string => `${p}%`;

@Component({
  selector: 'nz-progress',
  exportAs: 'nzProgress',
  encapsulation: ViewEncapsulation.None,
  imports: [NzIconModule, NzOutletModule, NgTemplateOutlet],
  template: `
    <ng-template #progressInfoTemplate>
      @if (nzShowInfo) {
        <span
          class="ant-progress-text ant-progress-indicator"
          [class.ant-progress-indicator-start]="isPureLine && percentAlign === 'start'"
          [class.ant-progress-indicator-center]="isPureLine && percentAlign === 'center'"
          [class.ant-progress-indicator-end]="nzType === 'line' && (isSteps || percentAlign === 'end')"
          [class.ant-progress-indicator-inner]="isPureLine && percentType === 'inner'"
          [class.ant-progress-indicator-outer]="nzType === 'line' && (isSteps || percentType === 'outer')"
          [class.ant-progress-indicator-bright]="isPureLine && percentType === 'inner' && strokeIsBright"
        >
          @if ((status === 'exception' || status === 'success') && !nzFormat && percentType !== 'inner') {
            <nz-icon [nzType]="icon" />
          } @else {
            <ng-container *nzStringTemplateOutlet="formatter; context: { $implicit: nzPercent }; let formatter">
              {{ formatter(nzPercent) }}
            </ng-container>
          }
        </span>
      }
    </ng-template>

    <div
      [class]="'ant-progress ant-progress-status-' + status"
      [class.ant-progress-line]="nzType === 'line'"
      [class.ant-progress-line-align-start]="isPureLine && percentAlign === 'start'"
      [class.ant-progress-line-align-center]="isPureLine && percentAlign === 'center'"
      [class.ant-progress-line-align-end]="isPureLine && percentAlign === 'end'"
      [class.ant-progress-line-position-inner]="isPureLine && percentType === 'inner'"
      [class.ant-progress-line-position-outer]="isPureLine && percentType === 'outer'"
      [class.ant-progress-small]="nzSize === 'small'"
      [class.ant-progress-default]="nzSize === 'default' || nzSize === 'medium'"
      [class.ant-progress-show-info]="nzShowInfo"
      [class.ant-progress-circle]="isCircleStyle"
      [class.ant-progress-inline-circle]="nzType === 'circle' && sizeOverride !== null && circleWidth <= 20"
      [class.ant-progress-steps]="isSteps"
      [class.ant-progress-rtl]="dir() === 'rtl'"
    >
      @if (nzType === 'line') {
        <div [style.display]="'contents'">
          <!-- normal line style; antd v6's root is a flex container with no wrapper around
               ant-progress-body, so this v4-only structural div must not take part in that
               flex layout (display: contents removes its own box, matching the flat v6 DOM) -->
          @if (isSteps) {
            <div class="ant-progress-steps-outer ant-progress-steps-body">
              @for (step of steps; track $index) {
                <div
                  class="ant-progress-steps-item"
                  [class.ant-progress-steps-item-active]="$index < activeStepsCount"
                  [style]="step"
                ></div>
              }
              <ng-template [ngTemplateOutlet]="progressInfoTemplate" />
            </div>
          } @else {
            <div
              class="ant-progress-outer ant-progress-body"
              [class.ant-progress-body-layout-bottom]="percentAlign === 'center' && percentType === 'outer'"
              [style.width]="bodyWidth"
            >
              <div class="ant-progress-inner ant-progress-rail" [style.height.px]="strokeWidth">
                <div
                  class="ant-progress-bg ant-progress-track"
                  [style.width.%]="nzPercent"
                  [style.border-radius]="nzStrokeLinecap === 'round' ? '100px' : '0'"
                  [style.background]="!isGradient ? nzStrokeColor : null"
                  [style.background-image]="isGradient ? lineGradient : null"
                  [style.height.px]="strokeWidth"
                >
                  @if (infoSlot === 'track') {
                    <ng-template [ngTemplateOutlet]="progressInfoTemplate" />
                  }
                </div>
                @if (nzSuccessPercent || nzSuccessPercent === 0) {
                  <div
                    class="ant-progress-success-bg ant-progress-track ant-progress-track-success"
                    [style.width.%]="nzSuccessPercent"
                    [style.border-radius]="nzStrokeLinecap === 'round' ? '100px' : '0'"
                    [style.height.px]="strokeWidth"
                  ></div>
                }
              </div>
              @if (infoSlot === 'body') {
                <ng-template [ngTemplateOutlet]="progressInfoTemplate" />
              }
            </div>
            @if (infoSlot === 'after') {
              <ng-template [ngTemplateOutlet]="progressInfoTemplate" />
            }
          }
        </div>
      }
      <!-- line progress -->

      <!-- circle / dashboard progress -->

      @if (isCircleStyle) {
        <div
          [style.width.px]="circleWidth"
          [style.height.px]="circleWidth"
          [style.fontSize.px]="circleWidth * 0.15 + 6"
          class="ant-progress-inner ant-progress-body"
          [class.ant-progress-circle-gradient]="isGradient"
        >
          <svg class="ant-progress-circle " viewBox="0 0 100 100">
            @if (isGradient) {
              <defs>
                <linearGradient [id]="'gradient-' + gradientId" x1="100%" y1="0%" x2="0%" y2="0%">
                  @for (i of circleGradient; track $index) {
                    <stop [attr.offset]="i.offset" [attr.stop-color]="i.color" />
                  }
                </linearGradient>
              </defs>
            }

            <path
              class="ant-progress-circle-trail ant-progress-circle-rail"
              stroke="#f3f3f3"
              fill-opacity="0"
              [attr.stroke-width]="strokeWidth"
              [attr.d]="pathString"
              [style]="trailPathStyle"
            />
            @for (p of progressCirclePath; track $index) {
              <path
                class="ant-progress-circle-path"
                fill-opacity="0"
                [attr.d]="pathString"
                [attr.stroke-linecap]="nzStrokeLinecap"
                [attr.stroke]="p.stroke"
                [attr.stroke-width]="nzPercent ? strokeWidth : 0"
                [style]="p.strokePathStyle"
              />
            }
          </svg>
          <ng-template [ngTemplateOutlet]="progressInfoTemplate" />
        </div>
      }
    </div>
  `
})
export class NzProgressComponent implements OnChanges {
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;

  private readonly nzConfigService = inject(NzConfigService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platform = inject(Platform);
  protected readonly dir = inject(Directionality).valueSignal;

  @Input() @WithConfig() nzShowInfo: boolean = true;

  /** @deprecated Use `nzSize` instead. This will be removed in v23.0.0. */
  // v6-alias: nzWidth -> nzSize
  @Input()
  set nzWidth(value: number | undefined) {
    this.widthAlias = value === undefined ? undefined : this.aliasWidth(value);
  }
  get nzWidth(): number {
    return this.circleWidth;
  }

  @Input() @WithConfig() nzStrokeColor?: NzProgressStrokeColorType = undefined;

  /**
   * A preset name (also settable through the global config), or as in antd v6 a number,
   * `[width, height]` or `{ width, height }`, which override `nzWidth` and `nzStrokeWidth`.
   */
  @Input()
  set nzSize(value: NzProgressSize | undefined) {
    this.sizeValue = value;
  }
  get nzSize(): NzProgressSize {
    return this.sizeValue ?? this.nzConfigService.getConfigForComponent('progress')?.nzSize ?? 'default';
  }

  @Input() nzFormat?: NzProgressFormatter;
  @Input({ transform: numberAttributeWithZeroFallback }) nzSuccessPercent?: number;
  @Input({ transform: numberAttribute }) nzPercent: number = 0;
  @Input({ transform: numberAttributeWithZeroFallback }) @WithConfig() nzStrokeWidth?: number;
  @Input({ transform: numberAttributeWithZeroFallback }) @WithConfig() nzGapDegree?: number;
  @Input() nzStatus?: NzProgressStatusType;
  @Input() nzType: NzProgressTypeType = 'line';
  @Input() @WithConfig() nzGapPosition: NzProgressGapPositionType = 'top';
  @Input() @WithConfig() nzStrokeLinecap: NzProgressStrokeLinecapType = 'round';

  @Input({ transform: numberAttribute }) nzSteps: number = 0;

  /** Where a line progress without steps shows its value. `type: 'inner'` needs the v6 stylesheet. */
  @Input() nzPercentPosition?: NzProgressPercentPosition;

  steps: NzProgressStepItem[] = [];

  /** Number of leading step items considered active (v6's `ant-progress-steps-item-active`). */
  activeStepsCount = 0;

  /** Gradient style when `nzType` is `line`. */
  lineGradient: string | null = null;

  /** If user uses gradient color. */
  isGradient = false;

  /** If the linear progress is a step progress. */
  isSteps = false;

  /** antd v6's `strokeColorIsBright`, for the `-indicator-bright` class. */
  strokeIsBright = false;

  /**
   * Each progress whose `nzType` is circle or dashboard should have unique id to
   * define `<linearGradient>`.
   */
  gradientId = gradientIdSeed++;

  /** Paths to rendered in the template. */
  progressCirclePath: NzProgressCirclePath[] = [];
  circleGradient?: Array<{ offset: string; color: string }>;
  trailPathStyle: NgStyleInterface | null = null;
  pathString?: string;
  icon!: string;

  /**
   * Whether the v6 stylesheet is loaded, probed once after the first render. The indicator only moves
   * into the body or the track under it; the default stylesheet has no rule for those positions.
   */
  protected readonly v6Styles = signal(false);

  private sizeValue: NzProgressSize | undefined = undefined;
  private widthAlias: number | undefined = undefined;
  private readonly aliasWidth = aliasDeprecatedInput<number>('nz-progress', 'nzWidth', 'nzSize');

  get formatter(): NzProgressFormatter {
    return this.nzFormat || defaultFormatter;
  }

  get status(): NzProgressStatusType {
    return this.nzStatus || this.inferredStatus;
  }

  /** `nzSize` as a number, `[width, height]` or `{ width, height }`; a preset name keeps today's sizing. */
  get sizeOverride(): Exclude<NzProgressSize, string> | null {
    const size = this.sizeValue;
    return size === undefined || typeof size === 'string' ? null : size;
  }

  get strokeWidth(): number {
    const size = this.sizeOverride;
    if (size !== null && this.nzType === 'line') {
      return getSize(size, this.isSteps ? 'step' : 'line', { steps: this.nzSteps, strokeWidth: this.nzStrokeWidth })[1];
    }
    if (size !== null && this.isCircleStyle && !this.nzStrokeWidth) {
      return Math.max((CIRCLE_MIN_STROKE_WIDTH / this.circleWidth) * 100, 6);
    }
    return this.nzStrokeWidth || (this.nzType === 'line' && this.nzSize !== 'small' ? 8 : 6);
  }

  /** Canvas width of a circle or dashboard: a numeric `nzSize` (or an array's first number) wins over `nzWidth`. */
  get circleWidth(): number {
    const size = this.sizeOverride;
    if (typeof size === 'number') {
      return size;
    }
    if (Array.isArray(size)) {
      const [width] = getSize(size, 'circle');
      if (typeof width === 'number' && width > 0) {
        return width;
      }
    }
    return this.widthAlias ?? DEFAULT_CIRCLE_WIDTH;
  }

  /** Inline width of a line body (antd `Line.tsx`: `width > 0 ? width : '100%'`). */
  get bodyWidth(): string | null {
    const size = this.sizeOverride;
    if (size === null || !this.isPureLine) {
      return null;
    }
    const [width] = getSize(size, 'line', { strokeWidth: this.nzStrokeWidth });
    return width > 0 ? `${width}px` : null;
  }

  get isCircleStyle(): boolean {
    return this.nzType === 'circle' || this.nzType === 'dashboard';
  }

  get isPureLine(): boolean {
    return this.nzType === 'line' && !this.isSteps;
  }

  get percentAlign(): 'start' | 'center' | 'end' {
    return this.nzPercentPosition?.align ?? 'end';
  }

  /** The resolved position: `inner` falls back to `outer` without the v6 stylesheet. */
  get percentType(): 'inner' | 'outer' {
    return this.nzPercentPosition?.type === 'inner' && this.v6Styles() ? 'inner' : 'outer';
  }

  /** `after`: today's DOM (after the body); `body`: antd's outer slot; `track`: antd's inner slot. */
  get infoSlot(): 'after' | 'body' | 'track' {
    if (!this.isPureLine || !this.v6Styles()) {
      return 'after';
    }
    if (this.percentType === 'inner') {
      return 'track';
    }
    return this.percentAlign === 'end' ? 'after' : 'body';
  }

  private cachedStatus: NzProgressStatusType = 'normal';
  private inferredStatus: NzProgressStatusType = 'normal';

  constructor() {
    onConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME, () => {
      this.updateIcon();
      this.setStrokeColor();
      this.getCirclePaths();
    });
    afterNextRender(() => {
      const el = this.host.nativeElement;
      this.v6Styles.set(
        this.platform.isBrowser && el.isConnected && getComputedStyle(el).getPropertyValue(V6_PROBE_TOKEN).trim() !== ''
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {
      nzSteps,
      nzGapPosition,
      nzStrokeLinecap,
      nzStrokeColor,
      nzGapDegree,
      nzType,
      nzStatus,
      nzPercent,
      nzSuccessPercent,
      nzStrokeWidth,
      nzSize,
      nzWidth
    } = changes;

    if (nzStatus) {
      this.cachedStatus = this.nzStatus || this.cachedStatus;
    }

    if (nzPercent || nzSuccessPercent) {
      const fillAll = parseInt(this.nzPercent.toString(), 10) >= 100;
      if (fillAll) {
        if ((isNotNil(this.nzSuccessPercent) && this.nzSuccessPercent! >= 100) || this.nzSuccessPercent === undefined) {
          this.inferredStatus = 'success';
        }
      } else {
        this.inferredStatus = this.cachedStatus;
      }
    }

    if (nzStatus || nzPercent || nzSuccessPercent || nzStrokeColor) {
      this.updateIcon();
    }

    if (nzStrokeColor) {
      this.setStrokeColor();
    }

    if ((nzSize || nzType) && this.isCircleStyle) {
      this.warnCircleSize();
    }

    if (
      nzGapPosition ||
      nzStrokeLinecap ||
      nzGapDegree ||
      nzType ||
      nzPercent ||
      nzStrokeColor ||
      nzStrokeWidth ||
      nzSize ||
      nzWidth
    ) {
      this.getCirclePaths();
    }

    if (nzPercent || nzSteps || nzStrokeWidth || nzSize) {
      this.isSteps = this.nzSteps > 0;
      if (this.isSteps) {
        this.getSteps();
      }
    }
  }

  /** antd `progress.tsx`: circle and dashboard accept only a number or a preset as `size`. */
  private warnCircleSize(): void {
    const size = this.sizeOverride;
    if (Array.isArray(size)) {
      warn('Type "circle" and "dashboard" do not accept array as `nzSize`, please use number or preset size instead.');
    } else if (isPlainObject(size)) {
      warn('Type "circle" and "dashboard" do not accept object as `nzSize`, please use number or preset size instead.');
    }
  }

  private updateIcon(): void {
    const ret = statusIconNameMap.get(this.status);
    this.icon = ret ? ret + (this.isCircleStyle ? '-o' : '-circle-fill') : '';
  }

  /**
   * Calculate step render configs.
   */
  private getSteps(): void {
    const current = Math.floor(this.nzSteps * (this.nzPercent / 100));
    this.activeStepsCount = current;
    const size = this.sizeOverride;
    const stepWidth =
      size === null
        ? this.nzSize === 'small'
          ? 2
          : 14
        : getSize(size, 'step', { steps: this.nzSteps, strokeWidth: this.nzStrokeWidth })[0] / this.nzSteps;

    const steps = [];

    for (let i = 0; i < this.nzSteps; i++) {
      let color;
      if (i <= current - 1) {
        color = this.nzStrokeColor;
      }
      const stepStyle = {
        backgroundColor: `${color}`,
        width: `${stepWidth}px`,
        height: `${this.strokeWidth}px`
      };
      steps.push(stepStyle);
    }

    this.steps = steps;
  }

  /**
   * Calculate paths when the type is circle or dashboard.
   */
  private getCirclePaths(): void {
    if (!this.isCircleStyle) {
      return;
    }

    const values = isNotNil(this.nzSuccessPercent) ? [this.nzSuccessPercent!, this.nzPercent] : [this.nzPercent];

    // Calculate shared styles.
    const radius = 50 - this.strokeWidth / 2;
    const gapPosition = this.nzGapPosition || (this.nzType === 'circle' ? 'top' : 'bottom');
    const len = Math.PI * 2 * radius;
    const gapDegree = this.nzGapDegree || (this.nzType === 'circle' ? 0 : 75);

    let beginPositionX = 0;
    let beginPositionY = -radius;
    let endPositionX = 0;
    let endPositionY = radius * -2;

    switch (gapPosition) {
      case 'left':
        beginPositionX = -radius;
        beginPositionY = 0;
        endPositionX = radius * 2;
        endPositionY = 0;
        break;
      case 'right':
        beginPositionX = radius;
        beginPositionY = 0;
        endPositionX = radius * -2;
        endPositionY = 0;
        break;
      case 'bottom':
        beginPositionY = radius;
        endPositionY = radius * 2;
        break;
      default:
    }

    this.pathString = `M 50,50 m ${beginPositionX},${beginPositionY}
       a ${radius},${radius} 0 1 1 ${endPositionX},${-endPositionY}
       a ${radius},${radius} 0 1 1 ${-endPositionX},${endPositionY}`;

    this.trailPathStyle = {
      strokeDasharray: `${len - gapDegree}px ${len}px`,
      strokeDashoffset: `-${gapDegree / 2}px`,
      transition: 'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s'
    };

    // Calculate styles for each path.
    this.progressCirclePath = values
      .map((value, index) => {
        const isSuccessPercent = values.length === 2 && index === 0;
        return {
          stroke: this.isGradient && !isSuccessPercent ? `url(#gradient-${this.gradientId})` : null,
          strokePathStyle: {
            stroke: !this.isGradient
              ? isSuccessPercent
                ? statusColorMap.get('success')
                : (this.nzStrokeColor as string)
              : null,
            transition:
              'stroke-dashoffset .3s ease 0s, stroke-dasharray .3s ease 0s, stroke .3s, stroke-width .06s ease .3s',
            strokeDasharray: `${((value || 0) / 100) * (len - gapDegree)}px ${len}px`,
            strokeDashoffset: `-${gapDegree / 2}px`
          }
        };
      })
      .reverse();
  }

  private setStrokeColor(): void {
    const color = this.nzStrokeColor;
    const isGradient = (this.isGradient = !!color && typeof color !== 'string');
    this.strokeIsBright = isBrightColor(color);
    if (isGradient && !this.isCircleStyle) {
      this.lineGradient = handleLinearGradient(color as NzProgressColorGradient);
    } else if (isGradient && this.isCircleStyle) {
      this.circleGradient = handleCircleGradient(this.nzStrokeColor as NzProgressGradientProgress);
    } else {
      this.lineGradient = null;
      this.circleGradient = [];
    }
  }
}
