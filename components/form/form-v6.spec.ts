/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzInputDirective } from 'ng-zorro-antd/input';

import { NzFormModule } from './form.module';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzFormModule, ReactiveFormsModule, NzInputDirective],
  template: `
    <form nz-form id="host" [formGroup]="fg">
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzRequired>Name</nz-form-label>
        <nz-form-control [nzSpan]="14" nzErrorTip="Required" nzHasFeedback>
          <input nz-input formControlName="name" />
        </nz-form-control>
      </nz-form-item>
    </form>
  `
})
class TestFormComponent {
  fg = new FormGroup({ name: new FormControl('', Validators.required) });
}

describe('form under antd v6 css', () => {
  let fixture: ComponentFixture<TestFormComponent>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(TestFormComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('colours the control and explain text red for an invalid item under v6', async () => {
    fixture.componentInstance.fg.controls.name.markAsDirty();
    fixture.componentInstance.fg.controls.name.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();
    // Wait past the input's `border-color` transition (`--ant-motion-duration-mid`, `.ant-input`'s own
    // status-driven rule) and the explain line's own enter transition (`ant-form-validate_animation-enter`,
    // ng-zorro's `animate.enter` binding) before reading colours.
    await new Promise(resolve => setTimeout(resolve, 350));
    fixture.detectChanges();

    const item = document.querySelector('#host .ant-form-item') as HTMLElement;
    expect(item.classList.contains('ant-form-item-has-error')).toBe(true);

    const input = item.querySelector('.ant-input') as HTMLElement;
    expect(getComputedStyle(input).borderColor).toBe('rgb(255, 77, 79)');

    const explain = item.querySelector('.ant-form-item-explain-error') as HTMLElement;
    expect(explain?.textContent?.trim()).toBe('Required');
    expect(getComputedStyle(explain).color).toBe('rgb(255, 77, 79)');

    expect(getComputedStyle(item.querySelector('.ant-form-item-label > label') as HTMLElement).height).toBe('32px');
  });

  it('shows the success feedback icon for a valid item with nzHasFeedback under v6', async () => {
    fixture.componentInstance.fg.controls.name.setValue('Milan');
    fixture.componentInstance.fg.controls.name.markAsDirty();
    fixture.componentInstance.fg.controls.name.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 350));
    fixture.detectChanges();

    const item = document.querySelector('#host .ant-form-item') as HTMLElement;
    expect(item.classList.contains('ant-form-item-has-success')).toBe(true);

    const icon = item.querySelector('.ant-form-item-feedback-icon-success') as HTMLElement;
    expect(icon).not.toBeNull();
    expect(getComputedStyle(icon).color).toBe('rgb(82, 196, 26)');
  });

  it("wraps the explain line in v6's ant-form-item-additional container and show-help motion class", async () => {
    fixture.componentInstance.fg.controls.name.markAsDirty();
    fixture.componentInstance.fg.controls.name.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();

    const item = document.querySelector('#host .ant-form-item') as HTMLElement;
    const additional = item.querySelector('.ant-form-item-additional') as HTMLElement;
    expect(additional).not.toBeNull();
    const explain = additional.querySelector('.ant-form-item-explain.ant-form-show-help');
    expect(explain).not.toBeNull();
  });

  it('marks an item ant-form-item-inline when the ancestor form is laid out inline', () => {
    const inlineFixture = TestBed.createComponent(TestInlineFormComponent);
    inlineFixture.detectChanges();
    const item = inlineFixture.nativeElement.querySelector('.ant-form-item') as HTMLElement;
    expect(item.classList.contains('ant-form-item-inline')).toBe(true);
  });
});

@Component({
  imports: [NzFormModule],
  template: `
    <form nz-form nzLayout="inline">
      <nz-form-item>
        <nz-form-label>Name</nz-form-label>
      </nz-form-item>
    </form>
  `
})
class TestInlineFormComponent {}
