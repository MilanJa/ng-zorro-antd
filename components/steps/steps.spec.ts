/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DebugElement,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import { testDirectionality, updateNonSignalsInput } from 'ng-zorro-antd/core/testing';
import { BooleanInput, NzDirectionVHType, NzSizeDMSType, NzSizeDSType } from 'ng-zorro-antd/core/types';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';

import { NzDemoStepsClickableComponent } from './demo/clickable';
import { NzDemoStepsNavComponent } from './demo/nav';
import { NzStepComponent } from './step.component';
import {
  NzProgressDotTemplate,
  NzStatusType,
  NzStepsComponent,
  NzStepsOrientation,
  NzStepsTitlePlacement,
  NzStepsType,
  NzStepsVariant
} from './steps.component';
import { NzStepsModule } from './steps.module';

describe('steps', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting()]
    });
  });

  describe('outer steps', () => {
    let fixture: ComponentFixture<NzTestOuterStepsComponent>;
    let testComponent: NzTestOuterStepsComponent;
    let outStep: DebugElement;
    let innerSteps: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestOuterStepsComponent);
      testComponent = fixture.componentInstance;
      outStep = fixture.debugElement.query(By.directive(NzStepsComponent));
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
    });

    it('should init className correct', async () => {
      await stabilize(fixture);
      expect(outStep.nativeElement.className).toBe(
        'ant-steps ant-steps-filled ant-steps-horizontal ant-steps-label-horizontal ant-steps-title-horizontal'
      );
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-active ant-steps-item-process');
      expect(innerSteps[1].nativeElement.className).toBe('ant-steps-item ant-steps-item-wait');
      expect(innerSteps[2].nativeElement.className).toBe('ant-steps-item ant-steps-item-wait');
    });

    it('should current change correct', async () => {
      await stabilize(fixture);
      testComponent.current = 1;
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-finish');
      expect(innerSteps[1].nativeElement.className).toBe('ant-steps-item ant-steps-item-process ant-steps-item-active');
      expect(innerSteps[2].nativeElement.className).toBe('ant-steps-item ant-steps-item-wait');
    });

    it('should tail display correct', async () => {
      await stabilize(fixture);
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-tail')).toBeTruthy();
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-tail')).toBeTruthy();
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-tail')).toBeFalsy();
    });

    it('should title correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('0title');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('1title');
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('2title');
    });

    it('should subtitle correct', () => {
      testComponent.subtitle = '0subtitle';
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-subtitle').innerText.trim()).toBe('0subtitle');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-subtitle')).toBeFalsy();
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-subtitle')).toBeFalsy();
      testComponent.subtitle = undefined;
      fixture.detectChanges();
    });

    it('should description correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        '0description'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        '1description'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        '2description'
      );
    });

    it('should icon display correct', () => {
      fixture.detectChanges();
      expect(
        innerSteps[0].nativeElement
          .querySelector('.ant-steps-item-icon')
          .firstElementChild!.classList.contains('ant-steps-icon')
      ).toBe(true);
      expect(
        innerSteps[1].nativeElement
          .querySelector('.ant-steps-item-icon')
          .firstElementChild!.classList.contains('ant-steps-icon')
      ).toBe(true);
      expect(
        innerSteps[2].nativeElement
          .querySelector('.ant-steps-item-icon')
          .firstElementChild!.classList.contains('ant-steps-icon')
      ).toBe(true);
    });

    it('should size display correct', () => {
      fixture.detectChanges();
      testComponent.size = 'small';
      testComponent.cdr.markForCheck();
      fixture.detectChanges();
      expect(outStep.nativeElement.className).toBe(
        'ant-steps ant-steps-filled ant-steps-horizontal ant-steps-label-horizontal ant-steps-title-horizontal ant-steps-small'
      );
    });

    it('should direction display correct', () => {
      fixture.detectChanges();
      testComponent.direction = 'vertical';
      testComponent.cdr.markForCheck();
      fixture.detectChanges();
      expect(outStep.nativeElement.className).toBe(
        'ant-steps ant-steps-filled ant-steps-title-horizontal ant-steps-vertical'
      );
    });

    it('should label placement display correct', () => {
      fixture.detectChanges();
      testComponent.labelPlacement = 'vertical';
      testComponent.cdr.markForCheck();
      fixture.detectChanges();
      expect(outStep.nativeElement.classList).toContain('ant-steps-label-vertical');
    });

    it('should status display correct', async () => {
      await stabilize(fixture);
      testComponent.status = 'wait';
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-active ant-steps-item-wait');
      testComponent.status = 'finish';
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-active ant-steps-item-finish');
      testComponent.status = 'error';
      testComponent.current = 1;
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(innerSteps[1].nativeElement.className).toBe('ant-steps-item ant-steps-item-error ant-steps-item-active');
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-finish ant-steps-next-error');
      // A rail takes the status of the step it leads to.
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-tail').className).toBe(
        'ant-steps-item-tail ant-steps-item-rail ant-steps-item-rail-error'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-tail').className).toBe(
        'ant-steps-item-tail ant-steps-item-rail ant-steps-item-rail-wait'
      );
    });

    it('should label placement map to the v6 title placement', async () => {
      await stabilize(fixture);
      testComponent.labelPlacement = 'vertical';
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(outStep.nativeElement.classList).toContain('ant-steps-title-vertical');
      expect(outStep.nativeElement.classList).not.toContain('ant-steps-title-horizontal');
      testComponent.direction = 'vertical';
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(outStep.nativeElement.classList).toContain('ant-steps-title-horizontal');
      expect(outStep.nativeElement.classList).not.toContain('ant-steps-title-vertical');
    });

    it('should processDot display correct', async () => {
      await stabilize(fixture);
      testComponent.progressDot = true;
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(outStep.nativeElement.classList.contains('ant-steps-dot')).toBe(true);
      expect(
        innerSteps[0].nativeElement
          .querySelector('.ant-steps-icon')
          .firstElementChild!.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
      expect(
        innerSteps[1].nativeElement
          .querySelector('.ant-steps-icon')
          .firstElementChild!.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
      expect(
        innerSteps[2].nativeElement
          .querySelector('.ant-steps-icon')
          .firstElementChild!.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
    });

    it('should processDot template display correct', async () => {
      await stabilize(fixture);
      testComponent.progressDot = testComponent.progressTemplate!;
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(outStep.nativeElement.classList.contains('ant-steps-dot')).toBe(true);
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-icon').firstElementChild.innerText.trim()).toBe(
        'process0'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-icon').firstElementChild.innerText.trim()).toBe(
        'wait1'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-icon').firstElementChild.innerText.trim()).toBe(
        'wait2'
      );
      expect(
        innerSteps[0].nativeElement
          .querySelector('.ant-steps-icon')
          .lastElementChild.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
      expect(
        innerSteps[1].nativeElement
          .querySelector('.ant-steps-icon')
          .lastElementChild.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
      expect(
        innerSteps[2].nativeElement
          .querySelector('.ant-steps-icon')
          .lastElementChild.classList.contains('ant-steps-icon-dot')
      ).toBe(true);
    });

    it('should support custom starting index', async () => {
      await stabilize(fixture);
      testComponent.startIndex = 3;
      testComponent.current = 3;
      testComponent.cdr.markForCheck();
      await stabilize(fixture);
      expect(innerSteps[0].nativeElement.className).toBe('ant-steps-item ant-steps-item-active ant-steps-item-process');
      expect(innerSteps[1].nativeElement.className).toBe('ant-steps-item ant-steps-item-wait');
      expect(innerSteps[2].nativeElement.className).toBe('ant-steps-item ant-steps-item-wait');
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('4');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('5');
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('6');
    });
  });

  describe('inner step string', () => {
    let fixture: ComponentFixture<NzTestInnerStepStringComponent>;
    let testComponent: NzTestInnerStepStringComponent;
    let innerSteps: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestInnerStepStringComponent);
      testComponent = fixture.debugElement.componentInstance;
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
    });

    it('should status display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.classList).toContain('ant-steps-item-process');
      expect(innerSteps[1].nativeElement.classList).toContain('ant-steps-item-process');
      expect(innerSteps[2].nativeElement.classList).toContain('ant-steps-item-process');
      testComponent.status.set('wait');
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.classList).toContain('ant-steps-item-wait');
      expect(innerSteps[1].nativeElement.classList).toContain('ant-steps-item-wait');
      expect(innerSteps[2].nativeElement.classList).toContain('ant-steps-item-wait');
    });

    it('should title display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('title');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('title');
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('title');
    });

    it('should description display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'description'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'description'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'description'
      );
    });

    it('should icon display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toBe(
        'anticon anticon-user'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toBe(
        'anticon anticon-user'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toBe(
        'anticon anticon-user'
      );
    });
  });

  describe('inner step template', () => {
    let fixture: ComponentFixture<NzTestInnerStepTemplateComponent>;
    let innerSteps: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestInnerStepTemplateComponent);
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
    });

    it('should title display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('titleTemplate');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('titleTemplate');
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-title').innerText.trim()).toBe('titleTemplate');
    });

    it('should description display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'descriptionTemplate'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'descriptionTemplate'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-item-description').innerText.trim()).toBe(
        'descriptionTemplate'
      );
    });

    it('should icon display correct', () => {
      fixture.detectChanges();
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toContain(
        'anticon-smile-o'
      );
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toContain(
        'anticon-smile-o'
      );
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-icon').firstElementChild.className).toContain(
        'anticon-smile-o'
      );
    });
  });

  describe('step ng for', () => {
    it('should title display correct', () => {
      TestBed.createComponent(NzTestStepForComponent).detectChanges();
    });

    it('should push works correct', () => {
      const comp = TestBed.createComponent(NzTestStepForComponent);
      comp.detectChanges();
      comp.debugElement.componentInstance.updateSteps();
      comp.detectChanges();
    });
  });

  describe('step async assign steps', () => {
    it('should allow steps assigned asynchronously', async () => {
      const fixture: ComponentFixture<NzTestStepAsyncComponent> = TestBed.createComponent(NzTestStepAsyncComponent);
      let innerSteps: DebugElement[];

      fixture.detectChanges();
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
      expect(innerSteps.length).toBe(0);

      await stabilize(fixture, 1000);
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
      fixture.detectChanges();
      expect(innerSteps.length).toBe(3);
      // These steps have neither title nor subtitle.
      expect(innerSteps[0].nativeElement.className).toBe(
        'ant-steps-item ant-steps-item-empty-header ant-steps-item-finish'
      );
      expect(innerSteps[1].nativeElement.className).toBe(
        'ant-steps-item ant-steps-item-active ant-steps-item-empty-header ant-steps-item-process'
      );
      expect(innerSteps[0].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('');
      expect(innerSteps[1].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('2');
      expect(innerSteps[2].nativeElement.querySelector('.ant-steps-icon').innerText.trim()).toBe('3');
    });
  });

  describe('step clickable', () => {
    let fixture: ComponentFixture<NzDemoStepsClickableComponent>;
    let testComponent: NzDemoStepsClickableComponent;
    let innerSteps: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoStepsClickableComponent);
      testComponent = fixture.debugElement.componentInstance;
      innerSteps = fixture.debugElement.queryAll(By.directive(NzStepComponent));
    });

    it('should clickable', async () => {
      await stabilize(fixture);
      innerSteps
        .map(step => step.nativeElement.querySelector('.ant-steps-item-container'))
        .forEach((e: HTMLElement) => {
          expect(e.getAttribute('role')).toBe('button');
        });
    });

    it('should output work', async () => {
      await stabilize(fixture);
      vi.spyOn(testComponent, 'onIndexChange');
      innerSteps[1].nativeElement.querySelector('.ant-steps-item-container').click();
      fixture.detectChanges();
      expect(testComponent.onIndexChange).toHaveBeenCalledWith(1);
    });

    it('should disable work', async () => {
      testComponent.disable = true;
      await stabilize(fixture);
      const step = innerSteps[0].nativeElement.querySelector('.ant-steps-item-container') as HTMLElement;
      expect(step.getAttribute('role')).not.toBe('button');
      vi.spyOn(testComponent, 'onIndexChange');
      step.click();
      fixture.detectChanges();
      expect(testComponent.onIndexChange).not.toHaveBeenCalled();
    });

    it("should can't click when status is process", async () => {
      testComponent.disable = false;
      testComponent.index.set(0);
      await stabilize(fixture);
      vi.spyOn(testComponent, 'onIndexChange');
      innerSteps[0].nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.onIndexChange).not.toHaveBeenCalled();
    });

    it('should enable and disable work', async () => {
      await stabilize(fixture);
      innerSteps[1].componentInstance.disable();
      fixture.detectChanges();
      vi.spyOn(testComponent, 'onIndexChange');
      innerSteps[1].nativeElement.querySelector('.ant-steps-item-container').click();
      fixture.detectChanges();
      expect(testComponent.onIndexChange).not.toHaveBeenCalled();
      innerSteps[1].componentInstance.enable();
      fixture.detectChanges();
      innerSteps[1].nativeElement.querySelector('.ant-steps-item-container').click();
      fixture.detectChanges();
      expect(testComponent.onIndexChange).toHaveBeenCalledTimes(1);
      expect(testComponent.onIndexChange).toHaveBeenCalledWith(1);
    });
  });

  describe('navigation', () => {
    let fixture: ComponentFixture<NzDemoStepsNavComponent>;
    let steps: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoStepsNavComponent);
      steps = fixture.debugElement.queryAll(By.directive(NzStepsComponent));
    });

    it('should clickable', async () => {
      await stabilize(fixture);

      steps
        .map(step => step.nativeElement)
        .forEach((e: HTMLElement) => {
          expect(e.classList).toContain('ant-steps-navigation');
        });
    });
  });
  describe('v6 inputs', () => {
    let fixture: ComponentFixture<NzTestStepsV6InputsComponent>;
    let host: NzTestStepsV6InputsComponent;
    const cls = (id: string): string[] => [...fixture.nativeElement.querySelector(`#${id}`).classList];
    const items = (id: string): HTMLElement[] =>
      Array.from(fixture.nativeElement.querySelectorAll(`#${id} .ant-steps-item`));
    const body = (id: string, i: number): string =>
      items(id)[i].querySelector('.ant-steps-item-description')!.textContent!.trim();
    const has = (id: string, ...names: string[]): void => expect(cls(id), id).toEqual(expect.arrayContaining(names));
    const lacks = (id: string, name: string): void => expect(cls(id), id).not.toContain(name);
    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestStepsV6InputsComponent);
      host = fixture.componentInstance;
    });
    it('maps nzOrientation and nzTitlePlacement to the classes of the deprecated inputs', async () => {
      await stabilize(fixture);
      expect(cls('v6').join(' ')).toBe(
        'ant-steps ant-steps-filled ant-steps-horizontal ant-steps-label-horizontal ant-steps-title-horizontal'
      );
      host.titlePlacement.set('vertical');
      await stabilize(fixture);
      has('v6', 'ant-steps-label-vertical', 'ant-steps-title-vertical');
      host.orientation.set('vertical');
      await stabilize(fixture);
      has('v6', 'ant-steps-vertical', 'ant-steps-title-horizontal');
      lacks('v6', 'ant-steps-horizontal');
    });
    it('lets the new input win whichever attribute comes first', async () => {
      await stabilize(fixture);
      for (const id of ['new-first', 'old-first']) {
        has(id, 'ant-steps-horizontal', 'ant-steps-title-vertical');
        lacks(id, 'ant-steps-vertical');
        expect(body(id, 0), id).toBe('new');
      }
    });
    it('renders nzType="dot" and keeps nzProgressDot as an alias', async () => {
      host.type.set('dot');
      await stabilize(fixture);
      has('v6', 'ant-steps-dot', 'ant-steps-title-vertical');
      expect(items('v6')[0].querySelector('.ant-steps-icon > .ant-steps-icon-dot')).toBeTruthy();
      host.legacyDot.set(true);
      await stabilize(fixture);
      has('legacy', 'ant-steps-dot');
      host.legacyType.set('navigation'); // antd `mergedType`: a non-default `type` wins over `progressDot`
      await stabilize(fixture);
      has('legacy', 'ant-steps-navigation');
      lacks('legacy', 'ant-steps-dot');
    });
    it('makes ant-steps-filled conditional on nzVariant and keeps the v4 classes', async () => {
      host.variant.set('outlined');
      await stabilize(fixture);
      has('v6', 'ant-steps-outlined', 'ant-steps-horizontal', 'ant-steps-label-horizontal');
      lacks('v6', 'ant-steps-filled');
    });
    it('renders nzContent and prefers it over nzDescription', async () => {
      await stabilize(fixture);
      expect([body('v6', 0), body('v6', 1), body('v6', 2)]).toEqual(['c0', 'contentTemplate', 'd2']);
    });
    it('emits nzClick with the index, also for the current step, never when disabled', async () => {
      await stabilize(fixture);
      const [first, current, last] = items('v6').map(i => i.querySelector<HTMLElement>('.ant-steps-item-container')!);
      expect([first.getAttribute('role'), last.getAttribute('role')]).toEqual(['button', null]);
      first.click();
      current.click();
      host.disabled.set(true);
      await stabilize(fixture);
      first.click();
      expect(host.clicked).toEqual([0, 1]);
      expect(first.getAttribute('role')).toBeNull();
    });
  });
  describe('v6 layouts', () => {
    let fixture: ComponentFixture<NzTestStepsLayoutComponent>;
    let host: NzTestStepsLayoutComponent;
    const root = (): HTMLElement => fixture.nativeElement.querySelector('#layout');
    const items = (): HTMLElement[] => Array.from(root().querySelectorAll('.ant-steps-item'));
    const rail = (i: number): DOMTokenList => items()[i].querySelector('.ant-steps-item-rail')!.classList;
    const click = (i: number): void => items()[i].querySelector<HTMLElement>('.ant-steps-item-container')!.click();
    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestStepsLayoutComponent);
      host = fixture.componentInstance;
    });
    it('windows the steps around nzCurrent with an ellipsis item', async () => {
      await stabilize(fixture);
      expect(root().classList).toContain('ant-steps-max-count');
      expect(items()[4].style.display).toBe('none');
      const ellipsis = items()[3];
      for (const c of [
        'ant-steps-item-ellipsis',
        'ant-steps-item-disabled',
        'ant-steps-item-custom',
        'ant-steps-item-wait'
      ]) {
        expect(ellipsis.classList).toContain(c);
      }
      expect(ellipsis.querySelector('.ant-steps-icon .anticon-ellipsis')).toBeTruthy();
      expect(ellipsis.querySelector('.ant-steps-item-title')!.textContent!.trim()).toBe('');
      expect(rail(2)).toContain('ant-steps-item-rail-wait');
      const shown = items().filter(i => i.style.display !== 'none');
      expect(shown.map(i => i.querySelector('.ant-steps-icon')!.textContent!.trim())).toEqual([
        '1',
        '2',
        '3',
        '',
        '6',
        '7'
      ]);
    });
    it('marks a range before the current step finish, or error when a hidden step errs', async () => {
      host.current.set(6);
      await stabilize(fixture);
      expect(items()[2].classList).toContain('ant-steps-item-finish');
      expect(items()[3].style.display).toBe('none');
      expect(rail(1)).toContain('ant-steps-item-rail-finish');
      host.errorAt.set(3);
      await stabilize(fixture);
      expect(items()[2].classList).toContain('ant-steps-item-error');
      expect(rail(1)).toContain('ant-steps-item-rail-error');
    });
    it('windows on the offset current and reports original indexes with nzStartIndex', async () => {
      host.start.set(3);
      host.current.set(5);
      await stabilize(fixture);
      expect(items()[4].classList).toContain('ant-steps-item-ellipsis');
      expect(items()[3].querySelector('.ant-steps-icon')!.textContent!.trim()).toBe('7');
      click(4); // the ellipsis item is disabled
      click(6);
      expect(host.changed).toEqual([9]);
    });
    it('warns and shows every step when nzMaxCount is below 3', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      host.max.set(2);
      await stabilize(fixture);
      expect(warn.mock.calls.some(c => c.join(' ').includes('`nzMaxCount` on `nz-steps` should be at least 3'))).toBe(
        true
      );
      expect(root().classList).not.toContain('ant-steps-max-count');
      expect(items().filter(i => i.style.display === 'none').length).toBe(0);
      warn.mockRestore();
    });
    it('renders inline as dots with the content as tooltip title, panel with an inert arrow, nzEllipsis', async () => {
      const titles = (): unknown[] =>
        fixture.debugElement
          .queryAll(By.directive(NzTooltipDirective))
          .map(d => d.injector.get(NzTooltipDirective).title);
      host.max.set(undefined);
      await stabilize(fixture);
      expect(titles().every(t => t === null)).toBe(true);
      host.type.set('inline');
      await stabilize(fixture);
      expect([...root().classList]).toEqual(
        expect.arrayContaining(['ant-steps-inline', 'ant-steps-dot', 'ant-steps-title-vertical'])
      );
      expect(titles()).toEqual(Array(7).fill('c'));
      host.type.set('panel');
      host.orientation.set('vertical'); // antd: panel is always horizontal
      host.ellipsis.set(true);
      await stabilize(fixture);
      expect([...root().classList]).toEqual(
        expect.arrayContaining(['ant-steps-panel', 'ant-steps-horizontal', 'ant-steps-ellipsis'])
      );
      const arrows = root().querySelectorAll<SVGElement>('nz-step > svg.ant-steps-panel-arrow');
      expect(arrows.length).toBe(7);
      expect(getComputedStyle(arrows[0]).display).toBe('none'); // v4 safety: inert without the v6 patch
      host.type.set('default');
      await stabilize(fixture);
      expect(root().querySelector('.ant-steps-panel-arrow')).toBeNull();
    });
  });
  testDirectionality(() => NzTestOuterStepsComponent, By.directive(NzStepsComponent), 'ant-steps');
});

