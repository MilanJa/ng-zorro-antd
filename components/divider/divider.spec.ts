/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { Component, DebugElement, signal, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzDividerComponent, NzDividerOrientation, NzDividerTitlePlacement } from './divider.component';
import { NzDividerModule } from './divider.module';

describe('divider', () => {
  let fixture: ComponentFixture<TestDividerComponent>;
  let context: TestDividerComponent;
  let dl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting()]
    });
    fixture = TestBed.createComponent(TestDividerComponent);
    context = fixture.componentInstance;
    dl = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('#nzDashed', () => {
    for (const value of [true, false]) {
      it(`[${value}]`, () => {
        context.nzDashed.set(value);
        fixture.detectChanges();
        expect(dl.query(By.css('.ant-divider-dashed')) != null).toBe(value);
      });
    }
  });

  describe('#nzType', () => {
    for (const value of ['horizontal', 'vertical'] as const) {
      it(`[${value}]`, () => {
        context.nzType.set(value);
        fixture.detectChanges();
        expect(dl.query(By.css(`.ant-divider-${value}`)) != null).toBe(true);
      });
    }
  });

  describe('#nzText', () => {
    for (const item of [
      { text: 'with text', ret: true },
      { text: undefined, ret: false }
    ]) {
      it(`[${item.text}]`, () => {
        context.nzText.set(item.text);
        fixture.detectChanges();
        expect(dl.query(By.css('.ant-divider-inner-text')) != null).toBe(item.ret);
      });
    }

    it('should be custom template', () => {
      const fixture = TestBed.createComponent(TestDividerTextTemplateComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.anticon-plus'))).not.toBeNull();
    });
  });

  describe('#nzOrientation', () => {
    (['center', 'left', 'right'] as const).forEach(type => {
      it(`with ${type}`, () => {
        context.nzOrientation.set(type);
        fixture.detectChanges();
        expect(dl.query(By.css(`.ant-divider-with-text-${type}`))).not.toBeNull();
      });
    });
  });

  describe('#nzVariant', () => {
    (['dashed', 'dotted'] as const).forEach(type => {
      it(`with ${type}`, () => {
        context.nzVariant.set(type);
        fixture.detectChanges();
        expect(dl.query(By.css(`.ant-divider-${type}`))).not.toBeNull();
      });
    });

    it('should have solid as default value for nzVariant', () => {
      expect(context.comp.nzVariant).toEqual('solid');
    });
  });

  describe('#nzPlain', () => {
    for (const value of [true, false]) {
      it(`[${value}]`, () => {
        context.nzPlain.set(value);
        fixture.detectChanges();
        expect(dl.query(By.css('.ant-divider-plain')) != null).toBe(value);
      });
    }
  });

  describe('#nzSize', () => {
    it('should not have size class by default', () => {
      fixture.detectChanges();
      const el = dl.query(By.css('.ant-divider'))!.nativeElement as HTMLElement;
      expect(el.classList.contains('ant-divider-sm')).toBe(false);
      expect(el.classList.contains('ant-divider-md')).toBe(false);
      expect(el.classList.contains('ant-divider-lg')).toBe(false);
    });

    (['small', 'middle', 'large'] as const).forEach(size => {
      it(`with ${size}`, () => {
        context.nzSize.set(size);
        fixture.detectChanges();
        const el = dl.query(By.css('.ant-divider'))!.nativeElement as HTMLElement;
        expect(el.classList.contains('ant-divider-sm')).toBe(size === 'small');
        expect(el.classList.contains('ant-divider-md')).toBe(size === 'middle');
        // Large size does not have a specific class; ensure no lg class is added
        expect(el.classList.contains('ant-divider-lg')).toBe(false);
      });
    });
  });

  describe('#with text class', () => {
    it('should have ant-divider-with-text when nzText set', () => {
      context.nzText.set('text');
      fixture.detectChanges();
      expect(dl.query(By.css('.ant-divider-with-text'))).not.toBeNull();
    });

    it('should not have ant-divider-with-text when nzText removed', () => {
      context.nzText.set(undefined);
      fixture.detectChanges();
      expect(dl.query(By.css('.ant-divider-with-text'))).toBeNull();
    });
  });

  describe('#rails', () => {
    it('renders the two rails for a horizontal text divider only', () => {
      const railCount = (): number => dl.queryAll(By.css('.ant-divider-rail-start, .ant-divider-rail-end')).length;
      context.nzText.set('text');
      fixture.detectChanges();
      expect(railCount()).toBe(2);
      expect(
        dl.query(By.css('.ant-divider-rail-start + .ant-divider-inner-text + .ant-divider-rail-end'))
      ).not.toBeNull();

      context.nzType.set('vertical');
      fixture.detectChanges();
      expect(railCount()).toBe(0);

      context.nzType.set('horizontal');
      context.nzText.set(undefined);
      fixture.detectChanges();
      expect(railCount()).toBe(0);
    });
  });
});

