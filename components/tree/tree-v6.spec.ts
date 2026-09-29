/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTreeModule } from './tree.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzTreeModule],
  template: `
    <nz-tree
      id="host"
      [nzData]="nodes"
      nzShowLine
      nzCheckable
      [nzExpandedKeys]="['0']"
      [nzSelectedKeys]="['0-1']"
      [nzCheckedKeys]="['0-0']"
    />
  `
})
class TestTreeComponent {
  nodes = [
    {
      title: 'parent 1',
      key: '0',
      children: [
        { title: 'leaf 1', key: '0-0', isLeaf: true },
        { title: 'leaf 2', key: '0-1', isLeaf: true }
      ]
    }
  ];
}

describe('tree under antd v6 css', () => {
  let fixture: ComponentFixture<TestTreeComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestTreeComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
  });

  it('renders the selected node content wrapper with the v6 selected background', () => {
    const host = document.getElementById('host') as HTMLElement;
    const selected = host.querySelector('.ant-tree-node-content-wrapper.ant-tree-node-selected') as HTMLElement;
    expect(selected).not.toBeNull();
    // nodeSelectedBg (controlItemBgActive) from --ant-tree-node-selected-bg.
    expect(getComputedStyle(selected).backgroundColor).toBe('rgb(230, 244, 255)');
  });

  it('gives leaf switchers the v6 line-mode class and marks the last leaf of a level', () => {
    const host = document.getElementById('host') as HTMLElement;
    const leafSwitchers = host.querySelectorAll('.ant-tree-switcher-noop');
    expect(leafSwitchers.length).toBe(2);
    leafSwitchers.forEach(switcher => expect(switcher.classList.contains('ant-tree-switcher-leaf-line')).toBe(true));
    const treenodes = host.querySelectorAll('.ant-tree-treenode');
    const lastLeaf = treenodes[treenodes.length - 1] as HTMLElement;
    expect(lastLeaf.classList.contains('ant-tree-treenode-leaf-last')).toBe(true);
    expect(treenodes[treenodes.length - 2].classList.contains('ant-tree-treenode-leaf-last')).toBe(false);
  });

  it('sizes the indent unit at the v6 indent size', () => {
    const host = document.getElementById('host') as HTMLElement;
    const unit = host.querySelector('.ant-tree-indent-unit') as HTMLElement;
    expect(getComputedStyle(unit).width).toBe('24px');
  });

  it('mirrors the v6 checkbox box onto the -inner span', () => {
    const host = document.getElementById('host') as HTMLElement;
    const checkedInner = host.querySelector(
      '.ant-tree-treenode-checkbox-checked .ant-tree-checkbox-inner'
    ) as HTMLElement;
    expect(checkedInner).not.toBeNull();
    expect(getComputedStyle(checkedInner).backgroundColor).toBe('rgb(22, 119, 255)'); // colorPrimary
    expect(getComputedStyle(checkedInner).borderRadius).toBe('4px'); // borderRadiusSM
    // The outer `.ant-tree-checkbox` box must be neutralised so the box is not drawn twice.
    const outer = checkedInner.parentElement as HTMLElement;
    expect(getComputedStyle(outer).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(outer).borderStyle).toBe('none');
    expect(getComputedStyle(outer).borderWidth).toBe('0px');
  });
});
