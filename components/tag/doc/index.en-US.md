---
category: Components
type: Data Display
title: Tag
cover: 'https://gw.alipayobjects.com/zos/alicdn/cH1BOLfxC/Tag.svg'
description: Used for marking and categorization.
---

## When To Use

- It can be used to tag by dimension or property.

- When categorizing.

## API

### nz-tag

| Property            | Description                                                                                                                                                                                                                                             | Type                                      | Default     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------- |
| `[nzMode]`          | Mode of tag                                                                                                                                                                                                                                             | `'closeable' \| 'default' \| 'checkable'` | `'default'` |
| `[nzChecked]`       | Checked status of Tag, double binding, only works when `nzMode="checkable"`                                                                                                                                                                             | `boolean`                                 | `false`     |
| `[nzColor]`         | Color of the Tag                                                                                                                                                                                                                                        | `string`                                  | -           |
| `[nzVariant]`       | Variant of the tag; with `'outlined'` a custom `nzColor` is tinted as Ant Design does; for `'outlined'` and `'solid'`: Requires the v6 stylesheet.                                                                                                      | `'filled' \| 'outlined' \| 'solid'`       | `'filled'`  |
| `[nzIcon]`          | Icon rendered before the content, which is then wrapped in a `<span>` as Ant Design does                                                                                                                                                                | `string \| TemplateRef<void>`             | -           |
| `[nzDisabled]`      | Disable the tag: a checkable tag no longer toggles, a closeable tag no longer closes, and a custom `nzColor` is not applied; a disabled checkable tag also leaves the tab order (`tabindex="-1"`); for the greyed-out look: Requires the v6 stylesheet. | `boolean`                                 | `false`     |
| `[nzValue]`         | Value of a checkable tag inside `nz-tag-checkable-group`; a tag without it is not part of the group's model                                                                                                                                             | `string \| number`                        | -           |
| ~~`[nzBordered]`~~  | Deprecated, use [nzVariant] instead. Whether has border style; `false` keeps the borderless look of the default stylesheet and resolves to `'filled'`                                                                                                   | `boolean`                                 | `true`      |
| `(nzOnClose)`       | Callback executed when tag is closed, only works when `nzMode="closable"`                                                                                                                                                                               | `EventEmitter<MouseEvent>`                | -           |
| `(nzCheckedChange)` | Checked status change call back, only works when `nzMode="checkable"`                                                                                                                                                                                   | `EventEmitter<boolean>`                   | -           |

### nz-tag-checkable-group

| Property       | Description                                                                                                                                                                                                           | Type                                               | Default |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------- |
| `[nzMultiple]` | Whether several tags can be checked; the model is an array when `true` and a single value or `null` otherwise                                                                                                         | `boolean`                                          | `false` |
| `[nzDisabled]` | Disable every checkable tag in the group; a child's own bound `[nzDisabled]` controls its look and focus, but a disabled group refuses model changes regardless; for the greyed-out look: Requires the v6 stylesheet. | `boolean`                                          | `false` |
| `[(ngModel)]`  | The checked `nzValue`s of the child checkable tags                                                                                                                                                                    | `(string \| number)[] \| string \| number \| null` | -       |