async function stabilize<T>(fixture: ComponentFixture<T>, ms?: number): Promise<void> {
  fixture.detectChanges();
  await updateNonSignalsInput(fixture, ms);
  fixture.detectChanges();
}

@Component({
  selector: 'nz-test-outer-steps',
  imports: [NgTemplateOutlet, NzStepsModule],
  template: `
    <nz-steps
      [nzCurrent]="current"
      [nzDirection]="direction"
      [nzLabelPlacement]="labelPlacement"
      [nzSize]="size"
      [nzStatus]="status"
      [nzProgressDot]="progressDot"
      [nzStartIndex]="startIndex"
    >
      <nz-step nzTitle="0title" [nzSubtitle]="subtitle" nzDescription="0description" />
      <nz-step nzTitle="1title" nzDescription="1description" />
      <nz-step nzTitle="2title" nzDescription="2description" />
    </nz-steps>
    <ng-template #progressTemplate let-dot let-status="status" let-index="index">
      <span class="insert-span">{{ status }}{{ index }}</span>
      <ng-template [ngTemplateOutlet]="dot" />
    </ng-template>
  `
})
export class NzTestOuterStepsComponent {
  public readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('progressTemplate', { static: false }) progressTemplate?: NzProgressDotTemplate;
  current = 0;
  direction: NzDirectionVHType = 'horizontal';
  labelPlacement: NzDirectionVHType = 'horizontal';
  size: NzSizeDSType = 'default';
  status: NzStatusType = 'process';
  subtitle?: string | TemplateRef<void>;
  progressDot: BooleanInput | NzProgressDotTemplate | undefined | null = false;
  startIndex = 0;
}

