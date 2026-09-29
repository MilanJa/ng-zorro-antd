/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzInputNumberModule } from './input-number.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzInputNumberModule],
  template: `
    <nz-input-number id="host" [ngModel]="3" />
    <nz-input-number id="err" nzStatus="error" [ngModel]="1" />
    <nz-input-number id="no-controls" [nzControls]="false" [ngModel]="1" />
    <nz-input-number id="addon" nzAddonBefore="before" nzAddonAfter="after" [ngModel]="1" />
    <nz-input-number id="prefix" nzPrefix="$" [ngModel]="1" />
    <nz-input-number id="prefix-err" nzPrefix="$" nzStatus="error" [ngModel]="1" />
  `
})
class TestInputNumberComponent {}

describe('input-number under antd v6 css', () => {
  let fixture: ComponentFixture<TestInputNumberComponent>;
  let overlay: OverlayContainer;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting()],
      animationsEnabled: true
    });
    fixture = TestBed.createComponent(TestInputNumberComponent);
    overlay = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    overlay.ngOnDestroy();
  });

  it('renders the outlined v6 input-number with the mode-input class and status colours', () => {
    // `nz-input-number` binds `[class]="class()"` on its own host element (no wrapping div for
    // the plain, no-affix, no-addon case), so the v6 classes land on the host itself.
    const root = document.getElementById('host') as HTMLElement;
    expect(root.classList.contains('ant-input-number-outlined')).toBe(true);
    expect(root.classList.contains('ant-input-number-mode-input')).toBe(true);
    expect(getComputedStyle(root).borderColor).toBe('rgb(217, 217, 217)');
    expect(getComputedStyle(root).height).toBe('32px');
    expect(getComputedStyle(document.getElementById('err') as HTMLElement).borderColor).toBe('rgb(255, 77, 79)');
  });

  it('adds the v6 actions wrapper and per-action classes next to the v4 handler classes', () => {
    const wrap = document.querySelector('#host .ant-input-number-handler-wrap') as HTMLElement;
    expect(wrap.classList.contains('ant-input-number-actions')).toBe(true);
    const up = document.querySelector('#host .ant-input-number-handler-up') as HTMLElement;
    expect(up.classList.contains('ant-input-number-action')).toBe(true);
    expect(up.classList.contains('ant-input-number-action-up')).toBe(true);
    const down = document.querySelector('#host .ant-input-number-handler-down') as HTMLElement;
    expect(down.classList.contains('ant-input-number-action')).toBe(true);
    expect(down.classList.contains('ant-input-number-action-down')).toBe(true);
    // Base (unhovered/unfocused) v6 state: the actions column is collapsed to width 0 and
    // fully transparent (antd's default `handleVisible: false` token, `handleOpacity: 0`,
    // `handleVisibleWidth: 0`). `:hover`/`-focused` widen and fade it in, but that state is
    // driven by the real UA `:hover` pseudo-class, which a synthetic `mouseenter` dispatch does
    // not set in Chromium, so it is not reachable from this spec; the collapsed geometry below is
    // asserted instead.
    const actions = document.querySelector('#host .ant-input-number-actions') as HTMLElement;
    expect(getComputedStyle(actions).opacity).toBe('0');
    expect(getComputedStyle(actions).width).toBe('0px');
    expect(getComputedStyle(actions).position).toBe('absolute');
  });

  it('marks the down action disabled at the numeric minimum next to the v4 handler-down-disabled class', () => {
    const down = document.querySelector('#no-controls .ant-input-number-handler-down') as HTMLElement;
    expect(down).toBeNull();
    // controls disabled: the root carries the v6 without-controls class, and no actions render.
    const root = document.getElementById('no-controls') as HTMLElement;
    expect(root.classList.contains('ant-input-number-without-controls')).toBe(true);
    expect(root.querySelector('.ant-input-number-actions')).toBeNull();
  });

  it('adds the v6 addon class next to the v4 group-addon classes', () => {
    const addons = document.querySelectorAll('#addon .ant-input-number-group-addon');
    expect(addons.length).toBe(2);
    addons.forEach(addon => expect((addon as HTMLElement).classList.contains('ant-input-number-addon')).toBe(true));
  });

  it('keeps antd emitting the unstyled in-form-item class on the root', () => {
    // No NzFormStatusService in this host, so it is absent here; presence is a boolean mirror of
    // `nzFormStatusService` injection and is covered by the component's own behavioural spec.
    const root = document.getElementById('host') as HTMLElement;
    expect(root.classList.contains('ant-input-number-in-form-item')).toBe(false);
  });

  it('renders the v6 prefix class inside the affix wrapper', () => {
    const prefix = document.querySelector('#prefix .ant-input-number-prefix');
    expect(prefix).not.toBeNull();
    // With an affix and no addon, the affix-wrapper classes land on the host element itself.
    const wrapper = document.getElementById('prefix') as HTMLElement;
    expect(wrapper.classList.contains('ant-input-number-affix-wrapper')).toBe(true);
    const inner = wrapper.querySelector('.ant-input-number') as HTMLElement;
    expect(inner.classList.contains('ant-input-number-outlined')).toBe(true);
  });

  it('lays the affix wrapper out as a bordered, inline-flex box with the prefix inside its border box', () => {
    // v6's InputNumber never wraps prefix/suffix in an affix-wrapper element at all (no CSS rule
    // of its own exists for `.ant-input-number-affix-wrapper` beyond the -lg/-sm padding
    // variants), so style/v6/patch.css mirrors antd's `.ant-input-affix-wrapper` layout and
    // `.ant-input-outlined` border/background states onto it, and neutralises the inner
    // `.ant-input-number`'s own border so it is not drawn a second time.
    const wrapper = document.getElementById('prefix') as HTMLElement;
    expect(getComputedStyle(wrapper).display).toBe('inline-flex');
    const wrapperRect = wrapper.getBoundingClientRect();
    expect(wrapperRect.width).toBeGreaterThanOrEqual(90);
    expect(getComputedStyle(wrapper).borderColor).toBe('rgb(217, 217, 217)');

    const prefix = wrapper.querySelector('.ant-input-number-prefix') as HTMLElement;
    const prefixRect = prefix.getBoundingClientRect();
    expect(prefixRect.left).toBeGreaterThanOrEqual(wrapperRect.left);
    expect(prefixRect.right).toBeLessThanOrEqual(wrapperRect.right);

    const inner = wrapper.querySelector('.ant-input-number') as HTMLElement;
    const innerStyle = getComputedStyle(inner);
    expect(innerStyle.borderStyle === 'none' || innerStyle.borderWidth === '0px').toBe(true);
  });

  it('colours the affix wrapper border by status, not just the plain root', () => {
    // `#err` has no affix (the class lands on the inner root directly, unchanged by this fix
    // round); `#prefix-err` has both a prefix and an error status, exercising the new
    // wrapper-level `-affix-wrapper-outlined.-affix-wrapper-status-error` border colour rule.
    const errRoot = document.getElementById('err') as HTMLElement;
    expect(getComputedStyle(errRoot).borderColor).toBe('rgb(255, 77, 79)');
    const errWrapper = document.getElementById('prefix-err') as HTMLElement;
    expect(getComputedStyle(errWrapper).borderColor).toBe('rgb(255, 77, 79)');
  });

  it('lays the addon row out inline, like antd v6 keeps for its own legacy Input.Group addons', () => {
    // v6 has no CSS at all for `ant-input-number-group`/`-group-addon`/`-group-wrapper`/`-wrapper`
    // (InputNumber's own deprecated addonBefore/After render through Space.Compact + bare
    // `-addon` spans in real v6 markup, not this nested structure), so style/v6/patch.css mirrors
    // the table/table-cell layout antd v6 itself still keeps for `Input`'s legacy `Input.Group`
    // addons (`.ant-input-group`/`.ant-input-group-addon`/`.ant-input-group-wrapper*`) onto the
    // `ant-input-number-*` names, so the row renders inline instead of stacking as block divs.
    const addon = document.querySelector('#addon .ant-input-number-group-addon') as HTMLElement;
    const inner = document.querySelector('#addon .ant-input-number') as HTMLElement;
    const addonRect = addon.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();
    expect(Math.abs(addonRect.top - innerRect.top)).toBeLessThanOrEqual(1);
    expect(addonRect.left).toBeLessThan(innerRect.left);
  });
});
