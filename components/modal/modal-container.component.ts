/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { CdkDrag, CdkDragEnd, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/overlay';
import { CdkPortalOutlet, PortalModule } from '@angular/cdk/portal';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { nzThemeScopeClasses } from 'ng-zorro-antd/core/theme';
import { NzPipesModule } from 'ng-zorro-antd/pipes';

import { NzModalCloseComponent } from './modal-close.component';
import { BaseModalContainerComponent } from './modal-container.directive';
import { NzModalFooterComponent } from './modal-footer.component';
import { NzModalTitleComponent } from './modal-title.component';

@Component({
  selector: 'nz-modal-container',
  exportAs: 'nzModalContainer',
  imports: [
    NzModalCloseComponent,
    NzModalTitleComponent,
    PortalModule,
    NzModalFooterComponent,
    NzPipesModule,
    CdkDrag,
    CdkDragHandle
  ],
  hostDirectives: [CdkScrollable],
  template: `
    <div
      #modalElement
      cdkDrag
      cdkDragBoundary=".cdk-overlay-container"
      [cdkDragDisabled]="!config.nzDraggable"
      (cdkDragEnded)="onDragEnded($event)"
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
        @if (config.nzTitle) {
          <div nz-modal-title cdkDragHandle [style.cursor]="config.nzDraggable ? 'move' : 'auto'"></div>
        }

        <div class="ant-modal-body" [style]="config.nzBodyStyle!">
          <ng-template cdkPortalOutlet />
          @if (isStringContent) {
            <div [innerHTML]="config.nzContent"></div>
          }
        </div>
        @if (config.nzFooter !== null) {
          <div
            nz-modal-footer
            [modalRef]="modalRef"
            (cancelTriggered)="onCloseClick()"
            (okTriggered)="onOkClick()"
          ></div>
        }
      </div>
    </div>
  `,
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
export class NzModalContainerComponent extends BaseModalContainerComponent implements OnInit {
  private readonly themeScopeClasses = nzThemeScopeClasses();

  @ViewChild(CdkPortalOutlet, { static: true }) set _portalOutlet(portalOutlet: CdkPortalOutlet) {
    this.portalOutlet = portalOutlet;
  }
  @ViewChild('modalElement', { static: true }) set _modalElementRef(elementRef: ElementRef<HTMLDivElement>) {
    this.modalElementRef = elementRef;
  }
  @ViewChild(NzModalFooterComponent) private modalFooter?: NzModalFooterComponent;

  /**
   * Root host class list: the base `ant-modal-wrap` class, the caller's `nzWrapClassName` (unchanged
   * from before), and the scope classes of the enclosing `[nzTheme]` (if any) so a scoped theme reaches
   * the modal, which is rendered into the CDK overlay container, outside the DOM subtree it scopes.
   */
  protected hostClasses(): string {
    const classes = ['ant-modal-wrap', ...this.themeScopeClasses()];
    if (this.config.nzWrapClassName) {
      classes.push(this.config.nzWrapClassName);
    }
    return classes.join(' ');
  }

  override markForCheck(): void {
    super.markForCheck();
    this.modalFooter?.markForCheck();
  }

  ngOnInit(): void {
    this.setupMouseListeners(this.modalElementRef);
  }

  protected onDragEnded(event: CdkDragEnd): void {
    const element = this.modalElementRef.nativeElement;
    const dragPosition = event.source.getFreeDragPosition();
    const { top, left } = getComputedStyle(element);
    // Persist the drag offset as layout offsets (the modal is `position: relative`) and clear
    // the CDK drag transform, otherwise the zoom-out exit animation would override the
    // `translate3d` transform and make the modal jump back to the center before closing.
    this.renderer.setStyle(element, 'top', coerceCssPixelValue((parseFloat(top) || 0) + dragPosition.y));
    this.renderer.setStyle(element, 'left', coerceCssPixelValue((parseFloat(left) || 0) + dragPosition.x));
    event.source.reset();
  }
}
