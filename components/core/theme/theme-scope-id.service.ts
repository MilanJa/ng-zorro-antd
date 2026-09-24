/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';

/**
 * @internal Hands out the `[nzTheme]` scope ids (`nz-theme-<id>`). Root-provided, so ids are unique per
 * application instance and restart for every server-rendered request, instead of growing with a
 * process-wide counter and diverging between the server render and the hydrating client.
 */
@Injectable({ providedIn: 'root' })
export class NzThemeScopeIdService {
  private last = 0;

  next(): number {
    return ++this.last;
  }
}
