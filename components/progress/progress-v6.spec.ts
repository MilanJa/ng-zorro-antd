/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzProgressModule } from './progress.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress id="line" [nzPercent]="30" [nzSuccessPercent]="10" />
    <nz-progress id="circle" nzType="circle" [nzPercent]="75" />
    <nz-progress id="steps" [nzSteps]="3" [nzPercent]="66" />
  `
})
class TestProgressComponent {}

describe('progress under antd v6 css', () => {
  let fixture: ComponentFixture<TestProgressComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestProgressComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the line as rail and tracks with the v6 colours and a success segment', () => {
    const rail = document.querySelector('#line .ant-progress-body > .ant-progress-rail') as HTMLElement;
    expect(getComputedStyle(rail).backgroundColor).toBe('rgba(0, 0, 0, 0.06)'); // remainingColor
    const track = rail.querySelector('.ant-progress-track:not(.ant-progress-track-success)') as HTMLElement;
    expect(getComputedStyle(track).backgroundColor).toBe('rgb(22, 119, 255)');
    const success = rail.querySelector('.ant-progress-track-success') as HTMLElement;
    expect(getComputedStyle(success).backgroundColor).toBe('rgb(82, 196, 26)');
    expect(Math.round((success.getBoundingClientRect().width / rail.getBoundingClientRect().width) * 100)).toBe(10);
    expect(document.querySelector('#line .ant-progress-indicator')?.textContent?.trim()).toBe('30%');
  });

  it('renders circle and steps with the v6 classes', () => {
    expect(
      document.querySelector('#circle .ant-progress-body > svg.ant-progress-circle .ant-progress-circle-rail')
    ).not.toBeNull();
    const items = document.querySelectorAll('#steps .ant-progress-steps-body > .ant-progress-steps-item');
    expect(items.length).toBe(3);
    expect(getComputedStyle(items[0] as HTMLElement).backgroundColor).toBe('rgb(22, 119, 255)');
    expect(getComputedStyle(items[2] as HTMLElement).backgroundColor).toBe('rgba(0, 0, 0, 0.06)');
  });
});

@Component({
  imports: [NzProgressModule],
  template: `
    <div style="width: 420px">
      <nz-progress
        id="inner"
        [nzPercent]="10"
        [nzPercentPosition]="{ align: 'center', type: 'inner' }"
        [nzSize]="[300, 20]"
      />
      <nz-progress
        id="bright"
        [nzPercent]="50"
        [nzPercentPosition]="{ align: 'start', type: 'inner' }"
        [nzSize]="[300, 20]"
        nzStrokeColor="#B7EB8F"
      />
      <nz-progress
        id="done"
        [nzPercent]="100"
        [nzPercentPosition]="{ align: 'center', type: 'inner' }"
        [nzSize]="[400, 20]"
      />
      <nz-progress id="start" [nzPercent]="60" [nzPercentPosition]="{ align: 'start', type: 'outer' }" />
      <nz-progress id="bottom" [nzPercent]="60" [nzPercentPosition]="{ align: 'center', type: 'outer' }" />
      <nz-progress id="tiny" nzType="circle" [nzPercent]="50" [nzSize]="20" [nzShowInfo]="false" />
    </div>
  `
})
class TestProgressPositionComponent {}

describe('progress percent position under antd v6 css', () => {
  let fixture: ComponentFixture<TestProgressPositionComponent>;
  const q = (sel: string): HTMLElement => document.querySelector(sel) as HTMLElement;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(TestProgressPositionComponent);
    fixture.detectChanges();
    await fixture.whenStable(); // afterNextRender probes the v6 token
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders an inner value inside the track, centred, in white', () => {
    const indicator = q('#inner .ant-progress-track > .ant-progress-indicator');
    expect(indicator.classList).toContain('ant-progress-indicator-inner');
    expect(indicator.classList).toContain('ant-progress-indicator-center');
    expect(q('#inner .ant-progress').classList).toContain('ant-progress-line-position-inner');
    expect(getComputedStyle(indicator).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(indicator).justifyContent).toBe('center');
    expect(q('#inner .ant-progress-body').getBoundingClientRect().width).toBe(300);
    expect(q('#inner .ant-progress-rail').getBoundingClientRect().height).toBe(20);
  });

  it('darkens an inner value on a bright stroke and aligns it to the start', () => {
    const indicator = q('#bright .ant-progress-track > .ant-progress-indicator');
    expect(indicator.classList).toContain('ant-progress-indicator-bright');
    expect(getComputedStyle(indicator).color).toBe('rgba(0, 0, 0, 0.45)');
    expect(getComputedStyle(indicator).justifyContent).toBe('start');
  });

  it('shows the text, not the success icon, for an inner value at 100%', () => {
    const indicator = q('#done .ant-progress-track > .ant-progress-indicator');
    expect(indicator.textContent!.trim()).toBe('100%');
    expect(indicator.querySelector('nz-icon')).toBeNull();
  });

  it('puts an outer start value before the rail and a centre value below it', () => {
    const startRail = q('#start .ant-progress-rail').getBoundingClientRect();
    const startText = q('#start .ant-progress-body > .ant-progress-indicator').getBoundingClientRect();
    expect(startText.right).toBeLessThanOrEqual(startRail.left);
    const body = q('#bottom .ant-progress-body');
    expect(body.classList).toContain('ant-progress-body-layout-bottom');
    expect(getComputedStyle(body).flexDirection).toBe('column');
    const rail = q('#bottom .ant-progress-rail').getBoundingClientRect();
    const text = q('#bottom .ant-progress-body > .ant-progress-indicator').getBoundingClientRect();
    expect(text.top).toBeGreaterThanOrEqual(rail.bottom);
    expect(Math.abs((text.left + text.right) / 2 - (rail.left + rail.right) / 2)).toBeLessThan(1);
  });

  it('draws a 20px inline circle', () => {
    expect(q('#tiny .ant-progress').classList).toContain('ant-progress-inline-circle');
    expect(q('#tiny .ant-progress-body').getBoundingClientRect().width).toBe(20);
  });
});
