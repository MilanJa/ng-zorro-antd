/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { testDirectionality } from 'ng-zorro-antd/core/testing';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzTagComponent } from './tag.component';
import { NzTagModule } from './tag.module';
import { NzTagVariant } from './typings';

describe('tag', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNzNoAnimation()]
    });
  });

  describe('basic tag', () => {
    let fixture: ComponentFixture<NzTestTagBasicComponent>;
    let testComponent: NzTestTagBasicComponent;
    let tag: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTagBasicComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      tag = fixture.debugElement.query(By.directive(NzTagComponent));
    });

    it('should className correct', () => {
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag');
    });

    it('should checkable work', () => {
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-checkable');

      testComponent.mode.set('checkable');
      fixture.detectChanges();
      expect(testComponent.checked()).toBe(false);
      expect(testComponent.checkedChange).toHaveBeenCalledTimes(0);
      expect(tag.nativeElement.classList).toContain('ant-tag-checkable');
      expect(tag.nativeElement.classList).not.toContain('ant-tag-checkable-checked');

      tag.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.checked()).toBe(true);
      expect(testComponent.checkedChange).toHaveBeenCalledTimes(1);
      expect(tag.nativeElement.classList).toContain('ant-tag-checkable');
      expect(tag.nativeElement.classList).toContain('ant-tag-checkable-checked');
    });

    it('should closeable work', async () => {
      fixture.detectChanges();
      expect(tag.nativeElement.querySelector('.anticon-close')).toBeNull();
      testComponent.mode.set('closeable');
      fixture.detectChanges();
      expect(tag.nativeElement.querySelector('.anticon-close')).toBeDefined();

      tag.nativeElement.querySelector('.anticon-close').click();
      fixture.detectChanges();
      expect(testComponent.onClose).toHaveBeenCalledTimes(1);
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('nz-tag')).toBeFalsy();
    });

    it('should color work', () => {
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-has-color');

      testComponent.color.set('green');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-green');

      testComponent.color.set('#f50');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-green');
      expect(tag.nativeElement.style.backgroundColor).toBe('rgb(255, 85, 0)');

      testComponent.color.set('green');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-green');
      expect(tag.nativeElement.style.backgroundColor).toBe('');
    });

    it('should status color work', () => {
      fixture.detectChanges();
      testComponent.color.set('success');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-success');

      testComponent.color.set('processing');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-processing');

      testComponent.color.set('invalid');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-invalid');
    });

    // https://github.com/NG-ZORRO/ng-zorro-antd/issues/1176
    it('should nzColor accept empty string', () => {
      testComponent.color.set('green');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-green');

      testComponent.color.set('');
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-has-color');

      testComponent.color.set(undefined);
      fixture.detectChanges();
      expect(tag.nativeElement.classList).not.toContain('ant-tag-has-color');
    });

    it('should have bordered by default', () => {
      expect(tag.nativeElement.classList).not.toContain('ant-tag-borderless');
      testComponent.bordered.set(false);
      fixture.detectChanges();
      expect(tag.nativeElement.classList).toContain('ant-tag-borderless');
    });
  });

  describe('prevent tag', () => {
    let fixture: ComponentFixture<NzTestTagPreventComponent>;
    let tag: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestTagPreventComponent);
      fixture.detectChanges();
      tag = fixture.debugElement.query(By.directive(NzTagComponent));
    });

    it('should close prevent default', async () => {
      fixture.detectChanges();
      expect(tag.nativeElement.querySelector('.anticon-close')).toBeDefined();
      tag.nativeElement.querySelector('.anticon-close').click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(tag.nativeElement.querySelector('.anticon-close')).toBeDefined();
    });
  });

  testDirectionality(() => NzTestTagBasicComponent, By.directive(NzTagComponent), 'ant-tag');
});

@Component({
  imports: [NzTagModule],
  selector: 'nz-test-basic-tag',
  template: `
    <nz-tag
      [nzMode]="mode()"
      [(nzChecked)]="checked"
      (nzCheckedChange)="checkedChange($event)"
      [nzColor]="color()"
      [nzBordered]="bordered()"
      (nzOnClose)="onClose()"
    >
      Tag 1
    </nz-tag>
  `
})
export class NzTestTagBasicComponent {
  readonly mode = signal<'default' | 'closeable' | 'checkable'>('default');
  readonly color = signal<string | undefined>(undefined);
  readonly checked = signal(false);
  readonly bordered = signal(true);
  onClose = vi.fn();
  afterClose = vi.fn();
  checkedChange = vi.fn();
}

