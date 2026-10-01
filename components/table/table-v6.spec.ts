/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { expectMotionSettled } from 'ng-zorro-antd/core/testing';
import { NzThemeDirective } from 'ng-zorro-antd/core/theme';
import { V6_PATCH_CSS, V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS } from 'ng-zorro-antd/core/theme/generated/test-css';
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing';
import { NzTableFilterList, NzTableModule } from 'ng-zorro-antd/table';

let style: HTMLStyleElement;
function installV6Css(): void {
  style = document.createElement('style');
  style.textContent = [V6_TEMPLATE_CSS, V6_TOKENS_DEFAULT_CSS, V6_PATCH_CSS].join('\n');
  document.head.appendChild(style);
}

interface Row {
  id: number;
  name: string;
  a: string;
  b: string;
}

@Component({
  imports: [NzTableModule],
  template: `
    <div style="width: 400px">
      <nz-table id="host" #t [nzData]="rows()" [nzScroll]="{ x: '900px', y: '120px' }" [nzFrontPagination]="false">
        <thead>
          <tr>
            <th nzLeft nzWidth="120px">Name</th>
            <th nzWidth="500px">A</th>
            <th nzWidth="500px">B</th>
            <th nzRight nzWidth="120px">Action</th>
          </tr>
        </thead>
        <tbody>
          @for (r of t.data; track r.id) {
            <tr>
              <td nzLeft>{{ r.name }}</td>
              <td>{{ r.a }}</td>
              <td>{{ r.b }}</td>
              <td nzRight>x</td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `
})
class TestFixedColumnsComponent {
  rows = signal<Row[]>(Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Row ${i}`, a: `a${i}`, b: `b${i}` })));
}

@Component({
  imports: [NzTableModule],
  template: `
    <nz-table id="host" #t [nzData]="rows()" [nzSize]="size()" [nzBordered]="bordered()" [nzFrontPagination]="false">
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th nzRight>Action</th>
        </tr>
      </thead>
      <tbody>
        @for (r of t.data; track r.id) {
          <tr>
            <td>{{ r.name }}</td>
            <td>{{ r.a }}</td>
            <td nzRight>x</td>
          </tr>
        }
      </tbody>
    </nz-table>
  `
})
class TestSizeBorderedComponent {
  size = signal<'small' | 'middle' | 'default'>('default');
  bordered = signal(false);
  rows = signal<Row[]>(Array.from({ length: 3 }, (_, i) => ({ id: i, name: `Row ${i}`, a: `${i}`, b: '' })));
}

@Component({
  imports: [NzTableModule, FormsModule, NzThemeDirective],
  template: `
    <div [nzTheme]="{ token: { colorPrimary: '#00b96b' } }">
      <nz-table id="host" #t [nzData]="rows()" [nzFrontPagination]="true" [nzPageSize]="10">
        <thead>
          <tr>
            <th [nzFilters]="filters" [nzFilterFn]="filterFn">Name</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          @for (r of t.data; track r.id) {
            <tr>
              <td>{{ r.name }}</td>
              <td>{{ r.a }}</td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `
})
class TestFilterPaginationComponent {
  rows = signal<Row[]>(Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}`, a: `${i}`, b: '' })));
  filters: NzTableFilterList = [
    { text: 'Row 0', value: 'Row 0' },
    { text: 'Row 1', value: 'Row 1' }
  ];
  filterFn = (value: string, item: Row): boolean => item.name === value;
}

