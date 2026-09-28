/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { CdkScrollable } from '@angular/cdk/overlay';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { nzThemeScopeClasses } from 'ng-zorro-antd/core/theme';
import { NzI18nPipe } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPipesModule } from 'ng-zorro-antd/pipes';

import { NzModalCloseComponent } from './modal-close.component';
import { BaseModalContainerComponent } from './modal-container.directive';

@Component({
  selector: 'nz-modal-confirm-container',
  exportAs: 'nzModalConfirmContainer',
  imports: [
    NzPipesModule,
    NzI18nPipe,
    NzIconModule,
    NzModalCloseComponent,
    NzOutletModule,
    PortalModule,
    NzButtonModule
  ],
  template: `
    <div
      #modalElement
      role="document"
      class="ant-modal"
      [class]="config.nzClassName!"
      [style]="config.nzStyle!"
      [style.width]="config?.nzWidth! | nzToCssUnit"
    >
      <div class="ant-modal-content ant-modal-container">
        @if (config.nzClosable) {
          <button nz-modal-close (click)="onCloseClick()"></button>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <div class="ant-modal-confirm-body-wrapper">
            <div
              class="ant-modal-confirm-body"
              [class.ant-modal-confirm-body-has-title]="!!config.nzTitle"
              [class.ant-modal-confirm-body-no-icon]="!config.nzIconType"
            >
              <nz-icon [nzType]="config.nzIconType!" />
              <span class="ant-modal-confirm-title">
                <ng-container *nzStringTemplateOutlet="config.nzTitle">
                  <span [innerHTML]="config.nzTitle"></span>
                </ng-container>
              </span>
              <div class="ant-modal-confirm-content">
                <ng-template cdkPortalOutlet />
                @if (isStringContent) {
                  <div [innerHTML]="config.nzContent"></div>
                }
              </div>
            </div>
            <div class="ant-modal-confirm-btns">
              @if (config.nzCancelText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'cancel' || null"
                  nz-button
                  (click)="onCancel()"
                  [nzLoading]="config.nzCancelLoading"
                  [disabled]="config.nzCancelDisabled"
                >
                  {{ config.nzCancelText || ('Modal.cancelText' | nzI18n) }}
                </button>
              }
              @if (config.nzOkText !== null) {
                <button
                  [attr.cdkFocusInitial]="config.nzAutofocus === 'ok' || null"
                  nz-button
                  [nzType]="config.nzOkType!"
                  (click)="onOk()"
                  [nzLoading]="config.nzOkLoading"
                  [disabled]="config.nzOkDisabled"
                  [nzDanger]="config.nzOkDanger"
                >
                  {{ config.nzOkText || ('Modal.okText' | nzI18n) }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  hostDirectives: [CdkScrollable],
  host: {
    tabindex: '-1',
    role: 'dialog',
    '[class]': 'hostClasses()',
    '[class.ant-modal-wrap-rtl]': `dir === 'rtl'`,
    '[class.ant-modal-centered]': 'config.nzCentered',
    '[style.zIndex]': 'config.nzZIndex',
    '(click)': 'onContainerClick($event)'
  }
})
export class NzModalConfirmContainerComponent extends BaseModalContainerComponent implements OnInit {
  private readonly themeScopeClasses = nzThemeScopeClasses();

  @ViewChild(CdkPortalOutlet, { static: true }) set _portalOutlet(portalOutlet: CdkPortalOutlet) {
    this.portalOutlet = portalOutlet;
  }
  @ViewChild('modalElement', { static: true }) set _modalElementRef(elementRef: ElementRef<HTMLDivElement>) {
    this.modalElementRef = elementRef;
  }
  @Output() override readonly cancelTriggered = new EventEmitter<void>();
  @Output() override readonly okTriggered = new EventEmitter<void>();

  /** See `NzModalContainerComponent.hostClasses` for why the theme scope classes are added here. */
  protected hostClasses(): string {
    const classes = ['ant-modal-wrap', ...this.themeScopeClasses()];
    if (this.config.nzWrapClassName) {
      classes.push(this.config.nzWrapClassName);
    }
    return classes.join(' ');
  }

  ngOnInit(): void {
    this.setupMouseListeners(this.modalElementRef);
  }

  onCancel(): void {
    this.cancelTriggered.emit();
  }

  onOk(): void {
    this.okTriggered.emit();
  }
}
