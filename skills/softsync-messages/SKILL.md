---
name: softsync-messages
description: "Read emails, notes and saved meeting summaries linked to records, and search them by content. Use when the user asks what was said, agreed or sent — \"what did Acme reply?\", \"summarise our last call\"."
---

<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Messages

Messages are everything the workspace has received or written about its records: synced emails, notes and notifications.

## Which tool
- **About a company or person** ("last week's emails with Acme"): resolve them to record ids, then `query_messages` with those ids and a time window. See the `finding-messages` reference for the exact sequence.
- **By topic, with no company or person named** ("emails about the renewal"): `semantic_search_messages`. Never use it as a fallback when `query_messages` finds nothing for a company or person — similar text is not proof it is about them.
- **Full text of one message**: `get_message_by_id` after finding it.
- **Calendar events** ("my meetings this week", "when did we last meet Acme?"): use `list_calendar_events` from the meetings skill, not `query_messages`.
- **Meeting summaries**: a summary someone saved to a record is a note on that record. Find it with `query_messages` on the record. Recordings that were never saved to a record stay in the desktop app and cannot be reached from here.
- **How many** ("how many emails have we exchanged with Acme?"): `get_message_statistics` counts messages linked to a record or person.

## Rules
- Resolve a company or person to its record id first (see the records skill), then filter messages by that id.
- You only see messages linked to records you can access. Say so if something the user expects is missing, rather than claiming it does not exist.
- Never guess a message id.

## More detail
Read these when the task needs them:
- [finding-messages](references/finding-messages.md): The required call sequence for "what did we discuss with Acme?" and when topic search is the wrong tool.
- [resolving-records](references/resolving-records.md): Turning a company or person into every linked record id before reading their messages or acting on them.
