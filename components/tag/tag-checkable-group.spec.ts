/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';

import { NZ_TAG_CHECKABLE_GROUP } from './tag-checkable-group.token';
import { NzTagComponent } from './tag.component';
import { NzTagModule } from './tag.module';
import { NzTagCheckableValue } from './typings';

@Component({
  imports: [FormsModule, NzTagModule],
  template: `
    <nz-tag-checkable-group [(ngModel)]="value" [nzMultiple]="multiple()" [nzDisabled]="disabled()">
      @for (tag of tags; track tag) {
        <nz-tag nzMode="checkable" [nzValue]="tag">{{ tag }}</nz-tag>
      }
      <nz-tag nzMode="checkable" [(nzChecked)]="loose">Loose</nz-tag>
      <nz-tag nzMode="checkable" nzValue="Own" [nzDisabled]="ownDisabled()">Own</nz-tag>
    </nz-tag-checkable-group>
  `
})
class TestGroupComponent {
  readonly tags = ['Movies', 'Books', 'Music', 'Sports'];
  value: NzTagCheckableValue | NzTagCheckableValue[] | null = ['Movies', 'Music'];
  loose = false;
  readonly multiple = signal(true);
  readonly disabled = signal(false);
  readonly ownDisabled = signal<boolean | undefined>(undefined);
}

@Component({
  imports: [ReactiveFormsModule, NzTagModule],
  template: `
    <nz-tag-checkable-group [formControl]="control">
      <nz-tag nzMode="checkable" nzValue="a">a</nz-tag>
    </nz-tag-checkable-group>
  `
})
class TestGroupFormComponent {
  readonly control = new FormControl<string[]>({ value: ['a'], disabled: true });
}

@Component({
  imports: [BidiModule, NzTagModule],
  template: `
    <div dir="rtl">
      <nz-tag-checkable-group><nz-tag nzMode="checkable" nzValue="a">a</nz-tag></nz-tag-checkable-group>
    </div>
  `
})
class TestGroupRtlComponent {}

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag nzMode="checkable" nzValue="x" [(nzChecked)]="checked" (nzCheckedChange)="change($event)">Solo</nz-tag>
  `
})
class TestSoloCheckableComponent {
  checked = false;
  readonly change = vi.fn();
}

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag-checkable-group [nzDisabled]="groupDisabled()">
      <nz-tag nzMode="checkable" nzValue="a">a</nz-tag>
    </nz-tag-checkable-group>
  `
})
class TestGroupTabindexComponent {
  readonly groupDisabled = signal(true);
}

const tagsOf = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nz-tag'));
const tagNamed = (fixture: ComponentFixture<unknown>, name: string): HTMLElement =>
  tagsOf(fixture).find(t => t.textContent!.trim() === name)!;
