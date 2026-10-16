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
