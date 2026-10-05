/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

// Elements whose activation opens a popup; best effort, each clicked/hovered once per page.
export const TRIGGERS = [
  '.ant-select-selector',
  '[nz-tooltip]',
  '[nz-popover]',
  '[nz-popconfirm]',
  '.ant-picker-input input',
  '.ant-dropdown-trigger',
  '.ant-cascader .ant-select-selector',
  // Auto-complete's trigger directive opens its overlay on `(click)` (`handleClick`), same as on
  // focus; `[nzAutocomplete]` is a property binding with no reflected DOM attribute, so the
  // directive's own static host attribute is the selector that actually matches the rendered input.
  'input[aria-autocomplete="list"]'
];

// Components whose popup only opens on click (not hover), scoped to the component's own demo
// containers; clicked up to 4 times each, closed with Escape/close buttons between attempts.
export const CLICK_TRIGGERS: Partial<Record<string, string>> = {
  modal: '.ant-btn',
  drawer: '.ant-btn',
  message: '.ant-btn',
  notification: '.ant-btn',
  popconfirm: '.ant-btn',
  'float-button': '.ant-float-btn-group-trigger, .ant-float-btn',
  'color-picker': '.ant-color-picker-trigger',
  'tree-select': '.ant-select-selector',
  cascader: '.ant-select-selector',
  upload: '.ant-upload button, .ant-upload-btn',
  dropdown: '[nz-dropdown], .ant-dropdown-trigger',
  // `nz-image` is a directive on the host `<img>`; it never emits antd's own `.ant-image-img`
  // class (there is no wrapping component), so the trigger is the element selector itself.
  image: 'img[nz-image]',
  tabs: '.ant-tabs-nav-more',
  table: '.ant-table-filter-trigger',
  pagination: '.ant-pagination-options .ant-select-selector'
  // 'context-menu': n/a -- right-click is not exercised by this harness.
};

// Components whose popup opens on hover (not click), scoped to the component's own demo
// containers; hovered once, closed with Escape. A `page.click` on these is unsafe when the
// trigger element wraps a real `<a href>` (e.g. breadcrumb's dropdown-hosted crumb,
// `components/breadcrumb/demo/dropdown.ts`): Playwright's click dispatches at the element's
// visible point, which can land on the anchor and navigate the page away instead of opening the
// popup, since the directive's own open path (`dropdown.directive.ts`'s `hostMouseState$`) never
// needs a click at all.
export const HOVER_TRIGGERS: Partial<Record<string, string>> = {
  breadcrumb: '.ant-breadcrumb-overlay-link',
  // A root-level submenu title of a vertical or horizontal menu (`nzTriggerSubMenuAction` defaults
  // to hover); an inline submenu toggles on click in place and opens no popup. One `:is()` selector,
  // since the callers prefix the demo container to the whole string.
  menu: ':is(.ant-menu-vertical, .ant-menu-horizontal) > .ant-menu-submenu > .ant-menu-submenu-title'
};
