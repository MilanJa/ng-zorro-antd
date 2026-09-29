/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzUploadFile } from './interface';
import { NzUploadModule } from './upload.module';

function makeFiles(): NzUploadFile[] {
  return [
    { uid: '1', name: 'a.png', status: 'done', thumbUrl: 'data:image/png;base64,aaaa' },
    { uid: '2', name: 'b.png', status: 'done', thumbUrl: 'data:image/png;base64,bbbb' }
  ];
}

@Component({
  imports: [FormsModule, NzUploadModule, NzButtonModule],
  template: `
    <nz-upload id="host" nzAction="/x" [nzFileList]="files" nzListType="picture-card">
      <button nz-button>Up</button>
    </nz-upload>
    <nz-upload id="text" nzAction="/x" [nzFileList]="files">
      <button nz-button>Up</button>
    </nz-upload>
  `
})
class TestUploadComponent {
  private readonly filesValue = signal<NzUploadFile[]>(makeFiles());

  get files(): NzUploadFile[] {
    return this.filesValue();
  }

  set files(value: NzUploadFile[]) {
    this.filesValue.set(value);
  }
}

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

describe('upload under antd v6 css', () => {
  let fixture: ComponentFixture<TestUploadComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestUploadComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('renders picture cards at 102px and the text list items with v6 spacing', () => {
    const card = document.querySelector('#host .ant-upload-list-item-container') as HTMLElement;
    expect(getComputedStyle(card).width).toBe('102px');
    expect(getComputedStyle(card).height).toBe('102px');
    const item = document.querySelector('#text .ant-upload-list-item') as HTMLElement;
    expect(getComputedStyle(item).height).toBe('22px'); // lineHeight * fontSize
    expect(getComputedStyle(item).marginTop).toBe('8px');
  });

  it('removes a list item after its leave motion', async () => {
    fixture.componentInstance.files = fixture.componentInstance.files.slice(1);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 400)); // ant-upload-animate-inline-leave, motion-duration-slow 0.3s
    expect(document.querySelectorAll('#text .ant-upload-list-item').length).toBe(1);
  });
});
