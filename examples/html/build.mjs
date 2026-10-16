// Writes the whole site as plain HTML files into dist/. Run it again when you
// publish in the app (or from a schedule), then upload dist/ anywhere that
// serves files. There is no server to run, and no script is needed to read a page.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { renderMarkdown } from './lib/markdown.js';
import { createClient } from './lib/softsync.js';
import { dayLabel, faqJsonLd, llmsTxt, postMarkdown, postView, robotsTxt, sitemapXml } from './lib/seo.js';

const env = process.env;
const site = {
  url: (env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  name: env.SITE_NAME ?? 'The Journal',
  tagline: env.SITE_TAGLINE ?? 'Stories, guides and ideas from our team',
};
const links = {
  app: env.SOFTSYNC_APP ?? 'https://app.softsync.ai',
  api: env.SOFTSYNC_API ?? 'https://api.softsync.ai',
  form: env.SOFTSYNC_FORM ?? '',
  booking: env.SOFTSYNC_BOOKING ?? '',
  help: env.SOFTSYNC_HELP ?? '',
  agent: env.SOFTSYNC_AGENT ?? '',
};
const out = env.OUT_DIR ?? 'dist';

const content = createClient({ api: links.api, apiKey: env.SOFTSYNC_API_KEY, cacheSeconds: 3600 });
const [posts, schema, authors, faq] = await Promise.all([content.listPosts({ limit: 100 }), content.schema(), content.authors(), content.listFaq()]);

const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const jsonLdTag = (items) => items.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('\n');

const nav = [
  { label: 'Blog', to: '/blog' },
  ...(links.help ? [{ label: 'Help', to: '/help' }] : []),
  ...(faq.length ? [{ label: 'FAQ', to: '/faq' }] : []),
  ...(links.form ? [{ label: 'Contact', to: '/contact' }] : []),
  ...(links.booking ? [{ label: 'Book', to: '/book' }] : []),
];

/** The frame every page shares. `head` adds a page's own search and sharing details. */
function page({ title, description = site.tagline, path, robots = 'index,follow', image, article, jsonLd = [], body }) {
  const canonical = `${site.url}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:type" content="${article ? 'article' : 'website'}">
${image ? `<meta property="og:image" content="${esc(image)}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
${article ? `<meta property="article:published_time" content="${esc(article.publishedTime)}">\n<meta property="article:modified_time" content="${esc(article.modifiedTime)}">\n<meta property="article:author" content="${esc(article.author)}">` : ''}
<link rel="alternate" type="text/plain" href="${site.url}/llms.txt" title="For AI assistants">
<link rel="stylesheet" href="/styles.css">
${jsonLdTag(jsonLd)}
</head>
<body class="bg-stone-50 text-stone-900 antialiased">
<header class="sticky top-0 z-10 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
  <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
    <a href="/" class="font-serif text-2xl font-bold tracking-tight">${esc(site.name)}</a>
    <nav class="flex flex-1 gap-5 text-[15px] text-stone-600">${nav.map((item) => `<a href="${item.to}" class="hover:text-orange-700">${item.label}</a>`).join('')}</nav>
    <form action="/search" role="search" class="flex gap-2">
      <input type="search" name="q" placeholder="Search articles" aria-label="Search articles" class="w-56 rounded-full border border-stone-300 bg-white px-4 py-2 text-[15px] outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20">
      <button class="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">Search</button>
    </form>
  </div>
</header>
${body}
<footer class="mt-20 border-t border-stone-200 py-8 text-sm text-stone-500">
  <div class="mx-auto max-w-6xl px-6"><b>${esc(site.name)}</b> · ${esc(site.tagline)} · <a href="/sitemap.xml">Sitemap</a> · <a href="/llms.txt">For AI assistants</a></div>
</footer>
${links.agent ? `<script src="${esc(links.app)}/web-agent.js" data-agent="${esc(links.agent)}" async></script>` : ''}
</body>
</html>
`;
}

const card = (post) => `<article class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl" data-post="${esc(post.slug)}">
  <a href="/blog/${esc(post.slug)}" tabindex="-1" aria-hidden="true" class="block aspect-video bg-stone-100">${post.cover ? `<img src="${esc(post.cover.url)}" alt="" loading="lazy" class="h-full w-full object-cover">` : ''}</a>
  <div class="flex flex-1 flex-col gap-2 p-6">
    <div class="flex flex-wrap gap-1.5">${post.tags.map((tag) => `<a href="/tag/${esc(tag)}" class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800 hover:bg-orange-100">${esc(schema.tags[tag] ?? tag)}</a>`).join('')}</div>
    <h2 class="font-serif text-2xl leading-snug font-bold tracking-tight"><a href="/blog/${esc(post.slug)}">${esc(post.title)}</a></h2>
    <p class="flex-1 text-stone-600">${esc(post.summary)}</p>
    <p class="text-sm text-stone-500">${esc(authors[post.author]?.name ?? 'The team')} · ${dayLabel(post.publishedOn)} · ${post.readingMinutes} min read</p>
  </div>
</article>`;

const listing = (heading, items, active = '') => `<main class="mx-auto max-w-6xl px-6">
  <nav aria-label="Filter by tag" class="mt-8 flex flex-wrap gap-2">
    <a href="/blog" class="rounded-full border px-4 py-1.5 text-sm ${active === '' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'}">All</a>
    ${Object.entries(schema.tags).map(([value, label]) => `<a href="/tag/${esc(value)}" class="rounded-full border px-4 py-1.5 text-sm ${active === value ? 'border-orange-700 bg-orange-700 text-white' : 'border-stone-300 bg-white hover:border-orange-600'}">${esc(label)}</a>`).join('')}
  </nav>
  <h1 class="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">${esc(heading)} <small class="ml-2 font-normal tracking-normal normal-case" id="count">${items.length} ${items.length === 1 ? 'article' : 'articles'}</small></h1>
  <div id="posts" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">${items.map(card).join('\n')}</div>
  <p id="empty" class="text-stone-500 italic" ${items.length ? 'hidden' : ''}>Nothing here yet. Try another tag or search.</p>
</main>`;

const embed = (kind, value, title) => `<script src="${esc(links.app)}/embed.js" data-page="${kind}/${esc(value)}" data-title="${esc(title)}" async></script>`;
const frame = (title, inner) => `<main class="mx-auto max-w-5xl px-6"><h1 class="mt-10 mb-6 font-serif text-5xl font-bold tracking-tight">${esc(title)}</h1>${inner}</main>`;

/** Your own design for the form: the questions are read now, and written as ordinary fields. */
async function ownForm() {
  const view = await (await fetch(`${links.api}/public/forms/${links.form}`)).json();
  const input = 'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20';
  const fields = (view.fields ?? []).filter((field) => field.kind !== 'file').map((field) => {
    const required = field.required ? 'required' : '';
    const control =
      field.kind === 'select'
        ? `<select name="${esc(field.id)}" ${required} class="${input}"><option value="">Choose…</option>${(field.choices ?? []).map((choice) => `<option value="${esc(choice.value)}">${esc(choice.label)}</option>`).join('')}</select>`
        : field.inputType === 'textarea'
          ? `<textarea name="${esc(field.id)}" ${required} rows="4" class="${input}"></textarea>`
          : `<input name="${esc(field.id)}" ${required} type="${field.inputType === 'email' ? 'email' : field.inputType === 'phone' ? 'tel' : 'text'}" class="${input}">`;
    return `<label class="flex flex-col gap-1 text-sm font-medium text-stone-700">${esc(field.label)}${control}</label>`;
  });
  return `<form id="own-form" action="${esc(links.api)}/public/forms/${esc(links.form)}" method="POST" class="flex flex-col gap-4">
  ${fields.join('\n  ')}
  <input type="text" name="_website" tabindex="-1" autocomplete="off" hidden>
  <button type="submit" class="self-start rounded-full bg-stone-900 px-6 py-2.5 font-medium text-white hover:bg-orange-700">Send</button>
  <p id="own-form-result" role="status" class="text-emerald-900"></p>
</form>
<script>
  // Without this the browser sends the form and shows the form's confirmation page.
  // With it, the visitor stays here and sees the confirmation text.
  document.getElementById('own-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const response = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new URLSearchParams(new FormData(form)) });
    const answer = await response.json().catch(() => ({}));
    document.getElementById('own-form-result').textContent = response.ok ? (answer.message || 'Thank you!') : 'Something went wrong. Please try again.';
  });
</script>`;
}

/** Search works in the browser from a small file of titles and summaries. */
const searchPage = `<main class="mx-auto max-w-6xl px-6">
  <h1 class="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase" id="heading">Search</h1>
  <div id="posts" class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"></div>
  <p id="empty" class="text-stone-500 italic" hidden>Nothing here yet. Try another tag or search.</p>
</main>
<script>
  const q = (new URLSearchParams(location.search).get('q') || '').trim().toLowerCase();
  document.getElementById('heading').textContent = q ? 'Results for “' + q + '”' : 'Search';
  fetch('/search.json').then((r) => r.json()).then((posts) => {
    const hits = q ? posts.filter((post) => (post.title + ' ' + post.summary + ' ' + post.text).toLowerCase().includes(q)) : [];
    document.getElementById('empty').hidden = hits.length > 0;
    document.getElementById('posts').innerHTML = hits.map((post) => post.card).join('');
  });
</script>`;

const files = new Map();
const add = (path, text) => files.set(path, text);
const visible = posts.filter((post) => !post.hidden);

add('index.html', page({
  title: `${site.name} — ${site.tagline}`,
  path: '/',
  jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: site.url }],
  body: `<main class="mx-auto max-w-6xl px-6">
  <section class="py-16"><h1 class="font-serif text-6xl leading-none font-bold tracking-tight">${esc(site.name)}</h1><p class="mt-4 max-w-xl text-xl text-stone-600">${esc(site.tagline)}</p></section>
  <h2 class="mt-14 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">From the blog <a href="/blog" class="ml-2 font-normal tracking-normal normal-case underline">All articles</a></h2>
  <div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">${visible.slice(0, 3).map(card).join('\n')}</div>
</main>`,
}));

add('blog/index.html', page({ title: 'Blog', path: '/blog', body: listing('Latest articles', visible) }));
for (const [tag, label] of Object.entries(schema.tags)) {
  const items = visible.filter((post) => post.tags.includes(tag));
  add(`tag/${tag}/index.html`, page({ title: label, path: `/tag/${tag}`, body: listing(label, items, tag) }));
}
add('search/index.html', page({ title: 'Search', path: '/search', robots: 'noindex,follow', body: searchPage }));

const searchIndex = [];
for (const summary of posts) {
  const post = await content.getPost(summary.slug);
  if (!post) continue;
  const view = postView({ post, authors, schema, siteUrl: site.url, siteName: site.name });
  const { author } = view;
  searchIndex.push({ title: post.title, summary: post.summary, text: post.sections.map((section) => section.body).join(' ').slice(0, 4000), card: card(post), hidden: post.hidden });
  add(`blog/${post.slug}.md`, postMarkdown({ post, authors }));
  add(`blog/${post.slug}/index.html`, page({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    robots: view.robots,
    image: post.cover?.url,
    article: { publishedTime: post.publishedOn, modifiedTime: post.updatedAt, author: author.name },
    jsonLd: view.jsonLd,
    body: `<main class="mx-auto max-w-3xl px-6"><article>
  <p class="mt-9 mb-3 text-sm text-stone-500"><a href="/">Home</a> / <a href="/blog">Blog</a> / ${esc(view.categoryLabel)}</p>
  <div class="flex flex-wrap gap-1.5">${view.tagLabels.map((tag) => `<a href="/tag/${esc(tag.value)}" class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">${esc(tag.label)}</a>`).join('')}</div>
  <h1 class="mt-3 font-serif text-5xl leading-tight font-bold tracking-tight">${esc(post.title)}</h1>
  <p class="mt-4 text-xl text-stone-700">${esc(post.summary)}</p>
  <div class="mt-6 flex items-center gap-3 text-[15px]">
    ${author.avatar ? `<img src="${esc(author.avatar)}" alt="" class="size-11 rounded-full object-cover">` : `<span class="grid size-11 place-items-center rounded-full bg-orange-700 font-bold text-white">${esc(author.name[0])}</span>`}
    <div><b>${esc(author.name)}</b><br><small class="text-stone-500">Published <time datetime="${esc(post.publishedOn)}">${dayLabel(post.publishedOn)}</time> · ${post.readingMinutes} min read</small></div>
  </div>
  ${post.cover ? `<figure class="my-8"><img src="${esc(post.cover.url)}" alt="${esc(post.cover.alt)}" fetchpriority="high" class="w-full rounded-2xl"></figure>` : ''}
  ${post.takeaways.length ? `<aside class="mb-8 rounded-r-2xl border-l-4 border-orange-700 bg-orange-50 px-6 py-5"><h2 class="mb-2 text-xs font-bold tracking-widest text-orange-800 uppercase">In short</h2><ul class="list-disc pl-5">${post.takeaways.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></aside>` : ''}
  ${view.headings.length > 2 ? `<nav aria-label="On this page" class="mb-8 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[15px]"><b>On this page</b>${view.headings.map((heading) => `<a href="#${esc(heading.id)}" class="${heading.level > 2 ? 'ml-4' : ''}">${esc(heading.text)}</a>`).join('')}</nav>` : ''}
  <div class="prose prose-stone prose-lg prose-a:text-orange-700 max-w-none">${view.html}</div>
  ${post.faqs.length ? `<section class="mt-12 border-t border-stone-200 pt-4"><h2 class="mb-4 font-serif text-2xl font-bold">Questions people ask</h2>${post.faqs.map((item) => `<details class="mb-2.5 rounded-xl border border-stone-200 bg-white px-5 py-3.5"><summary class="cursor-pointer font-semibold">${esc(item.question)}</summary><p class="mt-2 text-stone-700">${esc(item.answer)}</p></details>`).join('')}</section>` : ''}
  ${post.sources.length ? `<section class="mt-12 border-t border-stone-200 pt-4 text-[15px] text-stone-600"><h2 class="mb-2 font-serif text-2xl font-bold text-stone-900">Sources</h2><ul class="list-disc pl-5">${post.sources.map((source) => `<li>${/^https?:/.test(source) ? `<a href="${esc(source)}" rel="noopener" class="underline">${esc(source)}</a>` : esc(source)}</li>`).join('')}</ul></section>` : ''}
</article></main>`,
  }));
}
add('search.json', JSON.stringify(searchIndex.filter((post) => !post.hidden).map(({ hidden, ...rest }) => rest)));

if (faq.length) {
  const groups = new Map();
  for (const item of faq) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  add('faq/index.html', page({
    title: 'FAQ',
    description: 'Answers to the questions we hear most, from our help centre.',
    path: '/faq',
    jsonLd: [faqJsonLd(faq)],
    body: `<main class="mx-auto max-w-3xl px-6"><h1 class="mt-10 font-serif text-5xl font-bold tracking-tight">Frequently asked questions</h1>
${[...groups].map(([category, items]) => `<section class="mt-10"><h2 class="mb-3 font-serif text-2xl font-bold">${esc(schema.articleCategories[category] ?? 'General')}</h2>${items.map((item) => `<details class="mb-2.5 rounded-xl border border-stone-200 bg-white px-5 py-3.5"><summary class="cursor-pointer font-semibold">${esc(item.question)}</summary><div class="prose prose-stone mt-2">${renderMarkdown(item.answer).html}</div></details>`).join('')}</section>`).join('\n')}
</main>`,
  }));
}
if (links.help) add('help/index.html', page({ title: 'Help centre', path: '/help', body: frame('Help centre', embed('portal', links.help, 'Help centre')) }));
if (links.booking) add('book/index.html', page({ title: 'Book a time', path: '/book', body: frame('Book a time', embed('book', links.booking, 'Book a time')) }));
if (links.form) {
  add('contact/index.html', page({
    title: 'Contact',
    path: '/contact',
    body: `<main class="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-2">
  <section><h1 class="mt-10 mb-6 font-serif text-4xl font-bold tracking-tight">Write to us</h1><h2 class="mb-3 text-sm font-semibold tracking-widest text-stone-500 uppercase">The app’s own look</h2>${embed('forms', links.form, 'Contact')}</section>
  <section><h2 class="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase md:mt-[4.9rem]">Your own design</h2>${await ownForm()}</section>
</main>`,
  }));
}

add('sitemap.xml', sitemapXml({ siteUrl: site.url, posts, schema, hasFaq: faq.length > 0, pages: [...(links.help ? ['/help'] : []), ...(links.form ? ['/contact'] : []), ...(links.booking ? ['/book'] : [])] }));
add('robots.txt', robotsTxt(site.url));
add('llms.txt', llmsTxt({ siteUrl: site.url, siteName: site.name, tagline: site.tagline, posts, faq }));

await rm(out, { recursive: true, force: true });
for (const [path, text] of files) {
  await mkdir(dirname(join(out, path)), { recursive: true });
  await writeFile(join(out, path), text);
}
console.log(`Wrote ${files.size} files to ${out}/`);