@Component({
  imports: [NzIconModule, NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="current">
      <nz-step [nzTitle]="title" [nzDescription]="description" [nzIcon]="icon" [nzStatus]="status()" />
      <nz-step [nzTitle]="title" [nzDescription]="description" [nzIcon]="icon" [nzStatus]="status()" />
      <nz-step [nzTitle]="title" [nzDescription]="description" [nzIcon]="icon" [nzStatus]="status()" />
    </nz-steps>
    <ng-template #titleTemplate>titleTemplate</ng-template>
    <ng-template #descriptionTemplate>descriptionTemplate</ng-template>
    <ng-template #iconTemplate><nz-icon nzType="smile-o" /></ng-template>
  `
})
export class NzTestInnerStepStringComponent {
  @ViewChild('titleTemplate', { static: false }) titleTemplate?: TemplateRef<void>;
  @ViewChild('descriptionTemplate', { static: false }) descriptionTemplate?: TemplateRef<void>;
  @ViewChild('iconTemplate', { static: false }) iconTemplate?: TemplateRef<void>;
  readonly status = signal<NzStatusType>('process');
  current = 1;
  icon = 'user';
  title = 'title';
  description = 'description';
}

@Component({
  imports: [NzIconModule, NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1">
      <nz-step [nzTitle]="titleTemplate" [nzDescription]="descriptionTemplate" [nzIcon]="iconTemplate" />
      <nz-step [nzTitle]="titleTemplate" [nzDescription]="descriptionTemplate" [nzIcon]="iconTemplate" />
      <nz-step [nzTitle]="titleTemplate" [nzDescription]="descriptionTemplate" [nzIcon]="iconTemplate" />
    </nz-steps>
    <ng-template #titleTemplate>titleTemplate</ng-template>
    <ng-template #descriptionTemplate>descriptionTemplate</ng-template>
    <ng-template #iconTemplate><nz-icon nzType="smile-o" /></ng-template>
  `
})
export class NzTestInnerStepTemplateComponent {}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps>
      @for (step of steps; track step) {
        <nz-step />
      }
    </nz-steps>
  `
})
export class NzTestStepForComponent {
  steps = [1, 2, 3];
  updateSteps(): void {
    this.steps.push(4);
  }
}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps [nzCurrent]="1">
      @for (step of stepsSignal(); track step) {
        <nz-step />
      }
    </nz-steps>
  `
})
export class NzTestStepAsyncComponent implements OnInit {
  readonly stepsSignal = signal<number[]>([]);

