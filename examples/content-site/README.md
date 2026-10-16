# A blog and an FAQ that your writers run from the app

A small website that reads its articles from the app with a **workspace API key**. Your writers use the editor in the app (the *Blog & content* template); this site shows what they publish. Plain Node, no packages to install.

```bash
SOFTSYNC_API_KEY=your-workspace-key node server.mjs
# → http://localhost:3000
```

| Setting | Meaning | Default |
| --- | --- | --- |
| `SOFTSYNC_API_KEY` | A workspace API key (Settings → API keys). Read-only use. | — |
| `SOFTSYNC_API` | The API address | `https://api.softsync.ai` |
| `SITE_URL` | Your public address, used in canonical links and the sitemap | `http://localhost:3000` |
| `SITE_NAME`, `SITE_TAGLINE` | Shown in the header, titles and feed | The Journal |
| `CACHE_SECONDS` | How long an answer is remembered, so busy pages stay under the key's request limit (120 a minute) | 60 |

## What your visitors, search engines and AI assistants get

Every page is built on the server, so they all read real text.

| Page | What it is |
| --- | --- |
| `/` and `/tag/<tag>` | Latest articles, newest first. Tag chips filter the list; each tag has its own page that search engines can index. |
| `/search?q=…` | The search bar. Marked `noindex` so result pages stay out of search results. |
| `/blog/<slug>` | One article: title, summary, author, date, reading time, cover image, **In short** box, table of contents, text and pictures, questions and answers, sources. |
| `/blog/<slug>.md` | The same article as plain Markdown, for AI assistants and tools. |
| `/faq` | The help centre's customer-facing articles as questions and answers. |
| `/sitemap.xml` | Every article (with last-changed time and cover image), tag page and the FAQ. Articles hidden from search engines are left out. |
| `/feed.xml` | RSS feed of the latest articles. |
| `/robots.txt`, `/llms.txt` | Point crawlers to the sitemap, and give AI assistants a plain map of the site. |

### Where the search and AI-answer information comes from

Nothing is typed twice. It is all built from fields your writers already fill in:

| On the page | Built from |
| --- | --- |
| `<title>`, description, social preview | Title, Summary, Cover image |
| `rel="canonical"` | *Original address* if set, otherwise the article's own address |
| `noindex` | *Hide from search engines* |
| Article data (`BlogPosting`) | Title, Summary, Author (name and picture), Published on, last change, Tags, Focus keyword, word count, Reading minutes, Sources |
| Question data (`FAQPage`) | The article's Questions, or the Wiki's customer-facing articles on `/faq` |
| Breadcrumbs (`BreadcrumbList`) | Category and Title |
| **In short** box | Key takeaways |
| Sources list | Sources |

The template's **Search score** and **AI answer score** tell writers when a field is missing, before they publish.

## How it reads the content

All reads go through `softsync.mjs`, using one call: `POST /records/search` with the key in an `x-api-key` header.

```js
// the newest ten published articles tagged "tips", without their text
await fetch('https://api.softsync.ai/records/search', {
  method: 'POST',
  headers: { 'x-api-key': KEY, 'content-type': 'application/json' },
  body: JSON.stringify({
    tableId: POSTS_TABLE_ID,            // from GET /table/describe
    limit: 10,
    fieldFilters: [
      { fieldId: 'status', operator: 'eq', value: 'published' },
      { fieldId: 'tags', operator: 'in', value: 'tips' },
    ],
    sort: { fieldId: 'published_on', direction: 'desc' },
  }),
});
```

- An article is light: its text lives in **sections** (a second table, one row per part), so a list never carries the text. Read one article's sections with `fieldFilters: [{ fieldId: 'post', operator: 'eq', value: ARTICLE_ID }]` sorted by `position`.
- For a text search add `semanticQuery: 'words'` and `disableVector: true`.
- Authors come from `GET /workspaces/<id>/members` (name and picture); the workspace id is in `GET /api-keys/info`.
- Pictures are plain, permanent web addresses stored in the article, so they load for anyone and browsers can keep them.

## Make it yours

Options of `createBlog` (all optional): `listPath` (where the article list lives; `/blog` when your own home page is at `/`), `nav` (the header links), `home` (your own home page, wrapped in the same header and footer; it gets `content`, `cards(posts)` and `esc`) and `bodyEnd` (HTML added before `</body>` on every page, such as the web agent's chat bubble).


`server.mjs` holds the page design in one `CSS` block at the bottom and the page templates above it. Change the colours, fonts and layout there; the data and search information stay as they are. To use another framework (Next.js, Astro, Eleventy…), keep `softsync.mjs` and `markdown.mjs` as they are and build your pages from `listPosts`, `getPost`, `listFaq`, `authors` and `schema`.
