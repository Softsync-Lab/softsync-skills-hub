---
name: softsync-email
description: "Write email templates and send them to one contact or a list, and follow or cancel the send. Use when the user wants to write, fix or send a reusable email, or check how a send is going."
---

<!-- Generated from the SoftSync API MCP skills. Edit them there and re-export. -->

# Email

Mail goes out from a mailbox the workspace has already connected. Each recipient gets their own personalised copy, so a list send is many single emails, not one group message.

## Order of operations
1. `list_mailboxes`: check a mailbox is connected. If the list is empty, stop. Connecting a mailbox needs a sign-in in the app.
2. `list_email_templates`, then `get_email_template` to read the one you will send.
3. No suitable template? Call `list_email_template_variables` for the recipients' table to see which {{placeholders}} exist, then `create_email_template` with a subject and a simple HTML body. Fix one with `update_email_template`; remove one with `delete_email_template`.
4. `send_email_campaign` with the template and the recipient record ids. One recipient is fine.
5. `get_email_campaign` to follow progress, and `cancel_email_campaign` to stop what has not gone out yet.

## What to know
- A template belongs to one object (for example contacts) and can only be sent to records of that object.
- A placeholder the recipient's record has no value for renders as empty text.
- Sending is paced under the mailbox's hourly and daily limits, so a large list can take a long time. The call returns before anything is delivered.
- Sent mail cannot be recalled.

## Rules
- Never invent addresses: each email goes to the address on the recipient's record. Resolve recipients with the records skill.
- Show the user the template and the recipient count and wait for a clear yes before sending.
- Show a new or changed template to the user before saving it. Only use placeholders that `list_email_template_variables` returned.
