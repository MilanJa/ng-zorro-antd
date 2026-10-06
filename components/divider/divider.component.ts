/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  Component,
  Input,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  signal
} from '@angular/core';

import { warn } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import type { NzSizeLMSType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput } from 'ng-zorro-antd/core/util';

export type NzDividerOrientation = 'horizontal' | 'vertical';
export type NzDividerTitlePlacement = 'start' | 'end' | 'center';
/** The physical title placements `nzOrientation` accepted before it meant the axis. */
export type NzDividerLegacyTitlePlacement = 'left' | 'right' | 'center';

@Component({
  selector: 'nz-divider',
  exportAs: 'nzDivider',
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (nzText) {
      @if (axis() === 'horizontal') {
        <div class="ant-divider-rail ant-divider-rail-start"></div>
      }
      <span
        class="ant-divider-inner-text"
        [style.margin-inline-start]="hasMarginStart() ? titleMargin() : null"
        [style.margin-inline-end]="hasMarginEnd() ? titleMargin() : null"
      >
        <ng-container *nzStringTemplateOutlet="nzText">{{ nzText }}</ng-container>
      </span>
      @if (axis() === 'horizontal') {
        <div class="ant-divider-rail ant-divider-rail-end"></div>
      }
    }
  `,
  host: {
    class: 'ant-divider',
    '[class.ant-divider-horizontal]': `axis() === 'horizontal'`,
    '[class.ant-divider-vertical]': `axis() === 'vertical'`,
    '[class.ant-divider-with-text]': `nzText`,
    '[class.ant-divider-plain]': `nzPlain`,
    '[class.ant-divider-with-text-left]': `nzText && physicalPlacement() === 'left'`,
    '[class.ant-divider-with-text-right]': `nzText && physicalPlacement() === 'right'`,
    '[class.ant-divider-with-text-center]': `nzText && titlePlacement() === 'center'`,
    '[class.ant-divider-with-text-start]': `nzText && titlePlacement() === 'start'`,
    '[class.ant-divider-with-text-end]': `nzText && titlePlacement() === 'end'`,
    '[class.ant-divider-no-default-orientation-margin-start]': `hasMarginStart()`,
    '[class.ant-divider-no-default-orientation-margin-end]': `hasMarginEnd()`,
    '[class.ant-divider-rail]': `!nzText`,
    '[class.ant-divider-dashed]': `nzDashed || nzVariant === 'dashed'`,
    '[class.ant-divider-dotted]': `nzVariant === 'dotted'`,
    '[class.ant-divider-sm]': `nzSize === 'small'`,
    '[class.ant-divider-md]': `nzSize === 'middle'`
  },
  imports: [NzOutletModule]
})
export class NzDividerComponent {
  @Input() nzText?: string | TemplateRef<void>;

  /** @deprecated Use `nzOrientation` instead. This will be removed in v23.0.0. */
  // v6-alias: nzType -> nzOrientation
  @Input()
  set nzType(value: NzDividerOrientation) {
    const mapped = this.aliasType(value);
    if (!this.axisExplicit) {
      this.axis.set(mapped);
    }
  }
  get nzType(): NzDividerOrientation {
    return this.axis();
  }

  /**
   * Whether the line is horizontal or vertical. The values `'left' | 'right' | 'center'` (this input's
   * meaning before antd v6) are forwarded to `nzTitlePlacement` with a deprecation warning.
   */
  // v6-alias: nzOrientation -> nzTitlePlacement
  @Input()
  set nzOrientation(value: NzDividerOrientation | NzDividerLegacyTitlePlacement) {
    if (value === 'horizontal' || value === 'vertical') {
      this.axisExplicit = true;
      this.axis.set(value);
    } else if (value === 'left' || value === 'right' || value === 'center') {
      const legacy = this.aliasPlacement(value);
      if (!this.placementExplicit) {
        this.placement.set(legacy);
      }
    } else {
      warn(`\`nzOrientation\` on \`nz-divider\` accepts 'horizontal' or 'vertical'; ignoring "${value}".`);
    }
  }
  get nzOrientation(): NzDividerOrientation {
    return this.axis();
  }

  @Input()
  set nzTitlePlacement(value: NzDividerTitlePlacement) {
    this.placementExplicit = true;
    this.placement.set(value);
  }
  get nzTitlePlacement(): NzDividerTitlePlacement {
    return this.titlePlacement();
  }

  /** antd's `orientationMargin`: numbers and unitless numeric strings are px. */
  @Input()
  set nzTitleMargin(value: number | string | null | undefined) {
    this.margin.set(value ?? null);
  }
  get nzTitleMargin(): number | string | null {
    return this.margin();
  }

  @Input() nzVariant: 'dashed' | 'dotted' | 'solid' = 'solid';
  @Input() nzSize: NzSizeLMSType | undefined;
  @Input({ transform: booleanAttribute }) nzDashed = false;
  @Input({ transform: booleanAttribute }) nzPlain = false;

  protected readonly dir = inject(Directionality).valueSignal;
  protected readonly axis = signal<NzDividerOrientation>('horizontal');
  private axisExplicit = false;
  private readonly placement = signal<NzDividerTitlePlacement | 'left' | 'right'>('center');
  private placementExplicit = false;
  private readonly margin = signal<number | string | null>(null);
  private readonly aliasType = aliasDeprecatedInput<NzDividerOrientation>('nz-divider', 'nzType', 'nzOrientation');
  private readonly aliasPlacement = aliasDeprecatedInput<NzDividerLegacyTitlePlacement>(
    'nz-divider',
    'nzOrientation (left/right/center)',
    'nzTitlePlacement'
  );

  /**
   * The logical title placement antd v6 derives from a physical `left`/`right` and the direction
   * (`divider/index.js`, `mergedTitlePlacement`): its `-with-text-start|end` classes size the rails.
   */
  protected readonly titlePlacement = computed<NzDividerTitlePlacement>(() => {
    const placement = this.placement();
    if (placement === 'left') {
      return this.dir() === 'rtl' ? 'end' : 'start';
    }
    if (placement === 'right') {
      return this.dir() === 'rtl' ? 'start' : 'end';
    }
    return placement;
  });

  /** The physical side the v4 sheet's `-with-text-left|right` rules size; v4 has no logical names. */
  protected readonly physicalPlacement = computed<NzDividerLegacyTitlePlacement>(() => {
    const placement = this.placement();
    if (placement === 'left' || placement === 'right' || placement === 'center') {
      return placement;
    }
    return (placement === 'start') !== (this.dir() === 'rtl') ? 'left' : 'right';
  });

  protected readonly hasMarginStart = computed(() => this.margin() !== null && this.titlePlacement() === 'start');
  protected readonly hasMarginEnd = computed(() => this.margin() !== null && this.titlePlacement() === 'end');
  protected readonly titleMargin = computed(() => {
    const margin = this.margin();
    return typeof margin === 'number' || /^\d+$/.test(margin ?? '') ? `${margin}px` : margin;
  });
}
