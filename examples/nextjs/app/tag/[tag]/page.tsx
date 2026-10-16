import type { Metadata } from 'next';

import { PostList } from '@/components/PostList';
import { content } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const label = (await content().schema()).tags[tag] ?? tag;
  return { title: label, description: `Articles tagged ${label}.`, alternates: { canonical: `/tag/${tag}` } };
}

export default async function Tag({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const label = (await content().schema()).tags[tag] ?? tag;
  return <PostList tag={tag} heading={label} />;
}
