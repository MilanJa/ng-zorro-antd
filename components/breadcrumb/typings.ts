/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TemplateRef } from '@angular/core';

import { NgStyleInterface } from 'ng-zorro-antd/core/types';
import { NzDropdownMenuComponent, NzPlacementType } from 'ng-zorro-antd/dropdown';

/** A crumb of `nz-breadcrumb [nzItems]` (antd `BreadcrumbItemType`). */
export interface NzBreadcrumbItemOption {
  type?: 'item';
  /** Crumb content; `:name` placeholders in a string are replaced from `nzParams`. */
  title?: string | TemplateRef<void>;
  /** Literal link of the crumb; wins over `path`. */
  href?: string;
  /** Path segment, joined with the `path`s of the earlier items into `#/a/b` as antd does. */
  path?: string;
  /** Dropdown menu that opens from the crumb (an `nz-dropdown-menu` template reference). */
  menu?: NzDropdownMenuComponent | null;
  dropdownProps?: { nzPlacement?: NzPlacementType; nzTrigger?: 'click' | 'hover' };
  onClick?: (event: MouseEvent) => void;
  /** Class of the rendered `nz-breadcrumb-item`. */
  className?: string;
  /** Inline style of the rendered `nz-breadcrumb-item`. */
  style?: NgStyleInterface;
}

/** A standalone separator of `nz-breadcrumb [nzItems]` (antd `BreadcrumbSeparatorType`). */
export interface NzBreadcrumbSeparatorOption {
  type: 'separator';
  /** Separator content; falls back to `nzSeparator`, then `'/'`. */
  separator?: string | TemplateRef<void>;
}

export type NzBreadcrumbItem = NzBreadcrumbItemOption | NzBreadcrumbSeparatorOption;

/** Context of `nz-breadcrumb [nzItemRender]` (antd `itemRender(route, params, routes, paths)`). */
export interface NzBreadcrumbItemRenderContext {
  /** The default crumb content. */
  $implicit: TemplateRef<void>;
  item: NzBreadcrumbItemOption;
  params: Record<string, string | number> | null;
  items: NzBreadcrumbItem[];
  /** The resolved `path` segments up to and including this crumb. */
  paths: string[];
}