  ngOnInit(): void {
    setTimeout(() => {
      this.stepsSignal.set([1, 2, 3]);
    }, 1000);
  }
}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps
      id="v6"
      [nzCurrent]="1"
      [nzOrientation]="orientation()"
      [nzTitlePlacement]="titlePlacement()"
      [nzType]="type()"
      [nzVariant]="variant()"
    >
      <nz-step nzTitle="a" nzContent="c0" [nzDisabled]="disabled()" (nzClick)="clicked.push($event)" />
      <nz-step nzTitle="b" [nzContent]="contentTpl" nzDescription="legacy" (nzClick)="clicked.push($event)" />
      <nz-step nzTitle="c" nzDescription="d2" />
    </nz-steps>
    <nz-steps
      id="new-first"
      nzOrientation="horizontal"
      nzDirection="vertical"
      nzTitlePlacement="vertical"
      nzLabelPlacement="horizontal"
    >
      <nz-step nzTitle="x" nzContent="new" nzDescription="old" />
    </nz-steps>
    <nz-steps
      id="old-first"
      nzDirection="vertical"
      nzOrientation="horizontal"
      nzLabelPlacement="horizontal"
      nzTitlePlacement="vertical"
    >
      <nz-step nzTitle="x" nzDescription="old" nzContent="new" />
    </nz-steps>
    <nz-steps id="legacy" [nzType]="legacyType()" [nzProgressDot]="legacyDot()"><nz-step nzTitle="x" /></nz-steps>
    <ng-template #contentTpl>contentTemplate</ng-template>
  `
})
export class NzTestStepsV6InputsComponent {
  readonly orientation = signal<NzStepsOrientation>('horizontal');
  readonly titlePlacement = signal<NzStepsTitlePlacement>('horizontal');
  readonly type = signal<NzStepsType>('default');
  readonly variant = signal<NzStepsVariant>('filled');
  readonly legacyType = signal<NzStepsType>('default');
  readonly legacyDot = signal(false);
  readonly disabled = signal(false);
  readonly clicked: number[] = [];
}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps
      id="layout"
      [nzCurrent]="current()"
      [nzStartIndex]="start()"
      [nzMaxCount]="max()"
      [nzType]="type()"
      [nzOrientation]="orientation()"
      [nzEllipsis]="ellipsis()"
      (nzIndexChange)="changed.push($event)"
    >
      @for (i of steps; track i) {
        @if (i === errorAt()) {
          <nz-step [nzTitle]="'S' + i" nzStatus="error" nzContent="c" />
        } @else {
          <nz-step [nzTitle]="'S' + i" nzContent="c" />
        }
      }
    </nz-steps>
  `
})
export class NzTestStepsLayoutComponent {
  readonly steps = [0, 1, 2, 3, 4, 5, 6];
  readonly current = signal(0);
  readonly start = signal(0);
  readonly max = signal<number | undefined>(5);
  readonly type = signal<NzStepsType>('default');
  readonly orientation = signal<NzStepsOrientation>('horizontal');
  readonly ellipsis = signal(false);
  readonly errorAt = signal(-1);
  readonly changed: number[] = [];
}

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps id="size" [nzSize]="size()" [nzCurrent]="0">
      <nz-step nzTitle="a" />
      <nz-step nzTitle="b" />
    </nz-steps>
  `
})
export class NzTestStepsSizeComponent {
  readonly size = signal<NzSizeDMSType>('medium');
}

describe('steps nzSize', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  it('renders medium exactly as default, and small with the small class', async () => {
    const fixture = TestBed.createComponent(NzTestStepsSizeComponent);
    await stabilize(fixture);
    const root = (): HTMLElement => fixture.nativeElement.querySelector('#size');
    const classes = (): string[] => [root(), ...root().querySelectorAll('.ant-steps-item')].map(e => e.className);
    const medium = classes();
    expect(medium[0]).not.toContain('ant-steps-small');
    fixture.componentInstance.size.set('default');
    await stabilize(fixture);
    expect(classes()).toEqual(medium); // v4 safety: medium adds no class and drops none
    fixture.componentInstance.size.set('small');
    await stabilize(fixture);
    expect(root().classList).toContain('ant-steps-small');
  });
});

@Component({
  imports: [NzStepsModule],
  template: `
    <nz-steps id="status" [nzCurrent]="6" [nzMaxCount]="5">
      @for (i of steps; track i) {
        <nz-step [nzTitle]="'S' + i" [nzStatus]="i === 3 ? hiddenStatus() : i < 6 ? 'finish' : 'process'" />
      }
    </nz-steps>
  `
})
export class NzTestStepsStatusComponent {
  readonly steps = [0, 1, 2, 3, 4, 5, 6];
  readonly hiddenStatus = signal<NzStatusType>('finish');
}

describe('steps nzMaxCount with a bound step status', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
  });

  it('re-plans the ellipsis status when a hidden step status changes later', async () => {
    const fixture = TestBed.createComponent(NzTestStepsStatusComponent);
    await stabilize(fixture);
    const item = (i: number): HTMLElement => fixture.nativeElement.querySelectorAll('#status .ant-steps-item')[i];
    expect(item(2).classList).toContain('ant-steps-item-ellipsis');
    expect(item(3).style.display).toBe('none');
    expect(item(2).classList).toContain('ant-steps-item-finish');
    fixture.componentInstance.hiddenStatus.set('error');
    await stabilize(fixture);
    expect(item(2).classList).toContain('ant-steps-item-error');
    fixture.componentInstance.hiddenStatus.set('finish');
    await stabilize(fixture);
    expect(item(2).classList).toContain('ant-steps-item-finish');
  });
});
