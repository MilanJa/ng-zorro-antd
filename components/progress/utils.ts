/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { TinyColor } from '@ctrl/tinycolor';

import {
  NzProgressColorGradient,
  NzProgressGradientProgress,
  NzProgressSize,
  NzProgressStrokeColorType,
  NzProgressTypeType
} from './typings';

function stripPercentToNumber(percent: string): number {
  return +percent.replace('%', '');
}

export const sortGradient = (gradients: NzProgressGradientProgress): Array<{ key: number; value: string }> => {
  let tempArr: Array<{ key: number; value: string }> = [];

  Object.keys(gradients).forEach(key => {
    const value = gradients[key];
    const formatKey = stripPercentToNumber(key);
    if (!isNaN(formatKey)) {
      tempArr.push({
        key: formatKey,
        value
      });
    }
  });

  tempArr = tempArr.sort((a, b) => a.key - b.key);
  return tempArr;
};

export const handleCircleGradient = (
  strokeColor: NzProgressGradientProgress
): Array<{ offset: string; color: string }> =>
  sortGradient(strokeColor).map(({ key, value }) => ({ offset: `${key}%`, color: value }));

export const handleLinearGradient = (strokeColor: NzProgressColorGradient): string => {
  const { from = '#1890ff', to = '#1890ff', direction = 'to right', ...rest } = strokeColor;
  if (Object.keys(rest).length !== 0) {
    const sortedGradients = sortGradient(rest as NzProgressGradientProgress)
      .map(({ key, value }) => `${value} ${key}%`)
      .join(', ');
    return `linear-gradient(${direction}, ${sortedGradients})`;
  }
  return `linear-gradient(${direction}, ${from}, ${to})`;
};

/** Port of antd v6 `progress/utils.ts` `getSize`: `[width, height]` in px, -1 meaning "not set". */
export function getSize(
  size: NzProgressSize | undefined,
  type: NzProgressTypeType | 'step',
  extra?: { steps?: number; strokeWidth?: number }
): [number, number] {
  let width = -1;
  let height = -1;
  if (type === 'step') {
    const steps = extra?.steps ?? 0;
    const strokeWidth = extra?.strokeWidth;
    if (typeof size === 'string' || typeof size === 'undefined') {
      width = size === 'small' ? 2 : 14;
      height = strokeWidth ?? 8;
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else {
      [width = 14, height = 8] = (Array.isArray(size) ? size : [size.width, size.height]) as [number, number];
    }
    width *= steps;
  } else if (type === 'line') {
    const strokeWidth = extra?.strokeWidth;
    if (typeof size === 'string' || typeof size === 'undefined') {
      height = strokeWidth || (size === 'small' ? 6 : 8);
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else {
      [width = -1, height = 8] = (Array.isArray(size) ? size : [size.width, size.height]) as [number, number];
    }
  } else if (type === 'circle' || type === 'dashboard') {
    if (typeof size === 'string' || typeof size === 'undefined') {
      [width, height] = size === 'small' ? [60, 60] : [120, 120];
    } else if (typeof size === 'number') {
      [width, height] = [size, size];
    } else if (Array.isArray(size)) {
      width = (size[0] ?? size[1] ?? 120) as number;
      height = (size[0] ?? size[1] ?? 120) as number;
    }
  }
  return [width, height];
}

/** antd v6's `strokeColorIsBright`: the string colour, or a gradient's first value, is light. */
export function isBrightColor(strokeColor: NzProgressStrokeColorType | undefined): boolean {
  if (!strokeColor) {
    return false;
  }
  const color = typeof strokeColor === 'string' ? strokeColor : Object.values(strokeColor)[0];
  return typeof color === 'string' && new TinyColor(color).isLight();
}
