/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';

import { NzSplitterModule } from './splitter.module';
import { NzSplitterCollapsible, NzSplitterCollapsibleConfig, NzSplitterLayout, NzSplitterOrientation } from './typings';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

@Component({
  imports: [NzSplitterModule],
  template: `
    <div style="width: 600px; height: 200px">
      <nz-splitter id="s" [nzLayout]="layout()">
        <nz-splitter-panel [nzCollapsible]="true">a</nz-splitter-panel>
        <nz-splitter-panel [nzCollapsible]="true">b</nz-splitter-panel>
      </nz-splitter>
    </div>
  `
})
class SplitterHost {
  readonly layout = signal<NzSplitterLayout>('horizontal');
}

function root(): HTMLElement {
  return document.getElementById('s') as HTMLElement;
}

function q(selector: string): HTMLElement {
  return root().querySelector(selector) as HTMLElement;
}

function findRule(selector: string): CSSStyleRule | undefined {
  return [...document.styleSheets]
    .flatMap(sheet => {
      try {
        return [...sheet.cssRules];
      } catch {
        return [];
      }
    })
    .find(
      (r): r is CSSStyleRule => r instanceof CSSStyleRule && r.selectorText.split(',').some(s => s.trim() === selector)
    );
}

describe('splitter (v6 styles)', () => {
  let fixture: ComponentFixture<SplitterHost>;

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(SplitterHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('draws the dragger rail and handle from the splitter tokens', () => {
    const dragger = q('.ant-splitter-bar-dragger');
    // --ant-splitter-split-trigger-size
    expect(getComputedStyle(dragger).width).toBe('6px');
    const before = getComputedStyle(dragger, '::before');
    expect(before.width).toBe('2px');
    expect(before.backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
    const after = getComputedStyle(dragger, '::after');
    expect(after.height).toBe('20px');
    expect(after.backgroundColor).toBe('rgba(0, 0, 0, 0.15)');
  });

  it('hides the collapse buttons at rest and shows them while the bar is hovered', () => {
    const bars = root().querySelectorAll<HTMLElement>('.ant-splitter-bar-collapse-bar');
    expect(bars.length).toBe(2);
    for (const bar of Array.from(bars)) {
      expect(bar.classList).toContain('ant-splitter-bar-collapse-bar-hover-only');
      const cs = getComputedStyle(bar);
      expect(cs.opacity).toBe('0');
      expect(cs.width).toBe('12px');
      expect(cs.height).toBe('24px');
    }

    // `:hover` is not reachable from a synthetic event; read the rule from the CSSOM
    // (Chromium serialises the selector with spaces around `>`).
    const rule = findRule('.ant-splitter > .ant-splitter-bar:hover .ant-splitter-bar-collapse-bar-hover-only');
    expect(rule).toBeDefined();
    expect(rule!.style.opacity).toBe('1');
    expect(q('.ant-splitter-bar').matches('.ant-splitter > .ant-splitter-bar')).toBe(true);
  });

  it('drag: marks the dragger active, covers the page with the mask and resizes the first panel', () => {
    const dragger = q('.ant-splitter-bar-dragger');
    const panel = q('.ant-splitter-panel');
    const width0 = panel.getBoundingClientRect().width;
    const rect = dragger.getBoundingClientRect();
    const centre = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    dragger.dispatchEvent(new MouseEvent('mousedown', { clientX: centre, clientY: y, bubbles: true }));
    fixture.detectChanges();
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: centre + 50, clientY: y, bubbles: true }));
    fixture.detectChanges();

    expect(dragger.classList).toContain('ant-splitter-bar-dragger-active');
    // controlItemBgActiveHover
    expect(getComputedStyle(dragger, '::before').backgroundColor).toBe('rgb(186, 224, 255)');
    const mask = q('.ant-splitter-mask');
    expect(mask).not.toBeNull();
    expect(getComputedStyle(mask).position).toBe('fixed');

    document.dispatchEvent(new MouseEvent('mouseup', { clientX: centre + 50, clientY: y, bubbles: true }));
    fixture.detectChanges();

    expect(dragger.classList).not.toContain('ant-splitter-bar-dragger-active');
    expect(q('.ant-splitter-mask')).toBeNull();
    expect(Math.abs(panel.getBoundingClientRect().width - width0 - 50)).toBeLessThanOrEqual(1);
  });

  it('vertical: the dragger spans the bar with a row-resize cursor', () => {
    fixture.componentInstance.layout.set('vertical');
    fixture.detectChanges();
    const cs = getComputedStyle(q('.ant-splitter-bar-dragger'));
    expect(cs.height).toBe('6px');
    expect(cs.cursor).toBe('row-resize');
  });
});

