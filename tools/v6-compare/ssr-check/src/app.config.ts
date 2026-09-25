/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';

import { provideNzConfig } from 'ng-zorro-antd/core/config';
import { nzDarkAlgorithm } from 'ng-zorro-antd/core/theme';
import { provideNzIcons } from 'ng-zorro-antd/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNzConfig({ theme: { algorithm: nzDarkAlgorithm, token: { colorPrimary: '#00b96b' } } }),
    provideNzIcons([]),
    provideHttpClient()
  ]
};
