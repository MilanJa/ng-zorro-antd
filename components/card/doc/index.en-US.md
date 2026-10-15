---
category: Components
type: Data Display
title: Card
cols: 1
cover: 'https://gw.alipayobjects.com/zos/alicdn/keNB-R8Y9/Card.svg'
description: Simple rectangular container.
---

## When To Use

A card can be used to display content related to a single subject. The content can consist of multiple elements of varying types and sizes.

## API

```html
<nz-card nzTitle="card title">card content</nz-card>
```

### nz-card

| Property                  | Description                                                                                                                                                                                                          | Type                                  | Default     | Global Config |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------- | ------------- |
| `[nzActions]`             | The action list, shows at the bottom of the Card.                                                                                                                                                                    | `Array<TemplateRef<void>>`            | -           |
| `[nzBodyStyle]`           | Inline style to apply to the card content                                                                                                                                                                            | `{ [key: string]: string }`           | -           |
| `[nzBordered]`            | Toggles rendering of the border around the card                                                                                                                                                                      | `boolean`                             | `true`      | ✅            |
| `[nzCover]`               | Card cover                                                                                                                                                                                                           | `TemplateRef<void>`                   | -           |
| `[nzExtra]`               | Content to render in the top-right corner of the card                                                                                                                                                                | `string \| TemplateRef<void>`         | -           |
| `[nzHoverable]`           | Lift up when hovering card                                                                                                                                                                                           | `boolean`                             | `false`     | ✅            |
| `[nzLoading]`             | Shows a loading indicator while the contents of the card are being fetched                                                                                                                                           | `boolean`                             | `false`     |
| `[nzTitle]`               | Card title                                                                                                                                                                                                           | `string \| TemplateRef<void>`         | -           |
| `[nzType]`                | Card style type, can be set to `inner` or not set                                                                                                                                                                    | `'inner'`                             | -           |
| `[nzSize]`                | Size of card                                                                                                                                                                                                         | `'default' \| 'small'`                | `'default'` | ✅            |
| `[nzTabList]`             | Head tabs, rendered as an `nz-tabs` below the title row; while set, a projected `nz-card-tab` is ignored                                                                                                             | `NzCardTabItem[] \| null`             | `null`      |
| `[(nzActiveTabKey)]`      | Key of the active head tab (controlled). A key that matches no item selects no tab: no ink bar and no `aria-selected` tab, though the first tab keeps its active text colour because `nz-tabs` always holds an index | `string \| null`                      | `null`      |
| `[nzDefaultActiveTabKey]` | Key of the initially active head tab while `nzActiveTabKey` is not bound; falls back to the first item                                                                                                               | `string \| null`                      | `null`      |
| `[nzTabBarExtraContent]`  | Extra content at the end of the head tab bar                                                                                                                                                                         | `string \| TemplateRef<void> \| null` | `null`      |
| `[nzTabProps]`            | Options for the head `nz-tabs`. `nzSize` overrides the size derived from `nzSize` (`small` for a small card, otherwise `large`); unset fields use `line`, not centered, animated                                     | `NzCardTabProps \| null`              | `null`      |
| `(nzActiveTabKeyChange)`  | Emits the key the user selected; the companion of `[(nzActiveTabKey)]`                                                                                                                                               | `EventEmitter<string>`                | -           |
| `(nzTabChange)`           | Emits the key after the user changes the head tab; programmatic key changes do not emit                                                                                                                              | `EventEmitter<string>`                | -           |

### nz-card-meta

| Property          | Description         | Type                          | Default |
| ----------------- | ------------------- | ----------------------------- | ------- |
| `[nzAvatar]`      | avatar or icon      | `TemplateRef<void>`           | -       |
| `[nzDescription]` | description content | `string \| TemplateRef<void>` | -       |
| `[nzTitle]`       | title content       | `string \| TemplateRef<void>` | -       |

### [nz-card-grid]

| Property        | Description                | Type      | Default | Global Config |
| --------------- | -------------------------- | --------- | ------- | ------------- |
| `[nzHoverable]` | Lift up when hovering card | `boolean` | `true`  | -             |

Area for grid style card

### nz-card-tab

Area for tab card. Still supported, but ignored when the same card sets `nzTabList` (the card warns once in dev mode); use one or the other.

### NzCardTabItem

| Property   | Description                                       | Type                          | Default |
| ---------- | ------------------------------------------------- | ----------------------------- | ------- |
| `key`      | Unique key of the tab                             | `string`                      | -       |
| `label`    | Tab title                                         | `string \| TemplateRef<void>` | -       |
| `icon`     | Icon before the title: an icon type or a template | `string \| TemplateRef<void>` | -       |
| `disabled` | Whether the tab is disabled                       | `boolean`                     | `false` |

### NzCardTabProps

| Property     | Description                                | Type                              | Default                                         |
| ------------ | ------------------------------------------ | --------------------------------- | ----------------------------------------------- |
| `nzSize`     | Size of the head tabs                      | `'large' \| 'default' \| 'small'` | `'small'` for a small card, otherwise `'large'` |
| `nzType`     | Basic style of the head tabs               | `'line' \| 'card'`                | `'line'`                                        |
| `nzCentered` | Centers the head tabs                      | `boolean`                         | `false`                                         |
| `nzAnimated` | Whether to change head tabs with animation | `boolean`                         | `true`                                          |
