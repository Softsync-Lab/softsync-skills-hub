# Vue with Tailwind

The blog, FAQ, contact, booking, help centre and chat bubble, styled with Tailwind. A browser app cannot keep a key secret, so a small server in `server/` holds it, fills each post's head for search engines and serves the sitemap, `llms.txt` and Markdown.

```bash
cp .env.example .env     # add your workspace API key and your page links
npm install
npm run build && npm start     # one port: the app and its small server
# while you work: npm run api (one terminal) and npm run dev (another)
```

Without a key the site stops and says what is missing. See the [examples overview](../README.md) for what each value is.
