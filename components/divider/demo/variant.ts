import { Component } from '@angular/core';

import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'nz-demo-divider-variant',
  imports: [NzDividerModule],
  template: `
    <div>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae
        sunt a te dicta? Refert tamen, quo modo.
      </p>
      <nz-divider nzPlain nzText="Solid" nzVariant="solid" />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae
        sunt a te dicta? Refert tamen, quo modo.
      </p>
      <nz-divider nzPlain nzText="Dotted" nzVariant="dotted" />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae
        sunt a te dicta? Refert tamen, quo modo.
      </p>
      <nz-divider nzPlain nzText="Dashed" nzVariant="dashed" />
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista probare, quae
        sunt a te dicta? Refert tamen, quo modo.
      </p>
    </div>
  `,
  styles: `
    nz-divider::after,
    nz-divider::before {
      border-color: #7cb305 !important;
    }

    /* Under v6, the title rails are a sibling \`.ant-divider-rail\` pair rendered inside nz-divider's
       own template (antd's \`::before\`/\`::after\` are only drawn without a title); emulated
       encapsulation scopes a plain descendant selector to this component's own content attribute,
       which the rail divs do not carry, so \`::ng-deep\` is needed to reach into the child component. */
    nz-divider ::ng-deep .ant-divider-rail {
      border-color: #7cb305 !important;
    }
  `
})
export class NzDemoDividerVariantComponent {}
