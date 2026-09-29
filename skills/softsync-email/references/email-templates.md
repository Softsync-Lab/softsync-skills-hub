<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Email templates

A template is a reusable email for one table, such as contacts. Its {{placeholders}} are filled from each recipient's record when it is sent. Saving a template sends nothing.

## Tools
- `list_email_templates` with no filter to see every template, then `get_email_template` to read one. Find a template by its name.
- `list_email_template_variables`: the {{placeholders}} a table offers. Call it before writing a template, and only use what it returns.
- `create_email_template`: a new template with a name, a subject and a simple HTML body.
- `update_email_template`: change the name, subject, body or copied addresses. Send only what changes.
- `delete_email_template`: remove a template. Mail already sent with it is not affected.

## Rules
- When the user says exactly what to change (for example "swap this number for that one"), make the change and show what you saved. Do not ask again.
- When you write the wording yourself, save it and show the user the subject and body so they can ask for changes.
- Confirm the exact template before deleting it.
