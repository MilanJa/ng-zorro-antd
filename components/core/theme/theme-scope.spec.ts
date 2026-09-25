/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { expect } from 'vitest';

import { renderThemeCss } from './render-theme-css';
import { nzThemeScopeClasses } from './theme-scope';
import { NzThemeDirective } from './theme.directive';

@Component({
  selector: 'test-theme-scope-probe',
  template: ''
})
class ThemeScopeProbeComponent {
  readonly classes = nzThemeScopeClasses();
}

@Component({
  imports: [NzThemeDirective, ThemeScopeProbeComponent],
  template: `
    <div [nzTheme]="{}">
      <test-theme-scope-probe id="in" />
      <div [nzTheme]="{}">
        <test-theme-scope-probe id="nested" />
      </div>
    </div>
    <test-theme-scope-probe id="out" />
    <test-theme-scope-probe id="same" [nzTheme]="{}" />
  `
})
class TestHostComponent {}

describe('nzThemeScopeClasses', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeAll(async () => {
    // Pre-warm the lazily-imported engine chunk once, up front, so the first `[nzTheme]` render in this
    // file doesn't race a real dynamic import (see theme.directive.spec.ts for the same rationale).
    await renderThemeCss({}, ':root');
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    document.querySelectorAll('style[id^="nz-theme-"]').forEach(s => s.remove());
  });

  function directiveInstances(): NzThemeDirective[] {
    return fixture.debugElement.queryAll(By.directive(NzThemeDirective)).map(de => de.injector.get(NzThemeDirective));
  }

  function probe(id: string): ThemeScopeProbeComponent {
    return fixture.debugElement.query(By.css(`#${id}`)).componentInstance as ThemeScopeProbeComponent;
  }

  it('gives a probe under [nzTheme] its enclosing scope class', () => {
    const [outerDirective] = directiveInstances();
    expect(probe('in').classes()).toEqual([outerDirective.scopeClass]);
  });

  it('gives a probe outside any [nzTheme] no scope class', () => {
    expect(probe('out').classes()).toEqual([]);
  });

  it('gives a probe on the same element as [nzTheme] that directive’s scope class', () => {
    const sameDirective = fixture.debugElement.query(By.css('#same')).injector.get(NzThemeDirective);
    expect(probe('same').classes()).toEqual([sameDirective.scopeClass]);
  });

  it('gives a probe nested under two directives only the innermost scope class', () => {
    const [, innerDirective] = directiveInstances();
    expect(probe('nested').classes()).toEqual([innerDirective.scopeClass]);
  });
});
