---
name: softsync-groups-and-views
description: "Organise records into groups, share them with people, and set up table, board and calendar views. Use when the user wants a list of records, to share records with teammates, or a saved way to look at them."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Groups and views

A group is a shared collection of records with its own members and access levels. A view is a saved way of looking at a group's records.

## Groups
- Find groups through `describe_workspace_schema`, then `get_group` for one group and its views.
- `create_group`, `update_group` (name, description, sharing), `duplicate_group` and `delete_group`.
- A group is either private to its members or visible to the whole workspace.

## People in a group
- `list_group_members`, `add_group_member`, `update_group_member_role`, `remove_group_member`.
- Roles: Owner (full control), Admin (manage people and views), Editor (change records), Viewer (read only).
- Someone added by email who is not yet in the workspace joins as a guest.

## Views
- `list_views` and `get_view` to read them; `create_view`, `update_view` and `delete_view` to manage them.
- Three kinds: table, kanban board and calendar.
- A board needs a choice field to make its columns; a calendar needs a date field.
- Views refer to fields by id. Take them from `describe_workspace_schema`.

## Rules
- Check for an existing group before creating a new one.
- Adding someone gives them access to everything in the group. Confirm the person and the role first.
