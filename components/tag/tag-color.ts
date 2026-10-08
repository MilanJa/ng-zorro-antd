/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { inputToRGB } from '@ctrl/tinycolor';

/**
 * antd's tint for a custom Tag colour (`tag/hooks/useColor.ts`): the colour's HSL with the lightness set
 * to 0.95. The HSL round trip follows antd's fast-color package (`getHue`, `getSaturation` as
 * `delta / max`, `fromHsl`), not TinyColor's, so the hex matches the one antd renders.
 * Returns `null` for a value that is not a colour.
 */
export function tagCustomTint(color: string): string | null {
  const rgb = inputToRGB(color);
  if (!rgb.ok) {
    return null;
  }
  const channel = (value: number): number => Math.round(Math.min(255, Math.max(0, value)));
  const r = channel(rgb.r);
  const g = channel(rgb.g);
  const b = channel(rgb.b);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const hue =
    delta === 0
      ? 0
      : Math.round(
          60 * (r === max ? (g - b) / delta + (g < b ? 6 : 0) : g === max ? (b - r) / delta + 2 : (r - g) / delta + 4)
        );
  const saturation = delta === 0 ? 0 : delta / max;
  const lightness = 0.95;

  const huePrime = hue / 60;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const second = chroma * (1 - Math.abs((huePrime % 2) - 1));
  let [red, green, blue] = [0, 0, 0];
  if (huePrime < 1) {
    [red, green] = [chroma, second];
  } else if (huePrime < 2) {
    [red, green] = [second, chroma];
  } else if (huePrime < 3) {
    [green, blue] = [chroma, second];
  } else if (huePrime < 4) {
    [green, blue] = [second, chroma];
  } else if (huePrime < 5) {
    [red, blue] = [second, chroma];
  } else {
    [red, blue] = [chroma, second];
  }
  const offset = lightness - chroma / 2;
  return `#${[red, green, blue]
    .map(value =>
      Math.round((value + offset) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}