describe('table under antd v6 css', () => {
  afterEach(() => {
    style.remove();
    TestBed.inject(OverlayContainer).ngOnDestroy();
  });

  describe('fixed columns + ping shadow + sticky header', () => {
    let fixture: ComponentFixture<TestFixedColumnsComponent>;

    beforeEach(() => {
      installV6Css();
      TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
      fixture = TestBed.createComponent(TestFixedColumnsComponent);
      fixture.detectChanges();
    });

    it('styles the header, a body cell, the left-fixed cell and the scroll shadow', async () => {
      await fixture.whenStable();
      // The auto-left width of a fixed column (`nzLeft` with no explicit value) is resolved from
      // a `ResizeObserver`-driven measurement pass (`tr.directive.ts`'s `listOfListOfThWidth$`),
      // which needs another macrotask/frame past `whenStable()` to settle.
      await new Promise(r => setTimeout(r, 50));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const headerTh = root.querySelector('.ant-table-thead th') as HTMLElement;
      expect(headerTh).not.toBeNull();
      const headerCs = getComputedStyle(headerTh);
      // headerBg's default resolves to `--ant-table-header-bg` (#fafafa), not the generic
      // colorFillAlter token - verified in `components/core/theme/generated/test-css.ts`.
      expect(headerCs.backgroundColor).toBe('rgb(250, 250, 250)');
      expect(headerCs.padding).toBe('16px');
      expect(headerCs.borderBottom).toBe('1px solid rgb(240, 240, 240)');

      // The table also renders a hidden measure row (`ant-table-measure-row`) for width
      // calculation; pick a real data cell by its text content rather than by DOM order.
      const bodyCell = Array.from(root.querySelectorAll('.ant-table-tbody td')).find(
        td => td.textContent === 'a0'
      ) as HTMLElement;
      expect(bodyCell).not.toBeUndefined();
      expect(getComputedStyle(bodyCell).padding).toBe('16px');

      const fixedCell = root.querySelector('.ant-table-tbody td.ant-table-cell-fix-left') as HTMLElement;
      expect(fixedCell).not.toBeNull();
      const fixedCs = getComputedStyle(fixedCell);
      expect(fixedCs.position).toBe('sticky');
      expect(fixedCs.left).toBe('0px');
      expect(fixedCs.backgroundColor).toBe('rgb(255, 255, 255)');

      // Sticky header: the header div is a sibling of the scrollable body div, not inside it, so
      // it never moves when the body scrolls.
      const headerDiv = root.querySelector('.ant-table-header') as HTMLElement;
      const topBefore = headerDiv.getBoundingClientRect().top;

      const bodyDiv = root.querySelector('.ant-table-body') as HTMLElement;
      bodyDiv.scrollLeft = 200;
      bodyDiv.dispatchEvent(new Event('scroll'));
      await new Promise(r => setTimeout(r, 50));
      fixture.detectChanges();

      const tableMain = root.querySelector('.ant-table') as HTMLElement;
      expect(tableMain.classList.contains('ant-table-ping-left')).toBe(true);
      const lastFixedLeft = root.querySelector('.ant-table-cell-fix-left-last') as HTMLElement;
      expect(lastFixedLeft).not.toBeNull();
      expect(lastFixedLeft.classList.contains('ant-table-cell-fix-start-shadow-show')).toBe(true);
      const afterShadow = getComputedStyle(lastFixedLeft, '::after').boxShadow;
      expect(afterShadow).not.toBe('none');

      expect(headerDiv.getBoundingClientRect().top).toBe(topBefore);
    });
  });

  describe('sizes, bordered and row hover', () => {
    let fixture: ComponentFixture<TestSizeBorderedComponent>;

    beforeEach(() => {
      installV6Css();
      TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
      fixture = TestBed.createComponent(TestSizeBorderedComponent);
    });

    it('shrinks cell padding for nzSize="small"', () => {
      fixture.componentInstance.size.set('small');
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const cell = root.querySelector('.ant-table-tbody td') as HTMLElement;
      expect(getComputedStyle(cell).padding).toBe('8px');
    });

    it('draws the inline-end cell border when bordered', () => {
      fixture.componentInstance.bordered.set(true);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const cell = root.querySelector('.ant-table-tbody td') as HTMLElement;
      expect(getComputedStyle(cell).borderInlineEnd).toBe('1px solid rgb(240, 240, 240)');

      // antd v6's `bordered.js` draws a SECOND border, via `::after`, on the first fixed-right
      // cell, suppressed only when that cell is also the last fixed-right column
      // (`:not(.ant-table-cell-fix-right-last)`). ng-zorro never computes `-fix-right-last` at all
      // (emitting it would turn on an existing v4 rule for it - `v4-rule-guard.spec.ts`), so the
      // real v6 rule's `:not()` is unconditionally true here and would double the border on this
      // single-fixed-right-column table; `style/v6/patch.css` neutralises it back to 0 at equal
      // selector specificity.
      const fixedRightCell = root.querySelector('.ant-table-tbody td.ant-table-cell-fix-right') as HTMLElement;
      expect(fixedRightCell).not.toBeNull();
      expect(getComputedStyle(fixedRightCell, '::after').borderInlineEndWidth).toBe('0px');
    });

    it('mirrors the row-hover background as a :hover rule (no JS-driven hover-tracking class)', () => {
      fixture.detectChanges();
      // antd v6 toggles `ant-table-cell-row-hover` on every cell of the hovered row from JS
      // (`@rc-component/table`'s `useHoverState`, so a rowSpan-ed cell lights up too); ng-zorro
      // does not track per-row hover state, so `style/v6/patch.css` mirrors the same background
      // onto v4's plain `:hover` pseudo-class instead (`.ant-table-tbody > tr.ant-table-row:hover >
      // td`). A real `:hover` pseudo-class cannot be forced to match from a dispatched event (only
      // real pointer movement changes `:hover` matching), so this reads the installed stylesheet's
      // own CSSOM rule instead of `getComputedStyle` on an element: it finds the `:hover` rule that
      // targets a table cell and asserts its declared background is the row-hover token itself
      // (not merely a rule that happens to mention "background" anywhere, which the old assertion
      // here conflated with the template's unrelated `transition: background-color …` rule).
      const sheets = Array.from(document.styleSheets);
      let matched: CSSStyleRule | null = null;
      for (const sheet of sheets) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          if (!(rule instanceof CSSStyleRule)) continue;
          if (rule.selectorText.includes('.ant-table-row:hover') && rule.selectorText.includes('.ant-table-tbody')) {
            matched = rule;
            break;
          }
        }
        if (matched) break;
      }
      expect(matched).not.toBeNull();
      expect(matched!.selectorText).not.toContain('row-selected');
      expect(matched!.style.cssText).toContain('--ant-table-row-hover-bg');
    });
  });

  describe('filter dropdown scope and pagination', () => {
    let fixture: ComponentFixture<TestFilterPaginationComponent>;
    let overlay: OverlayContainer;

    beforeEach(() => {
      installV6Css();
      TestBed.configureTestingModule({ providers: [provideNzIconsTesting()], animationsEnabled: true });
      fixture = TestBed.createComponent(TestFilterPaginationComponent);
      overlay = TestBed.inject(OverlayContainer);
      fixture.detectChanges();
    });

    it('opens the filter dropdown inside the scoped theme and renders v6 pagination', async () => {
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      const trigger = root.querySelector('.ant-table-filter-trigger') as HTMLElement;
      expect(trigger).not.toBeNull();
      trigger.click();
      await new Promise(r => setTimeout(r, 200));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const pane = overlay.getContainerElement().querySelector('.ant-dropdown') as HTMLElement;
      expect(pane).not.toBeNull();
      await expectMotionSettled(pane);
      // `[nz-dropdown]` binds `[cdkConnectedOverlayPanelClass]` the way select does, so the scope
      // class lands on the CDK-generated `.cdk-overlay-pane` wrapper, one level above the
      // template's own `.ant-dropdown` root; the root inherits the scope's CSS custom properties
      // from that ancestor.
      const overlayPane = pane.closest('.cdk-overlay-pane') as HTMLElement;
      expect(overlayPane).not.toBeNull();
      expect(overlayPane.className).toMatch(/\bnz-theme-\d+\b/);
      expect(getComputedStyle(pane).getPropertyValue('--ant-color-primary').trim()).toBe('#00b96b');

      const dropdown = pane.querySelector('.ant-table-filter-dropdown') as HTMLElement;
      expect(dropdown).not.toBeNull();
      // borderRadius resolves to the generic `--ant-border-radius` (6px), not borderRadiusLG, as
      // `.ant-table-filter-dropdown{...border-radius:var(--ant-border-radius)...}` in the
      // generated template CSS shows, not borderRadiusLG (8px).
      expect(getComputedStyle(dropdown).borderRadius).toBe('6px');

      const pagination = root.querySelector('.ant-pagination.ant-table-pagination') as HTMLElement;
      expect(pagination).not.toBeNull();
      expect(pagination.classList.contains('ant-table-pagination-right')).toBe(true);
      expect(pagination.classList.contains('ant-table-pagination-end')).toBe(true);
      const item = pagination.querySelector('.ant-pagination-item') as HTMLElement;
      expect(item).not.toBeNull();
      const itemRect = item.getBoundingClientRect();
      expect(itemRect.width).toBeGreaterThan(0);
      expect(itemRect.height).toBeGreaterThan(0);
    });
  });
});
