/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';

import { NzConfigKey, WithConfig } from 'ng-zorro-antd/core/config';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzDropdownMenuComponent, NzDropdownModule, NzPlacementType } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzBreadcrumb } from './breadcrumb';
import { NzBreadCrumbSeparatorComponent } from './breadcrumb-separator.component';

@Component({
  selector: 'nz-breadcrumb-item',
  exportAs: 'nzBreadcrumbItem',
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, NzBreadCrumbSeparatorComponent, NzDropdownModule, NzIconModule, NzOutletModule],
  host: {
    class: 'ant-breadcrumb-item'
  },
  template: `
    @if (!!nzOverlay) {
      <span
        class="ant-breadcrumb-overlay-link"
        nz-dropdown
        [nzDropdownMenu]="nzOverlay"
        [nzPlacement]="nzOverlayPlacement"
      >
        <ng-template [ngTemplateOutlet]="noMenuTpl" />
        <nz-icon nzType="down" />
      </span>
    } @else {
      <ng-template [ngTemplateOutlet]="noMenuTpl" />
    }

    @if (nzBreadCrumbComponent.nzSeparator) {
      <nz-breadcrumb-separator>
        <ng-container *nzStringTemplateOutlet="nzBreadCrumbComponent.nzSeparator">
          {{ nzBreadCrumbComponent.nzSeparator }}
        </ng-container>
      </nz-breadcrumb-separator>
    }

    <ng-template #noMenuTpl>
      <span class="ant-breadcrumb-link">
        <ng-content />
      </span>
    </ng-template>
  `
})
export class NzBreadCrumbItemComponent {
  readonly _nzModuleName: NzConfigKey = 'breadcrumb';
  nzBreadCrumbComponent = inject(NzBreadcrumb);
  /**
   * Dropdown content of a breadcrumb item.
   */
  @Input() nzOverlay?: NzDropdownMenuComponent;
  /** Placement of the overlay; antd v6 centres it (`'bottomCenter'`). */
  @Input() @WithConfig() nzOverlayPlacement: NzPlacementType = 'bottomLeft';
}
