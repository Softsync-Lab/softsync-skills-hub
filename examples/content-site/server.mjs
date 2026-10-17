#!/usr/bin/env node
// A blog and an FAQ that read their content from the app with a workspace API key.
// Plain Node, no packages. Every page is built on the server, so search engines
// and AI assistants read real text, not an empty shell.
//
//   SOFTSYNC_API_KEY=… node server.mjs
//
// Pages: /  /tag/<tag>  /search?q=  /blog/<slug>  /blog/<slug>.md  /faq
//        /sitemap.xml  /feed.xml  /robots.txt  /llms.txt

import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

import { createClient } from './softsync.mjs';
import { escapeHtml as esc, renderMarkdown } from './markdown.mjs';

const TAG_COLORS = ['#c2410c', '#0f766e', '#7c3aed', '#b45309', '#be185d', '#1d4ed8'];

export function createBlog({
  api = process.env.SOFTSYNC_API || 'https://api.softsync.ai',
  apiKey = process.env.SOFTSYNC_API_KEY,
  siteUrl = process.env.SITE_URL || 'http://localhost:3000',
  siteName = process.env.SITE_NAME || 'The Journal',
  tagline = process.env.SITE_TAGLINE || 'Stories, guides and ideas from our team',
  cacheSeconds = Number(process.env.CACHE_SECONDS ?? 60),
  // Where the list of articles lives. Keep '/' for a blog-only site, or use '/blog'
  // when your own home page sits at '/' (see `home`).
  listPath = '/',
  // The links in the header.
  nav = [{ label: 'Articles', href: listPath }, { label: 'FAQ', href: '/faq' }],
  // Your own home page: `home({ content, cards, esc, base })` returns
  // `{ title, description, body, jsonLd? }`, and the site wraps it in the same header and footer.
  home,
  // HTML added before </body> on every page: the chat bubble, an analytics line…
  bodyEnd = '',
} = {}) {
  const content = createClient({ api, apiKey, cacheSeconds });
  const base = siteUrl.replace(/\/$/, '');
  const tint = (tag) => TAG_COLORS[[...tag].reduce((n, c) => n + c.charCodeAt(0), 0) % TAG_COLORS.length];
  const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const abs = (url) => (/^https?:/.test(url) ? url : `${base}${url}`);

  // ── Layout ─────────────────────────────────────────────────────────────
  function layout({ title, description, path, q = '', body, robots = 'index, follow', image, jsonLd = [], type = 'website', canonical, extraHead = '' }) {
    const url = canonical || `${base}${path}`;
    return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${esc(url)}">
<link rel="alternate" type="application/rss+xml" title="${esc(siteName)}" href="${base}/feed.xml">
<link rel="sitemap" type="application/xml" href="${base}/sitemap.xml">
<meta property="og:site_name" content="${esc(siteName)}"><meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(url)}">
${image ? `<meta property="og:image" content="${esc(image)}"><meta name="twitter:image" content="${esc(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
${extraHead}
${jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n')}
<style>${CSS}</style></head>
<body>
<header class="top"><div class="wrap bar"><a class="brand" href="/">${esc(siteName)}</a><nav class="links">${nav.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</nav>
<form class="search" action="/search" method="get" role="search"><input type="search" name="q" placeholder="Search articles" aria-label="Search articles" value="${esc(q)}"><button type="submit">Search</button></form></div></header>
${body}
<footer><div class="wrap"><b>${esc(siteName)}</b> · ${esc(tagline)} · <a href="/feed.xml">RSS</a> · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">For AI assistants</a></div></footer>
${bodyEnd}
</body></html>`;
  }

  const chips = (post, labels) => post.tags.map((t) => `<a class="chip" style="--c:${tint(t)}" href="/tag/${esc(t)}">${esc(labels[t] ?? t)}</a>`).join('');

  const card = (post, who, labels) => `<article class="card">
<a class="cover" href="/blog/${esc(post.slug)}" tabindex="-1" aria-hidden="true">${post.cover ? `<img src="${esc(post.cover.url)}" alt="" loading="lazy">` : `<span style="--c:${tint(post.category || post.slug)}">${esc((post.title || '?')[0])}</span>`}</a>
<div class="card-body"><div class="chips">${chips(post, labels)}</div>
<h2><a href="/blog/${esc(post.slug)}">${esc(post.title)}</a></h2><p>${esc(post.summary)}</p>
<div class="meta">${esc(who[post.author]?.name ?? 'The team')} · ${day(post.publishedOn)} · ${post.readingMinutes} min read</div></div></article>`;

  // ── Pages ──────────────────────────────────────────────────────────────
  async function listPage({ tag, q }) {
    const [posts, who, schema] = await Promise.all([content.listPosts({ tag, q }), content.authors(), content.schema()]);
    const heading = q ? `Results for “${q}”` : tag ? schema.tags[tag] ?? tag : 'Latest articles';
    const tags = Object.entries(schema.tags).map(([value, label]) => `<a class="chip big${tag === value ? ' on' : ''}" style="--c:${tint(value)}" href="/tag/${esc(value)}">${esc(label)}</a>`).join('');
    const body = `<main class="wrap">
${tag || q ? '' : `<section class="hero"><h1>${esc(siteName)}</h1><p>${esc(tagline)}</p></section>`}
<nav class="tags" aria-label="Filter by tag"><a class="chip big${!tag ? ' on' : ''}" style="--c:#44403c" href="${listPath}">All</a>${tags}</nav>
<h2 class="section">${esc(heading)} <small>${posts.length} ${posts.length === 1 ? 'article' : 'articles'}</small></h2>
<div class="grid">${posts.filter((p) => !p.hidden || q).map((p) => card(p, who, schema.tags)).join('') || '<p class="empty">Nothing here yet. Try another tag or search.</p>'}</div></main>`;
    return layout({
      title: q ? `Search: ${q} · ${siteName}` : tag ? `${schema.tags[tag] ?? tag} · ${siteName}` : `${siteName} — ${tagline}`,
      description: tag ? `Articles tagged ${schema.tags[tag] ?? tag} on ${siteName}.` : tagline,
      path: tag ? `/tag/${tag}` : listPath,
      robots: q ? 'noindex, follow' : 'index, follow',
      q,
      body,
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'Blog', name: siteName, description: tagline, url: base,
        blogPost: posts.slice(0, 10).map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${base}/blog/${p.slug}`, datePublished: p.publishedOn })) }],
    });
  }

  async function postPage(slug) {
    const post = await content.getPost(slug);
    if (!post) return null;
    const [who, schema] = await Promise.all([content.authors(), content.schema()]);
    const author = who[post.author] ?? { name: 'The team', avatar: null };
    const sections = post.sections.map((s) => renderMarkdown(s.body));
    const headings = sections.flatMap((s) => s.headings).filter((h) => h.level <= 3);
    const html = sections.map((s) => s.html).join('\n');
    const url = post.canonicalUrl || `${base}/blog/${post.slug}`;
    const image = post.cover ? post.cover.url : undefined;
    const article = {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: post.title, description: post.summary, url, mainEntityOfPage: url, inLanguage: 'en',
      datePublished: post.publishedOn, dateModified: post.updatedAt,
      ...(image ? { image: [image] } : {}),
      author: { '@type': 'Person', name: author.name, ...(author.avatar ? { image: author.avatar } : {}) },
      publisher: { '@type': 'Organization', name: siteName, url: base },
      keywords: [post.focusKeyword, ...post.tags.map((t) => schema.tags[t] ?? t)].filter(Boolean).join(', '),
      articleSection: schema.categories[post.category] ?? undefined,
      wordCount: post.wordCount, timeRequired: `PT${post.readingMinutes}M`,
      ...(post.sources.length ? { citation: post.sources.map((s) => (/^https?:/.test(s) ? { '@type': 'CreativeWork', url: s } : { '@type': 'CreativeWork', name: s })) } : {}),
    };
    const jsonLd = [article,
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: base },
        { '@type': 'ListItem', position: 2, name: 'Articles', item: `${base}${listPath}` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url }] }];
    const body = `<main class="wrap post"><article>
<p class="crumbs"><a href="/">Home</a> / <a href="${listPath}">Articles</a> / ${esc(schema.categories[post.category] ?? 'Guides')}</p>
<div class="chips">${chips(post, schema.tags)}</div>
<h1>${esc(post.title)}</h1><p class="lede">${esc(post.summary)}</p>
<div class="byline">${author.avatar ? `<img src="${esc(author.avatar)}" alt="">` : `<span class="avatar">${esc(author.name[0])}</span>`}<div><b>${esc(author.name)}</b><br><small>Published <time datetime="${esc(post.publishedOn)}">${day(post.publishedOn)}</time> · ${post.readingMinutes} min read</small></div></div>
${post.cover ? `<figure class="hero-img"><img src="${esc(post.cover.url)}" alt="${esc(post.cover.alt)}" fetchpriority="high"></figure>` : ''}
${post.takeaways.length ? `<aside class="short"><h2>In short</h2><ul>${post.takeaways.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></aside>` : ''}
${headings.length > 2 ? `<nav class="toc" aria-label="On this page"><b>On this page</b>${headings.map((h) => `<a class="l${h.level}" href="#${h.id}">${esc(h.text)}</a>`).join('')}</nav>` : ''}
<div class="prose">${html}</div>
${post.sources.length ? `<section class="sources"><h2>Sources</h2><ul>${post.sources.map((s) => `<li>${/^https?:/.test(s) ? `<a href="${esc(s)}" rel="noopener">${esc(s)}</a>` : esc(s)}</li>`).join('')}</ul></section>` : ''}
</article></main>`;
    return layout({
      title: `${post.title} · ${siteName}`, description: post.summary, path: `/blog/${post.slug}`, canonical: url, image,
      robots: post.hidden ? 'noindex, follow' : 'index, follow, max-image-preview:large',
      type: 'article', body, jsonLd,
      extraHead: `<meta property="article:published_time" content="${esc(post.publishedOn)}"><meta property="article:modified_time" content="${esc(post.updatedAt)}"><meta property="article:author" content="${esc(author.name)}">`,
    });
  }

  async function faqPage() {
    const [faq, schema] = await Promise.all([content.listFaq(), content.schema()]);
    if (!faq.length) return null;
    const groups = new Map();
    for (const item of faq) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
    const body = `<main class="wrap post"><article>
<p class="crumbs"><a href="/">Home</a> / FAQ</p><h1>Frequently asked questions</h1>
<p class="lede">Quick answers from our help centre. Can't find yours? Ask us in the chat.</p>
${[...groups].map(([category, items]) => `<section class="faq"><h2>${esc(schema.articleCategories[category] ?? 'General')}</h2>${items.map((f) => `<details><summary>${esc(f.question)}</summary><div class="prose">${renderMarkdown(f.answer).html}</div></details>`).join('')}</section>`).join('')}
</article></main>`;
    return layout({
      title: `FAQ · ${siteName}`, description: `Answers to the questions we hear most, from the ${siteName} help centre.`, path: '/faq', body,
      jsonLd: [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }],
    });
  }

  // ── Machine-readable ───────────────────────────────────────────────────
  async function sitemap() {
    const [posts, schema] = await Promise.all([content.listPosts({ limit: 100 }), content.schema()]);
    const visible = posts.filter((p) => !p.hidden);
    const urls = [
      `<url><loc>${base}${listPath}</loc><lastmod>${(visible[0]?.updatedAt ?? new Date().toISOString())}</lastmod></url>`,
      ...(home ? [`<url><loc>${base}/</loc></url>`] : []),
      ...((await content.listFaq()).length ? [`<url><loc>${base}/faq</loc></url>`] : []),
      ...Object.keys(schema.tags).filter((t) => visible.some((p) => p.tags.includes(t))).map((t) => `<url><loc>${base}/tag/${t}</loc></url>`),
      ...visible.map((p) => `<url><loc>${base}/blog/${p.slug}</loc><lastmod>${p.updatedAt}</lastmod>${p.cover ? `<image:image><image:loc>${esc(p.cover.url)}</image:loc></image:image>` : ''}</url>`),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>`;
  }

  async function feed() {
    const posts = (await content.listPosts({ limit: 20 })).filter((p) => !p.hidden);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(siteName)}</title><link>${base}</link><description>${esc(tagline)}</description>\n${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${base}/blog/${p.slug}</link><guid>${base}/blog/${p.slug}</guid><pubDate>${new Date(p.publishedOn).toUTCString()}</pubDate><description>${esc(p.summary)}</description></item>`).join('\n')}\n</channel></rss>`;
  }

  /** A plain-text map of the site for AI assistants (the llms.txt convention). */
  async function llms() {
    const posts = (await content.listPosts({ limit: 100 })).filter((p) => !p.hidden);
    const faq = await content.listFaq();
    return `# ${siteName}\n\n> ${tagline}\n\n## Articles\n\n${posts.map((p) => `- [${p.title}](${base}/blog/${p.slug}.md): ${p.summary}`).join('\n')}\n${faq.length ? `\n## Help\n\n- [Frequently asked questions](${base}/faq): ${faq.length} answers from our help centre\n` : ''}`;
  }

  /** One post as clean Markdown: its details first, then its sections and questions. */
  async function markdownOf(slug) {
    const post = await content.getPost(slug);
    if (!post) return null;
    const who = (await content.authors())[post.author]?.name ?? 'The team';
    return [`# ${post.title}`, '', `*By ${who} · ${day(post.publishedOn)} · ${post.readingMinutes} min read*`, '', `> ${post.summary}`, '',
      ...(post.takeaways.length ? ['## In short', '', ...post.takeaways.map((t) => `- ${t}`), ''] : []),
      ...post.sections.flatMap((s) => [s.body, '']),
      ...(post.sources.length ? ['## Sources', '', ...post.sources.map((s) => `- ${s}`), ''] : [])].join('\n');
  }

  // ── Server ─────────────────────────────────────────────────────────────
  const types = { xml: 'application/xml; charset=utf-8', txt: 'text/plain; charset=utf-8', md: 'text/markdown; charset=utf-8', html: 'text/html; charset=utf-8' };

  async function handle(req, res) {
    const url = new URL(req.url ?? '/', base);
    const path = decodeURIComponent(url.pathname).replace(/(.)\/$/, '$1');
    const send = (status, type, text) => { res.writeHead(status, { 'content-type': types[type], 'cache-control': 'public, max-age=60' }); res.end(text); };
    try {
      if (path === '/' && home) {
        const cards = async (posts) => {
          const [who, schema] = await Promise.all([content.authors(), content.schema()]);
          return posts.map((post) => card(post, who, schema.tags)).join('');
        };
        const page = await home({ content, cards, tint, day, esc, base });
        return send(200, 'html', layout({ path: '/', ...page }));
      }
      if (path === listPath) return send(200, 'html', await listPage({}));
      if (path === '/search') return send(200, 'html', await listPage({ q: (url.searchParams.get('q') ?? '').trim().slice(0, 100) || undefined }));
      if (path.startsWith('/tag/')) return send(200, 'html', await listPage({ tag: path.slice(5) }));
      if (path === '/faq') {
        const faq = await faqPage();
        if (faq) return send(200, 'html', faq);
      }
      if (path === '/sitemap.xml') return send(200, 'xml', await sitemap());
      if (path === '/feed.xml') return send(200, 'xml', await feed());
      if (path === '/llms.txt') return send(200, 'txt', await llms());
      if (path === '/robots.txt') return send(200, 'txt', `User-agent: *\nAllow: /\nDisallow: /search\n\nSitemap: ${base}/sitemap.xml\n`);
      if (path === '/favicon.ico') { res.writeHead(204); return res.end(); }
      if (path.startsWith('/blog/')) {
        const wantsMarkdown = path.endsWith('.md');
        const slug = path.slice(6).replace(/\.md$/, '');
        const page = wantsMarkdown ? await markdownOf(slug) : await postPage(slug);
        if (page) return send(200, wantsMarkdown ? 'md' : 'html', page);
      }
      return send(404, 'html', layout({ title: `Not found · ${siteName}`, description: 'That page does not exist.', path: '/404', robots: 'noindex', body: '<main class="wrap"><h1>We could not find that page</h1><p><a href="${listPath}">Back to all articles</a></p></main>' }));
    } catch (error) {
      console.error(error);
      return send(502, 'html', layout({ title: `Try again · ${siteName}`, description: 'Something went wrong.', path: '/error', robots: 'noindex', body: '<main class="wrap"><h1>Something went wrong</h1><p>Please try again in a moment.</p></main>' }));
    }
  }

  return { handle, listen: (port) => new Promise((resolve) => { const server = createServer(handle); server.listen(port, 'localhost', () => resolve(server)); }) };
}

const CSS = `
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font:17px/1.65 Georgia,'Iowan Old Style','Times New Roman',serif;color:#1c1917;background:#faf8f5}
a{color:inherit}.wrap{max-width:1120px;margin:0 auto;padding:0 28px}
.top{position:sticky;top:0;z-index:5;background:rgba(250,248,245,.92);backdrop-filter:blur(8px);border-bottom:1px solid #e7e2da}
.bar{display:flex;align-items:center;justify-content:space-between;gap:24px;height:68px}
.brand{font-size:23px;font-weight:700;letter-spacing:-.01em;text-decoration:none}
.links{display:flex;gap:22px;font:15px system-ui,sans-serif;flex:1;margin-left:28px}.links a{text-decoration:none;color:#57534e}.links a:hover{color:#c2410c}
.search{display:flex;gap:8px;font-family:system-ui,sans-serif}
.search input{width:280px;padding:10px 16px;border:1px solid #d6d0c6;border-radius:999px;background:#fff;font-size:15px;outline:none}
.search input:focus{border-color:#c2410c;box-shadow:0 0 0 3px rgba(194,65,12,.15)}
.search button{padding:10px 18px;border:0;border-radius:999px;background:#1c1917;color:#fff;font-size:14px;cursor:pointer}
.hero{padding:72px 0 28px}.hero h1{font-size:60px;line-height:1.05;margin:0 0 12px;letter-spacing:-.025em}.hero p{font-size:21px;color:#57534e;margin:0;max-width:640px}
.tags{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0 8px;font-family:system-ui,sans-serif}
.chip{display:inline-block;padding:3px 11px;border-radius:999px;font:600 12px system-ui,sans-serif;text-decoration:none;color:var(--c);background:color-mix(in srgb,var(--c) 11%,white)}
.chip.big{padding:8px 16px;font-size:14px;border:1px solid color-mix(in srgb,var(--c) 25%,white)}
.chip.on{background:var(--c);color:#fff}
.section{font-size:15px;font-family:system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#78716c;margin:36px 0 18px}.section small{font-weight:400;margin-left:8px;letter-spacing:0;text-transform:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:28px;margin-bottom:80px}
.card{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 1px 2px rgba(28,25,23,.05),0 10px 30px rgba(28,25,23,.06);transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
.card:hover{transform:translateY(-4px);box-shadow:0 2px 4px rgba(28,25,23,.06),0 22px 48px rgba(28,25,23,.12)}
.cover{display:block;aspect-ratio:16/9;background:#f0ebe3}.cover img{width:100%;height:100%;object-fit:cover;display:block}
.cover span{display:grid;place-items:center;width:100%;height:100%;font:700 84px Georgia,serif;color:#fff;background:linear-gradient(135deg,var(--c),color-mix(in srgb,var(--c) 45%,#fff))}
.card-body{padding:22px 24px 24px;display:flex;flex-direction:column;gap:10px;flex:1}.chips{display:flex;gap:6px;flex-wrap:wrap}
.card h2{font-size:23px;line-height:1.25;margin:0;letter-spacing:-.01em}.card h2 a{text-decoration:none}.card p{margin:0;color:#57534e;font-size:16px;flex:1}
.meta{font:13px system-ui,sans-serif;color:#78716c}.empty{color:#78716c;font-style:italic}
.post{max-width:760px}.crumbs{font:14px system-ui,sans-serif;color:#78716c;margin:36px 0 14px}.crumbs a{text-decoration:none}
.post h1{font-size:46px;line-height:1.1;margin:14px 0 14px;letter-spacing:-.02em}.lede{font-size:21px;color:#44403c;margin:0 0 24px}
.byline{display:flex;gap:14px;align-items:center;font-family:system-ui,sans-serif;font-size:15px;margin-bottom:28px}.byline small{color:#78716c}
.byline img,.avatar{width:44px;height:44px;border-radius:50%;object-fit:cover}.avatar{display:grid;place-items:center;background:#c2410c;color:#fff;font-weight:700}
.hero-img{margin:0 0 32px}.hero-img img{width:100%;border-radius:18px;display:block}
.short{background:#fff7ed;border-left:4px solid #c2410c;border-radius:0 14px 14px 0;padding:18px 24px;margin:0 0 32px}.short h2{font:700 13px system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#c2410c;margin:0 0 8px}.short ul{margin:0;padding-left:20px}
.toc{display:flex;flex-direction:column;gap:4px;font:15px system-ui,sans-serif;background:#fff;border:1px solid #e7e2da;border-radius:14px;padding:16px 20px;margin-bottom:32px}.toc b{margin-bottom:4px}.toc a{color:#57534e;text-decoration:none}.toc a:hover{color:#c2410c}.toc .l3{padding-left:16px}
.prose h2{font-size:30px;line-height:1.2;margin:2em 0 .5em;letter-spacing:-.01em}.prose h3{font-size:23px;margin:1.6em 0 .4em}.prose p,.prose li{margin:0 0 1.1em}
.prose img{max-width:100%;border-radius:12px}.prose figure{margin:1.6em 0}.prose figcaption{font:14px system-ui,sans-serif;color:#78716c;margin-top:8px;text-align:center}
.prose blockquote{margin:1.6em 0;padding:4px 22px;border-left:4px solid #d6d0c6;color:#44403c;font-style:italic}.prose a{color:#c2410c}
.prose code{background:#f0ebe3;padding:2px 6px;border-radius:6px;font-size:.9em}.prose pre{background:#1c1917;color:#fafaf9;padding:18px;border-radius:12px;overflow:auto}.prose pre code{background:none;padding:0}
.faq,.sources{margin-top:48px;padding-top:8px;border-top:1px solid #e7e2da}.faq h2,.sources h2{font-size:26px}
details{background:#fff;border:1px solid #e7e2da;border-radius:12px;padding:14px 20px;margin-bottom:10px}summary{cursor:pointer;font-weight:600}details p{margin:10px 0 0;color:#44403c}
.sources{font:15px system-ui,sans-serif;color:#57534e}.sources h2{font-family:Georgia,serif;color:#1c1917}
footer{border-top:1px solid #e7e2da;margin-top:72px;padding:28px 0 44px;font:14px system-ui,sans-serif;color:#78716c}
@media(max-width:700px){.bar{height:auto;padding:12px 0;flex-direction:column;align-items:stretch}.search input{flex:1;width:auto}.hero h1{font-size:40px}.post h1{font-size:34px}}
`;

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const port = Number(process.env.PORT || 3000);
  createBlog({ siteUrl: process.env.SITE_URL || `http://localhost:${port}` })
    .listen(port)
    .then(() => console.log(`Blog running on http://localhost:${port}`));
}