@Component({
  imports: [NzTagModule],
  template: `<nz-tag nzMode="closeable" (nzOnClose)="onClose($event)">Tag 1</nz-tag>`
})
export class NzTestTagPreventComponent {
  onClose(e: MouseEvent): void {
    e.preventDefault();
  }
}

@Component({ imports: [NzTagModule], template: '' })
class TestTagInputsComponent {
  readonly onClose = vi.fn();
  readonly checkedChange = vi.fn();
  readonly checked = signal(false);
}

function renderTag(template: string): { fixture: ComponentFixture<TestTagInputsComponent>; tag: HTMLElement } {
  TestBed.overrideComponent(TestTagInputsComponent, { set: { imports: [NzTagComponent], template } });
  const fixture = TestBed.createComponent(TestTagInputsComponent);
  fixture.detectChanges();
  return { fixture, tag: fixture.nativeElement.querySelector('nz-tag') as HTMLElement };
}

const variantOf = (tag: HTMLElement): string[] =>
  ['filled', 'outlined', 'solid'].filter(v => tag.classList.contains(`ant-tag-${v}`));

interface VariantCase {
  name: string;
  attrs: string;
  variant: NzTagVariant;
  borderless: boolean;
}

// antd useColor.js:18-30: variant first, else bordered={false} -> 'filled', else 'filled'.
const VARIANT_CASES: VariantCase[] = [
  { name: 'default', attrs: '', variant: 'filled', borderless: false },
  { name: 'filled', attrs: 'nzVariant="filled"', variant: 'filled', borderless: false },
  { name: 'outlined', attrs: 'nzVariant="outlined"', variant: 'outlined', borderless: false },
  { name: 'solid', attrs: 'nzVariant="solid"', variant: 'solid', borderless: false },
  { name: 'deprecated nzBordered=false', attrs: '[nzBordered]="false"', variant: 'filled', borderless: true },
  { name: 'deprecated nzBordered=true', attrs: '[nzBordered]="true"', variant: 'filled', borderless: false },
  {
    name: 'nzBordered=false, then nzVariant=outlined',
    attrs: '[nzBordered]="false" nzVariant="outlined"',
    variant: 'outlined',
    borderless: false
  },
  {
    name: 'nzVariant=outlined, then nzBordered=false',
    attrs: 'nzVariant="outlined" [nzBordered]="false"',
    variant: 'outlined',
    borderless: false
  },
  {
    name: 'nzVariant=filled with nzBordered=false',
    attrs: 'nzVariant="filled" [nzBordered]="false"',
    variant: 'filled',
    borderless: true
  },
  { name: 'undefined nzVariant is unset', attrs: '[nzVariant]="undefined"', variant: 'filled', borderless: false },
  {
    name: 'undefined nzVariant falls back to the alias',
    attrs: '[nzVariant]="undefined" [nzBordered]="false"',
    variant: 'filled',
    borderless: true
  }
];

