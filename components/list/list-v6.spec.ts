/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzListModule } from './list.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzListModule],
  template: `
    <nz-list id="host" nzBordered nzHeader="Header" [nzDataSource]="items" [nzRenderItem]="item">
      <ng-template #item let-i>
        <nz-list-item>{{ i }}</nz-list-item>
      </ng-template>
    </nz-list>
    <nz-list id="empty" [nzDataSource]="[]" [nzRenderItem]="item" />
  `
})
class TestListComponent {
  items = ['a', 'b', 'c'];
}

describe('list under antd v6 css', () => {
  let fixture: ComponentFixture<TestListComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestListComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders the v6 bordered layout', () => {
    const host = document.getElementById('host')!;
    expect(getComputedStyle(host).border).toBe('1px solid rgb(217, 217, 217)'); // colorBorder
    expect(getComputedStyle(host).borderRadius).toBe('8px'); // borderRadiusLG
    const header = host.querySelector('.ant-list-header') as HTMLElement;
    // .ant-list-bordered .ant-list-header: padding-inline is set separately from the base padding-block rule.
    expect(getComputedStyle(header).paddingBlock).toBe('12px');
    expect(getComputedStyle(header).paddingInline).toBe('24px');
    const item = host.querySelector('.ant-list-item') as HTMLElement;
    expect(getComputedStyle(item).paddingBlock).toBe('12px');
    expect(getComputedStyle(item).paddingInline).toBe('24px');
    expect(getComputedStyle(item).borderBlockEnd).toBe('1px solid rgba(5, 5, 5, 0.06)'); // colorSplit
  });

  it('renders nz-empty with .ant-list-empty-text padding for an empty data source', () => {
    const empty = document.getElementById('empty')!;
    const emptyText = empty.querySelector('.ant-list-empty-text') as HTMLElement;
    expect(emptyText).toBeTruthy();
    expect(getComputedStyle(emptyText).padding).toBe('16px'); // listEmptyTextPadding
    expect(emptyText.querySelector('.ant-empty')).toBeTruthy();
    expect(emptyText.querySelector('.ant-empty-normal')).toBeTruthy(); // empty's own v6 alignment: image === simpleEmptyImg
  });
});
