---
category: Components
type: Navigation
cols: 1
title: Steps
cover: 'https://gw.alipayobjects.com/zos/antfincdn/UZYqMizXHaj/Steps.svg'
description: A navigation bar that guides users through the steps of a task.
---

## When To Use

When a given task is complicated or has a certain sequence in the series of subtasks, we can decompose it into several steps to make things easier.

## API

```html
<nz-steps>
  <nz-step nzTitle="first step" />
  <nz-step nzTitle="second step" />
  <nz-step nzTitle="third step" />
</nz-steps>
```

### nz-steps

The whole of the step bar.

| Property                 | Description                                                                                                                                                                                                                                                                                    | Type                                                                                      | Default        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| `[nzType]`               | type of steps: `default`, `navigation`, `dot`, `inline` (dots with the content in a tooltip, for lists) or `panel` (panels joined by arrows); `inline` and `panel` fall back to the dot and default looks under the default stylesheet; for `'inline'`, `'panel'`: Requires the v6 stylesheet. | `'default' \| 'navigation' \| 'dot' \| 'inline' \| 'panel'`                               | `'default'`    |
| `[nzCurrent]`            | To set the current step, counting from 0. You can overwrite this state by using `nzStatus` of `nz-step`                                                                                                                                                                                        | `number`                                                                                  | `0`            |
| `[nzOrientation]`        | To specify the orientation of the step bar, `horizontal` and `vertical` are currently supported                                                                                                                                                                                                | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzDirection]`~~      | Deprecated, use `[nzOrientation]` instead. To specify the direction of the step bar                                                                                                                                                                                                            | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| `[nzTitlePlacement]`     | Place the title beside the icon (`horizontal`) or below it (`vertical`)                                                                                                                                                                                                                        | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzLabelPlacement]`~~ | Deprecated, use `[nzTitlePlacement]` instead. Support vertical title and description                                                                                                                                                                                                           | `'vertical' \| 'horizontal'`                                                              | `'horizontal'` |
| ~~`[nzProgressDot]`~~    | Deprecated, use `[nzType]` instead (`nzType="dot"`). A TemplateRef still customizes the dot                                                                                                                                                                                                    | `boolean \| TemplateRef<{ $implicit: TemplateRef<void>, status: string, index: number }>` | `false`        |
| `[nzVariant]`            | Visual variant of the step icons. Requires the v6 stylesheet.                                                                                                                                                                                                                                  | `'filled' \| 'outlined'`                                                                  | `'filled'`     |
| `[nzMaxCount]`           | Maximum number of steps shown (at least 3); hidden ranges around `nzCurrent` collapse into disabled ellipsis steps. Smaller values are ignored with a warning                                                                                                                                  | `number`                                                                                  | -              |
| `[nzEllipsis]`           | Keep titles and descriptions on one line with an ellipsis. Requires the v6 stylesheet.                                                                                                                                                                                                         | `boolean`                                                                                 | `false`        |
| `[nzResponsive]`         | Render vertically below the `xs` breakpoint (575px)                                                                                                                                                                                                                                            | `boolean`                                                                                 | `true`         |
| `[nzSize]`               | To specify the size of the step bar, `default` and `small` are currently supported                                                                                                                                                                                                             | `'small' \| 'default'`                                                                    | `'default'`    |
| `[nzStatus]`             | To specify the status of current step, can be set to one of the following values: `wait` `process` `finish` `error`                                                                                                                                                                            | `'wait' \| 'process' \| 'finish' \| 'error'`                                              | `'process'`    |
| `[nzStartIndex]`         | To specify the starting number                                                                                                                                                                                                                                                                 | `number`                                                                                  | `0`            |
| `(nzIndexChange)`        | Trigger event when step click                                                                                                                                                                                                                                                                  | `number`                                                                                  | -              |

### nz-step

A single step in the step bar.

| Property              | Description                                                                                                                                                | Type                                                                                    | Default  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| `[nzContent]`         | content (description) of the step, optional property                                                                                                       | `string \| TemplateRef<void>`                                                           | -        |
| ~~`[nzDescription]`~~ | Deprecated, use `[nzContent]` instead. description of the step                                                                                             | `string \| TemplateRef<void>`                                                           | -        |
| `[nzIcon]`            | icon of the step, optional property                                                                                                                        | `string \| string[] \| Set<string> \| { [klass: string]: any; }` \| `TemplateRef<void>` | -        |
| `[nzStatus]`          | to specify the status. It will be automatically set by `nzCurrent` of `nz-steps` if not configured. Optional values are: `wait` `process` `finish` `error` | `'wait' \| 'process' \| 'finish' \| 'error'`                                            | `'wait'` |
| `[nzTitle]`           | title of the step                                                                                                                                          | `string \| TemplateRef<void>`                                                           | -        |
| `[nzSubtitle]`        | subTitle of the step                                                                                                                                       | `string \| TemplateRef<void>`                                                           | -        |
| `[nzDisabled]`        | disable click                                                                                                                                              | `boolean`                                                                               | `false`  |
| `[nzPercentage]`      | Progress percentage of the step in `process` status (only works on basic Steps)                                                                            | `number`                                                                                | -        |
| `(nzClick)`           | Emits the step's index when a step that is not disabled is clicked                                                                                         | `number`                                                                                | -        |
