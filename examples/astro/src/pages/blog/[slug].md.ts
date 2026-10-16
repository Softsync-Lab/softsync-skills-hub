import type { APIRoute } from 'astro';

import { content } from '../../lib/site';
import { postMarkdown } from '../../lib/seo.js';

/** /blog/<slug>.md: the post as clean Markdown, for AI assistants. */
export const GET: APIRoute = async ({ params }) => {
  const post = await content().getPost(params.slug!);
  if (!post) return new Response('Not found', { status: 404 });
  const authors = await content().authors();
  return new Response(postMarkdown({ post, authors }), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