describe('tag v6 inputs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzNoAnimation(), provideNzIconsTesting()] });
  });

  describe('nzVariant and the deprecated nzBordered', () => {
    it.each(VARIANT_CASES)('$name', ({ attrs, variant, borderless }) => {
      const { tag } = renderTag(`<nz-tag ${attrs}>t</nz-tag>`);
      expect(variantOf(tag)).toEqual([variant]);
      expect(tag.classList.contains('ant-tag-borderless')).toBe(borderless);
    });

    it('treats undefined as unset when nzVariant changes later', () => {
      const fixture = TestBed.createComponent(TestTagVariantDynamicComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('nz-tag') as HTMLElement;
      const host = fixture.componentInstance;
      expect(variantOf(tag)).toEqual(['outlined']);
      expect(tag.classList).not.toContain('ant-tag-borderless');

      host.variant.set(undefined);
      fixture.detectChanges();
      expect(variantOf(tag)).toEqual(['filled']);
      expect(tag.classList).toContain('ant-tag-borderless');

      host.bordered.set(true);
      fixture.detectChanges();
      expect(variantOf(tag)).toEqual(['filled']);
      expect(tag.classList).not.toContain('ant-tag-borderless');

      host.variant.set('solid');
      host.bordered.set(false);
      fixture.detectChanges();
      expect(variantOf(tag)).toEqual(['solid']);
      expect(tag.classList).not.toContain('ant-tag-borderless');
    });

    it('reads nzVariant back as the resolved variant', () => {
      const { fixture } = renderTag(`<nz-tag [nzBordered]="false">t</nz-tag>`);
      const component = fixture.debugElement.query(By.directive(NzTagComponent)).componentInstance as NzTagComponent;
      expect(component.nzVariant).toBe('filled');
      expect(component.nzBordered).toBe(false);
    });
  });

  describe('custom colours per variant', () => {
    it.each([
      { attrs: 'nzColor="#f50"', bg: 'rgb(255, 85, 0)', color: '', border: '', hasColor: true },
      { attrs: 'nzColor="#f50" nzVariant="filled"', bg: 'rgb(255, 85, 0)', color: '', border: '', hasColor: true },
      { attrs: 'nzColor="#f50" nzVariant="solid"', bg: 'rgb(255, 85, 0)', color: '', border: '', hasColor: true },
      {
        attrs: 'nzColor="#f50" nzVariant="outlined"',
        bg: 'rgb(255, 238, 229)',
        color: 'rgb(255, 85, 0)',
        border: 'rgb(255, 85, 0)',
        hasColor: true
      },
      { attrs: 'nzColor="blue" nzVariant="outlined"', bg: '', color: '', border: '', hasColor: false },
      { attrs: 'nzColor="#f50" nzVariant="outlined" nzDisabled', bg: '', color: '', border: '', hasColor: false }
    ])('$attrs', ({ attrs, bg, color, border, hasColor }) => {
      const { tag } = renderTag(`<nz-tag ${attrs}>t</nz-tag>`);
      expect(tag.style.backgroundColor).toBe(bg);
      expect(tag.style.color).toBe(color);
      expect(tag.style.borderColor).toBe(border);
      expect(tag.classList.contains('ant-tag-has-color')).toBe(hasColor);
    });

    // The alias must not change the default stylesheet's custom-colour output.
    // This test passes on the code before this task too; it pins today's DOM.
    it('renders nzBordered=false with a custom hex colour exactly as before', () => {
      const { tag } = renderTag(`<nz-tag nzColor="#f50" [nzBordered]="false">t</nz-tag>`);
      expect([...tag.classList].sort()).toEqual([
        'ant-tag',
        'ant-tag-borderless',
        'ant-tag-filled',
        'ant-tag-has-color'
      ]);
      expect(tag.getAttribute('style')).toBe('background-color: rgb(255, 85, 0);');
      expect(tag.hasAttribute('tabindex')).toBe(false);
      expect(tag.hasAttribute('aria-disabled')).toBe(false);
    });
  });

  describe('nzIcon', () => {
    it('renders a named icon before the content and wraps the content in a span', () => {
      const { tag } = renderTag(`<nz-tag nzIcon="twitter" nzColor="#55acee">Twitter</nz-tag>`);
      const [icon, span] = Array.from(tag.children) as HTMLElement[];
      expect(tag.children.length).toBe(2);
      expect(icon.tagName).toBe('NZ-ICON');
      expect(icon.classList).toContain('anticon-twitter');
      expect(span.tagName).toBe('SPAN');
      expect(span.textContent!.trim()).toBe('Twitter');
    });

    it('renders a template icon the same way', () => {
      const { tag } = renderTag(`
        <ng-template #star><svg id="star" viewBox="0 0 24 24" width="1em" height="1em"></svg></ng-template>
        <nz-tag [nzIcon]="star">Star</nz-tag>
      `);
      const [icon, span] = Array.from(tag.children) as Element[];
      expect(icon.id).toBe('star');
      expect(span.tagName).toBe('SPAN');
      expect(span.textContent!.trim()).toBe('Star');
    });

    it('adds no wrapper without nzIcon', () => {
      const { tag } = renderTag(`<nz-tag>Plain</nz-tag>`);
      expect(tag.children.length).toBe(0);
      expect(tag.textContent!.trim()).toBe('Plain');
    });

    it('toggles the icon while the projected text survives', () => {
      const fixture = TestBed.createComponent(TestTagIconToggleComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('nz-tag') as HTMLElement;
      expect(tag.textContent!.trim()).toBe('Label');
      expect(tag.querySelector('nz-icon')).toBeNull();
      expect(tag.querySelector('span')).toBeNull();

      fixture.componentInstance.icon.set('check');
      fixture.detectChanges();
      expect(tag.textContent!.trim()).toBe('Label');
      expect(tag.querySelector('nz-icon.anticon-check')).not.toBeNull();
      expect(tag.querySelector('span')!.textContent!.trim()).toBe('Label');

      fixture.componentInstance.icon.set(undefined);
      fixture.detectChanges();
      expect(tag.textContent!.trim()).toBe('Label');
      expect(tag.querySelector('nz-icon')).toBeNull();
      expect(tag.querySelector('span')).toBeNull();
    });

    it('keeps the close icon last', () => {
      const { tag } = renderTag(`<nz-tag nzIcon="check-circle" nzMode="closeable">c</nz-tag>`);
      expect(tag.children.length).toBe(3);
      expect((tag.lastElementChild as HTMLElement).classList).toContain('ant-tag-close-icon');
    });
  });

  describe('nzDisabled', () => {
    it('blocks toggling in checkable mode and emits the checkable class only', () => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="checkable" nzDisabled (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      tag.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.checkedChange).not.toHaveBeenCalled();
      expect(tag.classList).not.toContain('ant-tag-checkable-checked');
      expect(tag.classList).toContain('ant-tag-checkable-disabled');
      expect(tag.classList).not.toContain('ant-tag-disabled');
      expect(tag.getAttribute('tabindex')).toBe('-1');
      expect(tag.getAttribute('aria-disabled')).toBe('true');
    });

    it('blocks closing', async () => {
      const { fixture, tag } = renderTag(`<nz-tag nzMode="closeable" nzDisabled (nzOnClose)="onClose()">c</nz-tag>`);
      (tag.querySelector('.ant-tag-close-icon') as HTMLElement).click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.componentInstance.onClose).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('nz-tag')).toBe(tag);
      expect(tag.classList).toContain('ant-tag-disabled');
    });

    it('keeps ant-tag-filled on a plain tag by default', () => {
      const { tag } = renderTag(`<nz-tag>p</nz-tag>`);
      expect(tag.classList).toContain('ant-tag-filled');
    });

    it('carries no ant-tag-filled on a checkable tag', () => {
      const { tag } = renderTag(`<nz-tag nzMode="checkable">c</nz-tag>`);
      expect(tag.classList).not.toContain('ant-tag-filled');
      expect(tag.classList).toContain('ant-tag-checkable');
    });

    it('treats [nzDisabled]="undefined" as unset', () => {
      const { tag } = renderTag(`<nz-tag [nzDisabled]="undefined">c</nz-tag>`);
      expect(tag.classList).not.toContain('ant-tag-disabled');
      expect(tag.hasAttribute('tabindex')).toBe(false);
      expect(tag.hasAttribute('aria-disabled')).toBe(false);
    });

    it('restores an app-supplied tabindex when enabled', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#supplied') as HTMLElement;
      const host = fixture.componentInstance;
      expect(tag.getAttribute('tabindex')).toBe('3');
      host.disabled.set(true);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('-1');
      host.disabled.set(false);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('3');
    });

    it('keeps the tabindex of a disabled tag that is not checkable', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#plain') as HTMLElement;
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('3');
      expect(tag.getAttribute('aria-disabled')).toBe('true');
      fixture.componentInstance.disabled.set(false);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('3');
    });

    it('keeps a tabindex the parent writes while the tag is disabled', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#dynamic') as HTMLElement;
      const host = fixture.componentInstance;
      expect(tag.getAttribute('tabindex')).toBe('5');
      host.disabled.set(true);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('-1');
      host.ti.set(7);
      fixture.detectChanges();
      host.disabled.set(false);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('7');
    });

    it('leaves a dynamically bound tabindex alone when never disabled', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#bound') as HTMLElement;
      expect(tag.getAttribute('tabindex')).toBe('5');
      fixture.componentInstance.ti.set(7);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('7');
    });

    it('removes tabindex on enable when none was supplied', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#none') as HTMLElement;
      expect(tag.getAttribute('tabindex')).toBe('0');
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('-1');
      fixture.componentInstance.disabled.set(false);
      fixture.detectChanges();
      expect(tag.getAttribute('tabindex')).toBe('0');
    });
  });

  describe('checkable accessibility', () => {
    const space = (tag: HTMLElement, init: KeyboardEventInit = {}): KeyboardEvent => {
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true, ...init });
      tag.dispatchEvent(event);
      return event;
    };

    it('is a checkbox whose aria-checked follows nzChecked, in the tab order', () => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="checkable" [nzChecked]="checked()" (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      expect(tag.getAttribute('role')).toBe('checkbox');
      expect(tag.getAttribute('aria-checked')).toBe('false');
      expect(tag.getAttribute('tabindex')).toBe('0');
      fixture.componentInstance.checked.set(true);
      fixture.detectChanges();
      expect(tag.getAttribute('aria-checked')).toBe('true');
    });

    it('keeps the app tabindex', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      for (const id of ['supplied', 'dynamic']) {
        const tag = fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
        expect(tag.getAttribute('role')).toBe('checkbox');
        expect(tag.getAttribute('tabindex')).toBe(id === 'supplied' ? '3' : '5');
      }
    });

    it('drops the tab stop it wrote when the tag stops being checkable', () => {
      const fixture = TestBed.createComponent(TestTagTabindexComponent);
      fixture.detectChanges();
      const tag = fixture.nativeElement.querySelector('#mode') as HTMLElement;
      expect(tag.getAttribute('tabindex')).toBe('0');
      fixture.componentInstance.mode.set('default');
      fixture.detectChanges();
      expect(tag.hasAttribute('tabindex')).toBe(false);
      expect(tag.hasAttribute('role')).toBe(false);
    });

    it('toggles on Space and prevents the page scroll', () => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="checkable" [(nzChecked)]="checked" (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      const event = space(tag);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.checkedChange).toHaveBeenCalledWith(true);
      expect(tag.getAttribute('aria-checked')).toBe('true');
      space(tag);
      fixture.detectChanges();
      expect(fixture.componentInstance.checkedChange).toHaveBeenLastCalledWith(false);
    });

    it('ignores a held Space', () => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="checkable" (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      space(tag, { repeat: true });
      fixture.detectChanges();
      expect(fixture.componentInstance.checkedChange).not.toHaveBeenCalled();
    });

    it('does not toggle on Space when disabled', () => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="checkable" nzDisabled (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      space(tag);
      fixture.detectChanges();
      expect(fixture.componentInstance.checkedChange).not.toHaveBeenCalled();
      expect(tag.getAttribute('tabindex')).toBe('-1');
      expect(tag.getAttribute('aria-checked')).toBe('false');
    });

    it.each(['default', 'closeable'])('carries no role, aria-checked or Space handling in %s mode', mode => {
      const { fixture, tag } = renderTag(
        `<nz-tag nzMode="${mode}" (nzCheckedChange)="checkedChange($event)">c</nz-tag>`
      );
      const event = space(tag);
      fixture.detectChanges();
      expect(tag.hasAttribute('role')).toBe(false);
      expect(tag.hasAttribute('aria-checked')).toBe(false);
      expect(tag.hasAttribute('tabindex')).toBe(false);
      expect(fixture.componentInstance.checkedChange).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });
});

