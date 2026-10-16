/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { renderThemeCss } from './render-theme-css';

describe('component-scoped alias overrides in the document', () => {
  let style: HTMLStyleElement;
  let host: HTMLElement;

  const tinted = (id: string): boolean =>
    getComputedStyle(document.getElementById(id)!).getPropertyValue('--ant-color-primary').trim() === '#123456';

  beforeAll(async () => {
    await renderThemeCss({}, ':root');
  });

  beforeEach(() => {
    style = document.createElement('style');
    document.head.appendChild(style);
    host = document.createElement('div');
    host.innerHTML = `
      <span id="input" class="ant-input"></span>
      <span id="number" class="ant-input-number"></span>
      <span id="number-inner" class="ant-input-number-input"></span>
      <span id="tree" class="ant-tree"></span>
      <span id="tree-select" class="ant-tree-select"></span>
      <span id="picker" class="ant-picker ant-picker-range"></span>
      <span id="calendar" class="ant-picker-calendar ant-picker-calendar-full">
        <span id="cell-inner" class="ant-picker-cell-inner"></span>
        <span id="picker-in-calendar" class="ant-picker"></span>
      </span>
    `;
    document.body.appendChild(host);
  });

  afterEach(() => {
    style.remove();
    host.remove();
  });

  async function apply(components: Record<string, object>, selector = ':root'): Promise<void> {
    style.textContent = await renderThemeCss({ components } as never, selector);
  }

  it('does not let an Input override reach input-number elements', async () => {
    await apply({ Input: { colorPrimary: '#123456' } });
    expect(tinted('input')).toBe(true);
    expect(tinted('number')).toBe(false);
    expect(tinted('number-inner')).toBe(false);
  });

  it('does not let a Tree override reach tree-select elements', async () => {
    await apply({ Tree: { colorPrimary: '#123456' } });
    expect(tinted('tree')).toBe(true);
    expect(tinted('tree-select')).toBe(false);
  });

  it('keeps a Calendar override off date pickers', async () => {
    await apply({ Calendar: { colorPrimary: '#123456' } });
    expect(tinted('calendar')).toBe(true);
    expect(tinted('picker')).toBe(false);
  });

  it('keeps a DatePicker override off the calendar', async () => {
    await apply({ DatePicker: { colorPrimary: '#123456' } });
    expect(tinted('picker')).toBe(true);
    expect(tinted('calendar')).toBe(false);
  });

  it('keeps a DatePicker override out of the calendar subtree, which a Calendar override still reaches', async () => {
    await apply({ DatePicker: { colorPrimary: '#123456' } });
    expect(tinted('cell-inner')).toBe(false);
    expect(tinted('picker-in-calendar')).toBe(false);
    await apply({ Calendar: { colorPrimary: '#123456' } });
    expect(tinted('cell-inner')).toBe(true);
  });

  it('applies the same exclusions inside a theme scope', async () => {
    host.classList.add('scope-x');
    await apply({ Input: { colorPrimary: '#123456' } }, '.scope-x');
    expect(tinted('input')).toBe(true);
    expect(tinted('number')).toBe(false);
  });

  it('still reaches a scope host that is itself the component root', async () => {
    host.className = 'scope-y ant-input';
    host.id = 'root-host';
    await apply({ Input: { colorPrimary: '#123456' } }, '.scope-y');
    expect(tinted('root-host')).toBe(true);
  });
});
