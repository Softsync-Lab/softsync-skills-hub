import type { APIRoute } from 'astro';

import { content, site } from '../lib/site';
import { llmsTxt } from '../lib/seo.js';

/** A plain-text map of the site for AI assistants (the llms.txt convention). */
export const GET: APIRoute = async () => {
  const [posts, faq] = await Promise.all([content().listPosts({ limit: 100 }), content().listFaq()]);
  return new Response(llmsTxt({ siteUrl: site.url, siteName: site.name, tagline: site.tagline, posts, faq }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
