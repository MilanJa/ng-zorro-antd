/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { Component, DebugElement, signal, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideMockDirectionality } from 'ng-zorro-antd/core/testing';
import { NzSafeAny, NzSemanticClassNames, NzSemanticStyles } from 'ng-zorro-antd/core/types';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzContentComponent } from './content.component';
import { NzFooterComponent } from './footer.component';
import { NzHeaderComponent } from './header.component';
import { NzLayoutComponent } from './layout.component';
import { NzLayoutModule } from './layout.module';
import { NzSiderComponent } from './sider.component';

declare const viewport: NzSafeAny;

describe('nz-layout', () => {
  describe('basic', () => {
    let fixture: ComponentFixture<NzLayoutBasicComponent>;
    let headers: DebugElement[];
    let contents: DebugElement[];
    let footers: DebugElement[];
    let siders: DebugElement[];
    let layouts: DebugElement[];

    beforeEach(() => {
      fixture = TestBed.createComponent(NzLayoutBasicComponent);
      headers = fixture.debugElement.queryAll(By.directive(NzHeaderComponent));
      contents = fixture.debugElement.queryAll(By.directive(NzContentComponent));
      footers = fixture.debugElement.queryAll(By.directive(NzFooterComponent));
      siders = fixture.debugElement.queryAll(By.directive(NzSiderComponent));
      layouts = fixture.debugElement.queryAll(By.directive(NzLayoutComponent));
    });

    it('should have correct class', () => {
      fixture.detectChanges();
      expect(headers.every(header => header.nativeElement.classList.contains('ant-layout-header'))).toBe(true);
      expect(layouts.every(layout => layout.nativeElement.classList.contains('ant-layout'))).toBe(true);
      expect(contents.every(content => content.nativeElement.classList.contains('ant-layout-content'))).toBe(true);
      expect(footers.every(footer => footer.nativeElement.classList.contains('ant-layout-footer'))).toBe(true);
      expect(siders.every(sider => sider.nativeElement.classList.contains('ant-layout-sider'))).toBe(true);
      expect(
        siders.every(
          sider =>
            sider.nativeElement.style.cssText === 'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
        )
      ).toBe(true);
      expect(layouts[2].nativeElement.classList.contains('ant-layout-has-sider')).toBe(true);
      expect(layouts[4].nativeElement.classList.contains('ant-layout-has-sider')).toBe(true);
      expect(layouts[5].nativeElement.classList.contains('ant-layout-has-sider')).toBe(true);
    });
  });

  describe('side', () => {
    let fixture: ComponentFixture<NzLayoutSideComponent>;
    let testComponent: NzLayoutSideComponent;
    let sider: DebugElement;
    let trigger: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzLayoutSideComponent);
      testComponent = fixture.componentInstance;
      sider = fixture.debugElement.query(By.directive(NzSiderComponent));
    });

    it('should nzCollapsed work', () => {
      testComponent.isCollapsed.set(false);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.ant-layout-sider-trigger'));
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 200px;');
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.isCollapsed()).toBe(true);
      expect(sider.nativeElement.style.cssText).toBe('flex: 0 0 80px; max-width: 80px; min-width: 80px; width: 80px;');
      expect(trigger.nativeElement.style.cssText).toBe('width: 80px;');
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.isCollapsed()).toBe(false);
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 200px;');
      testComponent.isCollapsed.set(true);
      fixture.detectChanges();
      expect(sider.nativeElement.style.cssText).toBe('flex: 0 0 80px; max-width: 80px; min-width: 80px; width: 80px;');
      expect(trigger.nativeElement.style.cssText).toBe('width: 80px;');
      testComponent.isCollapsed.set(false);
      fixture.detectChanges();
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 200px;');
    });

    it('should nzWidth work', () => {
      testComponent.isCollapsed.set(false);
      testComponent.width.set(300);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.ant-layout-sider-trigger'));
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 300px; max-width: 300px; min-width: 300px; width: 300px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 300px;');
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.isCollapsed()).toBe(true);
      expect(sider.nativeElement.style.cssText).toBe('flex: 0 0 80px; max-width: 80px; min-width: 80px; width: 80px;');
      expect(trigger.nativeElement.style.cssText).toBe('width: 80px;');
      trigger.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.isCollapsed()).toBe(false);
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 300px; max-width: 300px; min-width: 300px; width: 300px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 300px;');
      testComponent.isCollapsed.set(true);
      fixture.detectChanges();
      expect(sider.nativeElement.style.cssText).toBe('flex: 0 0 80px; max-width: 80px; min-width: 80px; width: 80px;');
      expect(trigger.nativeElement.style.cssText).toBe('width: 80px;');
      testComponent.isCollapsed.set(false);
      fixture.detectChanges();
      expect(sider.nativeElement.style.cssText).toBe(
        'flex: 0 0 300px; max-width: 300px; min-width: 300px; width: 300px;'
      );
      expect(trigger.nativeElement.style.cssText).toBe('width: 300px;');
    });

    it('should nzReverseArrow work', () => {
      testComponent.isCollapsed.set(false);
      fixture.detectChanges();
      trigger = fixture.debugElement.query(By.css('.ant-layout-sider-trigger'));
      expect(trigger.nativeElement.firstElementChild!.classList.contains('anticon-left')).toBe(true);
      testComponent.isCollapsed.set(true);
      fixture.detectChanges();
      expect(trigger.nativeElement.firstElementChild!.classList.contains('anticon-right')).toBe(true);
      testComponent.isReverseArrow.set(true);
      testComponent.isCollapsed.set(false);
      fixture.detectChanges();
      expect(trigger.nativeElement.firstElementChild!.classList.contains('anticon-right')).toBe(true);
      testComponent.isCollapsed.set(true);
      fixture.detectChanges();
      expect(trigger.nativeElement.firstElementChild!.classList.contains('anticon-left')).toBe(true);
    });
  });

  describe('custom-trigger', () => {
    let fixture: ComponentFixture<NzLayoutCustomTriggerComponent>;
    let testComponent: NzLayoutCustomTriggerComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideNzIconsTesting()]
      });
      fixture = TestBed.createComponent(NzLayoutCustomTriggerComponent);
      testComponent = fixture.componentInstance;
    });

    it('should not display trigger', () => {
      fixture.detectChanges();
      const trigger = fixture.debugElement.query(By.css('.ant-layout-sider-trigger'));
      expect(trigger).toBeNull();
    });

    it('should display trigger', () => {
      testComponent.changeTrigger();
      fixture.detectChanges();
      const trigger = fixture.debugElement.query(By.css('.ant-layout-sider-trigger'));
      expect(trigger.nativeElement.firstElementChild!.classList.contains('anticon-up')).toBe(true);
      expect(trigger).not.toBeNull();
    });
  });

  describe('responsive', () => {
    let fixture: ComponentFixture<NzLayoutResponsiveComponent>;
    let sider: DebugElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideNzIconsTesting()]
      });
      fixture = TestBed.createComponent(NzLayoutResponsiveComponent);
      sider = fixture.debugElement.query(By.directive(NzSiderComponent));
    });

    it('should responsive work', async () => {
      viewport.set(500);
      window.dispatchEvent(new Event('resize'));
      await fixture.whenStable();
      expect(sider.nativeElement.style.cssText).toBe('flex: 0 0 0px; max-width: 0px; min-width: 0px; width: 0px;');
      expect(
        sider.nativeElement
          .querySelector('.ant-layout-sider-zero-width-trigger')
          .firstElementChild.getAttribute('nzType')
      ).toBe('menu-fold');
      viewport.reset();
    });
  });

  describe('RTL', () => {
    let fixture: ComponentFixture<NzLayoutBasicComponent>;
    let layouts: DebugElement[];
    let dir: Directionality;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideMockDirectionality()]
      });
      fixture = TestBed.createComponent(NzLayoutBasicComponent);
      layouts = fixture.debugElement.queryAll(By.directive(NzLayoutComponent));
      dir = TestBed.inject(Directionality);
    });

    it('should className correct on dir change', () => {
      dir.valueSignal.set('rtl');
      fixture.detectChanges();
      expect(layouts.every(layout => layout.nativeElement.classList.contains('ant-layout-rtl'))).toBe(true);

      dir.valueSignal.set('ltr');
      fixture.detectChanges();
      expect(layouts.every(layout => layout.nativeElement.classList.contains('ant-layout-rtl'))).toBe(false);
    });
  });
});

