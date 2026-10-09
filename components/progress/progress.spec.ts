/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, DebugElement, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { testDirectionality } from 'ng-zorro-antd/core/testing';

import { NzProgressComponent } from './progress.component';
import { NzProgressModule } from './progress.module';
import {
  NzProgressFormatter,
  NzProgressGapPositionType,
  NzProgressPercentPosition,
  NzProgressSize,
  NzProgressStatusType,
  NzProgressStrokeColorType,
  NzProgressStrokeLinecapType
} from './typings';

describe('progress', () => {
  describe('progress line', () => {
    let fixture: ComponentFixture<NzTestProgressLineComponent>;
    let testComponent: NzTestProgressLineComponent;
    let progress: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestProgressLineComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      progress = fixture.debugElement.query(By.directive(NzProgressComponent));
    });

    it('should className correct', () => {
      fixture.detectChanges();

      const classNames = progress.nativeElement.firstElementChild.className;
      expect(classNames).toContain('ant-progress');
      expect(classNames).toContain('ant-progress-status-normal');
      expect(classNames).toContain('ant-progress-line');
      expect(classNames).toContain('ant-progress-show-info');
    });

    it('should percent work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.width).toBe('0%');
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('8px');
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('0%');
      testComponent.percent.set(50);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.width).toBe('50%');
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('8px');
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('50%');
      testComponent.percent.set(100);
      testComponent.successPercent.set(100);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.width).toBe('100%');
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('8px');
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('');
      expect(progress.nativeElement.querySelector('.anticon-check-circle')).toBeDefined();
    });

    it('should successPercent', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.width).toBe('0%');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('8px');
      testComponent.successPercent.set(50);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.width).toBe('50%');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('8px');
    });

    it('should successPercent forbidden inferred success', () => {
      fixture.detectChanges();
      testComponent.successPercent.set(50);
      testComponent.percent.set(100);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress')!.classList).not.toContain(
        'ant-progress-status-success'
      );
    });

    it('should formatter work', () => {
      testComponent.formatter.set((percent: number) => `${percent} percent`);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('0 percent');
      testComponent.percent.set(100);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('100 percent');

      testComponent.formatter.set(testComponent.formatterTemplate);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('100 / 100');
    });

    it('should status work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).toContain('ant-progress-status-normal');
      const listOfStatus: NzProgressStatusType[] = ['success', 'exception', 'active', 'normal'];
      testComponent.percent.set(100);
      listOfStatus.forEach(status => {
        testComponent.status.set(status);
        fixture.detectChanges();
        expect(progress.nativeElement.firstElementChild!.classList).toContain(`ant-progress-status-${status}`);
      });
    });

    it('should showInfo work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).toContain('ant-progress-show-info');
      expect(progress.nativeElement.querySelector('.ant-progress-text')).toBeDefined();
      testComponent.showInfo.set(false);
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).not.toContain('ant-progress-show-info');
      expect(progress.nativeElement.querySelector('.ant-progress-text')).toBeNull();
    });

    it('should strokeWidth work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('8px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('8px');
      testComponent.strokeWidth.set(6);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('6px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('6px');
    });

    it('should size work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('8px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('8px');
      testComponent.size.set('small');
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).toContain('ant-progress-small');
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.height).toBe('6px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.height).toBe('6px');
    });

    it('should strokeLinecap work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.borderRadius).toBe('100px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.borderRadius).toBe('100px');
      testComponent.strokeLinecap.set('square');
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.borderRadius).toBe('0px');
      expect(progress.nativeElement.querySelector('.ant-progress-success-bg').style.borderRadius).toBe('0px');
    });

    it('should strokeColor work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.background).toBe('');
      testComponent.strokeColor.set('blue');
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-bg').style.background).toBe('blue');
    });

    it('should strokeColor work with gradient', () => {
      fixture.detectChanges();
      const progressBar: HTMLDivElement = progress.nativeElement.querySelector('.ant-progress-bg')!;
      expect(progressBar.style.background).toBe('');
      testComponent.strokeColor.set({ '0%': '#108ee9', '100%': '#87d068' });
      fixture.detectChanges();
      expect(progressBar.style.background).toBe('');
      expect(progressBar.style.backgroundImage).toBe(
        'linear-gradient(to right, rgb(16, 142, 233) 0%, rgb(135, 208, 104) 100%)'
      );

      testComponent.strokeColor.set({ '0%': '#108ee9', '100%': '#87d068' });
      fixture.detectChanges();
      expect(progressBar.style.background).toBe('');
      expect(progressBar.style.backgroundImage).toBe(
        'linear-gradient(to right, rgb(16, 142, 233) 0%, rgb(135, 208, 104) 100%)'
      );
    });

    it('should support steps mode', () => {
      testComponent.steps.set(5);
      testComponent.percent.set(50);
      testComponent.strokeColor.set('#108ee9');
      fixture.detectChanges();

      const steps = progress.nativeElement.querySelectorAll('.ant-progress-steps-item');

      expect(steps.length).toBe(5);
      expect((steps[0] as HTMLDivElement).style.backgroundColor).toBe('rgb(16, 142, 233)');
      expect((steps[4] as HTMLDivElement).style.backgroundColor).toBeFalsy();

      testComponent.percent.set(80);
      fixture.detectChanges();

      expect((steps[4] as HTMLDivElement).style.backgroundColor).toBeFalsy();
    });
  });

  describe('progress dashboard', () => {
    let fixture: ComponentFixture<NzTestProgressDashBoardComponent>;
    let testComponent: NzTestProgressDashBoardComponent;
    let progress: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestProgressDashBoardComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      progress = fixture.debugElement.query(By.directive(NzProgressComponent));
    });

    it('should className correct', () => {
      fixture.detectChanges();

      const classNames = progress.nativeElement.firstElementChild.className;
      expect(classNames).toContain('ant-progress');
      expect(classNames).toContain('ant-progress-status-normal');
      expect(classNames).toContain('ant-progress-circle');
      expect(classNames).toContain('ant-progress-show-info');
    });

    it('should format work', () => {
      testComponent.format.set((percent: number) => `${percent} percent`);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('0 percent');
      testComponent.percent.set(100);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('100 percent');
    });

    it('should showInfo work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).toContain('ant-progress-show-info');
      expect(progress.nativeElement.querySelector('.ant-progress-text')).toBeDefined();
      testComponent.showInfo.set(false);
      fixture.detectChanges();
      expect(progress.nativeElement.firstElementChild!.classList).not.toContain('ant-progress-show-info');
      expect(progress.nativeElement.querySelector('.ant-progress-text')).toBeNull();
    });

    it('should percent work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('0%');
      testComponent.percent.set(50);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('50%');
      testComponent.percent.set(100);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-text').innerText.trim()).toBe('');
      expect(progress.nativeElement.querySelector('.anticon-check-circle')).toBeDefined();
    });

    it('should width work', () => {
      let styleText = '';

      function getStyleText(): void {
        styleText = progress.nativeElement.querySelector('.ant-progress-inner').style.cssText;
      }

      fixture.detectChanges();
      getStyleText();
      expect(styleText).toContain('width: 132px;');
      expect(styleText).toContain('height: 132px;');
      expect(styleText).toContain('font-size: 25.8px;');

      testComponent.width.set(100);
      fixture.detectChanges();
      getStyleText();
      expect(styleText).toContain('width: 100px;');
      expect(styleText).toContain('height: 100px;');
      expect(styleText).toContain('font-size: 21px;');
    });

    it('should strokeWidth work', () => {
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-trail').attributes.getNamedItem('stroke-width').value
      ).toBe('6');
      testComponent.strokeWidth.set(10);
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-trail').attributes.getNamedItem('stroke-width').value
      ).toBe('10');
    });

    it('should strokeLinecap work', () => {
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-path').attributes.getNamedItem('stroke-linecap')
          .value
      ).toBe('round');
      testComponent.strokeLinecap.set('square');
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-path').attributes.getNamedItem('stroke-linecap')
          .value
      ).toBe('square');
    });
  });

  describe('progress circle', () => {
    let fixture: ComponentFixture<NzTestProgressCircleComponent>;
    let testComponent: NzTestProgressCircleComponent;
    let progress: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestProgressCircleComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      progress = fixture.debugElement.query(By.directive(NzProgressComponent));
    });

    it('should className correct', () => {
      fixture.detectChanges();

      const classNames = progress.nativeElement.firstElementChild.className;
      expect(classNames).toContain('ant-progress');
      expect(classNames).toContain('ant-progress-status-normal');
      expect(classNames).toContain('ant-progress-circle');
      expect(classNames).toContain('ant-progress-show-info');
    });

    it('should gapDegree work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-circle-path').style.strokeDashoffset).toBe('0px');
      testComponent.gapDegree.set(120);
      fixture.detectChanges();
      expect(progress.nativeElement.querySelector('.ant-progress-circle-path').style.strokeDashoffset).toBe('-60px');
    });

    it('should gapPosition work', () => {
      fixture.detectChanges();

      function getPathD(): string {
        return progress.nativeElement
          .querySelector('.ant-progress-circle-path')
          .attributes.getNamedItem('d')
          .value.replace(/\n\s{2,}/g, ' ');
      }

      expect(getPathD()).toBe(`M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94`);

      testComponent.gapPosition.set('left');
      fixture.detectChanges();
      expect(getPathD()).toBe(`M 50,50 m -47,0 a 47,47 0 1 1 94,0 a 47,47 0 1 1 -94,0`);

      testComponent.gapPosition.set('right');
      fixture.detectChanges();
      expect(getPathD()).toBe(`M 50,50 m 47,0 a 47,47 0 1 1 -94,0 a 47,47 0 1 1 94,0`);

      testComponent.gapPosition.set('bottom');
      fixture.detectChanges();
      expect(getPathD()).toBe(`M 50,50 m 0,47 a 47,47 0 1 1 0,-94 a 47,47 0 1 1 0,94`);

      testComponent.gapPosition.set('top');
      fixture.detectChanges();
      expect(getPathD()).toBe(`M 50,50 m 0,-47 a 47,47 0 1 1 0,94 a 47,47 0 1 1 0,-94`);
    });

    it('should strokeLinecap work', () => {
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-path').attributes.getNamedItem('stroke-linecap')
          .value
      ).toBe('round');
      testComponent.strokeLinecap.set('square');
      fixture.detectChanges();
      expect(
        progress.nativeElement.querySelector('.ant-progress-circle-path').attributes.getNamedItem('stroke-linecap')
          .value
      ).toBe('square');
    });

    it('should strokeColor work', () => {
      fixture.detectChanges();
      const path = progress.nativeElement.querySelector('.ant-progress-circle-path');
      // No stroke property for built-in colors.
      expect(path.attributes.getNamedItem('stroke')).toBeFalsy();
      testComponent.strokeColor.set('blue');
      fixture.detectChanges();
      // TODO: don't why this is invalid in tests
      // expect(path.attributes.getNamedItem('style').value).toContain('blue');
    });

    it('should strokeColor work with gradient', () => {
      fixture.detectChanges();
      // const path = progress.nativeElement.querySelector('.ant-progress-circle-path');
      testComponent.strokeColor.set({ '0%': '#108ee9', '100%': '#87d068' });
      fixture.detectChanges();
      // expect(path.attributes.getNamedItem('stroke').value).toMatch(/url(#gradient-\d)/);
    });
  });

  describe('progress circle with successPercent', () => {
    let fixture: ComponentFixture<NzTestProgressCircleSuccessComponent>;
    let progress: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestProgressCircleSuccessComponent);
      fixture.detectChanges();
      progress = fixture.debugElement.query(By.directive(NzProgressComponent));
    });

    it('should success percent work', () => {
      fixture.detectChanges();
      expect(progress.nativeElement.querySelectorAll('.ant-progress-circle-path')[1].style.stroke).toBe(
        'rgb(135, 208, 104)'
      );
    });
  });

  testDirectionality(() => NzTestProgressLineComponent, By.css('.ant-progress'), 'ant-progress');
});

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress
      [nzSize]="size()"
      [nzSuccessPercent]="successPercent()"
      [nzFormat]="formatter()"
      [nzStatus]="status()"
      [nzShowInfo]="showInfo()"
      [nzStrokeWidth]="strokeWidth()"
      [nzPercent]="percent()"
      [nzStrokeColor]="strokeColor()"
      [nzStrokeLinecap]="strokeLinecap()"
      [nzSteps]="steps()"
    />
    <ng-template #formatterTemplate let-percent>{{ percent }} / 100</ng-template>
  `
})
export class NzTestProgressLineComponent {
  @ViewChild('formatterTemplate') formatterTemplate!: TemplateRef<{ $implicit: number }>;
  readonly size = signal<'default' | 'small'>('default');
  readonly status = signal<NzProgressStatusType | undefined>(undefined);
  readonly formatter = signal<NzProgressFormatter | undefined>(undefined);
  readonly strokeWidth = signal<number | undefined>(undefined);
  readonly percent = signal(0);
  readonly successPercent = signal(0);
  readonly showInfo = signal(true);
  readonly strokeLinecap = signal<NzProgressStrokeLinecapType>('round');
  readonly steps = signal<number | undefined>(undefined);
  readonly strokeColor = signal<NzProgressStrokeColorType | undefined>(undefined);
}

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress
      nzType="dashboard"
      [nzWidth]="width()"
      [nzFormat]="format()"
      [nzStatus]="status()"
      [nzShowInfo]="showInfo()"
      [nzStrokeWidth]="strokeWidth()"
      [nzPercent]="percent()"
      [nzStrokeLinecap]="strokeLinecap()"
    />
  `
})
export class NzTestProgressDashBoardComponent {
  readonly status = signal<NzProgressStatusType | undefined>(undefined);
  readonly format = signal<NzProgressFormatter | undefined>(undefined);
  readonly strokeWidth = signal<number | undefined>(undefined);
  readonly percent = signal(0);
  readonly showInfo = signal(true);
  readonly width = signal(132);
  readonly strokeLinecap = signal<NzProgressStrokeLinecapType>('round');
}

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress
      nzType="circle"
      [nzPercent]="75"
      [nzGapDegree]="gapDegree()"
      [nzGapPosition]="gapPosition()"
      [nzStrokeColor]="strokeColor()"
      [nzStrokeLinecap]="strokeLinecap()"
    />
  `
})
export class NzTestProgressCircleComponent {
  readonly gapDegree = signal<number | undefined>(undefined);
  readonly gapPosition = signal<NzProgressGapPositionType>('top');
  readonly strokeLinecap = signal<NzProgressStrokeLinecapType>('round');
  readonly strokeColor = signal<NzProgressStrokeColorType | undefined>(undefined);
}

@Component({
  imports: [NzProgressModule],
  template: `<nz-progress nzType="circle" [nzPercent]="75" [nzSuccessPercent]="60" />`
})
export class NzTestProgressCircleSuccessComponent {}

@Component({
  imports: [NzProgressModule],
  template: `
    <nz-progress
      id="p"
      [nzType]="type()"
      [nzPercent]="percent()"
      [nzSteps]="steps()"
      [nzSize]="size()"
      [nzWidth]="width()"
      [nzStrokeWidth]="strokeWidth()"
      [nzPercentPosition]="position()"
    />
  `
})
class NzTestProgressV6InputsComponent {
  readonly type = signal<'line' | 'circle' | 'dashboard'>('line');
  readonly percent = signal(50);
  readonly steps = signal(0);
  readonly size = signal<NzProgressSize | undefined>(undefined);
  readonly width = signal<number | undefined>(undefined);
  readonly strokeWidth = signal<number | undefined>(undefined);
  readonly position = signal<NzProgressPercentPosition | undefined>(undefined);
}

describe('progress v6 inputs', () => {
  let fixture: ComponentFixture<NzTestProgressV6InputsComponent>;
  let host: NzTestProgressV6InputsComponent;
  const root = (): HTMLElement => fixture.nativeElement.querySelector('#p .ant-progress');
  const q = (sel: string): HTMLElement | null => fixture.nativeElement.querySelector(`#p ${sel}`);

  beforeEach(() => {
    fixture = TestBed.createComponent(NzTestProgressV6InputsComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps today’s line DOM and adds the default position classes', () => {
    expect(root().classList).toContain('ant-progress-line-align-end');
    expect(root().classList).toContain('ant-progress-line-position-outer');
    const indicator = q('.ant-progress-indicator')!;
    expect([...indicator.classList]).toEqual(
      expect.arrayContaining(['ant-progress-text', 'ant-progress-indicator-end', 'ant-progress-indicator-outer'])
    );
    // v4 safety: the indicator stays after the body
    expect(indicator.previousElementSibling!.classList).toContain('ant-progress-body');
    expect(q('.ant-progress-body')!.style.width).toBe('');
  });

  it('v4 safety: without the v6 stylesheet inner falls back to outer after the body', async () => {
    host.position.set({ align: 'center', type: 'inner' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(root().classList).toContain('ant-progress-line-position-outer');
    expect(root().classList).toContain('ant-progress-line-align-center');
    expect(q('.ant-progress-track .ant-progress-indicator')).toBeNull();
    const indicator = q('.ant-progress-indicator')!;
    expect(indicator.classList).toContain('ant-progress-indicator-outer');
    expect(indicator.classList).toContain('ant-progress-indicator-center');
    expect(indicator.classList).not.toContain('ant-progress-indicator-end');
    expect(indicator.previousElementSibling!.classList).toContain('ant-progress-body');
    expect(q('.ant-progress-body')!.classList).toContain('ant-progress-body-layout-bottom');
  });

  it('keeps -end/-outer on steps and adds no position classes there', () => {
    host.steps.set(3);
    host.position.set({ align: 'start', type: 'outer' });
    fixture.detectChanges();
    expect(root().classList).not.toContain('ant-progress-line-align-start');
    const indicator = q('.ant-progress-indicator')!;
    expect(indicator.classList).toContain('ant-progress-indicator-end');
    expect(indicator.classList).toContain('ant-progress-indicator-outer');
    expect(indicator.classList).not.toContain('ant-progress-indicator-start');
  });

  it('sizes a line from nzSize [width, height] and a number', () => {
    host.size.set([300, 20]);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('300px');
    expect(q('.ant-progress-rail')!.style.height).toBe('20px');
    expect(q('.ant-progress-track')!.style.height).toBe('20px');
    host.size.set(12);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('12px');
    expect(q('.ant-progress-rail')!.style.height).toBe('12px');
    host.size.set({ height: 10 });
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('');
    expect(q('.ant-progress-rail')!.style.height).toBe('10px');
  });

  it('keeps preset names on today’s sizing and treats medium as default', () => {
    host.size.set('medium');
    fixture.detectChanges();
    expect(root().classList).toContain('ant-progress-default');
    expect(q('.ant-progress-rail')!.style.height).toBe('8px');
    host.size.set('small');
    fixture.detectChanges();
    expect(root().classList).toContain('ant-progress-small');
    expect(q('.ant-progress-rail')!.style.height).toBe('6px');
    host.type.set('circle');
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('132px');
  });

  it('sizes steps from nzSize', () => {
    host.steps.set(3);
    host.size.set([20, 30]);
    fixture.detectChanges();
    const item = q('.ant-progress-steps-item')!;
    expect(item.style.width).toBe('20px');
    expect(item.style.height).toBe('30px');
    host.size.set(10);
    fixture.detectChanges();
    expect(item.style.width).toBe('10px');
    expect(item.style.height).toBe('10px');
  });

  it('sizes a circle from a numeric nzSize, which wins over nzWidth in both orders', () => {
    host.type.set('circle');
    host.width.set(80);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('80px');
    host.size.set(60);
    fixture.detectChanges();
    const body = q('.ant-progress-body')!;
    expect(body.style.width).toBe('60px');
    expect(body.style.height).toBe('60px');
    expect(body.style.fontSize).toBe('15px');
    host.width.set(100);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('60px');
    // undefined means unset: back to the alias
    host.size.set(undefined);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('100px');
    host.width.set(undefined);
    fixture.detectChanges();
    expect(q('.ant-progress-body')!.style.width).toBe('132px');
  });

  it('uses antd’s minimum stroke and inline-circle class for a 20px circle', () => {
    host.type.set('circle');
    host.size.set(20);
    fixture.detectChanges();
    expect(root().classList).toContain('ant-progress-inline-circle');
    expect(q('.ant-progress-circle-rail')!.getAttribute('stroke-width')).toBe('15');
    host.type.set('dashboard');
    fixture.detectChanges();
    expect(root().classList).not.toContain('ant-progress-inline-circle');
  });

  it('renders nzWidth like a numeric nzSize that also binds nzStrokeWidth=6', () => {
    const stroke = (): string | null => q('.ant-progress-circle-rail')!.getAttribute('stroke-width');
    host.type.set('circle');
    host.width.set(40);
    fixture.detectChanges();
    const alias = stroke();
    expect(alias).toBe('6');

    host.width.set(undefined);
    host.size.set(40);
    host.strokeWidth.set(6);
    fixture.detectChanges();
    expect(stroke()).toBe(alias);

    // A numeric `nzSize` alone follows antd's `max(3 / size * 100, 6)`: 7.5 at 40px.
    host.strokeWidth.set(undefined);
    fixture.detectChanges();
    expect(stroke()).toBe('7.5');
  });
});
