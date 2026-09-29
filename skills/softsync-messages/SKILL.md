---
name: softsync-messages
description: "Read emails, notes and saved meeting summaries linked to records, and search them by content. Use when the user asks what was said, agreed or sent — \"what did Acme reply?\", \"summarise our last call\"."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Messages

Messages are everything the workspace has received or written about its records: synced emails, notes and notifications.

## Which tool
- **By content** ("emails about the renewal"): `semantic_search_messages`.
- **By facts** ("last week's emails with Acme"): `query_messages` with a time window or the linked record ids.
- **Full text of one message**: `get_message_by_id` after finding it.
- **Calendar events** ("my meetings this week", "when did we last meet Acme?"): use `list_calendar_events` from the meetings skill, not `query_messages`.
- **Meeting summaries**: a summary someone saved to a record is a note on that record. Find it with `semantic_search_messages` ("summary of the Acme call") or `query_messages` on the record. Recordings that were never saved to a record stay in the desktop app and cannot be reached from here.
- **How many** ("how many emails have we exchanged with Acme?"): `get_message_statistics` counts messages linked to a record or person.

## Rules
- Resolve a company or person to its record id first (see the records skill), then filter messages by that id.
- You only see messages linked to records you can access. Say so if something the user expects is missing, rather than claiming it does not exist.
- Never guess a message id.
