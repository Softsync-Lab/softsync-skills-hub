---
name: softsync-documents
description: "Design PDF templates such as invoices, quotes and contracts, try them on a record, and make the finished PDF. Use when the user wants a new document layout, to change one, or a PDF for a record."
---

<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Documents

A document template turns one record into a PDF, for example an invoice from an invoice record. Each PDF made is listed on the record.

## Tools
- `document_templates` with action `list` or `get`: the templates, their layout, paper and file name.
- `manage_document_templates` with action `create`: a title, the group it lives in, the object it is made from, the layout and the paper. Text may use {{ record.field }} placeholders.
- Action `update`: send only what changes; a layout or page settings, when sent, replace the whole thing, so read the template first.
- `document_templates` with action `preview`: fill a saved template, or a layout you are still trying, from one record and get a PDF to look at. It is not added to the record.
- `manage_document_templates` with action `generate`: make the real PDF and list it on the record.
- Action `delete` removes a template. PDFs already made are kept.

## Rules
- Changing templates needs editor rights in the template's group.
- Saving a template makes no PDF and is easy to change back, so save what the user asked for without asking first. Then preview it on a real record and show them the result.
