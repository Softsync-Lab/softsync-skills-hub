---
name: softsync-documents
description: "Design PDF templates such as invoices, quotes and contracts, try them on a record, and make the finished PDF. Use when the user wants a new document layout, to change one, or a PDF for a record."
---

<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Documents

A document template turns one record into a PDF, for example an invoice from an invoice record. Each PDF made is listed on the record.

## Tools
- `list_document_templates` and `get_document_template`: the templates, their layout, paper and file name.
- `create_document_template`: a title, the group it lives in, the object it is made from, the layout and the paper. Text may use {{ record.field }} placeholders.
- `update_document_template`: send only what changes; a layout or page settings, when sent, replace the whole thing, so read the template first.
- `preview_document`: fill a saved template, or a layout you are still trying, from one record and get a PDF to look at. It is not added to the record.
- `generate_document`: make the real PDF and list it on the record.
- `delete_document_template`: PDFs already made are kept.

## Rules
- Changing templates needs editor rights in the template's group.
- Preview on a real record before saving a new layout, and show the user the result.
