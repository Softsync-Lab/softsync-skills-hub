# SoftSync skills hub

For SoftSync customers — you need a SoftSync account to use it.

Work with your [SoftSync](https://softsync.ai) CRM from any AI assistant: look up companies and people, keep records up to date, check your calendar, book meetings, write notes after a call, set reminders, write and send email templates, manage forms and run your automations.

This repository has two parts that work together:

- **The SoftSync connection** (an MCP server at `https://api.softsync.ai/mcp/softsync`). It gives the assistant the tools to read and change your SoftSync data.
- **Skills** (`skills/`). Short guides that teach the assistant which tool to use, in what order, and when to ask you first.

Both follow open standards ([Agent Skills](https://agentskills.io) and [Agent Plugins](https://agent-plugins.org)), so one repository works in every assistant below.

## Install

| Assistant | How |
| --- | --- |
| **Claude Code** | `/plugin marketplace add Softsync-Lab/softsync-skills-hub`, then `/plugin install softsync@softsync` |
| **Codex** (OpenAI) | `codex plugin marketplace add Softsync-Lab/softsync-skills-hub`, then install **SoftSync** from `/plugins` |
| **Gemini CLI** | `gemini extensions install https://github.com/Softsync-Lab/softsync-skills-hub` |
| **Cursor and Grok Bot** | Install **SoftSync** from the Cursor Marketplace |
| **Other agents** (Copilot, Windsurf, Cline, OpenCode…) | `npx skills add Softsync-Lab/softsync-skills-hub`, then add the SoftSync connection in the agent's MCP settings |
| **Claude.ai and ChatGPT** | Add a custom connector with the SoftSync connection address. For the skills, run `scripts/package-skills.sh` and upload the files from `dist/` under the assistant's skills settings |

The first time the assistant uses SoftSync, you are sent to SoftSync to sign in and choose a workspace. No API key is needed and nothing secret is stored here. The assistant can only see and change what your SoftSync account can see and change.

## What it can do

| Area | Read | Change |
| --- | --- | --- |
| Companies, contacts, deals, tasks and custom objects | Search, open, history, related records, counts and charts | Create, update, bulk update, merge duplicates, move to the Bin and restore |
| Emails, notes and saved meeting summaries | Search by content or by date and person | Write, edit, share and delete your own notes |
| Calendar | Events from connected Google and Outlook calendars, by date or by company or person | — |
| Booking pages | Meeting types, free times, booked meetings | Book a meeting for a guest, move it, cancel it |
| Forms | Forms and their public links | Create, open or close, change and delete forms |
| Email | Mailboxes, templates, send progress | Write, change and delete templates; send one to one or many records; cancel a send |
| Reminders | Your reminders | Create, change and cancel |
| Groups and views | Groups, people, views | Create and share groups, manage people and views |
| Workspace structure | Tables and fields | Add or change tables |
| Automations | Manual and published workflows | Run them and check the result |
| Company and person lookup | Public registers and data providers | Save found facts to your records |

The assistant asks before anything that cannot be taken back: sent email cannot be recalled, merging records cannot be undone, and booking or cancelling a meeting notifies real people.

## Try it

After connecting, ask:

> Find the company Acme in SoftSync, summarise our last three emails with them, and remind me to follow up next Tuesday at 9.

The assistant should look the company up, read the emails, show you a short summary, and ask before creating the reminder.

## Skills

| Skill | Use it for |
| --- | --- |
| `softsync-records` | Finding, creating, updating, merging and deleting records, and charts |
| `softsync-messages` | Reading emails, notes and saved meeting summaries |
| `softsync-notes` | Writing notes on records |
| `softsync-email` | Writing and sending email templates |
| `softsync-forms` | Public forms and their links |
| `softsync-meetings` | Calendar events and booking pages |
| `softsync-reminders` | Reminders |
| `softsync-groups-and-views` | Groups, sharing and views |
| `softsync-tables` | Workspace structure |
| `softsync-workflows` | Running automations |
| `softsync-enrichment` | Looking up companies and people |

The skills are generated from the same guidance the SoftSync MCP server gives every assistant, so they always match the tools it offers. Please don't edit them here — changes are overwritten on the next release.

## What's in this repository

| File | Read by |
| --- | --- |
| `skills/*/SKILL.md` | Every assistant that supports Agent Skills |
| `plugin.json`, `mcp.json` | Agent Plugins clients, including Codex |
| `.claude-plugin/` | Claude Code |
| `.agents/plugins/marketplace.json` | Codex marketplace |
| `gemini-extension.json`, `GEMINI.md` | Gemini CLI |
| `.cursor-plugin/plugin.json` | Cursor and Grok Bot |

## Test locally

- **Claude Code:** `claude --plugin-dir .`, then run `/mcp` and check `softsync` is listed.
- **Cursor:** copy this folder to `~/.cursor/plugins/local/softsync` and reload Cursor.
- **Gemini CLI:** `gemini extensions link .`

Then run the task from [Try it](#try-it) against a test workspace. Also disconnect once and check that the assistant says it could not reach SoftSync instead of pretending it worked.

## Support

Questions or problems: [softsync.ai](https://softsync.ai).
