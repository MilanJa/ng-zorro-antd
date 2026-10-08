/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, linkedSignal, output, TemplateRef } from '@angular/core';

import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzShapeSCType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput, generateClassName } from 'ng-zorro-antd/core/util';

import { NzFloatButtonContentComponent } from './float-button-content.component';
import { NzFloatButtonBadge, NzFloatButtonType } from './typings';

const CLASS_NAME = 'ant-float-btn';

@Component({
  selector: 'nz-float-button',
  exportAs: 'nzFloatButton',
  imports: [NzButtonModule, NzFloatButtonContentComponent, NzBadgeModule, NgTemplateOutlet],
  template: `
    @if (!!nzHref()) {
      <a
        [target]="nzTarget()"
        [href]="nzHref()"
        nz-button
        [nzType]="nzType()"
        [class.ant-float-btn-default]="nzType() === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <ng-container *ngTemplateOutlet="contentTemplate" />
      </a>
    } @else {
      <button
        nz-button
        [nzType]="nzType()"
        [class.ant-float-btn-default]="nzType() === 'default'"
        class="ant-float-btn-inner"
        (click)="nzOnClick.emit(true)"
      >
        <ng-container *ngTemplateOutlet="contentTemplate" />
      </button>
    }
    <ng-template #contentTemplate>
      <nz-float-button-content
        [nzBadge]="nzBadge()"
        [nzIcon]="nzIcon()"
        [nzDescription]="content()"
        [nzShape]="shape()"
      />
    </ng-template>
  `,
  host: {
    '[class]': 'class()'
  }
})
export class NzFloatButtonComponent {
  readonly nzHref = input<string | null>(null);
  readonly nzTarget = input<string | null>(null);
  readonly nzType = input<NzFloatButtonType>('default');
  readonly nzIcon = input<string | TemplateRef<void> | null>(null);
  readonly nzContent = input<string | TemplateRef<void> | null>();
  /** @deprecated Use `nzContent` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDescription -> nzContent
  readonly nzDescription = input<string | TemplateRef<void> | null>(null);
  readonly nzShape = input<NzShapeSCType>('circle');
  readonly nzBadge = input<NzFloatButtonBadge | null>(null);
  readonly nzOnClick = output<boolean>();

  readonly shape = linkedSignal(() => this.nzShape());
  protected readonly content = computed(() => this.nzContent() ?? this.nzDescription());
  private readonly aliasDescription = aliasDeprecatedInput<string | TemplateRef<void>>(
    'nz-float-button',
    'nzDescription',
    'nzContent'
  );
  protected readonly dir = inject(Directionality).valueSignal;
  protected readonly class = computed<string[]>(() => {
    const dir = this.dir();
    // v6 DOM: button.ant-btn….ant-float-btn.ant-float-btn-{type}.ant-float-btn-{shape}[.ant-float-btn-icon-only]
    // (antd/es/float-button/FloatButton.js). The `ant-btn*` layer is not added to the host, where v4
    // button styles would also apply; the `-{type}`/`-{shape}`/`-icon-only` classes are additive.
    const classes = [CLASS_NAME, this.generateClass(this.nzType()), this.generateClass(this.shape())];
    if (!this.content()) {
      classes.push(`${CLASS_NAME}-icon-only`);
    }
    if (dir === 'rtl') {
      classes.push(this.generateClass(dir));
    }
    return classes;
  });

  constructor() {
    effect(() => {
      const legacy = this.nzDescription();
      if (legacy !== null && legacy !== undefined) this.aliasDescription(legacy);
    });
  }

  private generateClass(suffix: string): string {
    return generateClassName(CLASS_NAME, suffix);
  }
}
