/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { LocationStrategy, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  contentChildren,
  forwardRef,
  inject,
  viewChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Params, Router } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';

import { PREFIX, warn } from 'ng-zorro-antd/core/logger';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';

import { NzBreadcrumb } from './breadcrumb';
import { NzBreadCrumbItemComponent } from './breadcrumb-item.component';
import { NzBreadCrumbSeparatorComponent } from './breadcrumb-separator.component';
import { NzBreadcrumbItem, NzBreadcrumbItemOption, NzBreadcrumbItemRenderContext } from './typings';

export interface BreadcrumbOption {
  label: string;
  params: Params;
  url: string;
}

/** An `nzItems` entry resolved for rendering: `:param`s substituted, link derived as antd's `getPath` does. */
interface NzBreadcrumbCrumb {
  readonly item: NzBreadcrumbItem;
  /** The entry as a crumb; `null` for a `type: 'separator'` entry. */
  readonly option: NzBreadcrumbItemOption | null;
  /** Own content of a separator entry. */
  readonly separator: string | TemplateRef<void> | null;
  readonly title: string | TemplateRef<void> | null;
  readonly href: string | null;
  /** `'/a/b'` when the link comes from `path` rather than a literal `href`; used for `Router.navigateByUrl`. */
  readonly routerUrl: string | null;
  readonly paths: string[];
}

const ITEMS_WITH_AUTO_GENERATE =
  '`nzItems` and `nzAutoGenerate` are both set on `nz-breadcrumb`; `nzItems` wins and the router crumbs are not rendered.';

