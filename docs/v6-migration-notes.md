# Ant Design v6 alignment: deprecated input aliases

Inputs renamed to follow Ant Design v6. The old input still works: it forwards to the new one, prints a one-time
deprecation warning in dev mode, and loses to the new input when both are bound. Each alias is marked in code with
`// v6-alias: <old> -> <new>` and will be removed in the listed version; a future `ng update` schematic reads this table.

| Component | Old input | New input | Value mapping | Removal |
| --------- | --------- | --------- | ------------- | ------- |
