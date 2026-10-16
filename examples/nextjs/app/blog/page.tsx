import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { PostList } from '@/components/PostList';
import { content, site } from '@/lib/site';

export const metadata: Metadata = { title: 'Blog', alternates: { canonical: '/blog' } };

export default async function Blog() {
  const posts = await content().listPosts({ limit: 10 });
  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: site.name,
            description: site.tagline,
            url: `${site.url}/blog`,
            blogPost: posts.map((post: any) => ({ '@type': 'BlogPosting', headline: post.title, url: `${site.url}/blog/${post.slug}`, datePublished: post.publishedOn })),
          },
        ]}
      />
      <PostList heading="Latest articles" />
    </>
  );
}
