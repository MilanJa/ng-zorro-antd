/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, DebugElement, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideNzNoAnimation } from 'ng-zorro-antd/core/animation';
import { testDirectionality } from 'ng-zorro-antd/core/testing';
import { NzShapeSCType } from 'ng-zorro-antd/core/types';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzFloatButtonComponent } from './float-button.component';
import { NzFloatButtonModule } from './float-button.module';
import { NzFloatButtonBadge, NzFloatButtonType } from './typings';

describe('float-button', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideNzIconsTesting(), provideNzNoAnimation()]
    });
  });

  describe('basic', () => {
    let fixture: ComponentFixture<NzTestFloatButtonBasicComponent>;
    let testComponent: NzTestFloatButtonBasicComponent;
    let resultEl: DebugElement;
    let floatButtonComponent: NzFloatButtonComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzTestFloatButtonBasicComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      resultEl = fixture.debugElement.query(By.directive(NzFloatButtonComponent));
      floatButtonComponent = resultEl.componentInstance;
    });

    it('nzType', () => {
      testComponent.nzType.set('primary');
      fixture.detectChanges();
      const view = resultEl.nativeElement.querySelector('.ant-float-btn > .ant-btn-primary');
      expect(view.tagName).toBe('BUTTON');
    });

    it('nzShape', () => {
      testComponent.nzShape.set('square');
      fixture.detectChanges();
      expect(resultEl.nativeElement.classList).toContain('ant-float-btn-square');
    });

    it('nzHref && nzTarget', () => {
      testComponent.nzTarget.set('_blank');
      testComponent.nzHref.set('https://ng.ant.design/');
      fixture.detectChanges();
      const view = resultEl.nativeElement.querySelector('.ant-float-btn > .ant-btn');
      expect(view.getAttribute('href') === 'https://ng.ant.design/').toBe(true);
      expect(view.getAttribute('target') === '_blank').toBe(true);
    });

    it('nzIcon', () => {
      testComponent.nzIcon.set(testComponent.icon);
      fixture.detectChanges();
      const view = resultEl.nativeElement.getElementsByClassName('anticon-question-circle')[0];
      expect(view.getAttribute('nztype') === 'question-circle').toBe(true);
    });

    it('should nzIcon support passing nzType string only', () => {
      testComponent.nzIcon.set('file-search');
      fixture.detectChanges();
      const view = resultEl.nativeElement.querySelector('nz-icon');
      expect(view.classList).toContain('anticon-file-search');
    });

    it('nzOnClick', () => {
      resultEl.nativeElement.getElementsByClassName('ant-btn')[0].dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(testComponent.isClick()).toBe(true);
    });

    it('nzBadge', () => {
      expect(resultEl.nativeElement.querySelector('.ant-badge')).toBeNull();
      expect(floatButtonComponent.nzBadge()).toBeNull();
      testComponent.nzBadge.set({ nzCount: 5 });
      fixture.detectChanges();
      expect(floatButtonComponent.nzBadge()).toEqual({
        nzCount: 5
      });
      expect(resultEl.nativeElement.querySelector('.ant-badge')).toBeTruthy();
    });

    it('nzBadge accepts the medium size and renders it as the default size', () => {
      testComponent.nzBadge.set({ nzCount: 5, nzSize: 'medium' });
      fixture.detectChanges();
      const badge = resultEl.nativeElement.querySelector('.ant-badge') as HTMLElement;
      expect(badge).toBeTruthy();
      expect(badge.querySelector('.ant-badge-count')).toBeTruthy();
      expect(badge.querySelector('.ant-badge-count-sm')).toBeNull();
    });
  });

  testDirectionality(() => NzTestFloatButtonBasicComponent, By.directive(NzFloatButtonComponent), 'ant-float-btn');
});

@Component({
  selector: 'nz-test-basic-float-button',
  imports: [NzFloatButtonModule, NzIconModule],
  template: `
    <nz-float-button
      [nzIcon]="nzIcon()"
      [nzDescription]="nzDescription()"
      [nzHref]="nzHref()"
      [nzTarget]="nzTarget()"
      [nzType]="nzType()"
      [nzShape]="nzShape()"
      [nzBadge]="nzBadge()"
      (nzOnClick)="onClick($event)"
    />
    <ng-template #icon>
      <nz-icon nzType="question-circle" nzTheme="outline" />
    </ng-template>
    <ng-template #description>HELP</ng-template>
  `
})
export class NzTestFloatButtonBasicComponent {
  readonly nzHref = signal<string | null>(null);
  readonly nzTarget = signal<string | null>(null);
  readonly nzType = signal<NzFloatButtonType>('default');
  readonly nzShape = signal<NzShapeSCType>('circle');
  readonly nzIcon = signal<string | TemplateRef<void> | null>(null);
  readonly nzDescription = signal<TemplateRef<void> | null>(null);
  readonly nzBadge = signal<NzFloatButtonBadge | null>(null);

  @ViewChild('icon', { static: false }) icon!: TemplateRef<void>;
  @ViewChild('description', { static: false }) description!: TemplateRef<void>;

  readonly isClick = signal(false);

  onClick(value: boolean): void {
    this.isClick.set(value);
  }
}

@Component({
  imports: [NzFloatButtonModule],
  template: `
    <nz-float-button id="newFirst" nzShape="square" nzContent="NEW" nzDescription="OLD" />
    <nz-float-button id="oldFirst" nzShape="square" nzDescription="OLD" nzContent="NEW" />
    <nz-float-button id="legacy" nzShape="square" nzDescription="OLD" />
    <nz-float-button id="unset" nzShape="square" [nzContent]="undefined" nzDescription="OLD" />
    <nz-float-button id="none" nzShape="square" />
    <nz-float-button-top id="top" [nzVisibilityHeight]="-1" nzShape="square" nzContent="TOP" />
    <nz-float-button-group id="group" nzShape="square" nzTrigger="click" nzContent="MENU">
      <nz-float-button />
    </nz-float-button-group>
  `
})
class NzTestFloatButtonContentComponent {}

describe('float-button nzContent', () => {
  let fixture: ComponentFixture<NzTestFloatButtonContentComponent>;
  const text = (id: string): string | undefined =>
    (
      fixture.nativeElement.querySelector(`#${id} .ant-float-btn-description`) as HTMLElement | null
    )?.textContent?.trim();

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting(), provideNzNoAnimation()] });
    fixture = TestBed.createComponent(NzTestFloatButtonContentComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('prefers nzContent over the deprecated nzDescription in both binding orders', () => {
    expect(text('newFirst')).toBe('NEW');
    expect(text('oldFirst')).toBe('NEW');
  });

  it('falls back to nzDescription when nzContent is unbound or undefined', () => {
    expect(text('legacy')).toBe('OLD');
    expect(text('unset')).toBe('OLD');
  });

  it('keeps the icon-only class only without content', () => {
    expect(fixture.nativeElement.querySelector('#none').classList).toContain('ant-float-btn-icon-only');
    expect(fixture.nativeElement.querySelector('#newFirst').classList).not.toContain('ant-float-btn-icon-only');
  });

  it('forwards nzContent from the BackTop and the group trigger', () => {
    expect(text('top')).toBe('TOP');
    expect(text('group')).toBe('MENU');
  });
});
