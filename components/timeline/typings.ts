/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

export type NzTimelineMode = 'left' | 'alternate' | 'right' | 'custom';

export type NzTimelinePosition = 'left' | 'right';

export const TimelineTimeDefaultColors = ['red', 'blue', 'green', 'grey', 'gray'] as const;
export type NzTimelineItemColor = (typeof TimelineTimeDefaultColors)[number] | string;

/** Steps status of a node as antd 6 renders Timeline (a dot-type Steps): items finish, the pending node processes. */
export type NzTimelineNodeStatus = 'finish' | 'process';

export interface NzTimelineNodeState {
  /** the last node shown: antd's `current`, which draws no rail below it */
  active: boolean;
  /** status of the rail below the node, `null` when antd renders no rail */
  rail: NzTimelineNodeStatus | null;
}
