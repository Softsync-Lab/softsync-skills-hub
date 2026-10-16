# Examples

Copy-paste starting points for putting the app's pages on your own website.

| Folder | What it shows |
| --- | --- |
| [`website-embeds/`](website-embeds) | Plain HTML pages. A **form**, a **booking page**, your **help centre** and the **web agent** chat, each placed on a website in every way the app supports: one line of code, a plain frame, a link, a pop-up or slide-over, and (for forms) your own HTML form. |
| [`content-site/`](content-site) | A **blog from the app's CMS** and an **FAQ from the knowledge base**, built to be found by search engines and AI assistants: article, question and breadcrumb data, a sitemap, a feed, `robots.txt`, `llms.txt` and every article as Markdown. Runs with one API key. |

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
