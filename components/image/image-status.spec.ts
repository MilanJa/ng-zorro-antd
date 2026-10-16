/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NzImageDirective } from './image.directive';
import { NzImageModule } from './image.module';

let seq = 0;

@Component({
  imports: [NzImageModule],
  template: `<img nz-image [nzSrc]="src" />`
})
class TestImageStatusComponent {
  readonly image = viewChild.required(NzImageDirective);
  readonly src = `https://test.com/status-${++seq}.png`;
}

describe('nz-image status', () => {
  let fixture: ComponentFixture<TestImageStatusComponent>;
  let image: NzImageDirective;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestImageStatusComponent);
    fixture.detectChanges();
    image = fixture.componentInstance.image();
  });

  it('exposes the load status as a signal and through the status accessor', () => {
    expect(image.imageStatus()).toBe('loading');
    expect(image.status).toBe('loading');

    image.backLoadImage.dispatchEvent(new Event('load'));
    expect(image.imageStatus()).toBe('normal');
    expect(image.status).toBe('normal');
    expect(image.previewable).toBe(true);
  });

  it('moves the signal to error and stops previewing', () => {
    image.backLoadImage.dispatchEvent(new Event('error'));
    expect(image.imageStatus()).toBe('error');
    expect(image.status).toBe('error');
    expect(image.previewable).toBe(false);
  });

  it('keeps status writable for existing callers', () => {
    image.status = 'error';
    expect(image.imageStatus()).toBe('error');
    image.status = 'normal';
    expect(image.imageStatus()).toBe('normal');
    expect(image.previewable).toBe(true);
  });

  it('leaves the img element classless with no wrapper', () => {
    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img')!;
    expect(img.className).toBe('');
    expect(img.getAttribute('role')).toBeNull();
    expect(img.getAttribute('tabindex')).toBeNull();
    expect(img.parentElement).toBe(root);
    expect(root.querySelector('.ant-image')).toBeNull();
  });
});
