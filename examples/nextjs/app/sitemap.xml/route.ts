import { content, links, site } from '@/lib/site';
import { sitemapXml } from '@/lib/seo.js';

// Made when asked for, so it always lists what is published right now.
export const dynamic = 'force-dynamic';

/** New posts are listed the moment they are published: no list to keep by hand. */
export async function GET() {
  const [posts, schema, faq] = await Promise.all([content().listPosts({ limit: 100 }), content().schema(), content().listFaq()]);
  const pages = [...(links.help ? ['/help'] : []), ...(links.form ? ['/contact'] : []), ...(links.booking ? ['/book'] : [])];
  return new Response(sitemapXml({ siteUrl: site.url, posts, schema, hasFaq: faq.length > 0, pages }), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
