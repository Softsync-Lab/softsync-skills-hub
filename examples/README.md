# Examples

Copy-paste starting points for putting the app's pages on your own website.

| Folder | What it shows |
| --- | --- |
| [`website-embeds/`](website-embeds) | Plain HTML pages. A **form**, a **booking page**, your **help centre** and the **web agent** chat, each placed on a website in every way the app supports: one line of code, a plain frame, a link, a pop-up or slide-over, and (for forms) your own HTML form. |
| [`content-site/`](content-site) | A **blog from the app's CMS** and an **FAQ from the knowledge base**, built to be found by search engines and AI assistants: article and breadcrumb data, a sitemap, a feed, `robots.txt`, `llms.txt` and every article as Markdown. Runs with one API key. |
| [`tidybooks/`](tidybooks) | A **whole SaaS website**, the one our feature videos are filmed on: a landing page made of blocks (hero, feature cards, video, call to action), a blog, and the booking, help centre, FAQ and contact pages and chat bubble placed on it. |
| [`nextjs/`](nextjs), [`astro/`](astro), [`react/`](react), [`vue/`](vue), [`html/`](html) | The **whole website in your framework**, styled with Tailwind: blog, tags, search, FAQ, contact (the app's form and your own design), booking, help centre and the chat bubble. See below. |

## One site, five frameworks

Every framework example is the same website, so you can pick the one you already use. Each one reads the CMS with a workspace key that never reaches the browser, and puts the app's pages on yours.

| | Next.js | Astro | React | Vue | Plain HTML |
| --- | --- | --- | --- | --- | --- |
| Pages are made | when asked | when asked | in the browser | in the browser | once, when you run the build |
| Who holds the key | the app's server | the app's server | a small server in the folder | a small server in the folder | the build step |
| Search engines see the post's details in the page | yes | yes | yes (the small server adds them) | yes (the small server adds them) | yes |
| Run it | `npm run build && npm start` | `npm run build && npm start` | `npm run build && npm start` | `npm run build && npm start` | `npm run build`, then upload `dist/` |

They all show the same things: a **blog** with tags and search, an **FAQ** from the help centre, a **contact page** with the app's form in one line and again in your own Tailwind design, a **booking** page, the **help centre**, the **chat bubble** on every page, a **sitemap**, `robots.txt`, `llms.txt` and every article as Markdown.

Each folder has a `.env.example`. Copy it to `.env` and fill in:

| Value | What it is |
| --- | --- |
| `SOFTSYNC_API_KEY` | A workspace API key (Settings → API keys). Keep it on the server. |
| `SOFTSYNC_API`, the app address | Where the app and its API live. |
| `…_FORM`, `…_BOOKING`, `…_HELP`, `…_AGENT` | The public link of each page, as `WORKSPACE_ID/LINK_ID`, from its *Embed* or *Add to website* button. Leave one empty and that part of the site is left out. |

The API allows 120 requests a minute per key, so the examples remember answers for a minute (set `CACHE_SECONDS` to change it).

These examples are tested against the real app on every change, so what you copy works.

### More than a blog

Besides posts, each example's home page is built from a second kind of content: a table made in the app (a hero, a heading and picture cards). Any table works the same way with `listItems`. While building, `SOFTSYNC_PREVIEW=1` shows drafts and picks up edits within seconds. Both are explained in each example's README.

### Try it without an account

Every framework folder has `npm run demo`. It starts the example against a small sample business (blog posts with covers and authors, help articles, a contact form), served from recorded data in [`demo/`](demo). No account, no key, no internet needed. It is the quickest way to see what each example does before you connect your own workspace.


Every page in `website-embeds/` has `https://app.softsync.ai`, `WORKSPACE_ID` and `LINK_ID` to replace. Each feature's *Embed* or *Add to website* button gives you the exact line, with your values filled in.

## Which way should I use?

| You want | Use |
| --- | --- |
| The page inside yours, sized by itself, on phones too | **One line** (`embed.js`) |
| A website builder that does not allow scripts | **A plain frame** |
| Emails, social profiles, QR codes, menus | **A link** |
| A button that opens the page on top of yours | **A pop-up** or a **slide-over** |
| Your own design for a form | **Your own HTML form** that posts to the form's address |
| A live chat on every page | **The chat bubble** (`web-agent.js`) |
| Articles that search engines and AI assistants can read | **`content-site/`**, or any backend that reads the CMS with an API key |

## All together

A website for a one-person business can have, from scratch: a contact form and a booking page ([`website-embeds/form.html`](website-embeds/form.html), [`booking.html`](website-embeds/booking.html)), a help centre and FAQ answered from the same knowledge base ([`help-centre.html`](website-embeds/help-centre.html), `/faq` in [`content-site/`](content-site)), a chat bubble that answers from those articles and hands over to a person ([`web-agent.html`](website-embeds/web-agent.html)), and a blog from the CMS ([`content-site/`](content-site)). They share one source of truth: the writing you do in the app.
