import { Component } from '@angular/core';

import { NzCardModule, NzCardTabItem } from 'ng-zorro-antd/card';

@Component({
  selector: 'nz-demo-card-tabs',
  imports: [NzCardModule],
  template: `
    <nz-card
      style="width: 100%;"
      nzTitle="Card title"
      [nzExtra]="extraTemplate"
      [nzTabList]="tabList"
      [(nzActiveTabKey)]="activeTabKey1"
    >
      <p>{{ contentList[activeTabKey1] }}</p>
    </nz-card>
    <ng-template #extraTemplate>
      <a>More</a>
    </ng-template>
    <br />
    <br />
    <nz-card
      style="width: 100%;"
      [nzTabList]="tabListNoTitle"
      nzDefaultActiveTabKey="app"
      [nzTabBarExtraContent]="extraTemplate"
      [nzTabProps]="{ nzSize: 'default' }"
      (nzTabChange)="activeTabKey2 = $event"
    >
      <p>{{ contentListNoTitle[activeTabKey2] }}</p>
    </nz-card>
  `
})
export class NzDemoCardTabsComponent {
  readonly tabList: NzCardTabItem[] = [
    { key: 'tab1', label: 'tab1' },
    { key: 'tab2', label: 'tab2' }
  ];
  readonly contentList: Record<string, string> = { tab1: 'content1', tab2: 'content2' };
  readonly tabListNoTitle: NzCardTabItem[] = [
    { key: 'article', label: 'article' },
    { key: 'app', label: 'app' },
    { key: 'project', label: 'project' }
  ];
  readonly contentListNoTitle: Record<string, string> = {
    article: 'article content',
    app: 'app content',
    project: 'project content'
  };
  activeTabKey1 = 'tab1';
  activeTabKey2 = 'app';
}
