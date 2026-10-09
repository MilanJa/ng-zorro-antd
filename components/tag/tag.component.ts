/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  effect,
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

import { NZ_TAG_CHECKABLE_GROUP } from './tag-checkable-group.token';
import { tagCustomTint } from './tag-color';
import { NzTagCheckableValue, NzTagColor, NzTagVariant } from './typings';

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
    '[class.ant-tag-filled]': `variantClass === 'filled'`,
    '[class.ant-tag-outlined]': `variantClass === 'outlined'`,
    '[class.ant-tag-solid]': `variantClass === 'solid'`,
    '[style.background-color]': `customStyle.backgroundColor`,
    '[style.color]': `customStyle.color`,
    '[style.border-color]': `customStyle.borderColor`,
    '[class.ant-tag-has-color]': `nzColor && !isPresetColor && !disabled`,
    '[class.ant-tag-checkable]': `nzMode === 'checkable'`,
    '[class.ant-tag-checkable-checked]': `checked`,
    '[class.ant-tag-disabled]': `disabled && nzMode !== 'checkable'`,
    '[class.ant-tag-checkable-disabled]': `disabled && nzMode === 'checkable'`,
    '[class.ant-tag-rtl]': `dir() === 'rtl'`,
    '[class.ant-tag-borderless]': `!bordered && variant === 'filled'`,
    '[attr.aria-disabled]': `disabled || null`,
    '(click)': 'updateCheckedStatus()'
  },
  imports: [NgTemplateOutlet, NzIconModule]
})
export class NzTagComponent implements OnChanges {
  private renderer = inject(Renderer2);
  private el: HTMLElement = inject(ElementRef<HTMLElement>).nativeElement;
  protected readonly dir = inject(Directionality).valueSignal;
  /** The host's own `tabindex`, kept while the tag is disabled so it can be put back (null: none). */
  private savedTabindex: string | null = null;
  private tabindexSaved = false;
  private readonly group = inject(NZ_TAG_CHECKABLE_GROUP, { optional: true });

  @Input() nzMode: 'default' | 'closeable' | 'checkable' = 'default';
  @Input() nzColor?: NzTagColor;
  @Input({ transform: booleanAttribute }) nzChecked = false;
  /** Icon rendered before the content; the content is then wrapped in a `<span>`, as antd does. */
  @Input() nzIcon?: string | TemplateRef<void>;
  /** The value a checkable tag contributes to its `nz-tag-checkable-group`; unset keeps it out of the model. */
  @Input() nzValue?: NzTagCheckableValue;

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
    this.syncTabindex();
  }
  get nzDisabled(): boolean {
    return this.disabled;
  }

  @Output() readonly nzOnClose = new EventEmitter<MouseEvent>();
  @Output() readonly nzCheckedChange = new EventEmitter<boolean>();
  isPresetColor = false;

  constructor() {
    const group = this.group;
    if (group) {
      // The group's disabled state can change without this tag's own setter firing.
      effect(() => {
        group.disabled();
        this.syncTabindex();
      });
    }
  }

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

  /** A bound `nzDisabled` wins; otherwise a checkable tag inherits its group's disabled state. */
  protected get disabled(): boolean {
    return this.ownDisabled ?? (this.nzMode === 'checkable' ? this.group?.disabled() : undefined) ?? false;
  }

  /** Inside a group with an `nzValue`, the group's model decides; otherwise `nzChecked`, as before. */
  protected get checked(): boolean {
    return this.inGroup ? this.group!.isChecked(this.nzValue!) : this.nzChecked;
  }

  private get inGroup(): boolean {
    return !!this.group && this.nzMode === 'checkable' && this.nzValue !== undefined;
  }

  /** antd's `CheckableTag` carries no variant class; `ant-tag-filled` would paint over the checked fill. */
  protected get variantClass(): NzTagVariant | null {
    return this.nzMode === 'checkable' ? null : this.variant;
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
    if (this.nzMode !== 'checkable' || this.disabled) {
      return;
    }
    if (this.inGroup) {
      const next = !this.checked;
      if (this.group!.toggle(this.nzValue!, next)) {
        this.nzCheckedChange.emit(next);
      }
      return;
    }
    this.nzChecked = !this.nzChecked;
    this.nzCheckedChange.emit(this.nzChecked);
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

  /**
   * A disabled checkable tag leaves the tab order, as antd's `CheckableTag` does (other tags keep theirs).
   * The host's own `tabindex` is written only across the disabled transition: when the tag is enabled again
   * and the attribute is no longer `-1`, the parent wrote it meanwhile and it is left alone.
   */
  private syncTabindex(): void {
    const off = this.disabled && this.nzMode === 'checkable';
    if (off && !this.tabindexSaved) {
      this.savedTabindex = this.el.getAttribute('tabindex');
      this.tabindexSaved = true;
      this.renderer.setAttribute(this.el, 'tabindex', '-1');
    } else if (!off && this.tabindexSaved) {
      if (this.el.getAttribute('tabindex') === '-1') {
        if (this.savedTabindex === null) {
          this.renderer.removeAttribute(this.el, 'tabindex');
        } else {
          this.renderer.setAttribute(this.el, 'tabindex', this.savedTabindex);
        }
      }
      this.savedTabindex = null;
      this.tabindexSaved = false;
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
    const { nzColor, nzMode } = changes;
    if (nzColor) {
      this.setPresetColor();
    }
    if (nzMode) {
      this.syncTabindex();
    }
  }
}
