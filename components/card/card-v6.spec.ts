/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzCardModule } from './card.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzCardModule],
  template: `
    <nz-card id="host" nzTitle="Title" [nzExtra]="extra">
      <p>content</p>
    </nz-card>
    <ng-template #extra><a>More</a></ng-template>
    <nz-card id="small" nzSize="small" nzTitle="Small">
      <p>content</p>
    </nz-card>
    <nz-card id="meta">
      <nz-card-meta nzTitle="Europe Street beat" nzDescription="www.instagram.com" />
    </nz-card>
  `
})
class TestCardComponent {}

describe('card under antd v6 css', () => {
  let fixture: ComponentFixture<TestCardComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCardComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 default card shape', () => {
    const host = document.getElementById('host')!;
    expect(getComputedStyle(host).borderRadius).toBe('8px');
    expect(getComputedStyle(host).border).toBe('1px solid rgb(240, 240, 240)');
    const head = host.querySelector('.ant-card-head') as HTMLElement;
    expect(getComputedStyle(head).minHeight).toBe('56px');
    expect(getComputedStyle(head).fontSize).toBe('16px');
    expect(getComputedStyle(head).padding).toBe('0px 24px');
    const body = host.querySelector('.ant-card-body') as HTMLElement;
    expect(getComputedStyle(body).padding).toBe('24px');
  });

  it('renders the v6 small card head and body', () => {
    const small = document.getElementById('small')!;
    const head = small.querySelector('.ant-card-head') as HTMLElement;
    expect(getComputedStyle(head).minHeight).toBe('38px');
    const body = small.querySelector('.ant-card-body') as HTMLElement;
    expect(getComputedStyle(body).padding).toBe('12px');
  });

  it('gives the v6 name to the meta detail wrapper without dropping the v4 one', () => {
    const meta = document.getElementById('meta')!;
    const detail = meta.querySelector('.ant-card-meta-detail') as HTMLElement;
    expect(detail).not.toBeNull();
    expect(detail.classList.contains('ant-card-meta-section')).toBe(true);
    expect(getComputedStyle(detail).flex).toContain('1');
  });
});

@Component({
  imports: [NzCardModule],
  template: `
    <nz-card id="tabs-card" nzTitle="Card title" [nzTabList]="items">content</nz-card>
    <nz-card id="tabs-small" nzSize="small" [nzTabList]="items">content</nz-card>
  `
})
class TestCardTabListV6Component {
  readonly items = [
    { key: 'tab1', label: 'tab1' },
    { key: 'tab2', label: 'tab2' }
  ];
}

describe('card head tabs under antd v6 css', () => {
  let fixture: ComponentFixture<TestCardTabListV6Component>;

  beforeEach(async () => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestCardTabListV6Component);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('stacks large head tabs under the title the way antd 6 does', () => {
    const card = document.getElementById('tabs-card')!;
    const head = card.querySelector(':scope > .ant-card-head') as HTMLElement;
    expect(getComputedStyle(head).minHeight).toBe('0px');
    expect(getComputedStyle(head.querySelector('.ant-card-head-title') as HTMLElement).paddingTop).toBe('16px');
    const tabs = head.querySelector(':scope > nz-tabs.ant-card-head-tabs') as HTMLElement;
    expect(getComputedStyle(tabs).marginBottom).toBe('-17px');
    const tab = tabs.querySelector('.ant-tabs-tab') as HTMLElement;
    expect(getComputedStyle(tab).fontSize).toBe('16px');
    expect(getComputedStyle(tab).padding).toBe('16px 0px');
  });

  it('gives a small card small head tabs', () => {
    const card = document.getElementById('tabs-small')!;
    const tab = card.querySelector('.ant-card-head-tabs .ant-tabs-tab') as HTMLElement;
    expect(getComputedStyle(tab).fontSize).toBe('14px');
    expect(getComputedStyle(tab).padding).toBe('8px 0px');
  });
});