@Component({
  imports: [NzSplitterModule],
  template: `
    <div style="width: 600px; height: 200px">
      <nz-splitter id="api" [nzOrientation]="orientation()" [nzDraggerIcon]="draggerIcon()" [nzCollapsible]="config()">
        <nz-splitter-panel [nzCollapsible]="panel()">a</nz-splitter-panel>
        <nz-splitter-panel [nzCollapsible]="panel()">b</nz-splitter-panel>
      </nz-splitter>
    </div>
  `
})
class SplitterApiHost {
  readonly orientation = signal<NzSplitterOrientation>('horizontal');
  readonly draggerIcon = signal<string | undefined>(undefined);
  readonly config = signal<NzSplitterCollapsibleConfig | undefined>(undefined);
  readonly panel = signal<NzSplitterCollapsible>(true);
}

describe('splitter (v6 styles): antd v6 inputs', () => {
  let fixture: ComponentFixture<SplitterApiHost>;
  const api = (selector: string): HTMLElement => document.querySelector(`#api ${selector}`) as HTMLElement;
  const set = (fn: (host: SplitterApiHost) => void): void => {
    fn(fixture.componentInstance);
    fixture.detectChanges();
  };

  beforeEach(() => {
    installV6Css();
    TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
    fixture = TestBed.createComponent(SplitterApiHost);
    fixture.detectChanges();
  });

  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  it('showCollapsibleIcon: true shows the buttons at rest, false removes them', () => {
    set(h => h.panel.set({ start: true, end: true, showCollapsibleIcon: true }));
    expect(getComputedStyle(api('.ant-splitter-bar-collapse-bar-start')).opacity).toBe('1');
    set(h => h.panel.set({ start: true, end: true, showCollapsibleIcon: false }));
    expect(getComputedStyle(api('.ant-splitter-bar-collapse-bar-start')).display).toBe('none');
  });

  it('nzDraggerIcon is centred in colorFill and hides the default handle; a custom collapse icon drops the button fill', () => {
    set(h => {
      h.draggerIcon.set('holder');
      h.config.set({ icon: { start: 'caret-left' } });
    });
    const icon = getComputedStyle(api('.ant-splitter-bar-dragger-icon'));
    expect([icon.position, icon.display, icon.color]).toEqual(['absolute', 'flex', 'rgba(0, 0, 0, 0.15)']);
    expect(getComputedStyle(api('.ant-splitter-bar-dragger'), '::after').display).toBe('none');
    expect(getComputedStyle(api('.ant-splitter-bar-collapse-bar-start')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // controlItemBgHover on the uncustomised end button
    expect(getComputedStyle(api('.ant-splitter-bar-collapse-bar-end')).backgroundColor).toBe('rgba(0, 0, 0, 0.04)');
  });

  it('motion animates flex-basis over motionDurationSlow when a panel collapses', async () => {
    set(h => h.config.set({ motion: true }));
    const panel = api('.ant-splitter-panel');
    expect(getComputedStyle(panel).transitionProperty).toBe('flex-basis');
    expect(getComputedStyle(panel).transitionDuration).toBe('0.3s');
    api('.ant-splitter-bar-collapse-bar-start').click();
    fixture.detectChanges();
    // `transition: flex-basis 0.3s`: read once mid-way, once after it has ended.
    await new Promise(r => setTimeout(r, 100));
    const mid = panel.getBoundingClientRect().width;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(300);
    await new Promise(r => setTimeout(r, 350));
    expect(panel.getBoundingClientRect().width).toBe(0);
  });

  it('nzOrientation vertical: the dragger spans the bar with a row-resize cursor', () => {
    set(h => h.orientation.set('vertical'));
    const cs = getComputedStyle(api('.ant-splitter-bar-dragger'));
    expect([cs.height, cs.cursor]).toEqual(['6px', 'row-resize']);
  });
});