/** antd `getPath`: drop one leading `/`, then replace the first `:key` of each param. */
function resolvePath(path: string, params: Record<string, string | number>): string {
  let merged = path.replace(/^\//, '');
  for (const key of Object.keys(params)) {
    merged = merged.replace(`:${key}`, String(params[key]));
  }
  return merged;
}

/** antd `getBreadcrumbName`: replace every `:key` of a string title; an empty value keeps the placeholder. */
function resolveTitle(
  title: string | TemplateRef<void> | undefined,
  params: Record<string, string | number>
): string | TemplateRef<void> | null {
  if (typeof title !== 'string') {
    return title ?? null;
  }
  const keys = Object.keys(params);
  if (!keys.length) {
    return title;
  }
  return title.replace(new RegExp(`:(${keys.join('|')})`, 'g'), (placeholder: string, key: string) =>
    params[key] ? String(params[key]) : placeholder
  );
}

/** A click the browser should handle itself (new tab or window, download), like `routerLink`. */
function isModifiedClick(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0;
}

@Component({
  selector: 'nz-breadcrumb',
  exportAs: 'nzBreadcrumb',
  providers: [{ provide: NzBreadcrumb, useExisting: forwardRef(() => NzBreadCrumbComponent) }],
  imports: [NgTemplateOutlet, NzBreadCrumbItemComponent, NzBreadCrumbSeparatorComponent, NzOutletModule],
  template: `
    <ng-content />
    @if (nzItems) {
      @for (crumb of crumbs; track $index) {
        @if (crumb.option; as option) {
          <ng-template #defaultContent>
            @if (crumb.href !== null) {
              <a [attr.href]="crumb.href"
                ><ng-container *nzStringTemplateOutlet="crumb.title">{{ crumb.title }}</ng-container></a
              >
            } @else {
              <ng-container *nzStringTemplateOutlet="crumb.title">{{ crumb.title }}</ng-container>
            }
          </ng-template>
          <nz-breadcrumb-item
            [nzOverlay]="option.menu ?? undefined"
            [nzOverlayPlacement]="option.dropdownProps?.nzPlacement"
            [nzOverlayTrigger]="option.dropdownProps?.nzTrigger"
            [class]="option.className ?? ''"
            [style]="option.style ?? null"
            (click)="onItemClick(crumb, $event)"
          >
            <ng-template
              [ngTemplateOutlet]="nzItemRender ?? defaultContent"
              [ngTemplateOutletContext]="{
                $implicit: defaultContent,
                item: option,
                params: nzParams,
                items: nzItems,
                paths: crumb.paths
              }"
            />
          </nz-breadcrumb-item>
        } @else {
          <nz-breadcrumb-separator
            ><ng-container *nzStringTemplateOutlet="crumb.separator ?? nzSeparator ?? '/'">{{
              crumb.separator ?? nzSeparator ?? '/'
            }}</ng-container></nz-breadcrumb-separator
          >
        }
      }
    } @else if (nzAutoGenerate && breadcrumbs.length) {
      @for (breadcrumb of breadcrumbs; track breadcrumb.url) {
        <nz-breadcrumb-item>
          <a [attr.href]="breadcrumb.url" (click)="navigate(breadcrumb.url, $event)">{{ breadcrumb.label }}</a>
        </nz-breadcrumb-item>
      }
    }
  `,
  host: {
    class: 'ant-breadcrumb',
    '[class.ant-breadcrumb-rtl]': `dir() === 'rtl'`
  },
  encapsulation: ViewEncapsulation.None
})
export class NzBreadCrumbComponent implements OnInit, OnChanges, NzBreadcrumb {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dir = inject(Directionality).valueSignal;

  @Input({ transform: booleanAttribute }) nzAutoGenerate = false;
  @Input() nzSeparator: string | TemplateRef<void> | null = '/';
  @Input() nzRouteLabel: string = 'breadcrumb';
  @Input() nzRouteLabelFn: (label: string) => string = label => label;
  @Input() nzRouteFn: (route: string) => string = route => route;
  /** Data-driven crumbs, rendered after the projected content; wins over `nzAutoGenerate`. */
  @Input() nzItems: NzBreadcrumbItem[] | null = null;
  /** Values for `:name` placeholders in the `title` and `path` strings of `nzItems`. */
  @Input() nzParams: Record<string, string | number> | null = null;
  /** Custom content of each `nzItems` crumb; the context's `$implicit` is the default content. */
  @Input() nzItemRender: TemplateRef<NzBreadcrumbItemRenderContext> | null = null;
  /** Icon after a crumb with a dropdown menu; `nz-breadcrumb-item`s that do not set their own use it. */
  @Input() nzDropdownIcon: string | TemplateRef<void> | undefined = 'down';
  @Output() readonly nzItemClick = new EventEmitter<{ item: NzBreadcrumbItem; event: MouseEvent }>();

  breadcrumbs: BreadcrumbOption[] = [];
  protected crumbs: NzBreadcrumbCrumb[] = [];
  private itemsWithAutoGenerateWarned = false;
  private readonly projectedItems = contentChildren(NzBreadCrumbItemComponent, { descendants: true });
  private readonly dataItems = viewChildren(NzBreadCrumbItemComponent);

  ngOnInit(): void {
    if (this.nzAutoGenerate) {
      this.registerRouterChange();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzItems, nzParams, nzSeparator, nzDropdownIcon } = changes;
    if (nzItems || nzParams) {
      this.crumbs = this.resolveCrumbs();
    }
    if (nzSeparator || nzDropdownIcon) {
      // Items are on-push and read both values from this component, so they must be told.
      for (const item of [...this.projectedItems(), ...this.dataItems()]) {
        item.markParentChanged();
      }
    }
    if (this.nzItems && this.nzAutoGenerate && !this.itemsWithAutoGenerateWarned) {
      this.itemsWithAutoGenerateWarned = true;
      warn(ITEMS_WITH_AUTO_GENERATE);
    }
  }

  navigate(url: string, e: MouseEvent): void {
    if (isModifiedClick(e)) {
      return;
    }
    e.preventDefault();
    this.injector.get(Router).navigateByUrl(url);
  }

  protected onItemClick(crumb: NzBreadcrumbCrumb, event: MouseEvent): void {
    const link = (event.target as Element | null)?.closest?.('.ant-breadcrumb-link');
    if (!link || !(event.currentTarget as Element).contains(link)) {
      return;
    }
    crumb.option!.onClick?.(event);
    this.nzItemClick.emit({ item: crumb.item, event });
    if (crumb.routerUrl !== null && !event.defaultPrevented && !isModifiedClick(event)) {
      const router = this.configuredRouter();
      if (router) {
        event.preventDefault();
        router.navigateByUrl(crumb.routerUrl);
      }
    }
  }

  /**
   * `Router` is root-provided even without `provideRouter`, but `ActivatedRoute` exists only once the
   * application configures the router; without it a path crumb keeps its plain `#/…` link, and with it
   * the link is built by the app's `LocationStrategy`.
   */
  private configuredRouter(): Router | null {
    return this.injector.get(ActivatedRoute, null) ? this.injector.get(Router) : null;
  }

  private resolveCrumbs(): NzBreadcrumbCrumb[] {
    const params = this.nzParams ?? {};
    const strategy = this.configuredRouter() ? this.injector.get(LocationStrategy) : null;
    const paths: string[] = [];
    return (this.nzItems ?? []).map(item => {
      if (item.type === 'separator') {
        return {
          item,
          option: null,
          separator: item.separator ?? null,
          title: null,
          href: null,
          routerUrl: null,
          paths: [...paths]
        };
      }
      const path = item.path === undefined ? undefined : resolvePath(item.path, params);
      if (path !== undefined) {
        paths.push(path);
      }
      const fromPath = path === undefined ? null : `/${paths.join('/')}`;
      return {
        item,
        option: item,
        separator: null,
        title: resolveTitle(item.title, params),
        href:
          item.href ?? (fromPath === null ? null : strategy ? strategy.prepareExternalUrl(fromPath) : `#${fromPath}`),
        routerUrl: item.href === undefined ? fromPath : null,
        paths: [...paths]
      };
    });
  }

  private registerRouterChange(): void {
    try {
      const router = this.injector.get(Router);
      const activatedRoute = this.injector.get(ActivatedRoute);
      router.events
        .pipe(
          filter(e => e instanceof NavigationEnd),
          takeUntilDestroyed(this.destroyRef),
          startWith(true) // trigger initial render
        )
        .subscribe(() => {
          this.breadcrumbs = this.getBreadcrumbs(activatedRoute.root);
          this.cdr.markForCheck();
        });
    } catch {
      throw new Error(`${PREFIX} You should import RouterModule if you want to use 'NzAutoGenerate'.`);
    }
  }

  private getBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: BreadcrumbOption[] = []
  ): BreadcrumbOption[] {
    const children: ActivatedRoute[] = route.children;

    // If there's no sub root, then stop the recurse and returns the generated breadcrumbs.
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.outlet === PRIMARY_OUTLET) {
        // Only parse components in primary router-outlet (in another word, router-outlet without a specific name).
        // Parse this layer and generate a breadcrumb item.
        const routeUrl: string = child.snapshot.url
          .map(segment => segment.path)
          .filter(path => path)
          .join('/');

        // Do not change nextUrl if routeUrl is falsy. This happens when it's a route lazy loading other modules.
        const nextUrl = routeUrl ? `${url}/${routeUrl}` : url;
        const breadcrumbLabel = this.nzRouteLabelFn(child.snapshot.data[this.nzRouteLabel]);
        const shapedUrl = this.nzRouteFn(nextUrl);
        // If have data, go to generate a breadcrumb for it.
        if (routeUrl && breadcrumbLabel) {
          const breadcrumb: BreadcrumbOption = {
            label: breadcrumbLabel,
            params: child.snapshot.params,
            url: shapedUrl
          };
          breadcrumbs.push(breadcrumb);
        }

        return this.getBreadcrumbs(child, nextUrl, breadcrumbs);
      }
    }

    return breadcrumbs;
  }
}
