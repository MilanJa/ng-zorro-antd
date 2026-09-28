# Ant Design v6 alignment: API gaps

Limitations met while aligning components with antd v6 that cannot be closed without a public API change
(new input/output, rename, removed feature). Sub-project 3 (API alignment) consumes this list.

| Component  | antd v6 behaviour               | ng-zorro today               | Gap                       |
| ---------- | ------------------------------- | ---------------------------- | ------------------------- |
| Popconfirm | `description` prop              | no `nzPopconfirmDescription` | new input (sub-project 3) |
| Progress   | `percentPosition`/`size` object | not available                | inputs (sub-project 3)    |
