import { Component, signal } from '@angular/core';

import { NzTabsModule } from 'ng-zorro-antd/tabs';

interface EditableTab {
  key: string;
  title: string;
}

@Component({
  selector: 'nz-demo-tabs-editable-card',
  imports: [NzTabsModule],
  template: `
    <nz-tabs [(nzActiveKey)]="activeKey" nzType="editable-card" (nzAdd)="newTab()" (nzClose)="closeTab($event)">
      @for (tab of tabs(); track tab.key) {
        <nz-tab nzClosable [nzKey]="tab.key" [nzTitle]="tab.title">Content of {{ tab.title }}</nz-tab>
      }
    </nz-tabs>
  `
})
export class NzDemoTabsEditableCardComponent {
  readonly tabs = signal<EditableTab[]>([
    { key: '1', title: 'Tab 1' },
    { key: '2', title: 'Tab 2' }
  ]);
  readonly activeKey = signal('1');
  private newTabIndex = 0;

  closeTab({ key }: { index: number; key?: string }): void {
    const tabs = this.tabs();
    const index = tabs.findIndex(tab => tab.key === key);
    const rest = tabs.filter(tab => tab.key !== key);
    if (rest.length && this.activeKey() === key) {
      this.activeKey.set(rest[Math.max(index - 1, 0)].key);
    }
    this.tabs.set(rest);
  }

  newTab(): void {
    const key = `newTab${this.newTabIndex++}`;
    this.tabs.update(tabs => [...tabs, { key, title: 'New Tab' }]);
    this.activeKey.set(key);
  }
}
