/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzTransferModule, TransferItem } from 'ng-zorro-antd/transfer';

@Component({
  imports: [FormsModule, NzTransferModule],
  template: `
    <nz-transfer
      id="host"
      [nzDataSource]="items()"
      [nzTargetKeys]="targetKeys()"
      [nzSelectedKeys]="selectedKeys()"
      [nzOneWay]="oneWay()"
    />
  `
})
class TestTransferComponent {
  items = signal<TransferItem[]>([
    { key: '1', title: 'item1' },
    { key: '2', title: 'item2' },
    { key: '3', title: 'item3' },
    { key: '4', title: 'item4' }
  ]);
  targetKeys = signal<string[]>(['1']);
  // Selected after `nzTargetKeys` is applied (ngOnChanges processes `nzSelectedKeys` last), so this
  // key stays checked in the left list instead of being moved by the target-keys handler.
  selectedKeys = signal<string[]>(['2']);
  oneWay = signal(false);
}

describe('transfer under antd v6 css', () => {
  let fixture: ComponentFixture<TestTransferComponent>;
  let style: HTMLStyleElement;

  beforeEach(() => {
    style = document.createElement('style');
    style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
    document.head.appendChild(style);
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTransferComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('sizes the two lists as v6 sections', () => {
    const sections = fixture.nativeElement.querySelectorAll('.ant-transfer-section');
    expect(sections.length).toBe(2);
    sections.forEach((section: HTMLElement) => {
      const style = getComputedStyle(section);
      expect(style.width).toBe('180px');
      expect(style.height).toBe('200px');
    });
    const header = sections[0].querySelector('.ant-transfer-list-header') as HTMLElement;
    expect(getComputedStyle(header).height).toBe('40px');
    const item = sections[0].querySelector('.ant-transfer-list-content-item') as HTMLElement;
    expect(getComputedStyle(item).minHeight).toBe('32px');
  });

  it('gives a checked item the v6 active background', () => {
    const item = fixture.nativeElement.querySelector(
      '.ant-transfer-section .ant-transfer-list-content-item-checked'
    ) as HTMLElement;
    expect(item).not.toBeNull();
    expect(getComputedStyle(item).backgroundColor).toBe('rgb(230, 244, 255)');
  });

  it('renders the middle operation column as v6 actions with small buttons', () => {
    const actions = fixture.nativeElement.querySelector('.ant-transfer-actions') as HTMLElement;
    expect(actions).not.toBeNull();
    const buttons = actions.querySelectorAll('button.ant-btn');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => expect(button.classList.contains('ant-btn-sm')).toBe(true));
  });

  it('marks the target list content as show-remove when nzOneWay is set', async () => {
    fixture.componentInstance.oneWay.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    // `nz-transfer-list[data-direction="right"]` carries both `ant-transfer-list` and
    // `ant-transfer-section` on the same host element, so querying by the v6 class alone still
    // resolves it.
    const rightSection = fixture.nativeElement.querySelector(
      'nz-transfer-list[data-direction="right"].ant-transfer-section'
    ) as HTMLElement;
    expect(rightSection).not.toBeNull();
    const content = rightSection.querySelector('.ant-transfer-list-content-show-remove');
    expect(content).not.toBeNull();
  });
});