@Component({
  imports: [NzDividerModule],
  template: `
    <nz-divider
      #comp
      [nzDashed]="nzDashed()"
      [nzType]="nzType()"
      [nzText]="nzText()"
      [nzOrientation]="nzOrientation()"
      [nzVariant]="nzVariant()"
      [nzPlain]="nzPlain()"
      [nzSize]="nzSize()"
    />
  `
})
class TestDividerComponent {
  @ViewChild('comp', { static: false }) comp!: NzDividerComponent;
  readonly nzDashed = signal(false);
  readonly nzType = signal<'vertical' | 'horizontal'>('horizontal');
  readonly nzText = signal<string | undefined>('with text');
  readonly nzOrientation = signal<'left' | 'right' | 'center'>('center');
  readonly nzVariant = signal<'dashed' | 'dotted' | 'solid'>('solid');
  readonly nzPlain = signal(false);
  readonly nzSize = signal<'small' | 'middle' | 'large' | undefined>(undefined);
}

@Component({
  imports: [NzDividerModule, NzIconModule],
  template: `
    <nz-divider nzDashed [nzText]="text">
      <ng-template #text>
        <nz-icon nzType="plus" />
        Add
      </ng-template>
    </nz-divider>
  `
})
class TestDividerTextTemplateComponent {}

interface AliasCase {
  name: string;
  template: string;
  axis: 'horizontal' | 'vertical';
  placement: 'start' | 'end' | 'center';
  v4: 'left' | 'right' | 'center';
}

const ltr = (attrs: string): string => `<nz-divider nzText="T" ${attrs} />`;
const rtl = (attrs: string): string => `<div dir="rtl"><nz-divider nzText="T" ${attrs} /></div>`;

const ALIAS_CASES: AliasCase[] = [
  { name: 'old left', template: ltr('nzOrientation="left"'), axis: 'horizontal', placement: 'start', v4: 'left' },
  { name: 'old right', template: ltr('nzOrientation="right"'), axis: 'horizontal', placement: 'end', v4: 'right' },
  {
    name: 'old center',
    template: ltr('nzOrientation="center"'),
    axis: 'horizontal',
    placement: 'center',
    v4: 'center'
  },
  { name: 'new start', template: ltr('nzTitlePlacement="start"'), axis: 'horizontal', placement: 'start', v4: 'left' },
  { name: 'new end', template: ltr('nzTitlePlacement="end"'), axis: 'horizontal', placement: 'end', v4: 'right' },
  {
    name: 'new center',
    template: ltr('nzTitlePlacement="center"'),
    axis: 'horizontal',
    placement: 'center',
    v4: 'center'
  },
  {
    name: 'old left + new end',
    template: ltr('nzOrientation="left" nzTitlePlacement="end"'),
    axis: 'horizontal',
    placement: 'end',
    v4: 'right'
  },
  {
    name: 'new end + old left',
    template: ltr('nzTitlePlacement="end" nzOrientation="left"'),
    axis: 'horizontal',
    placement: 'end',
    v4: 'right'
  },
  {
    name: 'old vertical (nzType)',
    template: ltr('nzType="vertical"'),
    axis: 'vertical',
    placement: 'center',
    v4: 'center'
  },
  {
    name: 'new vertical',
    template: ltr('nzOrientation="vertical"'),
    axis: 'vertical',
    placement: 'center',
    v4: 'center'
  },
  {
    name: 'nzType vertical + nzOrientation horizontal',
    template: ltr('nzType="vertical" nzOrientation="horizontal"'),
    axis: 'horizontal',
    placement: 'center',
    v4: 'center'
  },
  {
    name: 'nzOrientation horizontal + nzType vertical',
    template: ltr('nzOrientation="horizontal" nzType="vertical"'),
    axis: 'horizontal',
    placement: 'center',
    v4: 'center'
  },
  {
    name: 'nzType vertical + old left',
    template: ltr('nzType="vertical" nzOrientation="left"'),
    axis: 'vertical',
    placement: 'start',
    v4: 'left'
  },
  {
    name: 'new start + new vertical',
    template: ltr('nzTitlePlacement="start" nzOrientation="vertical"'),
    axis: 'vertical',
    placement: 'start',
    v4: 'left'
  },
  {
    name: 'invalid value is ignored',
    template: ltr('nzOrientation="diagonal"'),
    axis: 'horizontal',
    placement: 'center',
    v4: 'center'
  },
  { name: 'rtl old left', template: rtl('nzOrientation="left"'), axis: 'horizontal', placement: 'end', v4: 'left' },
  {
    name: 'rtl new start',
    template: rtl('nzTitlePlacement="start"'),
    axis: 'horizontal',
    placement: 'start',
    v4: 'right'
  },
  { name: 'rtl new end', template: rtl('nzTitlePlacement="end"'), axis: 'horizontal', placement: 'end', v4: 'left' }
];

