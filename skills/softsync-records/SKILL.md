---
name: softsync-records
description: "Find, create, update, merge, delete and restore records such as companies, contacts, deals and tasks, and chart them. Use when the user names a company, person or deal, wants to add or change one, clean up duplicates, or count and chart their data."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Records

Records are the rows of workspace tables: companies, contacts, deals, tasks and any custom objects.

## Start here
1. Call `describe_workspace_schema` to learn the tables, their fields and the groups you can see.
2. Name tables and fields by their `apiName` (snake_case), never by display label.
3. System fields are `__system_created_at`, `__system_updated_at` and `__system_created_by`. The double underscore is required.

## Finding records
- `search_records`: exact filters on fields (equals, contains, greater than, empty…) with sort and paging. Use it for "deals in negotiation" or "contacts at Acme".
- `semantic_search_records`: search by meaning when the user describes something loosely.
- `get_record_by_id`: the full record once you have its id.
- `query_records_by_view`: the records a saved view shows, with that view's filters and sort.
- `get_related_record_ids`: records linked to one record, such as the contacts at a company.
- `get_record_activity`: what changed on a record, when and by whom. Use it to answer "what happened?" instead of guessing.

## Creating and changing records
- `record_creation`: create one or many records, across tables in one call. Records in the same call can link to each other through `_ref`. Pick a duplicate-detection field per table so existing records are matched instead of duplicated.
- `update_record`: change fields on specific records. Send only the fields that change.
- `update_field_on_records`: set the same values on many records. For "all of them", get the ids first with `find_matching_record_ids`.
- `add_records_to_group` / `remove_records_from_group`: change which group records appear in.

## Cleaning up
- `check_duplicate_records`: find likely duplicates in a table so the user can review them.
- `merge_records`: fold duplicates into one record. The service chooses the survivor, and a merge cannot be undone.
- `delete_records`: move records to the Bin. `restore_records` brings them back within 30 days.

## Numbers and charts
- `record_statistic`: one count, sum, average or ratio, optionally split by a field — "how many open deals per stage?".
- `generate_analytics`: several chart datasets at once. Both return data, not pictures.

## Rules
- Never invent ids. Look records, people and groups up first and use the ids that come back.
- A relation field takes record ids; a person field takes workspace member ids.
- Say what you are about to change before a bulk update, a merge or a delete, and wait for the user to agree.
