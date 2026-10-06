---
category: Components
type: Layout
title: Divider
cover: 'https://gw.alipayobjects.com/zos/alicdn/5swjECahe/Divider.svg'
description: A divider line separates different content.
---

## When To Use

- Divide sections of article.
- Divide inline text and links such as the operation column of table.

## API

### nz-divider

| Property             | Description                                                                                                                                                                                        | Type                              | Default        | Version |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------- | ------- |
| `[nzDashed]`         | whether line is dashed                                                                                                                                                                             | `boolean`                         | `false`        |
| ~~`[nzType]`~~       | Deprecated, use [nzOrientation] instead. Direction type of divider                                                                                                                                 | `'horizontal' \| 'vertical'`      | `'horizontal'` |
| `[nzText]`           | inner text of divider                                                                                                                                                                              | `string \| TemplateRef<void>`     | -              |
| `[nzPlain]`          | Divider text show as plain style                                                                                                                                                                   | `boolean`                         | `false`        |
| `[nzOrientation]`    | Whether the line is horizontal or vertical. The former title values `'left' \| 'right' \| 'center'` are still accepted and forwarded to [nzTitlePlacement] with a deprecation warning              | `'horizontal' \| 'vertical'`      | `'horizontal'` |
| `[nzTitlePlacement]` | The position of the title inside the divider                                                                                                                                                       | `'start' \| 'end' \| 'center'`    | `'center'`     |
| `[nzTitleMargin]`    | The margin between the title and its closest border when [nzTitlePlacement] is not `'center'` (antd `orientationMargin`); a number or a unitless numeric string is px. Requires the v6 stylesheet. | `number \| string`                | -              |
| `[nzVariant]`        | Whether line is dashed, dotted or solid                                                                                                                                                            | `'dashed' \| 'dotted' \| 'solid'` | `'solid'`      |
| `[nzSize]`           | Divider size                                                                                                                                                                                       | `'small' \| 'middle' \| 'large'`  | -              | 20.2.0  |
