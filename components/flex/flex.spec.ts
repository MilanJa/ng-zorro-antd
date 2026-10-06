/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import {
  NzAlign,
  NzFlex,
  NzFlexBasis,
  NzFlexGrow,
  NzFlexOrientation,
  NzFlexShrink,
  NzGap,
  NzJustify,
  NzWrap
} from 'ng-zorro-antd/flex';
import { NzFlexModule } from 'ng-zorro-antd/flex/flex.module';
import { NzFlexDirective } from 'ng-zorro-antd/flex/nz-flex.directive';

describe('flex', () => {
  let fixture: ComponentFixture<TestFlexComponent>;
  let component: TestFlexComponent;
  let element: HTMLElement;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestFlexComponent);
    element = fixture.debugElement.query(By.directive(NzFlexDirective)).nativeElement;
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should apply className', () => {
    expect(element.className).toContain('ant-flex');
  });

  it('should have correct direction', () => {
    component.isVertical.set(false);
    fixture.detectChanges();
    expect(element.className).not.toContain('vertical');
    component.isVertical.set(true);
    fixture.detectChanges();
    expect(element.className).toContain('vertical');
  });

  it('should have correct justification value', () => {
    const listOfJustifications: NzJustify[] = [
      'flex-start',
      'center',
      'flex-end',
      'space-between',
      'space-around',
      'space-evenly',
      'start',
      'end',
      'right',
      'left',
      'stretch',
      'normal'
    ];
    listOfJustifications.forEach(justification => {
      component.justify.set(justification);
      fixture.detectChanges();
      expect(element.className).toContain(justification);
    });
  });

  it('should have correct alignment value', () => {
    const listOfAlignments: NzAlign[] = ['flex-start', 'center', 'flex-end', 'start', 'end', 'stretch', 'normal'];
    listOfAlignments.forEach(alignment => {
      component.align.set(alignment);
      fixture.detectChanges();
      expect(element.className).toContain(alignment);
    });
  });

  it('should have correct gap value', () => {
    const listOfGaps: NzGap[] = ['small', 'middle', 'large', 10, 20, 30, 40];
    listOfGaps.forEach(gap => {
      component.gap.set(gap);
      fixture.detectChanges();
      let gapValue: string;
      switch (gap) {
        case 'small':
          gapValue = '8px';
          break;
        case 'middle':
          gapValue = '16px';
          break;
        case 'large':
          gapValue = '24px';
          break;
        default:
          gapValue = `${gap}px`;
      }

      expect(getComputedStyle(element).getPropertyValue('gap')).toEqual(gapValue);
    });

    component.gap.set('10rem');
    fixture.detectChanges();
    expect(getComputedStyle(element).getPropertyValue('gap')).toEqual(`${10 * 16}px`);
  });

  it('should keep the fixed px gap under v4, with the v6 token as an unresolved fallback source', () => {
    component.gap.set('small');
    fixture.detectChanges();
    expect(element.style.gap).toEqual('var(--ant-padding-xs, 8px)');
    expect(getComputedStyle(element).getPropertyValue('gap')).toEqual('8px');
  });

  it('should have correct wrap value', () => {
    const listOfWraps: NzWrap[] = ['wrap', 'nowrap', 'wrap-reverse'];
    listOfWraps.forEach(wrap => {
      component.wrap.set(wrap);
      fixture.detectChanges();
      expect(element.className).toContain(`flex-wrap-${wrap}`);
    });
  });

  it('should have correct flex value', () => {
    const listOfFlexes: NzFlex[] = ['0 0 auto', '1 1 100%', '0 1 50px'];
    listOfFlexes.forEach(flex => {
      component.flex.set(flex);
      fixture.detectChanges();
      expect(getComputedStyle(element).getPropertyValue('flex')).toEqual(flex);
    });

    component.flex.set('1 0 50rem');
    fixture.detectChanges();
    expect(getComputedStyle(element).getPropertyValue('flex')).toEqual('1 0 800px');
  });

  it('should have initial value for nzVertical', () => {
    expect(element.className).not.toContain('vertical');
  });

  it('should have initial value for justification', () => {
    expect(element.className).toContain('normal');
  });

  it('should have initial value for alignment', () => {
    expect(element.className).toContain('normal');
  });

  it('should have initial value for gap', () => {
    expect(getComputedStyle(element).getPropertyValue('gap')).toEqual('0px');
  });

  it('should have initial value for wrap', () => {
    expect(element.className).toContain('nowrap');
  });

  it('should have initial value for flex', () => {
    expect(getComputedStyle(element).getPropertyValue('--flex')).toEqual('');
  });

  it('should map the v6 align values to their classes and keep align-items: normal without the v6 stylesheet', () => {
    const v6Only: NzAlign[] = ['baseline', 'self-start', 'self-end'];
    v6Only.forEach(alignment => {
      component.align.set(alignment);
      fixture.detectChanges();
      expect(element.classList).toContain(`ant-flex-align-${alignment}`);
      expect(element.classList).not.toContain('ant-flex-align-normal');
      // v4 safety: no stylesheet styles the class, the browser default stays in place
      expect(getComputedStyle(element).alignItems).toBe('normal');
    });
  });

  it('should treat gap "medium" like "middle" and keep "middle" as a synonym', () => {
    component.gap.set('medium');
    fixture.detectChanges();
    expect(element.classList).toContain('ant-flex-gap-medium');
    expect(element.classList).not.toContain('ant-flex-gap-middle');
    expect(element.style.gap).toBe('var(--ant-padding, 16px)');
    expect(getComputedStyle(element).gap).toBe('16px');

    component.gap.set('middle');
    fixture.detectChanges();
    expect(element.classList).toContain('ant-flex-gap-middle');
    expect(element.classList).not.toContain('ant-flex-gap-medium');
    expect(element.style.gap).toBe('var(--ant-padding, 16px)');
  });

  it('should accept a boolean nzWrap', () => {
    component.wrap.set(true);
    fixture.detectChanges();
    expect(element.classList).toContain('ant-flex-wrap-wrap');
    expect(element.classList).not.toContain('ant-flex-wrap-nowrap');

    component.wrap.set(false);
    fixture.detectChanges();
    expect(element.classList).toContain('ant-flex-wrap-nowrap');
    expect(element.classList).not.toContain('ant-flex-wrap-wrap');
  });

  describe('nzOrientation', () => {
    let orientationFixture: ComponentFixture<TestFlexOrientationComponent>;
    let host: TestFlexOrientationComponent;
    let flexEl: HTMLElement;

    beforeEach(() => {
      orientationFixture = TestBed.createComponent(TestFlexOrientationComponent);
      host = orientationFixture.componentInstance;
      flexEl = orientationFixture.debugElement.query(By.directive(NzFlexDirective)).nativeElement;
      orientationFixture.detectChanges();
    });

    // antd useOrientation: a valid orientation decides; otherwise the vertical boolean does
    it.each([
      { vertical: false, orientation: undefined, isVertical: false },
      { vertical: true, orientation: undefined, isVertical: true },
      { vertical: false, orientation: 'vertical', isVertical: true },
      { vertical: false, orientation: 'horizontal', isVertical: false },
      { vertical: true, orientation: 'horizontal', isVertical: false },
      { vertical: true, orientation: 'vertical', isVertical: true },
      { vertical: true, orientation: 'diagonal', isVertical: true }
    ] as const)('vertical=$vertical orientation=$orientation -> vertical class $isVertical', c => {
      host.vertical.set(c.vertical);
      host.orientation.set(c.orientation as NzFlexOrientation | undefined);
      orientationFixture.detectChanges();
      expect(flexEl.classList.contains('ant-flex-vertical')).toBe(c.isVertical);
    });
  });
});

@Component({
  imports: [NzFlexModule],
  template: `
    <div
      nz-flex
      [nzVertical]="isVertical()"
      [nzJustify]="justify()"
      [nzAlign]="align()"
      [nzGap]="gap()"
      [nzWrap]="wrap()"
      [nzFlex]="flex()"
    >
      <div></div>
      <div></div>
      <div></div>
    </div>
  `
})
export class TestFlexComponent {
  readonly isVertical = signal(false);
  readonly justify = signal<NzJustify>('normal');
  readonly align = signal<NzAlign>('normal');
  readonly gap = signal<NzGap>(0);
  readonly wrap = signal<NzWrap | boolean>('nowrap');
  readonly flex = signal<`${NzFlexShrink} ${NzFlexGrow} ${NzFlexBasis}` | 'unset'>('unset');
}

@Component({
  imports: [NzFlexModule],
  template: `<div nz-flex [nzVertical]="vertical()" [nzOrientation]="orientation()"></div>`
})
export class TestFlexOrientationComponent {
  readonly vertical = signal(false);
  readonly orientation = signal<NzFlexOrientation | undefined>(undefined);
}
