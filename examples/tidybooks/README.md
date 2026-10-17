# Tidybooks: a whole SaaS website, run from the app

The demo website behind our feature videos. **Tidybooks** is a made-up invoicing product, and this folder is its real website: every word on it comes from the app, and every interactive part is one of the app's own pages placed inside it. Open source, plain Node, no packages to install.

```bash
cp .env.example .env     # fill in your key and the public links
SOFTSYNC_API_KEY=your-workspace-key node server.mjs
# → http://localhost:3000
```

## What is on it

| Page | Where it comes from |
| --- | --- |
| `/` landing page: hero, feature cards with pictures, a video, a call to action, the latest posts | A page of **Website content** (a post with category *page* and slug `home`). Each part is one block; drag them in the app to reorder them here. |
| `/blog`, `/tag/…`, `/search`, `/blog/<slug>` | The posts in **Website content** |
| `/book` | Your booking page, placed with the one-line embed |
| `/help` and `/faq` | Your help centre (one-line embed) and its customer pages as a FAQ for search engines |
| `/contact` | A form from the app, placed with the one-line embed |
| Chat bubble on every page | The web agent, one line |
| `/sitemap.xml`, `/feed.xml`, `/robots.txt`, `/llms.txt` | Built from all of the above |

## How the landing page is made of blocks

`landing.mjs` turns the sections of the `home` page into bands, in the order set in the app:

| Block | Becomes |
| --- | --- |
| The first one | The hero (its first heading is the page's big heading) |
| Titled `Feature: …`, next to each other | One row of feature cards, a card per block |
| Has a YouTube, Vimeo or Loom link | The video band |
| Title contains "call" | The call to action, with buttons to `/book` and `/contact` |
| Any other | A plain text band |

Add a block in the app and it appears on the site. Click any text on the site while building (`SOFTSYNC_PREVIEW=1`) and the app opens the block it came from.

## Files

| File | What it holds |
| --- | --- |
| `server.mjs` | Starts the site |
| `site.mjs` | The pages, menu and chat bubble, and how an app page is embedded (`embed()`) |
| `landing.mjs` | Blocks → landing page |
| `content.mjs` | The sample content: the landing page's words, five posts and the help articles |
| `../content-site/` | The shared engine: reading the app with a key, the blog, the FAQ, the sitemap |

The sample content is what the demo workspace is filled with; copy it into a workspace made from the **Website content** and **Wiki** templates to see the same site.

## Use it in your framework

The pieces are the same in every framework, so start from the one you use:

- The key never leaves your server: pages read the CMS with `softsync.mjs`, then render. See [`nextjs/`](../nextjs), [`astro/`](../astro), [`react/`](../react), [`vue/`](../vue) and [`html/`](../html) for the same blog, FAQ, contact, booking and help pages in each.
- The booking, help and contact pages are only an embed line each (`embed()` in `site.mjs`, `components/Embed` in the Next.js example).
- The landing page is the one piece with its own rules: read the page with `getPost('home')` and map its blocks like `landing.mjs` does.
