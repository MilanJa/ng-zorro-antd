/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Component, Input, TemplateRef, ViewEncapsulation, booleanAttribute, inject } from '@angular/core';

import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NgStyleInterface } from 'ng-zorro-antd/core/types';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

import { NzStatisticContentValueComponent } from './statistic-content-value.component';
import { NzStatisticValueType } from './typings';

@Component({
  selector: 'nz-statistic',
  exportAs: 'nzStatistic',
  encapsulation: ViewEncapsulation.None,
  imports: [NzSkeletonModule, NzStatisticContentValueComponent, NzOutletModule],
  template: `
    <!--
      Rendered unconditionally (unlike v6's Statistic.js, which skips both this and the title
      div when the title is empty): v4's .ant-statistic-title margin-bottom: 4px rule applies
      to the title div whether or not it has content, so a title-less statistic still needs the
      div present to keep that 4px gap under the default stylesheet.
    -->
    <div class="ant-statistic-header">
      <div class="ant-statistic-title">
        <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
      </div>
    </div>
    @if (nzLoading) {
      <nz-skeleton class="ant-statistic-skeleton" [nzParagraph]="false" />
    } @else {
      <div class="ant-statistic-content" [style]="nzValueStyle">
        @if (nzPrefix) {
          <span class="ant-statistic-content-prefix">
            <ng-container *nzStringTemplateOutlet="nzPrefix">{{ nzPrefix }}</ng-container>
          </span>
        }
        <nz-statistic-content-value [nzValue]="nzValue" [nzValueTemplate]="nzValueTemplate" />
        @if (nzSuffix) {
          <span class="ant-statistic-content-suffix">
            <ng-container *nzStringTemplateOutlet="nzSuffix">{{ nzSuffix }}</ng-container>
          </span>
        }
      </div>
    }
  `,
  host: {
    class: 'ant-statistic',
    '[class.ant-statistic-rtl]': `dir() === 'rtl'`
  }
})
export class NzStatisticComponent {
  protected readonly dir = inject(Directionality).valueSignal;

  @Input() nzPrefix?: string | TemplateRef<void>;
  @Input() nzSuffix?: string | TemplateRef<void>;
  @Input() nzTitle?: string | TemplateRef<void>;
  @Input() nzValue?: NzStatisticValueType;
  @Input() nzValueStyle: NgStyleInterface = {};
  @Input() nzValueTemplate?: TemplateRef<{ $implicit: NzStatisticValueType }>;
  @Input({ transform: booleanAttribute }) nzLoading: boolean = false;
}
