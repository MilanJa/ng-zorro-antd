/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
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
link.href = `v6-${algorithm}.css`;
document.head.appendChild(link);

const demos = wanted ? __DEMOS__.filter(d => d.name === wanted) : __DEMOS__;
const root = createRoot(document.getElementById('antd-root')!);
root.render(
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
);
