/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Component, DebugElement, DOCUMENT, NgZone, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';

import {
  dispatchMouseEvent,
  dispatchTouchEvent,
  MockNgZone,
  provideMockDirectionality
} from 'ng-zorro-antd/core/testing';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSplitterModule } from './splitter.module';
import {
  NzSplitterCollapseEvent,
  NzSplitterCollapsible,
  NzSplitterCollapsibleConfig,
  NzSplitterLayout,
  NzSplitterOrientation
} from './typings';

interface PanelProps {
  defaultSize?: number | string;
  min?: number | string;
  max?: number | string;
  size?: number | string;
  resizable?: boolean;
  collapsible?: NzSplitterCollapsible;
}

@Component({
  imports: [NzSplitterModule],
  template: `
    <nz-splitter
      [nzLazy]="lazy()"
      [nzLayout]="vertical() ? 'vertical' : 'horizontal'"
      (nzResizeStart)="onResizeStart($event)"
      (nzResize)="onResize($event)"
      (nzResizeEnd)="onResizeEnd($event)"
    >
      @for (panel of panels(); track $index) {
        <nz-splitter-panel
          [nzDefaultSize]="panel.defaultSize"
          [nzMin]="panel.min"
          [nzMax]="panel.max"
          [nzSize]="panel.size"
          [nzResizable]="panel.resizable ?? true"
          [nzCollapsible]="panel.collapsible ?? false"
        >
          {{ $index }}
        </nz-splitter-panel>
      }
    </nz-splitter>
  `,
  styles: `
    @import './style/testing.less';

    :host nz-splitter {
      height: 100px;
      width: 100px;
    }
  `
})
class NzSplitterTestComponent {
  readonly vertical = signal(false);
  readonly lazy = signal(false);
  readonly panels = signal<PanelProps[]>([{}, {}]);
  readonly onResizeStart = (_sizes: number[]): void => void 0;
  readonly onResize = (_sizes: number[]): void => void 0;
  readonly onResizeEnd = (_sizes: number[]): void => void 0;
}

