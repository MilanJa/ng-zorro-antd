/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { NzFormModule } from 'ng-zorro-antd/form';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzGridModule } from './grid.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzGridModule],
  template: `
    <div style="width: 400px">
      <div nz-row id="row" [nzGutter]="16">
        <div nz-col nzSpan="12" id="c12">a</div>
        <div nz-col [nzSpan]="0" id="c0">b</div>
        <div nz-col nzSpan="6" nzOffset="6" id="c6">c</div>
      </div>
    </div>
  `
})
class GridBasicHost {}

@Component({
  imports: [NzGridModule],
  template: `
    <div nz-row>
      <div nz-col id="resp" nzXs="24" nzMd="12">r</div>
    </div>
  `
})
class GridResponsiveHost {}

@Component({
  imports: [NzGridModule],
  template: `
    <div nz-row id="al" nzJustify="space-between" nzAlign="middle">
      <div nz-col nzSpan="4">a</div>
      <div nz-col nzSpan="4">b</div>
    </div>
  `
})
class GridAlignHost {}

@Component({
  imports: [NzGridModule, NzFormModule],
  template: `
    <div style="width: 400px">
      <form nz-form nzLayout="horizontal">
        <nz-form-item id="item">
          <nz-form-label [nzSpan]="6" id="label">Name</nz-form-label>
          <nz-form-control [nzSpan]="14" id="control">
            <div nz-row id="nested">
              <div nz-col nzSpan="12" id="n1">x</div>
              <div nz-col nzSpan="12" id="n2">y</div>
            </div>
          </nz-form-control>
        </nz-form-item>
      </form>
    </div>
  `
})
class GridFormHost {}

function el(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

describe('grid under antd v6 css', () => {
  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('lays out a gutter row with span, zero-span and offset columns', () => {
    const fixture = TestBed.createComponent(GridBasicHost);
    fixture.detectChanges();

    const row = getComputedStyle(el('row'));
    expect(row.display).toBe('flex');
    expect(row.flexWrap).toBe('wrap');
    expect(row.fontSize).toBe('14px');
    // The gutter is an inline `margin-inline` on the row (antd's `row.js` does the same).
    expect(row.marginLeft).toBe('-8px');

    const c12 = getComputedStyle(el('c12'));
    expect(c12.flex).toBe('0 0 50%');
    expect(c12.maxWidth).toBe('50%');
    expect(c12.paddingLeft).toBe('8px');

    expect(getComputedStyle(el('c0')).display).toBe('none');

    // `.ant-col-offset-6` is `margin-inline-start: 25%` of the row (400 px + 2 x 8 px gutter).
    const rowWidth = el('row').getBoundingClientRect().width;
    expect(Math.abs(parseFloat(getComputedStyle(el('c6')).marginLeft) - 0.25 * rowWidth)).toBeLessThanOrEqual(0.5);
  });

  it('applies the breakpoint span that matches the viewport', () => {
    const fixture = TestBed.createComponent(GridResponsiveHost);
    fixture.detectChanges();

    // The runner's viewport width is not fixed: read the `md` media query antd's sheet uses.
    const expected = matchMedia('(min-width: 768px)').matches ? '50%' : '100%';
    expect(getComputedStyle(el('resp')).maxWidth).toBe(expected);
  });

  it('maps nzJustify and nzAlign to the row flex alignment', () => {
    const fixture = TestBed.createComponent(GridAlignHost);
    fixture.detectChanges();

    const al = getComputedStyle(el('al'));
    expect(al.justifyContent).toBe('space-between');
    expect(al.alignItems).toBe('center');
  });

  it('puts a horizontal form label and control side by side, with a nested row inside the control', () => {
    const fixture = TestBed.createComponent(GridFormHost);
    fixture.detectChanges();

    expect(getComputedStyle(el('item')).display).toBe('flex');

    const label = el('label').getBoundingClientRect();
    const control = el('control').getBoundingClientRect();
    expect(Math.abs(label.top - control.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(label.width - 100)).toBeLessThanOrEqual(0.5);

    // `.ant-form-item-horizontal .ant-form-item-control { flex: 1 1 0 }` grows the control, and
    // `.ant-col-14 { max-width: 58.33333333% }` caps it.
    expect(getComputedStyle(el('control')).maxWidth.startsWith('58.3333')).toBe(true);
    expect(Math.abs(control.width - 233.33)).toBeLessThanOrEqual(0.5);

    const nested = el('nested').getBoundingClientRect();
    const n1 = el('n1').getBoundingClientRect();
    const n2 = el('n2').getBoundingClientRect();
    expect(Math.abs(n1.top - n2.top)).toBeLessThanOrEqual(1);
    expect(Math.abs(n1.width - nested.width / 2)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(n2.width - nested.width / 2)).toBeLessThanOrEqual(0.5);
  });
});
