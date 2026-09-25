/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ApplicationRef } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { config } from './app.config.server';

const bootstrap = (context: BootstrapContext): Promise<ApplicationRef> =>
  bootstrapApplication(AppComponent, config, context);

export default bootstrap;
