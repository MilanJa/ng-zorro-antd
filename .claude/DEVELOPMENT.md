# Coding Style Guide

### Basic Coding Guidelines

- Written in TypeScript and Angular.
- Each template must be defined in the component "\*.ts" file using the `template` property of the `@Component` decorator.
- Each official style must be defined in the component's `index.less` file.
- Each CSS patch must be defined in the component's `patch.less` file.
- Ant Design v6 styles are generated, not written: `scripts/build/v6/components.ts` lists the components that have v6 output, and `nx run ng-zorro-antd-lib:generate-v6-styles` produces their CSS from antd. The only hand-written v6 file is the component's `style/v6/patch.css`.
- Migrating a component to v6: (1) add it to `scripts/build/v6/components.ts` with its antd component names and root class (`prefixCls`, e.g. `ant-btn`); (2) align host classes and templates until `scripts/build/v6/__tests__/class-coverage.spec.ts` passes with only documented permanent entries in `scripts/build/v6/class-allowlist.json` (classes that antd itself emits but its v6 CSS never styles, explained in the file's comment keys); (3) port `style/patch.less` to `style/v6/patch.css` using `--ant-*` variables; (4) for components with popups, add an overlay test using `expectMotionSettled` from `ng-zorro-antd/core/testing`; (5) run `npm run v6:update-manifest` and commit `scripts/build/v6/manifest.json`, the regenerated `components/core/theme/generated/{tokens,component-roots}.ts` and the docs coverage list.
- Templates must follow the structure of the associated Ant Design component. Documentation can be found [here](https://ant.design/llms.txt) and [here](https://ant.design/llms-full.txt).
- Support Server Side Rendering (SSR).
- All imports of NG-ZORRO components need to be absolute. Example:

```typescript
import { NzMentionComponent } from 'ng-zorro-antd/mention';
```

### Component Development

- All code added to a component must be covered by unit tests. For guidelines on how to write unit tests, see the [testing](./TESTING.md) file.
- New development on existing components must respect the existing structure of the component; where possible, use modern Angular features.
- New components must be developed using the latest Angular features.
- New features must be documented and include a demo. Guidelines on how to document can be found [here](./DOCUMENTATION.md).

### TypeScript Guidelines

- Use generics where appropriate to enhance type flexibility.
- Use intersection types (&) to combine multiple types.
- Use literal union types to define a limited set of options.
- Avoid using `enum` in favor of union types and `as const`.
- Rely on TypeScript's type inference whenever possible.
- Use type assertions (`as`) only when necessary.

### Responsiveness and Theming Support

- Components should display well on different screen sizes.
- All components must support dark mode.
- Components should support right-to-left (RTL) text directions.
- Use logical CSS properties (e.g., `margin-inline-start`) instead of directional properties (e.g., `margin-left`).
