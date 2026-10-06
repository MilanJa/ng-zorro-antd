import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'nz-demo-divider-title-margin',
  imports: [NzDividerModule],
  template: `
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt
      a te dicta? Refert tamen, quo modo.
    </p>
    <nz-divider nzText="Left Text with 0 title margin" nzTitlePlacement="start" [nzTitleMargin]="0" />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt
      a te dicta? Refert tamen, quo modo.
    </p>
    <nz-divider nzText="Right Text with 50px title margin" nzTitlePlacement="end" [nzTitleMargin]="50" />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae sunt
      a te dicta? Refert tamen, quo modo.
    </p>
  `
})
export class NzDemoDividerTitleMarginComponent {}
