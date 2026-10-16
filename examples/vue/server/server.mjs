// The small server behind a single-page site (React, Vue…).
//
// A browser app cannot hold the workspace API key: anyone could read it from
// the page. So this server holds it, reads the CMS, and gives the browser app
// plain JSON under /cms. It also does what a crawler needs and a browser app
// cannot: it fills each post page's <head> (title, description, canonical,
// social tags and structured data) before sending it, and it serves the
// sitemap, robots.txt, llms.txt and every post as Markdown.
//
//   npm run build && npm start      (serves ./dist and /cms on one port)
//   npm run api                     (only /cms, while `npm run dev` serves the app)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '../src/lib/softsync.js';
import { llmsTxt, postMarkdown, postView, robotsTxt, sitemapXml } from '../src/lib/seo.js';

const env = process.env;
const port = Number(env.PORT || 8787);
const site = {
  url: (env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, ''),
  name: env.SITE_NAME || 'The Journal',
  tagline: env.SITE_TAGLINE || 'Stories, guides and ideas from our team',
};
// The app's public pages that exist on the site, for the sitemap.
const pages = ['/help', '/contact', '/book'].filter((page) => env[`SOFTSYNC_${{ '/help': 'HELP', '/contact': 'FORM', '/book': 'BOOKING' }[page]}`]);
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

const content = createClient({ api: env.SOFTSYNC_API, apiKey: env.SOFTSYNC_API_KEY, cacheSeconds: Number(env.CACHE_SECONDS ?? 60), preview: env.SOFTSYNC_PREVIEW === '1' });

const types = { html: 'text/html; charset=utf-8', json: 'application/json', xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8', md: 'text/markdown; charset=utf-8' };
const escape = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mime = { '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2' };

/** The page's <head> for one post, so search engines and link previews see it without running any script. */
function headFor(view) {
  const { post } = view;
  const tags = [
    `<title>${escape(post.title)} · ${escape(site.name)}</title>`,
    `<meta name="description" content="${escape(post.summary)}">`,
    `<link rel="canonical" href="${escape(view.url)}">`,
    `<meta name="robots" content="${escape(view.robots)}">`,
    `<meta property="og:type" content="article"><meta property="og:title" content="${escape(post.title)}">`,
    `<meta property="og:description" content="${escape(post.summary)}"><meta property="og:url" content="${escape(view.url)}">`,
    post.cover ? `<meta property="og:image" content="${escape(post.cover.url)}">` : '',
    `<meta name="twitter:card" content="${post.cover ? 'summary_large_image' : 'summary'}">`,
    `<meta property="article:published_time" content="${escape(post.publishedOn)}"><meta property="article:author" content="${escape(view.author.name)}">`,
    ...view.jsonLd.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`),
  ];
  return tags.join('\n    ');
}

async function handle(request, response) {
  const url = new URL(request.url ?? '/', site.url);
  const route = decodeURIComponent(url.pathname).replace(/(.)\/$/, '$1');
  const send = (status, type, body) => {
    response.writeHead(status, { 'content-type': types[type], 'cache-control': 'no-cache' });
    response.end(typeof body === 'string' ? body : JSON.stringify(body));
  };

  try {
    // ── JSON for the browser app ──────────────────────────────────────────
    if (route === '/cms/site') return send(200, 'json', site);
    if (route === '/cms/posts') {
      const [posts, authors, schema] = await Promise.all([
        content.listPosts({ tag: url.searchParams.get('tag') || undefined, q: (url.searchParams.get('q') || '').slice(0, 100) || undefined }),
        content.authors(),
        content.schema(),
      ]);
      return send(200, 'json', { posts: posts.filter((post) => !post.hidden || url.searchParams.get('q')), authors, tags: schema.tags });
    }
    if (route.startsWith('/cms/posts/')) {
      const post = await content.getPost(route.slice('/cms/posts/'.length));
      if (!post) return send(404, 'json', { message: 'Not found' });
      const [authors, schema] = await Promise.all([content.authors(), content.schema()]);
      return send(200, 'json', postView({ post, authors, schema, siteUrl: site.url, siteName: site.name }));
    }
    if (route === '/cms/blocks') return send(200, 'json', { blocks: await content.listItems('site_blocks') });
    if (route === '/cms/faq') {
      const [items, schema] = await Promise.all([content.listFaq(), content.schema()]);
      return send(200, 'json', { items, categories: schema.articleCategories });
    }

    // ── What crawlers and AI assistants read ──────────────────────────────
    if (route === '/sitemap.xml') {
      const [posts, schema, faq] = await Promise.all([content.listPosts({ limit: 100 }), content.schema(), content.listFaq()]);
      return send(200, 'xml', sitemapXml({ siteUrl: site.url, posts, schema, hasFaq: faq.length > 0, pages }));
    }
    if (route === '/robots.txt') return send(200, 'txt', robotsTxt(site.url));
    if (route === '/llms.txt') {
      const [posts, faq] = await Promise.all([content.listPosts({ limit: 100 }), content.listFaq()]);
      return send(200, 'txt', llmsTxt({ siteUrl: site.url, siteName: site.name, tagline: site.tagline, posts, faq }));
    }
    if (route.startsWith('/blog/') && route.endsWith('.md')) {
      const post = await content.getPost(route.slice(6, -3));
      if (!post) return send(404, 'txt', 'Not found');
      return send(200, 'md', postMarkdown({ post, authors: await content.authors() }));
    }

    // ── The built app ─────────────────────────────────────────────────────
    const file = path.join(dist, route);
    if (route !== '/' && file.startsWith(dist) && (await stat(file).then((s) => s.isFile()).catch(() => false))) {
      response.writeHead(200, { 'content-type': mime[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'public, max-age=3600' });
      return response.end(await readFile(file));
    }
    let page = await readFile(path.join(dist, 'index.html'), 'utf8').catch(() => null);
    if (page === null) return send(404, 'txt', 'Run `npm run build` first, or open the app from `npm run dev`.');
    if (route.startsWith('/blog/')) {
      const post = await content.getPost(route.slice(6));
      if (post) {
        const [authors, schema] = await Promise.all([content.authors(), content.schema()]);
        page = page.replace(/<title>.*?<\/title>/s, '').replace('</head>', `    ${headFor(postView({ post, authors, schema, siteUrl: site.url, siteName: site.name }))}\n  </head>`);
      }
    }
    return send(200, 'html', page);
  } catch (error) {
    console.error(error);
    return send(502, 'json', { message: 'Something went wrong. Please try again.' });
  }
}

createServer(handle).listen(port, () => console.log(`Site and /cms on http://localhost:${port}`));
