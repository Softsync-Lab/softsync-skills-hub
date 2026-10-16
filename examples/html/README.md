# Plain HTML with Tailwind

A whole website as ordinary files: no framework, no server to run. A build step reads your blog and help centre from the app, writes every page into `dist/`, and you upload that folder anywhere that serves files.

```bash
cp .env.example .env     # fill in the key and your links
npm install
npm run build            # writes dist/
```

Run the build again whenever you publish (by hand, or from a schedule). Without a key it stops and tells you what is missing.

What you get in `dist/`: the home page, `/blog`, a page per tag and per article, `/faq`, `/contact`, `/book`, `/help`, a search page that works in the browser, `sitemap.xml`, `robots.txt`, `llms.txt` and each article as `/blog/<address>.md`.

- **Your design** — the pages are written in `build.mjs`; change the Tailwind classes there.
- **Your own form** — `/contact` shows the app's form in one line, and again as your own form: the questions are read when you build, and the answers go straight to the form's address.
- **Hosting** — a folder like `/blog/my-post/` must answer with its `index.html`, which every static host does.

## Keep editing while you build

Write in the app, watch your site. Set `SOFTSYNC_PREVIEW=1` in `.env` while you build and:

- drafts show up, so you see a post or a page before you publish it;
- a change you save in the app is on your site after a refresh (a few seconds, not a minute);
- everything else works as on the live site.

Turn it off (leave it empty) on the live site, so visitors only see what you have published. The plain HTML example rebuilds by itself every few seconds with `npm run dev`.

## Content that is not a blog

The blog is one kind of content. A table you make yourself works the same way: the pieces of a landing page, products, team members, anything. Make the table in the app, give it a `status` column (Draft or Published) and an `Order` column (`position`), and read it with one line:

```js
const cards = await content.listItems('site_blocks', { where: { block: 'feature' } });
```

You get published rows in order, with pictures as `{ url, alt }`. The home page in this example is built that way: a hero, a heading and picture cards, all written in the app.

## Try it with demo data

No account or key yet? Run the example against a small sample business:

```bash
npm install
npm run demo
```

You get a working blog, FAQ and contact page with sample posts, authors and pictures. Nothing is saved, and nothing leaves your computer. When you are ready, copy `.env.example` to `.env` and use your own workspace.
