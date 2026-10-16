# Next.js with Tailwind

The blog, FAQ, contact, booking, help centre and chat bubble, styled with Tailwind. Pages are made on the server when asked, and the key never reaches the browser.

```bash
cp .env.example .env     # add your workspace API key and your page links
npm install
npm run build && npm start     # or: npm run dev
```

Without a key the site stops and says what is missing. See the [examples overview](../README.md) for what each value is.

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
