---
name: softsync-tables
description: "Read the workspace structure — tables, fields, choices and groups — and add or change tables. Use before any other SoftSync task to learn what the workspace holds, or when the user wants a new table or field."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Tables

## Reading the structure
`describe_workspace_schema` returns every table you can see with its fields, field kinds and options, plus the groups you can access. Call it before any other workspace tool.

- A choice field lists `options.choices`, each with a `value` (what you send) and a `label` (what the user sees). Always send the value.
- A relation field's `options.tableId` names the table it links to.
- Formula fields are computed and cannot be written.
- Every table also has `__system_created_at`, `__system_updated_at` and `__system_created_by`.

## Changing the structure
- `upsert_table`: create a table or add and change its fields. Needs the Admin or Editor role.
- `delete_table`: removes a table and every record in it. There is no Bin for tables. Admin only; confirm with the user first.

## Rules
- Reuse an existing table or field when one fits instead of creating a near-duplicate.
- Describe the change you plan in plain words and wait for agreement before changing the structure.