@Component({
  imports: [NzTagModule],
  template: `<nz-tag [nzVariant]="variant()" [nzBordered]="bordered()">t</nz-tag>`
})
class TestTagVariantDynamicComponent {
  readonly variant = signal<NzTagVariant | undefined>('outlined');
  readonly bordered = signal(false);
}

@Component({
  imports: [NzTagModule],
  template: `
    <nz-tag id="supplied" nzMode="checkable" tabindex="3" [nzDisabled]="disabled()">x</nz-tag>
    <nz-tag id="plain" tabindex="3" [nzDisabled]="disabled()">x</nz-tag>
    <nz-tag id="dynamic" nzMode="checkable" [attr.tabindex]="ti()" [nzDisabled]="disabled()">x</nz-tag>
    <nz-tag id="bound" [attr.tabindex]="ti()">x</nz-tag>
    <nz-tag id="none" nzMode="checkable" [nzDisabled]="disabled()">x</nz-tag>
    <nz-tag id="mode" [nzMode]="mode()">x</nz-tag>
  `
})
class TestTagTabindexComponent {
  readonly mode = signal<'default' | 'closeable' | 'checkable'>('checkable');
  readonly disabled = signal(false);
  readonly ti = signal(5);
}

@Component({
  imports: [NzTagModule],
  template: `<nz-tag [nzIcon]="icon()">Label</nz-tag>`
})
class TestTagIconToggleComponent {
  readonly icon = signal<string | undefined>(undefined);
}
