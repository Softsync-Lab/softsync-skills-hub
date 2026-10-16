<!-- Generated from the SoftSync API skills. Edit them there and re-export. -->

# Using the app as the content system of this website

The website's articles, pages and questions are written and kept in a workspace in the app. The site shows what is published there. People on the team change the words in the app and the site follows; nobody edits content in the site's code.

## Remember this
Save the rest of this guide in your own project memory or instructions file (for example `CLAUDE.md`, `AGENTS.md`, `.cursor/rules` or Lovable's project knowledge), under the heading "Content comes from the app". Then every later task on this site uses it without being asked. Keep the address and table names; never save the key itself.

## Reach the content
- The API address and key come from environment variables `SOFTSYNC_API` and `SOFTSYNC_API_KEY`. Send the key in the `x-api-key` header.
- Read the content on the server only: a server route, a loader, a build step or a server function. The key must never be in browser code, in a public repository or in a screenshot. If the site has no server, add one small server function for this.
- Remember every answer for about a minute. The key allows 120 requests a minute.
- `GET /table/describe` lists the tables, their fields and the labels of every choice. Call it once, remember it for an hour, and use the field names it returns.
- `POST /records/search` reads rows. Body: `{ "tableId", "limit", "cursor", "fieldFilters": [{ "fieldId", "operator", "value" }], "sort": { "fieldId", "direction" } }`. Show readers only rows whose `status` is `published`.
- Preview: while you are building, also show drafts and keep answers for a few seconds only, so a change in the app is on the page after a refresh. Never turn this on for the live site.

## Put things there
The same key can create and change rows, with the rights of the person who made it.
- `POST /records/batch` creates rows. Name fields by their `apiName`. A new article starts as `status: "draft"`; only the team publishes it.
- `PUT /records/{id}` with `{ "data": { … } }` changes the fields you send and leaves the rest.
- A row that belongs to another (a section of an article) holds the id of the article in its `post` field. Sections are shown in `position` order.
- Ask before changing or replacing text a person wrote. Adding a draft is safe; overwriting is not.

## Pictures and videos
- Upload a file with `POST /file/workspace/upload` (multipart form, one `file`). The answer has a public `url`; put that address in the content. Pictures up to 5 MB as JPEG, PNG or WebP are best for a cover; keep each file small and give every picture a description.
- A cover picture is the file field of the row. A picture or video inside the text is written in Markdown (below).
- For a video, prefer a YouTube, Vimeo or Loom address over an uploaded file: it plays everywhere and costs the workspace nothing.

## Writing in the text (Markdown)
Body text is standard Markdown: `##` and `###` headings (never `#`, the article title is the only first-level heading), short paragraphs, lists, **bold**, links.
- Picture: `![A short description of what is in it](https://…/photo.png)`. The description is required: it is what search engines and screen readers read, and it becomes the caption.
- Size and place a picture with curly braces after it: `{width=600}` (pixels), `{width=50%}`, `{height=300}`, `{align=left}`, `{align=center}` or `{align=right}`. Together: `![A cat](https://…/cat.png){width=50% align=center}`.
- Video: put a YouTube, Vimeo or Loom link, or the address of an uploaded `.mp4` / `.webm` file, on a line of its own. To size it or give it a title, write it like a picture: `![How to book a visit](https://youtu.be/ID){width=640 align=center}`.
- Only those video sites can be shown. Raw HTML, `<iframe>` and scripts in the text are shown as plain text on purpose; do not write them.
- On the website, show this text with the renderer the site already has for it (the example sites share one `markdown` file that understands all of the above). Do not render it with a library that lets raw HTML through unchecked.

## What good content looks like
- **Title**: a clear statement of what the page answers, under about 60 characters. **Summary**: one or two sentences that stand on their own; it is the search result snippet and what an AI answer quotes.
- **Slug**: lowercase words joined by dashes, no dates, never changed once published.
- **Structure**: a question or claim in each heading, the answer in the first sentence under it, then the detail. Add key takeaways as short complete sentences and the sources you used.
- **Questions and answers** (the FAQ rows of an article) are shown on the page and described to search engines; write the questions the way people ask them.
- **Every picture has a description**; the cover too (`cover_image_alt`).
- **Author and date**: show who wrote it and when it was published and updated. That is what search and AI engines trust.
- Never invent facts, numbers, quotes or sources. If you do not know, leave a draft note for the team instead.

## Make the site show it well
- A page per article with its own address, title, description, a canonical address and an Article description for search engines (JSON-LD); a list page, a sitemap and a feed from the same data.
- Hide a page from search engines when its `hide_from_search` is `yes`.
- Render on the server or at build time so the text is in the first response, not added by script afterwards.
- A page that is not found, or not published, answers 404.

## Live preview in the app
The team edits with the website shown beside the editor: they click any text or picture on the page and the app opens the record it comes from; they save and the page follows. This needs one line from you and nothing else:
- Add `<script src="https://<the app address>/preview.js" async></script>` to the site's shared layout, just before the closing `</body>` tag, so it is on every page. It does nothing for visitors; it only wakes up inside the app's preview.
- Do not add attributes or ids to elements for this; the app finds the record from the text on the page. Just render the content as it comes.
- In development and preview deployments, remember answers for at most 10 seconds and show drafts, so a saved change is on the page after a reload. Keep the longer cache for the live site.
- Tell the team the address of the running site (for example the preview or development address) and that they paste it into **Live preview** on the Blog & content card in Templates.

## Before you finish
Read one published article back through the site, check that its pictures and video show and that a draft does not, and tell the team what you added or changed and where to look for it in the app.