@Component({
  imports: [NzIconModule, NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" [nzTrigger]="triggerTemplate" />
      <nz-layout>
        <nz-header>
          <nz-icon
            class="trigger"
            [nzType]="isCollapsed() ? 'menu-unfold' : 'menu-fold'"
            (click)="isCollapsed.set(!isCollapsed())"
          />
        </nz-header>
        <nz-content>
          <div>Bill is a cat.</div>
        </nz-content>
        <nz-footer>Ant Design ©2019 Implement By Angular</nz-footer>
      </nz-layout>
    </nz-layout>
    <ng-template #trigger>
      <nz-icon nzType="up" />
    </ng-template>
  `
})
export class NzLayoutCustomTriggerComponent {
  readonly isCollapsed = signal(false);
  triggerTemplate: TemplateRef<void> | null = null;
  @ViewChild('trigger', { static: true }) customTrigger!: TemplateRef<void>;

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    this.triggerTemplate = this.customTrigger;
  }
}

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider nzCollapsible [(nzCollapsed)]="isCollapsed" [nzWidth]="width()" [nzReverseArrow]="isReverseArrow()" />
      <nz-layout>
        <nz-header />
        <nz-content>
          <div>Bill is a cat.</div>
        </nz-content>
        <nz-footer>Ant Design ©2019 Implement By Angular</nz-footer>
      </nz-layout>
    </nz-layout>
  `
})
export class NzLayoutSideComponent {
  readonly isCollapsed = signal(false);
  readonly isReverseArrow = signal(false);
  readonly width = signal<string | number>('200px');
}

@Component({
  imports: [NzIconModule, NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider
        nzCollapsible
        [(nzCollapsed)]="isCollapsed"
        nzBreakpoint="lg"
        [nzCollapsedWidth]="0"
        [nzZeroTrigger]="zeroTrigger"
      />
      <nz-layout>
        <nz-header />
        <nz-content>
          <div>Content</div>
        </nz-content>
        <nz-footer>Ant Design ©2019 Implement By Angular</nz-footer>
      </nz-layout>
    </nz-layout>
    <ng-template #zeroTrigger>
      <nz-icon nzType="menu-fold" nzTheme="outline" />
    </ng-template>
  `
})
export class NzLayoutResponsiveComponent {
  readonly isCollapsed = signal(false);
}

@Component({
  imports: [NzLayoutModule],
  selector: 'nz-test-layout-basic',
  template: `
    <nz-layout>
      <nz-header>Header</nz-header>
      <nz-content>Content</nz-content>
      <nz-footer>Footer</nz-footer>
    </nz-layout>

    <nz-layout>
      <nz-header>Header</nz-header>
      <nz-layout>
        <nz-sider>Sider</nz-sider>
        <nz-content>Content</nz-content>
      </nz-layout>
      <nz-footer>Footer</nz-footer>
    </nz-layout>

    <nz-layout>
      <nz-header>Header</nz-header>
      <nz-layout>
        <nz-content>Content</nz-content>
        <nz-sider>Sider</nz-sider>
      </nz-layout>
      <nz-footer>Footer</nz-footer>
    </nz-layout>

    <nz-layout>
      <nz-sider>Sider</nz-sider>
      <nz-layout>
        <nz-header>Header</nz-header>
        <nz-content>Content</nz-content>
        <nz-footer>Footer</nz-footer>
      </nz-layout>
    </nz-layout>
  `
})
export class NzLayoutBasicComponent {}

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider id="slots" class="own" [nzClassNames]="classNames()" [nzStyles]="styles()">S</nz-sider>
      <nz-sider id="plain">P</nz-sider>
    </nz-layout>
  `
})
export class NzLayoutSiderSlotsComponent {
  readonly classNames = signal<NzSemanticClassNames<'root' | 'body'>>({ root: 'my-root', body: 'my-body' });
  readonly styles = signal<NzSemanticStyles<'root' | 'body'>>({
    root: { color: 'rgb(255, 0, 0)', width: '999px' },
    body: { padding: '12px' }
  });
}

describe('nz-sider semantic slots', () => {
  let fixture: ComponentFixture<NzLayoutSiderSlotsComponent>;
  const q = (sel: string): HTMLElement => fixture.nativeElement.querySelector(sel);

  beforeEach(() => {
    fixture = TestBed.createComponent(NzLayoutSiderSlotsComponent);
    fixture.detectChanges();
  });

  it('merges root into the host class and style and lets the width bindings win', () => {
    const host = q('#slots');
    expect(host.classList).toContain('ant-layout-sider');
    expect(host.classList).toContain('own');
    expect(host.classList).toContain('my-root');
    expect(host.style.color).toBe('rgb(255, 0, 0)');
    expect(host.style.width).toBe('200px');
    expect(host.style.flex).toBe('0 0 200px');
  });

  it('applies body to the children wrapper', () => {
    const body = q('#slots .ant-layout-sider-children');
    expect(body.className).toBe('ant-layout-sider-children my-body');
    expect(body.style.padding).toBe('12px');
  });

  it('updates and clears the slots', () => {
    fixture.componentInstance.classNames.set({});
    fixture.componentInstance.styles.set({});
    fixture.detectChanges();
    expect(q('#slots').classList).not.toContain('my-root');
    expect(q('#slots').style.color).toBe('');
    expect(q('#slots .ant-layout-sider-children').className).toBe('ant-layout-sider-children');
  });

  it('v4 safety: an unbound sider keeps today’s classes and styles', () => {
    expect(q('#plain').className).toBe('ant-layout-sider ant-layout-sider-dark');
    expect(q('#plain').getAttribute('style')).toBe(
      'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
    );
    expect(q('#plain .ant-layout-sider-children').getAttribute('style')).toBeNull();
  });
});

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider id="nullish" [nzClassNames]="cn()" [nzStyles]="st()">S</nz-sider>
    </nz-layout>
  `
})
export class NzLayoutSiderNullishSlotsComponent {
  readonly cn = signal<NzSemanticClassNames<'root' | 'body'> | null | undefined>(undefined);
  readonly st = signal<NzSemanticStyles<'root' | 'body'> | null | undefined>(null);
}

describe('nz-sider nullish semantic slots', () => {
  it('treats undefined and null as unset, then applies and clears the slots', () => {
    const fixture = TestBed.createComponent(NzLayoutSiderNullishSlotsComponent);
    const q = (sel: string): HTMLElement => fixture.nativeElement.querySelector(sel);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(q('#nullish').className).toBe('ant-layout-sider ant-layout-sider-dark');
    expect(q('#nullish').getAttribute('style')).toBe(
      'flex: 0 0 200px; max-width: 200px; min-width: 200px; width: 200px;'
    );
    expect(q('#nullish .ant-layout-sider-children').className).toBe('ant-layout-sider-children');
    expect(q('#nullish .ant-layout-sider-children').getAttribute('style')).toBeNull();

    fixture.componentInstance.cn.set({ root: 'my-root', body: 'my-body' });
    fixture.componentInstance.st.set({ root: { color: 'rgb(255, 0, 0)' }, body: { padding: '12px' } });
    fixture.detectChanges();
    expect(q('#nullish').classList).toContain('my-root');
    expect(q('#nullish').style.color).toBe('rgb(255, 0, 0)');
    expect(q('#nullish .ant-layout-sider-children').className).toBe('ant-layout-sider-children my-body');
    expect(q('#nullish .ant-layout-sider-children').style.padding).toBe('12px');

    fixture.componentInstance.cn.set(undefined);
    fixture.componentInstance.st.set(undefined);
    fixture.detectChanges();
    expect(q('#nullish').classList).not.toContain('my-root');
    expect(q('#nullish').style.color).toBe('');
    expect(q('#nullish .ant-layout-sider-children').className).toBe('ant-layout-sider-children');
    expect(q('#nullish .ant-layout-sider-children').style.padding).toBe('');
  });
});

@Component({
  imports: [NzLayoutModule],
  template: `
    <nz-layout>
      <nz-sider
        id="beside"
        class="app"
        [class.extra]="flag()"
        [style.opacity]="0.5"
        [nzClassNames]="classNames()"
        [nzStyles]="{ root: { color: 'red' } }"
      >
        S
      </nz-sider>
    </nz-layout>
  `
})
export class NzLayoutSiderHostBindingsComponent {
  readonly flag = signal(true);
  readonly classNames = signal<NzSemanticClassNames<'root' | 'body'>>({ root: 'own' });
}

describe('nz-sider host bindings beside app bindings', () => {
  it('keeps the app class, class and style bindings next to the slots', () => {
    const fixture = TestBed.createComponent(NzLayoutSiderHostBindingsComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('#beside');
    for (const name of ['ant-layout-sider', 'app', 'extra', 'own']) {
      expect(host.classList).toContain(name);
    }
    expect(host.style.opacity).toBe('0.5');
    expect(host.style.color).toBe('red');
    expect(host.style.width).toBe('200px');
    expect(host.style.flex).toBe('0 0 200px');
    expect(host.style.maxWidth).toBe('200px');
    expect(host.style.minWidth).toBe('200px');

    fixture.componentInstance.flag.set(false);
    fixture.detectChanges();
    expect(host.classList).not.toContain('extra');
    for (const name of ['ant-layout-sider', 'app', 'own']) {
      expect(host.classList).toContain(name);
    }

    fixture.componentInstance.flag.set(true);
    fixture.componentInstance.classNames.set({});
    fixture.detectChanges();
    expect(host.classList).not.toContain('own');
    for (const name of ['ant-layout-sider', 'app', 'extra']) {
      expect(host.classList).toContain(name);
    }
    expect(host.style.opacity).toBe('0.5');
    expect(host.style.color).toBe('red');
  });
});
