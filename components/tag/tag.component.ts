/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { isPresetColor, isStatusColor, presetColors, statusColors } from 'ng-zorro-antd/core/color';
import { aliasDeprecatedInput, isTemplateRef } from 'ng-zorro-antd/core/util';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { tagCustomTint } from './tag-color';
import { NzTagColor, NzTagVariant } from './typings';

/** `booleanAttribute` that keeps `undefined` as "unset" (rule 8 beside `aliasDeprecatedInput`). */
function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value === undefined ? undefined : booleanAttribute(value);
}

interface NzTagCustomStyle {
  backgroundColor: string | null | undefined;
  color: string | null;
  borderColor: string | null;
}

@Component({
  selector: 'nz-tag',
  exportAs: 'nzTag',
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (nzIcon) {
      @if (iconTemplate; as template) {
        <ng-container [ngTemplateOutlet]="template" />
      } @else if (iconType; as type) {
        <nz-icon [nzType]="type" />
      }
      <span><ng-container [ngTemplateOutlet]="content" /></span>
    } @else {
      <ng-container [ngTemplateOutlet]="content" />
    }
    @if (nzMode === 'closeable') {
      <nz-icon nzType="close" class="ant-tag-close-icon" tabindex="-1" (click)="closeTag($event)" />
    }
  `,
  encapsulation: ViewEncapsulation.None,
  // The variant resolves as antd v6's useColor does (node_modules/antd/es/tag/hooks/useColor.js:18-30):
  // `nzVariant` first, otherwise 'filled'. The deprecated `nzBordered` maps `false` to 'filled' and
  // `true` to nothing, so it never yields 'outlined'. `ant-tag-borderless` stays on a filled tag whose
  // `nzBordered` is `false`: the default stylesheet's borderless look keys off it.
  host: {
    class: 'ant-tag',
    '[class.ant-tag-filled]': `variant === 'filled'`,
    '[class.ant-tag-outlined]': `variant === 'outlined'`,
    '[class.ant-tag-solid]': `variant === 'solid'`,
    '[style.background-color]': `customStyle.backgroundColor`,
    '[style.color]': `customStyle.color`,
    '[style.border-color]': `customStyle.borderColor`,
    '[class.ant-tag-has-color]': `nzColor && !isPresetColor && !disabled`,
    '[class.ant-tag-checkable]': `nzMode === 'checkable'`,
    '[class.ant-tag-checkable-checked]': `nzChecked`,
    '[class.ant-tag-disabled]': `disabled && nzMode !== 'checkable'`,
    '[class.ant-tag-checkable-disabled]': `disabled && nzMode === 'checkable'`,
    '[class.ant-tag-rtl]': `dir() === 'rtl'`,
    '[class.ant-tag-borderless]': `!bordered && variant === 'filled'`,
    '[attr.tabindex]': `disabled ? -1 : hostTabindex`,
    '[attr.aria-disabled]': `disabled || null`,
    '(click)': 'updateCheckedStatus()'
  },
  imports: [NgTemplateOutlet, NzIconModule]
})
export class NzTagComponent implements OnChanges {
  private renderer = inject(Renderer2);
  private el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly dir = inject(Directionality).valueSignal;
  /** A `tabindex` the app wrote on the host; it comes back when the tag is enabled again. */
  protected readonly hostTabindex = this.el.getAttribute('tabindex');

  @Input() nzMode: 'default' | 'closeable' | 'checkable' = 'default';
  @Input() nzColor?: NzTagColor;
  @Input({ transform: booleanAttribute }) nzChecked = false;
  /** Icon rendered before the content; the content is then wrapped in a `<span>`, as antd does. */
  @Input() nzIcon?: string | TemplateRef<void>;

  @Input()
  set nzVariant(value: NzTagVariant | undefined) {
    this.variantExplicit = value !== undefined;
    this.variant = value ?? this.borderedVariant ?? 'filled';
  }
  get nzVariant(): NzTagVariant {
    return this.variant;
  }

  /** @deprecated Use `nzVariant` instead. This will be removed in v23.0.0. */
  // v6-alias: nzBordered -> nzVariant
  @Input({ transform: booleanAttribute })
  set nzBordered(value: boolean) {
    this.bordered = value;
    // antd warns only for `bordered={false}` (tag/index.js: `warning.deprecated(bordered !== false, ...)`).
    this.borderedVariant = value ? undefined : this.aliasBordered(value);
    if (!this.variantExplicit) {
      this.variant = this.borderedVariant ?? 'filled';
    }
  }
  get nzBordered(): boolean {
    return this.bordered;
  }

  @Input({ transform: optionalBooleanAttribute })
  set nzDisabled(value: boolean | undefined) {
    this.ownDisabled = value;
  }
  get nzDisabled(): boolean {
    return this.disabled;
  }

  @Output() readonly nzOnClose = new EventEmitter<MouseEvent>();
  @Output() readonly nzCheckedChange = new EventEmitter<boolean>();
  isPresetColor = false;

  protected variant: NzTagVariant = 'filled';
  protected bordered = true;
  private variantExplicit = false;
  private borderedVariant: NzTagVariant | undefined;
  private ownDisabled: boolean | undefined;
  private styleKey: string | null = null;
  private style: NzTagCustomStyle = { backgroundColor: undefined, color: null, borderColor: null };
  private readonly aliasBordered = aliasDeprecatedInput<boolean, NzTagVariant>(
    'nz-tag',
    'nzBordered',
    'nzVariant',
    () => 'filled'
  );

  protected get disabled(): boolean {
    return this.ownDisabled ?? false;
  }

  protected get iconTemplate(): TemplateRef<void> | null {
    return isTemplateRef(this.nzIcon) ? this.nzIcon : null;
  }

  protected get iconType(): string | null {
    return typeof this.nzIcon === 'string' ? this.nzIcon : null;
  }

  /**
   * The inline colour of a custom (non-preset) `nzColor`, after antd's useColor (tag/hooks/useColor.ts).
   * 'filled' and 'solid' keep the solid background in the colour that the default stylesheet draws;
   * 'outlined' gets antd's tint background with the text and the border in the colour. A disabled tag
   * drops the colour, as antd does.
   */
  protected get customStyle(): NzTagCustomStyle {
    const key = `${this.nzColor}|${this.isPresetColor}|${this.variant}|${this.disabled}`;
    if (key !== this.styleKey) {
      this.styleKey = key;
      this.style = this.computeCustomStyle();
    }
    return this.style;
  }

  updateCheckedStatus(): void {
    if (this.nzMode === 'checkable' && !this.disabled) {
      this.nzChecked = !this.nzChecked;
      this.nzCheckedChange.emit(this.nzChecked);
    }
  }

  closeTag(e: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.nzOnClose.emit(e);
    if (!e.defaultPrevented) {
      this.renderer.removeChild(this.renderer.parentNode(this.el), this.el);
    }
  }

  private computeCustomStyle(): NzTagCustomStyle {
    if (this.disabled) {
      return { backgroundColor: null, color: null, borderColor: null };
    }
    if (this.nzColor && !this.isPresetColor && this.variant === 'outlined') {
      return { backgroundColor: tagCustomTint(this.nzColor), color: this.nzColor, borderColor: this.nzColor };
    }
    return { backgroundColor: this.isPresetColor ? '' : this.nzColor, color: null, borderColor: null };
  }

  private clearPresetColor(): void {
    // /(ant-tag-(?:pink|red|...))/g
    const regexp = new RegExp(`(ant-tag-(?:${[...presetColors, ...statusColors].join('|')}))`, 'g');
    const classname = this.el.classList.toString();
    const matches: string[] = [];
    let match: RegExpExecArray | null = regexp.exec(classname);
    while (match !== null) {
      matches.push(match[1]);
      match = regexp.exec(classname);
    }
    this.el.classList.remove(...matches);
  }

  private setPresetColor(): void {
    this.clearPresetColor();
    if (!this.nzColor) {
      this.isPresetColor = false;
    } else {
      this.isPresetColor = isPresetColor(this.nzColor) || isStatusColor(this.nzColor);
    }
    if (this.isPresetColor) {
      this.el.classList.add(`ant-tag-${this.nzColor}`);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { nzColor } = changes;
    if (nzColor) {
      this.setPresetColor();
    }
  }
}
