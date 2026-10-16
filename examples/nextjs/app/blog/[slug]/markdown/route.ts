import { content } from '@/lib/site';
import { postMarkdown } from '@/lib/seo.js';

/** /blog/<slug>.md: the post as clean Markdown (see the rewrite in next.config.mjs). */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = await content().getPost((await params).slug);
  if (!post) return new Response('Not found', { status: 404 });
  const authors = await content().authors();
  return new Response(postMarkdown({ post, authors }), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
