/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzStepsModule } from 'ng-zorro-antd/steps';

@Component({
  selector: 'nz-demo-steps-max-count',
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputNumberModule, NzStepsModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px">
      <h5 style="margin: 0">Number of Steps</h5>
      <nz-steps [nzCurrent]="current()" [nzMaxCount]="5">
        @for (title of titles(); track title) {
          <nz-step [nzTitle]="title" />
        }
      </nz-steps>
      <div style="display: flex; gap: 8px; align-items: center; align-self: center">
        <button nz-button [disabled]="current() <= 0" (click)="current.set(current() - 1)">
          <nz-icon nzType="left" />
        </button>
        <nz-input-number
          [nzMin]="3"
          [nzMax]="7"
          [ngModel]="count()"
          (ngModelChange)="setCount($event)"
          style="width: 120px"
        />
        <button nz-button [disabled]="current() >= count() - 1" (click)="current.set(current() + 1)">
          <nz-icon nzType="right" />
        </button>
      </div>
    </div>
  `
})
export class NzDemoStepsMaxCountComponent {
  readonly count = signal(7);
  readonly current = signal(3);
  readonly titles = computed(() => Array.from({ length: this.count() }, (_, i) => `Step ${i + 1}`));
  setCount(value: number): void {
    this.count.set(value);
    this.current.set(Math.floor((value - 1) / 2));
  }
}
