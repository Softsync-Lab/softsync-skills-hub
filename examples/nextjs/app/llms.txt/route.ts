import { content, site } from '@/lib/site';
import { llmsTxt } from '@/lib/seo.js';

// Made when asked for, so it always lists what is published right now.
export const dynamic = 'force-dynamic';

/** A plain-text map of the site for AI assistants (the llms.txt convention). */
export async function GET() {
  const [posts, faq] = await Promise.all([content().listPosts({ limit: 100 }), content().listFaq()]);
  return new Response(llmsTxt({ siteUrl: site.url, siteName: site.name, tagline: site.tagline, posts, faq }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
