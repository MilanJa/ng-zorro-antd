/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, TemplateRef, ViewEncapsulation } from '@angular/core';

import { NzConfigKey, WithConfig } from 'ng-zorro-antd/core/config';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzDropdownMenuComponent, NzDropdownModule, NzPlacementType } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { NzBreadcrumb } from './breadcrumb';
import { NzBreadCrumbSeparatorComponent } from './breadcrumb-separator.component';

const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'breadcrumb';

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
        [nzPlacement]="nzOverlayPlacement ?? 'bottomLeft'"
        [nzTrigger]="nzOverlayTrigger ?? 'hover'"
      >
        <ng-template [ngTemplateOutlet]="noMenuTpl" />
        <ng-container *nzStringTemplateOutlet="dropdownIcon; let icon">
          <nz-icon [nzType]="icon" />
        </ng-container>
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
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;
  nzBreadCrumbComponent = inject(NzBreadcrumb);
  private readonly cdr = inject(ChangeDetectorRef);
  /**
   * Dropdown content of a breadcrumb item.
   */
  @Input() nzOverlay?: NzDropdownMenuComponent;
  /** Placement of the overlay; antd v6 centres it (`'bottomCenter'`). */
  @Input() @WithConfig() nzOverlayPlacement: NzPlacementType | undefined = 'bottomLeft';
  /** Icon after the crumb when `nzOverlay` is set; unset uses the parent `nz-breadcrumb`'s `nzDropdownIcon`. */
  @Input() nzDropdownIcon?: string | TemplateRef<void>;
  /**
   * Trigger of the overlay. Set by `nz-breadcrumb` from an `nzItems` entry's `dropdownProps.nzTrigger`.
   */
  @Input() nzOverlayTrigger?: 'click' | 'hover';

  /** Re-renders the item after a value it reads from the parent `nz-breadcrumb` changed. */
  markParentChanged(): void {
    this.cdr.markForCheck();
  }

  protected get dropdownIcon(): string | TemplateRef<void> {
    return this.nzDropdownIcon ?? this.nzBreadCrumbComponent.nzDropdownIcon ?? 'down';
  }
}