const checkedNames = (fixture: ComponentFixture<unknown>): string[] =>
  tagsOf(fixture)
    .filter(t => t.classList.contains('ant-tag-checkable-checked'))
    .map(t => t.textContent!.trim());

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe('nz-tag-checkable-group', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation()] });
  });

  it('multiple: the model is the array of checked nzValues', async () => {
    const fixture = TestBed.createComponent(TestGroupComponent);
    await settle(fixture);
    expect(checkedNames(fixture)).toEqual(['Movies', 'Music']);

    tagNamed(fixture, 'Books').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toEqual(['Movies', 'Music', 'Books']);

    tagNamed(fixture, 'Movies').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toEqual(['Music', 'Books']);
    expect(checkedNames(fixture)).toEqual(['Books', 'Music']);
  });

  it('single: the model is one value, or null once unchecked', async () => {
    const fixture = TestBed.createComponent(TestGroupComponent);
    fixture.componentInstance.multiple.set(false);
    fixture.componentInstance.value = 'Books';
    await settle(fixture);
    expect(checkedNames(fixture)).toEqual(['Books']);

    tagNamed(fixture, 'Movies').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toBe('Movies');
    expect(checkedNames(fixture)).toEqual(['Movies']);

    tagNamed(fixture, 'Movies').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toBeNull();
    expect(checkedNames(fixture)).toEqual([]);
  });

  it('keeps a tag without nzValue out of the model', async () => {
    const fixture = TestBed.createComponent(TestGroupComponent);
    await settle(fixture);
    tagNamed(fixture, 'Loose').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toEqual(['Movies', 'Music']);
    expect(fixture.componentInstance.loose).toBe(true);
    expect(tagNamed(fixture, 'Loose').classList).toContain('ant-tag-checkable-checked');
  });

  it('passes nzDisabled to the child tags; a bound child nzDisabled wins', async () => {
    const fixture = TestBed.createComponent(TestGroupComponent);
    fixture.componentInstance.disabled.set(true);
    await settle(fixture);
    for (const tag of tagsOf(fixture)) {
      expect(tag.classList).toContain('ant-tag-checkable-disabled');
      expect(tag.getAttribute('tabindex')).toBe('-1');
    }
    tagNamed(fixture, 'Books').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toEqual(['Movies', 'Music']);

    fixture.componentInstance.ownDisabled.set(false);
    await settle(fixture);
    expect(tagNamed(fixture, 'Own').classList).not.toContain('ant-tag-checkable-disabled');
    expect(tagNamed(fixture, 'Books').classList).toContain('ant-tag-checkable-disabled');
  });

  it('a bound child nzDisabled=false still cannot change a disabled group model', async () => {
    const fixture = TestBed.createComponent(TestGroupComponent);
    fixture.componentInstance.disabled.set(true);
    fixture.componentInstance.ownDisabled.set(false);
    await settle(fixture);
    tagNamed(fixture, 'Own').click();
    await settle(fixture);
    expect(fixture.componentInstance.value).toEqual(['Movies', 'Music']);
  });

  it('is disabled by a disabled form control', async () => {
    const fixture = TestBed.createComponent(TestGroupFormComponent);
    await settle(fixture);
    const tag = tagsOf(fixture)[0];
    expect(tag.classList).toContain('ant-tag-checkable-checked');
    expect(tag.classList).toContain('ant-tag-checkable-disabled');
    tag.click();
    await settle(fixture);
    expect(fixture.componentInstance.control.getRawValue()).toEqual(['a']);
  });

  it('emits the group host classes, with -rtl under rtl', () => {
    const plain = TestBed.createComponent(TestGroupComponent);
    plain.detectChanges();
    const host = plain.nativeElement.querySelector('nz-tag-checkable-group') as HTMLElement;
    expect(host.classList).toContain('ant-tag-checkable-group');
    expect(host.classList).not.toContain('ant-tag-checkable-group-rtl');

    const rtl = TestBed.createComponent(TestGroupRtlComponent);
    rtl.detectChanges();
    expect((rtl.nativeElement.querySelector('nz-tag-checkable-group') as HTMLElement).classList).toContain(
      'ant-tag-checkable-group-rtl'
    );
  });

  // Outside a group nothing changes, even with nzValue bound.
  it('leaves a checkable tag outside any group exactly as before', () => {
    const fixture = TestBed.createComponent(TestSoloCheckableComponent);
    fixture.detectChanges();
    const debug = fixture.debugElement.query(By.directive(NzTagComponent));
    const tag = debug.nativeElement as HTMLElement;
    expect(debug.injector.get(NZ_TAG_CHECKABLE_GROUP, null)).toBeNull();
    expect(debug.injector.get(NG_VALUE_ACCESSOR, null)).toBeNull();
    expect([...tag.classList].sort()).toEqual(['ant-tag', 'ant-tag-checkable']);
    expect(tag.hasAttribute('tabindex')).toBe(false);
    expect(tag.hasAttribute('aria-disabled')).toBe(false);

    tag.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked).toBe(true);
    expect(fixture.componentInstance.change).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.change).toHaveBeenCalledWith(true);
    expect([...tag.classList].sort()).toEqual(['ant-tag', 'ant-tag-checkable', 'ant-tag-checkable-checked']);

    tag.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked).toBe(false);
    expect(tag.classList).not.toContain('ant-tag-checkable-checked');
  });

  it('group-driven disabled writes tabindex -1 and removes it again', () => {
    const fixture = TestBed.createComponent(TestGroupTabindexComponent);
    fixture.detectChanges();
    const tag = tagsOf(fixture)[0];
    expect(tag.getAttribute('tabindex')).toBe('-1');

    fixture.componentInstance.groupDisabled.set(false);
    fixture.detectChanges();
    expect(tag.hasAttribute('tabindex')).toBe(false);
  });
});