/* -------------------------- Test Cases -------------------------- */
describe('nz-splitter', () => {
  let fixture: ComponentFixture<NzSplitterTestComponent>;
  let component: NzSplitterTestComponent;
  let container: DebugElement;
  let document: Document;

  function getDragger(index: number = 0): HTMLElement {
    return container.queryAll(By.css('.ant-splitter-bar-dragger'))[index].nativeElement as HTMLElement;
  }

  function getDraggerPosition(dragger: HTMLElement): { x: number; y: number } {
    const { left, right, top, bottom } = dragger.getBoundingClientRect();
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    return { x, y };
  }

  function getDraggerAndPos(index: number = 0): { dragger: HTMLElement; x: number; y: number } {
    const dragger = getDragger(index);
    return { dragger, ...getDraggerPosition(dragger) };
  }

  function mouseMoveTrigger(dragger: HTMLElement, from: { x: number; y: number }, to: { x: number; y: number }): void {
    dispatchMouseEvent(dragger, 'mousedown', from.x, from.y);
    fixture.detectChanges();
    dispatchMouseEvent(document, 'mousemove', to.x, to.y);
    fixture.detectChanges();
    dispatchMouseEvent(document, 'mouseup', to.x, to.y);
    fixture.detectChanges();
  }

  function drag(dragger: HTMLElement, f1: (x: number) => number, f2: (y: number) => number = y => y): void {
    const { x, y } = getDraggerPosition(dragger);
    mouseMoveTrigger(dragger, { x, y }, { x: f1(x), y: f2(y) });
  }

  function getPanelFlexBasis(dl: DebugElement): string {
    const el = dl.nativeElement as HTMLElement;
    return el.style.flexBasis;
  }

  describe('basic', () => {
    let zone: MockNgZone;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: NgZone,
            useFactory: () => {
              zone = new MockNgZone();
              return zone;
            }
          }
        ]
      });
      fixture = TestBed.createComponent(NzSplitterTestComponent);
      document = TestBed.inject(DOCUMENT);
      container = fixture.debugElement;
      component = fixture.componentInstance;
    });

    it('should correct render', () => {
      fixture.detectChanges();
      expect(container.query(By.css('.ant-splitter'))).toBeTruthy();
      expect(container.queryAll(By.css('.ant-splitter-panel'))).toHaveLength(2);
      expect(container.query(By.css('.ant-splitter-bar'))).toBeTruthy();
    });

    it('should correct render panel size', async () => {
      component.panels.set([{ size: 20 }, { size: '45%' }, {}]);
      await fixture.whenStable();

      const panels = container.queryAll(By.css('.ant-splitter-panel'));
      expect(getPanelFlexBasis(panels?.[0])).toBe('20px');
      expect(getPanelFlexBasis(panels?.[1])).toBe('45px');
      expect(getPanelFlexBasis(panels?.[2])).toBe('35px');
    });

    it('should layout work', async () => {
      await fixture.whenStable();
      expect(container.query(By.css('.ant-splitter.ant-splitter-horizontal'))).toBeTruthy();

      component.vertical.set(true);
      await fixture.whenStable();
      expect(container.query(By.css('.ant-splitter.ant-splitter-vertical'))).toBeTruthy();
    });

    it('should resizable work', async () => {
      component.panels.set([{ size: 20 }, { resizable: false }, {}]);
      await fixture.whenStable();
      expect(container.queryAll(By.css('.ant-splitter-bar-dragger'))).toHaveLength(2);
      expect(container.queryAll(By.css('.ant-splitter-bar-dragger-disabled'))).toHaveLength(2);

      component.panels.set([{ size: 20 }, {}, { resizable: false }]);
      await fixture.whenStable();
      expect(container.queryAll(By.css('.ant-splitter-bar-dragger'))).toHaveLength(2);
      expect(container.queryAll(By.css('.ant-splitter-bar-dragger-disabled'))).toHaveLength(1);
    });

    describe('drag', () => {
      beforeEach(() => {
        vi.spyOn(component, 'onResizeStart');
        vi.spyOn(component, 'onResize');
        vi.spyOn(component, 'onResizeEnd');
      });

      it('should mouse move work', async () => {
        component.panels.set([{}, {}]);
        await fixture.whenStable();

        const { dragger, x, y } = getDraggerAndPos();

        // right
        dispatchMouseEvent(dragger, 'mousedown', x, y);
        await fixture.whenStable();
        expect(dragger.classList).toContain('ant-splitter-bar-dragger-active');
        expect(component.onResizeStart).toHaveBeenCalledWith([50, 50]);

        dispatchMouseEvent(dragger, 'mousemove', x + 40, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledWith([90, 10]);
        expect(component.onResizeEnd).not.toHaveBeenCalled();

        dispatchMouseEvent(dragger, 'mouseup', x + 40, y);
        await fixture.whenStable();
        expect(component.onResizeEnd).toHaveBeenCalledWith([90, 10]);

        // left
        dispatchMouseEvent(dragger, 'mousedown', x + 40, y);
        await fixture.whenStable();
        dispatchMouseEvent(dragger, 'mousemove', x - 240, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledWith([0, 100]);
        dispatchMouseEvent(dragger, 'mouseup');
        await fixture.whenStable();
        expect(component.onResizeEnd).toHaveBeenCalledWith([0, 100]);
      });

      it('should touch move work', async () => {
        component.panels.set([{}, {}]);
        await fixture.whenStable();

        const { dragger, x, y } = getDraggerAndPos();

        // right
        dispatchTouchEvent(dragger, 'touchstart', x, y);
        await fixture.whenStable();
        expect(dragger.classList).toContain('ant-splitter-bar-dragger-active');
        expect(component.onResizeStart).toHaveBeenCalledWith([50, 50]);

        dispatchTouchEvent(document, 'touchmove', x + 40, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledWith([90, 10]);
        expect(component.onResizeEnd).not.toHaveBeenCalled();

        dispatchTouchEvent(document, 'touchend', x + 40, y);
        await fixture.whenStable();
        expect(component.onResizeEnd).toHaveBeenCalledWith([90, 10]);

        // left
        dispatchTouchEvent(dragger, 'touchstart', x + 40, y);
        await fixture.whenStable();

        dispatchTouchEvent(document, 'touchmove', x - 240, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledWith([0, 100]);
        dispatchTouchEvent(document, 'touchend');
        await fixture.whenStable();
        expect(component.onResizeEnd).toHaveBeenCalledWith([0, 100]);
      });

      it('with min', async () => {
        component.panels.set([{ min: 10 }, {}]);
        await fixture.whenStable();

        drag(getDragger(), x => x - 100);
        expect(component.onResize).toHaveBeenCalledWith([10, 90]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([10, 90]);
      });

      it('with max', async () => {
        component.panels.set([{ max: 90 }, {}]);
        await fixture.whenStable();

        drag(getDragger(), x => x + 100);
        expect(component.onResize).toHaveBeenCalledWith([90, 10]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([90, 10]);
      });

      it('both panel has min and max', async () => {
        component.panels.set([
          { min: 10, max: 80 },
          { min: 10, max: 80 }
        ]);
        await fixture.whenStable();

        drag(getDragger(), x => x - 100);
        expect(component.onResize).toHaveBeenCalledWith([20, 80]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([20, 80]);

        drag(getDragger(), x => x + 100);
        expect(component.onResize).toHaveBeenCalledWith([80, 20]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([80, 20]);
      });

      it('[true, 0, true] can be move left', async () => {
        component.panels.set([{}, { defaultSize: 0 }, {}]);
        await fixture.whenStable();

        drag(getDragger(1), x => x - 100);
        expect(component.onResize).toHaveBeenCalledWith([0, 50, 50]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([0, 50, 50]);
      });

      it('[false, 0, true] can not be move left', async () => {
        component.panels.set([{ resizable: false }, { defaultSize: 0 }, {}]);
        await fixture.whenStable();

        drag(getDragger(1), x => x - 100);
        expect(component.onResize).toHaveBeenCalledWith([50, 0, 50]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([50, 0, 50]);
      });
    });

    describe('collapsible', () => {
      function expectClick(button: HTMLElement, sizes: number[]): void {
        button.click();
        fixture.detectChanges();
        expect(component.onResize).toHaveBeenCalledWith(sizes);
        expect(component.onResizeEnd).toHaveBeenCalledWith(sizes);
      }

      beforeEach(() => {
        vi.spyOn(component, 'onResize');
        vi.spyOn(component, 'onResizeEnd');
      });

      it('basic', async () => {
        component.panels.set([{ size: 20, collapsible: true }, { collapsible: true }]);
        await fixture.whenStable();

        expect(container.queryAll(By.css('.ant-splitter-bar-collapse-icon'))).toHaveLength(2);
        expect(container.query(By.css('.ant-splitter-bar-collapse-start'))).toBeTruthy();
        expect(container.query(By.css('.ant-splitter-bar-collapse-end'))).toBeTruthy();

        component.panels.set([
          {
            size: 20,
            collapsible: true
          },
          {
            collapsible: true
          },
          {}
        ]);
        await fixture.whenStable();
        expect(container.queryAll(By.css('.ant-splitter-bar-collapse-start'))).toHaveLength(2);
        expect(container.queryAll(By.css('.ant-splitter-bar-collapse-end'))).toHaveLength(1);
      });

      it('collapsible - true', async () => {
        component.panels.set([
          {
            size: 20,
            collapsible: true
          },
          {}
        ]);
        await fixture.whenStable();

        const startBtn = container.query(By.css('.ant-splitter-bar-collapse-start'))!.nativeElement as HTMLElement;
        startBtn.click();
        fixture.detectChanges();

        expect(component.onResize).toHaveBeenCalledWith([0, 100]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([0, 100]);
      });

      it('collapsible - start:true', async () => {
        component.panels.set([
          {},
          {
            size: 20,
            collapsible: {
              start: true
            }
          },
          {}
        ]);
        await fixture.whenStable();

        expect(container.query(By.css('.ant-splitter-bar-collapse-start'))).toBeFalsy();
        expect(container.query(By.css('.ant-splitter-bar-collapse-end'))).toBeTruthy();

        const endBtn = container.query(By.css('.ant-splitter-bar-collapse-end'))!.nativeElement as HTMLElement;
        endBtn.click();
        await fixture.whenStable();

        expect(component.onResize).toHaveBeenCalledWith([60, 0, 40]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([60, 0, 40]);
      });

      it('collapsible - end:true', async () => {
        component.panels.set([
          {},
          {
            size: 20,
            collapsible: {
              end: true
            }
          },
          {}
        ]);
        await fixture.whenStable();

        expect(container.query(By.css('.ant-splitter-bar-collapse-start'))).toBeTruthy();
        expect(container.query(By.css('.ant-splitter-bar-collapse-end'))).toBeFalsy();

        const startBtn = container.query(By.css('.ant-splitter-bar-collapse-start'))!.nativeElement as HTMLElement;
        startBtn.click();
        await fixture.whenStable();

        expect(component.onResize).toHaveBeenCalledWith([40, 0, 60]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([40, 0, 60]);
      });

      it('both collapsible', async () => {
        component.panels.set([
          {
            collapsible: true
          },
          {
            collapsible: true
          }
        ]);
        await fixture.whenStable();

        const startBtn = container.query(By.css('.ant-splitter-bar-collapse-start'))!.nativeElement as HTMLElement;
        const endBtn = container.query(By.css('.ant-splitter-bar-collapse-end'))!.nativeElement as HTMLElement;

        expectClick(startBtn, [0, 100]);
        expectClick(endBtn, [50, 50]);
        expectClick(endBtn, [100, 0]);
        expectClick(startBtn, [50, 50]);
      });

      it('collapsible with cache', async () => {
        component.panels.set([
          {
            defaultSize: 20,
            collapsible: true,
            min: 10
          },
          {
            collapsible: true,
            min: '80%'
          }
        ]);
        await fixture.whenStable();

        const startBtn = container.query(By.css('.ant-splitter-bar-collapse-start'))!.nativeElement as HTMLElement;
        const endBtn = container.query(By.css('.ant-splitter-bar-collapse-end'))!.nativeElement as HTMLElement;

        // Collapse left
        expectClick(startBtn, [0, 100]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeTruthy();
        // Collapse back
        expectClick(endBtn, [20, 80]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeFalsy();
        // Collapse right
        expectClick(endBtn, [100, 0]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeTruthy();
      });

      it('collapsible with fallback', async () => {
        component.panels.set([
          {
            defaultSize: 10,
            collapsible: true,
            min: 15
          },
          {
            collapsible: true,
            min: '80%'
          }
        ]);
        await fixture.whenStable();

        const startBtn = container.query(By.css('.ant-splitter-bar-collapse-start'))!.nativeElement as HTMLElement;
        const endBtn = container.query(By.css('.ant-splitter-bar-collapse-end'))!.nativeElement as HTMLElement;

        // Collapse left
        expectClick(startBtn, [0, 100]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeTruthy();
        // Collapse back
        expectClick(endBtn, [2.5, 97.5]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeFalsy();
        // Collapse right
        expectClick(endBtn, [100, 0]);
        expect(container.query(By.css('.ant-splitter-bar-dragger-disabled'))).toBeTruthy();
      });
    });

    describe('lazy', async () => {
      beforeEach(() => {
        component.lazy.set(true);
        component.panels.set([
          {
            defaultSize: '50%',
            min: '30%',
            max: '70%'
          },
          {
            defaultSize: '50%',
            min: '30%',
            max: '70%'
          }
        ]);

        vi.spyOn(component, 'onResizeStart');
        vi.spyOn(component, 'onResize');
        vi.spyOn(component, 'onResizeEnd');
      });

      it('should only update after mouse up', async () => {
        await fixture.whenStable();
        const { dragger, x, y } = getDraggerAndPos();

        // right
        dispatchMouseEvent(dragger, 'mousedown', x, y);
        await fixture.whenStable();
        expect(dragger.classList).toContain('ant-splitter-bar-dragger-active');
        expect(component.onResizeStart).toHaveBeenCalledWith([50, 50]);

        dispatchMouseEvent(document, 'mousemove', x + 100, y);
        await fixture.whenStable();
        expect(component.onResize).not.toHaveBeenCalled();

        dispatchMouseEvent(document, 'mouseup', x + 100, y);
        expect(component.onResize).toHaveBeenCalledWith([70, 30]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([70, 30]);

        // left
        dispatchMouseEvent(dragger, 'mousedown', x + 100, y);
        await fixture.whenStable();

        dispatchMouseEvent(document, 'mousemove', x, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledTimes(1);

        dispatchMouseEvent(document, 'mouseup', x, y);
        expect(component.onResize).toHaveBeenCalledWith([30, 70]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([30, 70]);
      });

      it('should work with touch events', async () => {
        await fixture.whenStable();
        const { dragger, x, y } = getDraggerAndPos();

        // right
        dispatchTouchEvent(dragger, 'touchstart', x, y);
        await fixture.whenStable();
        expect(dragger.classList).toContain('ant-splitter-bar-dragger-active');
        expect(component.onResizeStart).toHaveBeenCalledWith([50, 50]);

        dispatchTouchEvent(document, 'touchmove', x + 100, y);
        await fixture.whenStable();
        expect(component.onResize).not.toHaveBeenCalled();

        dispatchTouchEvent(document, 'touchend', x + 100, y);
        expect(component.onResize).toHaveBeenCalledWith([70, 30]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([70, 30]);

        // left
        dispatchTouchEvent(dragger, 'touchstart', x + 100, y);
        await fixture.whenStable();

        dispatchTouchEvent(document, 'touchmove', x, y);
        await fixture.whenStable();
        expect(component.onResize).toHaveBeenCalledTimes(1);

        dispatchTouchEvent(document, 'touchend', x, y);
        expect(component.onResize).toHaveBeenCalledWith([30, 70]);
        expect(component.onResizeEnd).toHaveBeenCalledWith([30, 70]);
      });

      it('should work with vertical layout', async () => {
        component.vertical.set(true);
        await fixture.whenStable();

        function dragWithMouse(f: (y: number) => number): void {
          const { dragger, x, y } = getDraggerAndPos();
          dispatchMouseEvent(dragger, 'mousedown', x, y);
          dispatchMouseEvent(dragger, 'mousemove', x, f(y));
          dispatchMouseEvent(dragger, 'mouseup', x, f(y));
        }

        function dragWithTouch(f: (y: number) => number): void {
          const { dragger, x, y } = getDraggerAndPos();
          dispatchTouchEvent(dragger, 'touchstart', x, y);
          dispatchTouchEvent(document, 'touchmove', x, f(y));
          dispatchTouchEvent(document, 'touchend', x, f(y));
        }

        // down
        dragWithMouse(y => y + 100);
        expect(component.onResize).toHaveBeenCalledWith([70, 30]);

        // up
        dragWithMouse(y => y - 100);
        expect(component.onResize).toHaveBeenCalledWith([30, 70]);

        // touch drag down
        dragWithTouch(y => y + 100);
        expect(component.onResize).toHaveBeenCalledWith([70, 30]);

        // touch drag up
        dragWithTouch(y => y - 100);
        expect(component.onResize).toHaveBeenCalledWith([30, 70]);
      });
    });
  });

  describe('directionality', () => {
    let dir: Directionality;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideMockDirectionality()]
      });
      dir = TestBed.inject(Directionality);
      dir.valueSignal.set('rtl');
      fixture = TestBed.createComponent(NzSplitterTestComponent);
      container = fixture.debugElement;
      component = fixture.componentInstance;

      vi.spyOn(component, 'onResize');
      vi.spyOn(component, 'onResizeEnd');
    });

    it('rtl', async () => {
      component.panels.set([{}, {}]);
      await fixture.whenStable();

      const splitter = container.query(By.css('.ant-splitter'))!.nativeElement as HTMLElement;
      expect(splitter.classList).toContain('ant-splitter-rtl');

      drag(getDragger(), x => x - 40);
      expect(component.onResize).toHaveBeenCalledWith([90, 10]);
      expect(component.onResizeEnd).toHaveBeenCalledWith([90, 10]);
    });

    it('should move the lazy preview in the pointer direction', async () => {
      component.lazy.set(true);
      component.panels.set([
        { defaultSize: '50%', min: '20%', max: '80%' },
        { defaultSize: '50%', min: '20%', max: '80%' }
      ]);
      await fixture.whenStable();

      const { dragger, x, y } = getDraggerAndPos();
      dispatchMouseEvent(dragger, 'mousedown', x, y);
      dispatchMouseEvent(document, 'mousemove', x - 40, y);
      fixture.detectChanges();

      const preview = container.query(By.css('.ant-splitter-bar-preview'))!.nativeElement as HTMLElement;
      expect(preview.style.transform).toBe('translateX(-30px)');
    });
  });
});

@Component({
  imports: [NzSplitterModule],
  template: `
    <ng-template #startIcon><span class="custom-start">S</span></ng-template>
    <nz-splitter
      [nzOrientation]="orientation()"
      [nzLayout]="layout()"
      [nzDraggerIcon]="draggerIcon()"
      [nzCollapsible]="config()"
      (nzDraggerDoubleClick)="onDoubleClick($event)"
      (nzCollapse)="onCollapse($event)"
    >
      <nz-splitter-panel [nzCollapsible]="first()">0</nz-splitter-panel>
      <nz-splitter-panel [nzCollapsible]="second()">1</nz-splitter-panel>
    </nz-splitter>
  `,
  styles: `
    @import './style/testing.less';
    :host nz-splitter {
      height: 100px;
      width: 100px;
    }
  `
})
class NzSplitterV6ApiTestComponent {
  @ViewChild('startIcon', { static: true }) startIcon!: TemplateRef<void>;
  readonly orientation = signal<NzSplitterOrientation | undefined>(undefined);
  readonly layout = signal<NzSplitterLayout | undefined>(undefined);
  readonly draggerIcon = signal<string | TemplateRef<void> | undefined>(undefined);
  readonly config = signal<NzSplitterCollapsibleConfig | undefined>(undefined);
  readonly first = signal<NzSplitterCollapsible>(true);
  readonly second = signal<NzSplitterCollapsible>(true);
  readonly onDoubleClick = (_index: number): void => void 0;
  readonly onCollapse = (_event: NzSplitterCollapseEvent): void => void 0;
}

describe('nz-splitter antd v6 inputs', () => {
  let fixture: ComponentFixture<NzSplitterV6ApiTestComponent>;
  let component: NzSplitterV6ApiTestComponent;
  const root = (): HTMLElement => fixture.nativeElement.querySelector('nz-splitter');
  const all = (selector: string): HTMLElement[] => Array.from(root().querySelectorAll(selector));
  const one = (selector: string): HTMLElement => root().querySelector(selector) as HTMLElement;
  const iconType = (selector: string): string =>
    fixture.debugElement.query(By.css(selector)).injector.get(NzIconDirective).nzType()!;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()] });
    fixture = TestBed.createComponent(NzSplitterV6ApiTestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('nzOrientation sets the layout classes; nzLayout is an alias the new input overrides', async () => {
    expect(root().classList).toContain('ant-splitter-horizontal');
    component.layout.set('vertical');
    await fixture.whenStable();
    expect(root().classList).toContain('ant-splitter-vertical');
    component.orientation.set('horizontal');
    await fixture.whenStable();
    expect(root().classList).toContain('ant-splitter-horizontal');
    expect(root().classList).not.toContain('ant-splitter-vertical');
  });

  // the `nzLayout` deprecation warning itself is covered in splitter-deprecation.spec.ts: the global
  // once-per-message dedup in ng-zorro-antd/core/logger means this file's other tests (and the pre-existing
  // `describe('nz-splitter', ...)` suite above, which always binds `nzLayout`) would otherwise consume it first.

  it('showCollapsibleIcon picks the visibility class; a bar merges both panels as antd does', async () => {
    expect(all('.ant-splitter-bar-collapse-bar-hover-only')).toHaveLength(2);
    component.first.set({ end: true, showCollapsibleIcon: false });
    component.second.set({ start: true, showCollapsibleIcon: true });
    await fixture.whenStable();
    expect(one('.ant-splitter-bar-collapse-bar-start').classList).toContain(
      'ant-splitter-bar-collapse-bar-always-hidden'
    );
    expect(one('.ant-splitter-bar-collapse-bar-end').classList).toContain(
      'ant-splitter-bar-collapse-bar-always-visible'
    );
    expect(all('.ant-splitter-bar-collapse-bar-hover-only')).toHaveLength(0);
  });

  it('nzCollapsible.icon and nzDraggerIcon render custom icons with the -customize classes', async () => {
    expect(one('.ant-splitter-bar-dragger').classList).not.toContain('ant-splitter-bar-dragger-customize');
    expect(one('.ant-splitter-bar-dragger-icon')).toBeNull();
    component.config.set({ icon: { start: component.startIcon, end: 'caret-right' } });
    component.draggerIcon.set('holder');
    await fixture.whenStable();
    expect(one('.ant-splitter-bar-collapse-bar-start').classList).toContain('ant-splitter-bar-collapse-bar-customize');
    expect(one('span.ant-splitter-bar-collapse-icon.ant-splitter-bar-collapse-start .custom-start')).toBeTruthy();
    expect(one('.ant-splitter-bar-collapse-bar-end').classList).toContain('ant-splitter-bar-collapse-bar-customize');
    expect(iconType('.ant-splitter-bar-collapse-end')).toBe('caret-right');
    expect(one('.ant-splitter-bar-dragger').classList).toContain('ant-splitter-bar-dragger-customize');
    expect(iconType('.ant-splitter-bar-dragger-icon nz-icon')).toBe('holder');
    component.draggerIcon.set(component.startIcon);
    await fixture.whenStable();
    expect(one('.ant-splitter-bar-dragger-icon .custom-start')).toBeTruthy();
  });

  it('emits nzDraggerDoubleClick with the bar index and nzCollapse with flags and sizes', async () => {
    const dbl = vi.spyOn(component, 'onDoubleClick');
    const collapse = vi.spyOn(component, 'onCollapse');
    one('.ant-splitter-bar-dragger').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(dbl).toHaveBeenCalledWith(0);
    one('.ant-splitter-bar-collapse-bar-start').click();
    await fixture.whenStable();
    expect(collapse).toHaveBeenCalledWith({ collapsed: [true, false], sizes: [0, 100] });
    one('.ant-splitter-bar-collapse-bar-end').click(); // expands panel 0 from cacheCollapsedSize
    await fixture.whenStable();
    expect(collapse).toHaveBeenLastCalledWith({ collapsed: [false, false], sizes: [50, 50] });
  });

  it('motion puts -panel-transition on every panel except while dragging', async () => {
    expect(all('.ant-splitter-panel-transition')).toHaveLength(0);
    component.config.set({ motion: true });
    await fixture.whenStable();
    expect(all('.ant-splitter-panel-transition')).toHaveLength(2);
    const dragger = one('.ant-splitter-bar-dragger');
    const { left, top } = dragger.getBoundingClientRect();
    dispatchMouseEvent(dragger, 'mousedown', left, top);
    await fixture.whenStable();
    expect(all('.ant-splitter-panel-transition')).toHaveLength(0);
    dispatchMouseEvent(document, 'mouseup', left, top);
    await fixture.whenStable();
    expect(all('.ant-splitter-panel-transition')).toHaveLength(2);
  });

  it('v4 stylesheet: every v6 option renders without error and keeps the v4 classes and geometry', async () => {
    const draggerWidth = one('.ant-splitter-bar-dragger').getBoundingClientRect().width;
    component.draggerIcon.set('holder');
    component.config.set({ motion: true, icon: { start: 'caret-left' } });
    component.first.set({ start: true, end: true, showCollapsibleIcon: true });
    await fixture.whenStable();
    expect(one('.ant-splitter-bar-dragger').getBoundingClientRect().width).toBe(draggerWidth);
    expect(all('.ant-splitter-bar-collapse-bar.ant-splitter-bar-collapse-bar-start')).toHaveLength(1);
    expect(all('.ant-splitter-bar-collapse-icon')).toHaveLength(2);
  });
});
