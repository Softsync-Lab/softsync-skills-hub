import type { Metadata } from 'next';

import { PostList } from '@/components/PostList';

// Search results are for people, not for search engines.
export const metadata: Metadata = { title: 'Search', robots: { index: false, follow: true } };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').trim().slice(0, 100);
  return <PostList q={q || undefined} heading={q ? `Results for “${q}”` : 'Search'} />;
}
