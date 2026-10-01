/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzCalendarComponent } from './calendar.component';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [FormsModule, NzCalendarComponent],
  template: `<nz-calendar id="host" [ngModel]="date" [nzFullscreen]="fullscreen" />`
})
class TestCalendarComponent {
  date: Date = new Date(2026, 8, 30);
  fullscreen = true;
}

@Component({
  imports: [FormsModule, NzCalendarComponent],
  template: `<nz-calendar id="host" [nzFullscreen]="true" />`
})
class TestCalendarTodayComponent {}

describe('calendar under antd v6 css', () => {
  let fixture: ComponentFixture<TestCalendarComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCalendarComponent);
    fixture.detectChanges();
    host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the full-mode root at v6 background', () => {
    expect(host.classList.contains('ant-picker-calendar')).toBe(true);
    expect(host.classList.contains('ant-picker-calendar-full')).toBe(true);
    const cs = getComputedStyle(host);
    expect(cs.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  it('lays out the header at v6 padding, justified to the end', () => {
    const header = host.querySelector('.ant-picker-calendar-header') as HTMLElement;
    const cs = getComputedStyle(header);
    expect(cs.padding).toBe('12px 0px');
    expect(cs.justifyContent).toBe('flex-end');
  });

  it("sizes the header's year/month nz-select boxes at v6 control height", () => {
    const selector = host.querySelector('.ant-picker-calendar-year-select .ant-select-selector') as HTMLElement;
    expect(getComputedStyle(selector).height).toBe('32px');
  });

  it('gives a full-mode date cell the v6 border-top (line-width-bold, color-split)', () => {
    const dateBox = host.querySelector('.ant-picker-calendar-date') as HTMLElement;
    const cs = getComputedStyle(dateBox);
    expect(cs.borderTop).toBe('2px solid rgba(5, 5, 5, 0.06)');
  });

  it('paints the selected cell at v6 controlItemBgActive', () => {
    const selectedDate = host.querySelector('.ant-picker-cell-selected .ant-picker-calendar-date') as HTMLElement;
    expect(selectedDate).not.toBeNull();
    expect(getComputedStyle(selectedDate).backgroundColor).toBe('rgb(230, 244, 255)');
  });

  it('switches to mini mode at v6 mini cell height', async () => {
    fixture.componentInstance.fullscreen = false;
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 0));
    expect(host.classList.contains('ant-picker-calendar-mini')).toBe(true);
    const cellInner = host.querySelector('.ant-picker-cell-inner') as HTMLElement;
    expect(getComputedStyle(cellInner).height).toBe('24px');
  });
});

describe('calendar today cell under antd v6 css', () => {
  let fixture: ComponentFixture<TestCalendarTodayComponent>;
  let host: HTMLElement;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCalendarTodayComponent);
    fixture.detectChanges();
    host = fixture.debugElement.query(By.css('#host')).nativeElement as HTMLElement;
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  // With no bound value the active/selected date defaults to today (`new CandyDate()`), so the
  // selected cell and the today cell are the same element: v6's combined selected+today rule
  // (`.ant-picker-cell-selected .ant-picker-calendar-date-today .ant-picker-calendar-date-value`)
  // colours its value with colorPrimary, distinct from the plain (non-selected) today rule, which
  // keeps colorText.
  it("colours today's (also selected) value at v6 colorPrimary", () => {
    const todayValue = host.querySelector('.ant-picker-calendar-date-today .ant-picker-calendar-date-value');
    expect(todayValue).not.toBeNull();
    expect(getComputedStyle(todayValue as HTMLElement).color).toBe('rgb(22, 119, 255)');
  });
});
