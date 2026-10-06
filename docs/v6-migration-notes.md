# Ant Design v6 alignment: deprecated input aliases

Inputs renamed to follow Ant Design v6. The old input still works: it forwards to the new one, prints a one-time
deprecation warning in dev mode, and loses to the new input when both are bound. Each alias is marked in code with
`// v6-alias: <old> -> <new>` and will be removed in the listed version; a future `ng update` schematic reads this table.

| Component   | Old input                         | New input        | Value mapping                                                                                                                            | Removal |
| ----------- | --------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| nz-divider  | nzOrientation (left/right/center) | nzTitlePlacement | left→start, right→end, center→center in LTR; under RTL left→end, right→start (the old values are physical; a rewrite must keep the side) | v23.0.0 |
| nz-divider  | nzType                            | nzOrientation    | horizontal→horizontal, vertical→vertical                                                                                                 | v23.0.0 |
| nz-splitter | nzLayout                          | nzOrientation    | identity                                                                                                                                 | v23.0.0 |
