/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { normalizePassiveListenerOptions, Platform } from '@angular/cdk/platform';
import {
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  NgZone,
  numberAttribute,
  OnInit,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { withAnimationCheck } from 'ng-zorro-antd/core/animation';
import { withConfigFactory } from 'ng-zorro-antd/core/config';
import { NzScrollService } from 'ng-zorro-antd/core/services';
import { NzShapeSCType } from 'ng-zorro-antd/core/types';
import { aliasDeprecatedInput, fromEventOutsideAngular, generateClassName } from 'ng-zorro-antd/core/util';

import { NzFloatButtonComponent } from './float-button.component';
import { NzFloatButtonBadge, NzFloatButtonType } from './typings';

const withConfig = withConfigFactory('floatButton');
const CLASS_NAME = 'ant-float-btn';

const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });

@Component({
  selector: 'nz-float-button-top',
  exportAs: 'nzFloatButtonTop',
  imports: [NzFloatButtonComponent],
  template: `
    @if (visible()) {
      <nz-float-button
        #backTop
        [nzIcon]="nzIcon() || 'vertical-align-top'"
        [nzContent]="content()"
        [nzHref]="nzHref()"
        [nzType]="nzType()"
        [nzShape]="shape()"
        [nzBadge]="nzBadge()"
        [class.ant-float-btn-progress]="nzShowProgress()"
        [style.--ant-float-btn-progress]="nzShowProgress() ? progress() + 'turn' : null"
        [animate.enter]="fadeAnimationEnter()"
        [animate.leave]="fadeAnimationLeave()"
      />
    }
  `,
  host: {
    '[class]': 'class()'
  },
  encapsulation: ViewEncapsulation.None
})
export class NzFloatButtonTopComponent implements OnInit {
  private readonly scrollSrv = inject(NzScrollService);
  private readonly platform = inject(Platform);
  private readonly ngZone = inject(NgZone);
  private readonly directionality = inject(Directionality);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  readonly backTop = viewChild('backTop', { read: ElementRef });

  readonly nzVisibilityHeight = input<number>();
  readonly nzHref = input<string | null>(null);
  readonly nzType = input<NzFloatButtonType>('default');
  readonly nzShape = input<NzShapeSCType>('circle');
  readonly nzIcon = input<string | TemplateRef<void> | null>(null);
  readonly nzContent = input<string | TemplateRef<void> | null>();
  /** @deprecated Use `nzContent` instead. This will be removed in v23.0.0. */
  // v6-alias: nzDescription -> nzContent
  readonly nzDescription = input<TemplateRef<void> | null>(null);
  readonly nzTemplate = input<TemplateRef<void> | null>(null);
  readonly nzTarget = input<string | HTMLElement | null>(null);
  readonly nzDuration = input(450, { transform: numberAttribute });
  readonly nzBadge = input<NzFloatButtonBadge | null>(null);
  /** Shows the scroll progress as a ring around the button edge (antd `showProgress`). */
  readonly nzShowProgress = input(false, { transform: booleanAttribute });
  readonly nzOnClick = output<boolean>();

  protected readonly visible = signal<boolean>(false);
  /** Scrolled fraction of the target, 0 to 1. */
  protected readonly progress = signal(0);
  protected readonly content = computed(() => this.nzContent() ?? this.nzDescription());
  private readonly aliasDescription = aliasDeprecatedInput<TemplateRef<void>>(
    'nz-float-button-top',
    'nzDescription',
    'nzContent'
  );
  // compact global config
  private readonly visibilityHeight = withConfig('nzVisibilityHeight', this.nzVisibilityHeight, 400);
  readonly shape = linkedSignal(() => this.nzShape());
  protected readonly class = computed<string[]>(() => {
    const dir = this.directionality.valueSignal();
    // v6 DOM: same button.ant-btn….ant-float-btn.ant-float-btn-{type}.ant-float-btn-{shape} shape as
    // FloatButton (antd/es/float-button/BackTop.js:82-88 renders FloatButton itself); the progress
    // class and custom property go on that inner FloatButton, as antd puts them on its root.
    const classes = [
      CLASS_NAME,
      `${CLASS_NAME}-top`,
      this.generateClass(this.nzType()),
      this.generateClass(this.shape())
    ];
    if (dir === 'rtl') {
      classes.push(this.generateClass(dir));
    }
    return classes;
  });

  protected readonly fadeAnimationEnter = withAnimationCheck(() => `${CLASS_NAME}-top-motion-enter`);
  protected readonly fadeAnimationLeave = withAnimationCheck(() => `${CLASS_NAME}-top-motion-leave`);

  private target?: HTMLElement | null = null;
  private backTopClickSubscription = Subscription.EMPTY;
  private scrollListenerDestroy$ = new Subject<void>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.scrollListenerDestroy$.next();
      this.scrollListenerDestroy$.complete();
    });

    effect(() => {
      const target = this.nzTarget();
      if (target) {
        this.target = typeof target === 'string' ? this.document.querySelector(target) : target;
        this.registerScrollEvent();
      }
    });

    effect(onCleanup => {
      const backTop = this.backTop();
      if (backTop) {
        this.backTopClickSubscription.unsubscribe();
        this.backTopClickSubscription = fromEventOutsideAngular(backTop.nativeElement, 'click')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.scrollSrv.scrollTo(this.getTarget(), 0, { duration: this.nzDuration() });
            this.ngZone.run(() => this.nzOnClick.emit(true));
          });
      }
      return onCleanup(() => {
        this.backTopClickSubscription.unsubscribe();
      });
    });

    effect(() => {
      this.visibilityHeight();
      this.nzShowProgress();
      untracked(() => this.handleScroll());
    });

    effect(() => {
      const legacy = this.nzDescription();
      if (legacy !== null && legacy !== undefined) this.aliasDescription(legacy);
    });
  }

  ngOnInit(): void {
    this.registerScrollEvent();
  }

  private getTarget(): HTMLElement | Window {
    return this.target || window;
  }

  private handleScroll(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    if (this.nzShowProgress()) {
      this.progress.set(this.scrollProgress());
    }
    if (this.visible() === this.scrollSrv.getScroll(this.getTarget()) > this.visibilityHeight()) {
      return;
    }
    this.visible.update(v => !v);
  }

  /**
   * antd `float-button/hooks/useScroll.ts` `getScrollProgress`. A target that cannot scroll
   * (scrollHeight === clientHeight) gives 0, not 0 / 0.
   */
  private scrollProgress(): number {
    const target = this.getTarget();
    const element = target === this.document.defaultView ? this.document.documentElement : (target as HTMLElement);
    const maxScroll = Math.max(element.scrollHeight - element.clientHeight, 0);
    return maxScroll > 0 ? Math.min(Math.max(this.scrollSrv.getScroll(target) / maxScroll, 0), 1) : 0;
  }

  private registerScrollEvent(): void {
    if (!this.platform.isBrowser) {
      return;
    }
    this.scrollListenerDestroy$.next();
    this.handleScroll();
    fromEventOutsideAngular(this.getTarget(), 'scroll', passiveEventListenerOptions as AddEventListenerOptions)
      .pipe(debounceTime(50), takeUntil(this.scrollListenerDestroy$))
      .subscribe(() => this.handleScroll());
  }

  private generateClass(suffix: string): string {
    return generateClassName(CLASS_NAME, suffix);
  }
}
