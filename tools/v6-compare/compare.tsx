/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import React from 'react';
import { createRoot } from 'react-dom/client';

// Injected per component by build-demos.ts through esbuild's `define`.
declare const __DEMOS__: Array<{ name: string; Component: React.ComponentType }>;

const params = new URLSearchParams(location.search);
const wanted = params.get('demo');
const theme = params.get('theme') ?? 'v6';
const algorithm = theme === 'v6-dark' ? 'dark' : theme === 'v6-compact' ? 'compact' : 'default';

const link = document.createElement('link');
link.rel = 'stylesheet';
// The antd pane renders real antd markup, so it loads only the extracted antd template and the
// theme's tokens, not `v6-<algorithm>.css` (which also carries the component patches that retarget
// antd's rules onto ng-zorro's DOM, e.g. moving the select box off `.ant-select`); that file styles
// ng-zorro's own doc-site page, not this pane.
link.href = `v6-${algorithm}.antd.css`;
document.head.appendChild(link);

// Even with `zeroRuntime`, antd v6 registers its CSS-variable blocks (alias and component tokens of the
// *default* theme, scoped to a `css-var-*` class it puts on every component) plus a few global rules
// (`.anticon`, keyframes) through @ant-design/cssinjs. Those would override the harness theme's tokens from
// `v6-<algorithm>.css`, so the antd pane would show the light default theme in every harness theme. Send
// them to a detached element instead: only the generated v6 CSS (which carries the same icon and keyframe
// rules) applies, as on the ng-zorro side. capture.ts fails if runtime styles reach the document.
const runtimeStyleSink = document.createElement('div');

const demos = wanted ? __DEMOS__.filter(d => d.name === wanted) : __DEMOS__;
const root = createRoot(document.getElementById('antd-root')!);
root.render(
  <StyleProvider container={runtimeStyleSink}>
    <ConfigProvider theme={{ zeroRuntime: true, hashed: false }}>
      {demos.map(({ name, Component }) => (
        <section key={name} className="cmp-demo" data-demo={name}>
          <h4 className="cmp-demo-title">{name}</h4>
          <div className="cmp-demo-body">
            <Component />
          </div>
        </section>
      ))}
    </ConfigProvider>
  </StyleProvider>
);
