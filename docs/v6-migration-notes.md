# Ant Design v6 alignment: deprecated input aliases

Inputs renamed to follow Ant Design v6. The old input still works: it forwards to the new one, prints a one-time
deprecation warning in dev mode, and loses to the new input when both are bound. Each alias is marked in code with
`// v6-alias: <old> -> <new>` and will be removed in the listed version; a future `ng update` schematic reads this table.

| Component        | Old input                         | New input        | Value mapping                                                                                                                            | Removal |
| ---------------- | --------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| nz-divider       | nzOrientation (left/right/center) | nzTitlePlacement | left→start, right→end, center→center in LTR; under RTL left→end, right→start (the old values are physical; a rewrite must keep the side) | v23.0.0 |
| nz-divider       | nzType                            | nzOrientation    | horizontal→horizontal, vertical→vertical                                                                                                 | v23.0.0 |
| nz-splitter      | nzLayout                          | nzOrientation    | identity                                                                                                                                 | v23.0.0 |
| nz-timeline      | nzMode (left/right)               | nzMode           | left→start, right→end                                                                                                                    | v23.0.0 |
| nz-timeline      | nzPending                         | nzLoading        | move the pending content into a last nz-timeline-item's nzLoading                                                                        | v23.0.0 |
| nz-timeline      | nzPendingDot                      | nzIcon           | move the dot into that last item's nzIcon                                                                                                | v23.0.0 |
| nz-timeline-item | nzLabel                           | nzTitle          | identity                                                                                                                                 | v23.0.0 |
| nz-timeline-item | nzDot                             | nzIcon           | identity                                                                                                                                 | v23.0.0 |
| nz-timeline-item | nzPosition                        | nzPlacement      | left→start, right→end                                                                                                                    | v23.0.0 |
| nz-timeline-item | nzPlacement (left/right)          | nzPlacement      | left→start, right→end                                                                                                                    | v23.0.0 |
