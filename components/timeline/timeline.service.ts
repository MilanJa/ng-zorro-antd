/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class TimelineService {
  check$ = new ReplaySubject<void>(1);
  refresh$ = new Subject<void>();

  markForCheck(): void {
    this.check$.next();
  }

  refresh(): void {
    this.refresh$.next();
  }
}
