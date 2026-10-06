---
category: Components
type: Data Display
title: Timeline
cover: 'https://gw.alipayobjects.com/zos/antfincdn/vJmo00mmgR/Timeline.svg'
description: Vertical display timeline.
---

## When To Use

- When a series of information needs to be ordered by time (ascend or descend).
- When you need a timeline to make a visual connection.

## API

```html
<nz-timeline>
  <nz-timeline-item>step1 2015-09-01</nz-timeline-item>
  <nz-timeline-item>step2 2015-09-01</nz-timeline-item>
  <nz-timeline-item>step3 2015-09-01</nz-timeline-item>
  <nz-timeline-item>step4 2015-09-01</nz-timeline-item>
</nz-timeline>
```

### nz-timeline

Timeline

| Property             | Description                                                                                                                                                 | Type                                          | Default                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------ |
| ~~`[nzPending]`~~    | Deprecated, use `[nzLoading]` instead. Add a last `nz-timeline-item` with `[nzLoading]`; sets the last ghost node's existence or its content                | `string \| boolean \| TemplateRef<void>`      | `false`                        |
| ~~`[nzPendingDot]`~~ | Deprecated, use `[nzIcon]` instead. Set `[nzIcon]` on that last loading item; sets the dot of the last ghost node when pending is true                      | `string \| TemplateRef<void>`                 | `<nz-icon nzType="loading" />` |
| `[nzReverse]`        | Reverse nodes or not                                                                                                                                        | `boolean`                                     | `false`                        |
| `[nzMode]`           | Item placement; `alternate` alternates the sides, `custom` uses each item's `nzPlacement`. `'left'` and `'right'` are deprecated, use `'start'` and `'end'` | `'start' \| 'end' \| 'alternate' \| 'custom'` | `'start'`                      |
| `[nzOrientation]`    | Direction of the timeline; `'horizontal'` lays items out in a row. Requires the v6 stylesheet.                                                              | `'vertical' \| 'horizontal'`                  | `'vertical'`                   |
| `[nzVariant]`        | Style variant of the dots. Requires the v6 stylesheet.                                                                                                      | `'filled' \| 'outlined'`                      | `'outlined'`                   |
| `[nzTitleSpan]`      | Width of the title column, out of 24 (number) or as a CSS length; ignored in `alternate` mode. Requires the v6 stylesheet.                                  | `number \| string`                            | `12`                           |

### nz-timeline-item

Node of timeline

| Property           | Description                                                                                      | Type                          | Default |
| ------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------- | ------- |
| `[nzColor]`        | Set the circle's color to `'blue' \| 'red' \| 'green' \| 'gray'` or other custom colors          | `string`                      | `blue`  |
| `[nzIcon]`         | Customize the node icon                                                                          | `string \| TemplateRef<void>` | -       |
| ~~`[nzDot]`~~      | Deprecated, use `[nzIcon]` instead.                                                              | `string \| TemplateRef<void>` | -       |
| `[nzPlacement]`    | Customize the placement, only works when `nzMode` is `custom`; `'left'`/`'right'` are deprecated | `'start' \| 'end'`            | -       |
| ~~`[nzPosition]`~~ | Deprecated, use `[nzPlacement]` instead.                                                         | `'left' \| 'right'`           | -       |
| `[nzTitle]`        | Set the title                                                                                    | `string \| TemplateRef<void>` | -       |
| ~~`[nzLabel]`~~    | Deprecated, use `[nzTitle]` instead.                                                             | `string \| TemplateRef<void>` | -       |
| `[nzLoading]`      | Loading node: a spinner icon, and the rail before it is drawn as in progress                     | `boolean`                     | `false` |