@Component({ imports: [NzDividerComponent, BidiModule], template: '' })
class TestDividerAliasComponent {}

function renderDivider(template: string): HTMLElement {
  // `set` replaces the whole component metadata, so `imports` must be repeated. The standalone
  // compiler's JIT recompile (used by `overrideComponent`) cannot resolve `nz-divider` through the
  // `NzDividerModule` NgModule indirection (NG0304); importing `NzDividerComponent` directly works.
  TestBed.overrideComponent(TestDividerAliasComponent, {
    set: { template, imports: [NzDividerComponent, BidiModule] }
  });
  const aliasFixture = TestBed.createComponent(TestDividerAliasComponent);
  aliasFixture.detectChanges();
  return aliasFixture.nativeElement.querySelector('nz-divider') as HTMLElement;
}

describe('divider v6 inputs and deprecated aliases', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  it.each(ALIAS_CASES)('$name', ({ template, axis, placement, v4 }) => {
    const d = renderDivider(template);
    expect(d.classList).toContain(`ant-divider-${axis}`);
    expect(d.classList).not.toContain(`ant-divider-${axis === 'horizontal' ? 'vertical' : 'horizontal'}`);
    for (const p of ['start', 'end', 'center']) {
      expect(d.classList.contains(`ant-divider-with-text-${p}`)).toBe(p === placement);
    }
    // v4 safety: the physical class the v4 sheet sizes its ::before/::after lines with
    for (const p of ['left', 'right']) {
      expect(d.classList.contains(`ant-divider-with-text-${p}`)).toBe(p === v4);
    }
    expect(d.querySelectorAll('.ant-divider-rail-start').length).toBe(axis === 'horizontal' ? 1 : 0);
  });

  it('keeps the new inputs authoritative when the deprecated values change later', () => {
    const fixture = TestBed.createComponent(TestDividerDynamicComponent);
    fixture.detectChanges();
    const d = fixture.nativeElement.querySelector('nz-divider') as HTMLElement;
    expect(d.classList).toContain('ant-divider-with-text-end');

    const host = fixture.componentInstance;
    host.orientation.set('right');
    fixture.detectChanges();
    expect(d.classList).toContain('ant-divider-with-text-end');

    // the axis is not explicit yet (nzOrientation only carried title values), so nzType still applies
    host.type.set('vertical');
    fixture.detectChanges();
    expect(d.classList).toContain('ant-divider-vertical');

    host.orientation.set('horizontal');
    fixture.detectChanges();
    expect(d.classList).toContain('ant-divider-horizontal');
    host.type.set('horizontal');
    fixture.detectChanges();
    host.type.set('vertical');
    fixture.detectChanges();
    expect(d.classList).toContain('ant-divider-horizontal');

    host.placement.set('start');
    fixture.detectChanges();
    expect(d.classList).toContain('ant-divider-with-text-start');
  });

  it.each([
    { template: ltr('nzTitlePlacement="start" [nzTitleMargin]="20"'), side: 'start', value: '20px' },
    { template: ltr('nzTitlePlacement="start" nzTitleMargin="24"'), side: 'start', value: '24px' },
    { template: ltr('nzTitlePlacement="end" nzTitleMargin="3em"'), side: 'end', value: '3em' },
    { template: ltr('nzOrientation="left" [nzTitleMargin]="0"'), side: 'start', value: '0px' },
    { template: rtl('nzOrientation="left" [nzTitleMargin]="10"'), side: 'end', value: '10px' },
    { template: ltr('nzTitlePlacement="center" [nzTitleMargin]="20"'), side: null, value: '' }
  ] as const)('nzTitleMargin: $template', ({ template, side, value }) => {
    const d = renderDivider(template);
    const text = d.querySelector('.ant-divider-inner-text') as HTMLElement;
    expect(d.classList.contains('ant-divider-no-default-orientation-margin-start')).toBe(side === 'start');
    expect(d.classList.contains('ant-divider-no-default-orientation-margin-end')).toBe(side === 'end');
    expect(text.style.marginInlineStart).toBe(side === 'start' ? value : '');
    expect(text.style.marginInlineEnd).toBe(side === 'end' ? value : '');
  });
});

@Component({
  imports: [NzDividerModule],
  template: `
    <nz-divider nzText="T" [nzTitlePlacement]="placement()" [nzOrientation]="orientation()" [nzType]="type()" />
  `
})
class TestDividerDynamicComponent {
  readonly placement = signal<NzDividerTitlePlacement>('end');
  readonly orientation = signal<NzDividerOrientation | 'left' | 'right' | 'center'>('left');
  readonly type = signal<NzDividerOrientation>('horizontal');
}
