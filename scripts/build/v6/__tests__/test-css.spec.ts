/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { writeTestCss } from '../generate-engine';
import { buildV6Template } from '../generate-styles';

describe('writeTestCss', () => {
  let dir: string;
  let source: string;

  beforeAll(async () => {
    dir = mkdtempSync(path.join(os.tmpdir(), 'v6-test-css-'));
    await writeTestCss(dir);
    source = readFileSync(path.join(dir, 'test-css.ts'), 'utf8');
  }, 120_000);

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  function templateCss(): string {
    const match = /export const V6_TEMPLATE_CSS = (".*");/.exec(source);
    return JSON.parse(match![1]) as string;
  }

  it("carries the stylesThrough copies the shipped template has (Steps' dot rules under ant-timeline)", () => {
    const copied = '.ant-timeline.ant-timeline-dot .ant-timeline-item-icon{';
    expect(buildV6Template()).toContain(copied);
    expect(templateCss()).toContain(copied);
    // and antd's own timeline rules are still there
    expect(templateCss()).toContain('.ant-timeline .ant-timeline-item.ant-timeline-item.ant-timeline-item-color-red{');
  });

  it("puts the copies before the copying component's own equal-specificity overrides, as antd injects them", () => {
    // Steps' default (copied) and Timeline's own override of the same variable, both `.ant-timeline .ant-timeline-item`.
    const copiedDefault = '.ant-timeline .ant-timeline-item{--ant-cmp-steps-item-solid-line-color:#000;';
    const override = '.ant-timeline .ant-timeline-item{--ant-cmp-steps-item-process-rail-line-style:dotted;}';
    for (const css of [buildV6Template(), templateCss()]) {
      expect(css.indexOf(copiedDefault)).toBeGreaterThanOrEqual(0);
      expect(css.indexOf(override)).toBeGreaterThan(css.indexOf(copiedDefault));
    }
  });
});
