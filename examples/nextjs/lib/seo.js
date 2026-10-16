// What search engines and AI assistants read. Pure functions: give them the
// posts the CMS returned and the site's address, get back data or text.
// Every example uses these same functions, so the output is identical.
import { renderMarkdown } from './markdown.js';

const text = (value) => String(value ?? '');
const xml = (value) => text(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

export const dayLabel = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** Everything one post page needs: the HTML of its sections, its contents list and its structured data. */
export function postView({ post, authors, schema, siteUrl, siteName }) {
  const base = siteUrl.replace(/\/$/, '');
  const author = authors[post.author] ?? { name: 'The team', avatar: null };
  const sections = post.sections.map((section) => renderMarkdown(section.body));
  const url = post.canonicalUrl || `${base}/blog/${post.slug}`;
  const image = post.cover ? post.cover.url : undefined;
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedOn,
    dateModified: post.updatedAt,
    ...(image ? { image: [image] } : {}),
    author: { '@type': 'Person', name: author.name, ...(author.avatar ? { image: author.avatar } : {}) },
    publisher: { '@type': 'Organization', name: siteName, url: base },
    keywords: [post.focusKeyword, ...post.tags.map((tag) => schema.tags[tag] ?? tag)].filter(Boolean).join(', '),
    articleSection: schema.categories[post.category] ?? undefined,
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingMinutes}M`,
    ...(post.sources.length
      ? { citation: post.sources.map((source) => (/^https?:/.test(source) ? { '@type': 'CreativeWork', url: source } : { '@type': 'CreativeWork', name: source })) }
      : {}),
  };
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  return {
    post,
    author,
    url,
    html: sections.map((section) => section.html).join('\n'),
    headings: sections.flatMap((section) => section.headings).filter((heading) => heading.level <= 3),
    categoryLabel: schema.categories[post.category] ?? 'Articles',
    tagLabels: post.tags.map((tag) => ({ value: tag, label: schema.tags[tag] ?? tag })),
    // One <script type="application/ld+json"> each. A FAQ block lets assistants quote the answers.
    jsonLd: [article, breadcrumbs, ...(post.faqs.length ? [faqJsonLd(post.faqs)] : [])],
    // `noindex` for a post marked "hide from search engines".
    robots: post.hidden ? 'noindex, follow' : 'index, follow, max-image-preview:large',
  };
}

export function faqJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
  };
}

/** The sitemap grows by itself: every published, indexable post is listed with its picture. */
/** @param {{ siteUrl: string, posts: any[], schema: any, hasFaq: boolean, pages?: string[] }} options */
export function sitemapXml({ siteUrl, posts, schema, hasFaq, pages = [] }) {
  const base = siteUrl.replace(/\/$/, '');
  const visible = posts.filter((post) => !post.hidden);
  const urls = [
    `<url><loc>${base}/</loc></url>`,
    `<url><loc>${base}/blog</loc><lastmod>${xml(visible[0]?.updatedAt ?? new Date().toISOString())}</lastmod></url>`,
    ...pages.map((page) => `<url><loc>${base}${page}</loc></url>`),
    ...(hasFaq ? [`<url><loc>${base}/faq</loc></url>`] : []),
    ...Object.keys(schema.tags)
      .filter((tag) => visible.some((post) => post.tags.includes(tag)))
      .map((tag) => `<url><loc>${base}/tag/${xml(tag)}</loc></url>`),
    ...visible.map(
      (post) =>
        `<url><loc>${base}/blog/${xml(post.slug)}</loc><lastmod>${xml(post.updatedAt)}</lastmod>${post.cover ? `<image:image><image:loc>${xml(post.cover.url)}</image:loc></image:image>` : ''}</url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>`;
}

export function robotsTxt(siteUrl) {
  return `User-agent: *\nAllow: /\nDisallow: /search\n\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`;
}

/** A plain-text map of the site for AI assistants (the llms.txt convention). */
export function llmsTxt({ siteUrl, siteName, tagline, posts, faq }) {
  const base = siteUrl.replace(/\/$/, '');
  const visible = posts.filter((post) => !post.hidden);
  return [
    `# ${siteName}`,
    '',
    `> ${tagline}`,
    '',
    '## Articles',
    '',
    ...visible.map((post) => `- [${post.title}](${base}/blog/${post.slug}.md): ${post.summary}`),
    ...(faq.length ? ['', '## Help', '', `- [Frequently asked questions](${base}/faq): ${faq.length} answers from the help centre`] : []),
    '',
  ].join('\n');
}

/** One post as clean Markdown: details first, then its sections and questions. */
export function postMarkdown({ post, authors }) {
  const who = authors[post.author]?.name ?? 'The team';
  return [
    `# ${post.title}`,
    '',
    `*By ${who} · ${dayLabel(post.publishedOn)} · ${post.readingMinutes} min read*`,
    '',
    `> ${post.summary}`,
    '',
    ...(post.takeaways.length ? ['## In short', '', ...post.takeaways.map((item) => `- ${item}`), ''] : []),
    ...post.sections.flatMap((section) => [section.body, '']),
    ...(post.faqs.length ? ['## Questions people ask', '', ...post.faqs.flatMap((faq) => [`**${faq.question}**`, '', faq.answer, ''])] : []),
    ...(post.sources.length ? ['## Sources', '', ...post.sources.map((source) => `- ${source}`), ''] : []),
  ].join('\n');
}
