import { Component } from '@angular/core';

import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'nz-demo-tag-icon',
  imports: [NzTagModule],
  template: `
    <nz-tag nzColor="#55acee" nzIcon="twitter">Twitter</nz-tag>
    <nz-tag nzColor="#cd201f" nzIcon="youtube">Youtube</nz-tag>
    <nz-tag nzColor="#3b5999" nzIcon="facebook">Facebook</nz-tag>
    <nz-tag nzColor="#55acee" nzIcon="linkedin">LinkedIn</nz-tag>
  `
})
export class NzDemoTagIconComponent {}
