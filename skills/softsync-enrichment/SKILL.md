---
name: softsync-enrichment
description: "Look up facts about a company or person from a website, work email, LinkedIn profile or organisation number, and save them. Use when a record is missing details such as industry, size, title or contact info."
---

<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Enrichment

`enrich` looks a company or person up in public registers and data providers and compares the result with matching records.

## Order of operations
1. Preview first (the default). Show the user what was found and what differs from their records.
2. Save only when asked. "Fill" fills empty fields and creates missing company or contact records; "overwrite" replaces only the fields the user confirmed. Pass the preview's lookup id so nothing is looked up twice.

## Rules
- A personal email address alone is not enough; ask for the website, organisation number or LinkedIn profile.
- Ask for email addresses only when the user wants them.
- Each source that finds something costs one enrichment credit. Repeating a lookup within an hour is free.
