# Ant Design v6 alignment: deprecated input aliases

Inputs renamed to follow Ant Design v6. The old input still works: it forwards to the new one, prints a one-time
deprecation warning in dev mode, and loses to the new input when both are bound. Each alias is marked in code with
`// v6-alias: <old> -> <new>` and will be removed in the listed version; a future `ng update` schematic reads this table.
A row whose Old input and New input name the same input (an `X -> X` marker) records deprecated VALUES of a kept
input rather than a renamed input; the deprecated values are listed in the Old input cell (e.g. `nzMode
(left/right)`).

| Component             | Old input                         | New input        | Value mapping                                                                                                                                                                                                                                                   | Removal |
| --------------------- | --------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| nz-divider            | nzOrientation (left/right/center) | nzTitlePlacement | left→start, right→end, center→center in LTR; under RTL left→end, right→start (the old values are physical; a rewrite must keep the side)                                                                                                                        | v23.0.0 |
| nz-divider            | nzType                            | nzOrientation    | horizontal→horizontal, vertical→vertical                                                                                                                                                                                                                        | v23.0.0 |
| nz-splitter           | nzLayout                          | nzOrientation    | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-timeline           | nzMode (left/right)               | nzMode           | left→start, right→end                                                                                                                                                                                                                                           | v23.0.0 |
| nz-timeline           | nzPending                         | nzLoading        | move the pending content into a last nz-timeline-item's nzLoading                                                                                                                                                                                               | v23.0.0 |
| nz-timeline           | nzPendingDot                      | nzIcon           | move the dot into that last item's nzIcon                                                                                                                                                                                                                       | v23.0.0 |
| nz-timeline-item      | nzLabel                           | nzTitle          | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-timeline-item      | nzDot                             | nzIcon           | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-timeline-item      | nzPosition                        | nzPlacement      | left→start, right→end                                                                                                                                                                                                                                           | v23.0.0 |
| nz-timeline-item      | nzPlacement (left/right)          | nzPlacement      | left→start, right→end                                                                                                                                                                                                                                           | v23.0.0 |
| nz-steps              | nzDirection                       | nzOrientation    | identical values                                                                                                                                                                                                                                                | v23.0.0 |
| nz-steps              | nzLabelPlacement                  | nzTitlePlacement | identical values                                                                                                                                                                                                                                                | v23.0.0 |
| nz-steps              | nzProgressDot                     | nzType           | `true` → `'dot'`; `false` → no change; a TemplateRef → `'dot'`, the template stays the dot renderer                                                                                                                                                             | v23.0.0 |
| nz-step               | nzDescription                     | nzContent        | identical values                                                                                                                                                                                                                                                | v23.0.0 |
| nz-tag                | nzBordered                        | nzVariant        | false→filled, and ant-tag-borderless stays on the host for the default stylesheet; true→no change (filled is the default); antd useColor never maps it to outlined                                                                                              | v23.0.0 |
| nz-float-button       | nzDescription                     | nzContent        | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-float-button-top   | nzDescription                     | nzContent        | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-float-button-group | nzDescription                     | nzContent        | identity                                                                                                                                                                                                                                                        | v23.0.0 |
| nz-progress           | nzWidth                           | nzSize           | the circle or dashboard canvas width in px; a numeric `nzSize` follows antd's stroke formula (`max(3 / size * 100, 6)`) and adds `ant-progress-inline-circle` at 20 px or below, so for a pixel-identical migration below 50 px also bind `[nzStrokeWidth]="6"` | v23.0.0 |

## Behaviour changes

Changes that do not rename an input, so they have no row in the table above. They apply under either stylesheet unless
stated otherwise.

- **Steps `nzResponsive` defaults to `true`** (Ant Design parity). A horizontal `nz-steps` renders vertically below
  576 px. Opt out with `[nzResponsive]="false"`.
- **Inline-collapsed Menu** (`nzInlineCollapsed`):
  - an icon-less first-level item or submenu with a plain-text title shows the first letter of the title (the full
    title stays the submenu's accessible name);
  - a first-level item shows its label in an automatic tooltip on hover. Opt out with `[nzTooltip]="false"` on
    `nz-menu`, or put your own `nz-tooltip` on the item to keep that one instead.
- **Getter and default changes**:
  - `nz-divider`: reading `nzOrientation` returns the axis (`'horizontal' | 'vertical'`), no longer the title
    placement (`'left' | 'right' | 'center'`), which is now `nzTitlePlacement`;
  - `nz-splitter`: `nzLayout()` defaults to `undefined` (the effective orientation is `'horizontal'` unless
    `nzOrientation` or `nzLayout` is set);
  - `nz-timeline`: `nzMode` defaults to `'start'`.
- **Steps `nzProgressDot` as a template** is deprecated. Its replacement, an `nzIconRender` input, is not available yet,
  so the deprecation warning for the template form is advisory until it lands; keep using the template meanwhile.
- **Undefined means unset** for an input that replaced a deprecated one: binding `undefined` no longer pins an empty
  value. The deprecated input's value, or the default, applies again, and no warning is printed. This covers
  `nz-divider` `nzOrientation`/`nzTitlePlacement`, `nz-steps` `nzOrientation`/`nzTitlePlacement`, `nz-step`
  `nzContent`, `nz-timeline-item` `nzTitle`/`nzIcon`/`nzPlacement`, and every renamed input added after them;
  `nz-splitter` always behaved this way.
- **Size value `medium`**: `nz-badge`, `nz-progress`, `nz-pagination` and `nz-steps` accept `nzSize="medium"`, Ant
  Design 6's name for the default size, and render it exactly as `'default'`. `'default'` stays accepted without a
  warning; it is not deprecated.
- **Pagination size config**: the global `provideNzConfig({ pagination: { nzSize } })` value now reaches
  `nz-pagination`; it was ignored before unless `nzResponsive` was set, so an app that set it will see its
  pagination change size.
- **Disabled tags and groups**: a disabled checkable `nz-tag` leaves the tab order (`tabindex="-1"`) while other
  disabled tags keep their own tabindex, and a disabled `nz-tag-checkable-group` refuses model changes without
  emitting `nzCheckedChange`.
- **Checkable tag accessibility**: a checkable `nz-tag` now renders `role="checkbox"` and `aria-checked`, toggles on
  Space (not while disabled), and gets `tabindex="0"` unless the host already has a `tabindex`, which is never
  overwritten. Default and closeable tags are unchanged.
- **Breadcrumb router crumbs and modifier clicks**: a crumb that `nzAutoGenerate` renders no longer navigates in place
  on a ctrl, meta, shift or alt click or a non-primary click. The browser handles it (new tab or window), as with
  `routerLink`; a plain click still navigates through the router.
- **Class-list changes with nothing new bound**, none styled under the default stylesheet:
  - every `nz-progress` line without `nzSteps` now carries `ant-progress-line-align-end` and
    `ant-progress-line-position-outer`;
  - an `nz-pagination` inside an `nz-form` that sets `nzVariant` carries the matching variant class;
  - a checkable `nz-tag` no longer carries `ant-tag-filled`;
  - the circle in an `nz-step` with `nzPercentage` no longer carries `ant-progress-default`.
