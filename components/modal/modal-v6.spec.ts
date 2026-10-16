/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ViewContainerRef, inject, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzModalContentDirective } from './modal-content.directive';
import { NzModalModule } from './modal.module';
import { NzModalService } from './modal.service';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzModalModule, NzThemeDirective, NzModalContentDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-modal [nzVisible]="open()" [nzCentered]="centered()" nzTitle="T" (nzOnCancel)="open.set(false)">
        <ng-container *nzModalContent>body</ng-container>
      </nz-modal>
    </div>
  `
})
class DeclarativeModalHostComponent {
  open = signal(false);
  centered = signal(false);
}

@Component({
  imports: [NzThemeDirective],
  template: `<div [nzTheme]="{ token: { colorBgMask: 'rgb(1, 2, 3)' } }"><ng-container #anchor /></div>`
})
class ScopedConfirmHostComponent {
  readonly viewContainerRef = viewChild.required('anchor', { read: ViewContainerRef });
  readonly modal = inject(NzModalService);
}

describe('modal under antd v6 css', () => {
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), NzModalService] });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 modal container, scoped to the enclosing theme', async () => {
    const fixture: ComponentFixture<DeclarativeModalHostComponent> =
      TestBed.createComponent(DeclarativeModalHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const wrap = overlay.getContainerElement().querySelector('.ant-modal-wrap') as HTMLElement;
    const modal = wrap.querySelector('.ant-modal') as HTMLElement;
    await expectMotionSettled(modal);
    const container = modal.querySelector('.ant-modal-container') as HTMLElement;
    expect(getComputedStyle(container).backgroundColor).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(container).borderRadius).toBe('8px');
    expect(getComputedStyle(container).padding).toBe('20px 24px');
    expect(wrap.className).toMatch(/\bnz-theme-\d+\b/);
    const scopeClass = /\bnz-theme-\d+\b/.exec(wrap.className)![0];
    const mask = overlay.getContainerElement().querySelector('.cdk-overlay-backdrop') as HTMLElement;
    expect(mask.classList).toContain('ant-modal-mask');
    expect(mask.classList).toContain(scopeClass);
    // `.ant-modal-wrap` must be the fixed, full-viewport positioning context (v6's own rule for it is
    // scoped under `.ant-modal-root`, which ng-zorro never renders, and mirrored in `style/v6/patch.css`);
    // without it the modal renders pinned to the left edge instead of centred.
    expect(getComputedStyle(wrap).position).toBe('fixed');
    const rect = modal.getBoundingClientRect();
    const centre = rect.left + rect.width / 2;
    expect(Math.abs(centre - window.innerWidth / 2)).toBeLessThanOrEqual(2);
    // `NzThemeDirective`'s scoped CSS lands after the button's first paint with the default
    // `--ant-color-primary`; `.ant-btn`'s own `transition: all ...` animates to the scoped colour rather
    // than switching instantly (see popconfirm-v6.spec.ts for the full explanation). Wait the transition
    // out before reading `background-color`.
    await new Promise(r => setTimeout(r, 300));
    expect(
      getComputedStyle(wrap.querySelector('.ant-modal-footer .ant-btn-color-primary') as HTMLElement).backgroundColor
    ).toBe('rgb(0, 185, 107)');
  });

  it('vertically centres the modal when nzCentered is set', async () => {
    const fixture: ComponentFixture<DeclarativeModalHostComponent> =
      TestBed.createComponent(DeclarativeModalHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.componentInstance.centered.set(true);
    fixture.detectChanges();

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const wrap = overlay.getContainerElement().querySelector('.ant-modal-wrap') as HTMLElement;
    const modal = wrap.querySelector('.ant-modal') as HTMLElement;
    await expectMotionSettled(modal);
    expect(modal.classList.contains('ant-modal-centered')).toBe(false); // the class is on the wrap, not the panel
    expect(wrap.classList.contains('ant-modal-centered')).toBe(true);
    const rect = modal.getBoundingClientRect();
    const centreY = rect.top + rect.height / 2;
    expect(Math.abs(centreY - window.innerHeight / 2)).toBeLessThanOrEqual(2);
  });

  it('narrows the modal gutter on small viewports', async () => {
    // The browser viewport is 1000px wide, so the `max-width: 767px` mirror is checked in a 500px iframe
    // holding ng-zorro's wrap > modal structure with the v6 CSS.
    const frame = document.createElement('iframe');
    frame.style.width = '500px';
    frame.style.height = '400px';
    document.body.appendChild(frame);
    try {
      const doc = frame.contentDocument!;
      doc.open();
      doc.write(
        `<style>${style.textContent}</style>` +
          '<div class="ant-modal-wrap"><div class="ant-modal" style="width: 520px"></div></div>'
      );
      doc.close();
      const modal = doc.querySelector('.ant-modal') as HTMLElement;
      const cs = frame.contentWindow!.getComputedStyle(modal);
      expect(cs.marginTop).toBe('8px'); // --ant-margin-xs
      expect(modal.getBoundingClientRect().width).toBe(500 - 16); // max-width: calc(100vw - 16px)
    } finally {
      frame.remove();
    }
  });

  it('colours the confirm icon per type', async () => {
    const fixture: ComponentFixture<DeclarativeModalHostComponent> =
      TestBed.createComponent(DeclarativeModalHostComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();

    const service = TestBed.inject(NzModalService);
    const ref = service.confirm({ nzTitle: 'Delete?', nzContent: 'Really' });
    fixture.detectChanges();
    await fixture.whenStable();
    const body = overlay
      .getContainerElement()
      .querySelector('.ant-modal-confirm-confirm .ant-modal-confirm-body') as HTMLElement;
    expect(body.classList.contains('ant-modal-confirm-body-has-title')).toBe(true);
    // ng-zorro does not wrap title/content in v6's `.ant-modal-confirm-paragraph`: v4's `confirm.less`
    // rule `.ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content`
    // needs them to stay direct siblings of the icon.
    expect(body.querySelector('.ant-modal-confirm-title')?.textContent?.trim()).toBe('Delete?');
    expect(getComputedStyle(body.querySelector(':scope > .anticon') as HTMLElement).color).toBe('rgb(250, 173, 20)');
    // The patch's grid layout: title/content sit beside the icon (not below it), stacked on top of each
    // other.
    const icon = body.querySelector(':scope > .anticon') as HTMLElement;
    const title = body.querySelector('.ant-modal-confirm-title') as HTMLElement;
    const content = body.querySelector('.ant-modal-confirm-content') as HTMLElement;
    const iconRect = icon.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    expect(titleRect.left).toBeGreaterThanOrEqual(iconRect.right);
    expect(Math.abs(contentRect.left - titleRect.left)).toBeLessThanOrEqual(1);
    expect(contentRect.top).toBeGreaterThan(titleRect.top);
    ref.close();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-modal-confirm')).toBeNull();
  });
  it('puts the scope class on the confirm mask only inside a theme scope', async () => {
    overlay = TestBed.inject(OverlayContainer);
    const modal = TestBed.inject(NzModalService);
    const outside = modal.confirm({ nzTitle: 'outside' });
    const outsideMask = outside.getBackdropElement()!;
    expect(outsideMask.classList).toContain('ant-modal-mask');
    expect(outsideMask.className).not.toMatch(/nz-theme-/);
    outside.close();

    const fixture = TestBed.createComponent(ScopedConfirmHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const inside = fixture.componentInstance.modal.confirm({
      nzTitle: 'inside',
      nzViewContainerRef: fixture.componentInstance.viewContainerRef()
    });
    fixture.detectChanges();
    await fixture.whenStable();
    const insideMask = inside.getBackdropElement()!;
    expect(insideMask.classList).toContain('ant-modal-mask');
    expect(insideMask.className).toMatch(/\bnz-theme-\d+\b/);
    inside.close();
  });
});
