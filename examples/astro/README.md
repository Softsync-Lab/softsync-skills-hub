# Astro with Tailwind

The blog, FAQ, contact, booking, help centre and chat bubble, styled with Tailwind. Pages are made on the server when asked, and the key never reaches the browser.

```bash
cp .env.example .env     # add your workspace API key and your page links
npm install
npm run build && npm start     # or: npm run dev
```

Without a key the site stops and says what is missing. See the [examples overview](../README.md) for what each value is.

## Try it with demo data

No account or key yet? Run the example against a small sample business:

```bash
npm install
npm run demo
```

You get a working blog, FAQ and contact page with sample posts, authors and pictures. Nothing is saved, and nothing leaves your computer. When you are ready, copy `.env.example` to `.env` and use your own workspace.
