/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
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
      <nz-modal [nzVisible]="open()" nzTitle="T" (nzOnCancel)="open.set(false)">
        <ng-container *nzModalContent>body</ng-container>
      </nz-modal>
    </div>
  `
})
class DeclarativeModalHostComponent {
  open = signal(false);
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
    // `NzThemeDirective`'s scoped CSS lands after the button's first paint with the default
    // `--ant-color-primary`; `.ant-btn`'s own `transition: all ...` animates to the scoped colour rather
    // than switching instantly (see popconfirm-v6.spec.ts for the full explanation). Wait the transition
    // out before reading `background-color`.
    await new Promise(r => setTimeout(r, 300));
    expect(
      getComputedStyle(wrap.querySelector('.ant-modal-footer .ant-btn-color-primary') as HTMLElement).backgroundColor
    ).toBe('rgb(0, 185, 107)');
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
    // Substitution: the brief's assertion looks for `.ant-modal-confirm-paragraph
    // .ant-modal-confirm-title`. ng-zorro does not wrap title/content in an `.ant-modal-confirm-paragraph`
    // div -- see the task report ("Step 3: Align") for why that wrapper would break a v4 `confirm.less`
    // rule (`.ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content`,
    // an adjacent-sibling chain that requires title/content to remain direct siblings of the icon).
    expect(body.querySelector('.ant-modal-confirm-title')?.textContent?.trim()).toBe('Delete?');
    expect(getComputedStyle(body.querySelector(':scope > .anticon') as HTMLElement).color).toBe('rgb(250, 173, 20)');
    ref.close();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400));
    expect(overlay.getContainerElement().querySelector('.ant-modal-confirm')).toBeNull();
  });
});
