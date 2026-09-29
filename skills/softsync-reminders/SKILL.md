---
name: softsync-reminders
description: "Set one-time or repeating reminders, optionally linked to a record. Use when the user says \"remind me…\" or wants a follow-up on a date — \"remind me to follow up with Acme on Friday\"."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Reminders

## Tools
- `create_reminder`: a one-time reminder at a set moment, or a repeating one (daily, weekly or monthly at a local time). Link it to a record so the notification opens that record.
- `list_reminders`: the reminders you can see.
- `update_reminder`: change the text or time, or pause a repeating reminder.
- `delete_reminder`: cancel a reminder so it never fires.

## Rules
- Turn relative dates ("next Friday at 9") into an exact time in the user's time zone, and repeat it back to them.
- Reminders are private by default. Making one public notifies everyone in the workspace, so only do that when asked.
