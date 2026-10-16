import Link from 'next/link';

import { content } from '@/lib/site';
import { PostCard } from './PostCard';

/** The blog's list page body: tag chips, a heading and the cards. Used by the list, tag and search pages. */
export async function PostList({ tag, q, heading }: { tag?: string; q?: string; heading: string }) {
  const [posts, authors, schema] = await Promise.all([content().listPosts({ tag, q }), content().authors(), content().schema()]);
  const visible = posts.filter((post: { hidden: boolean }) => !post.hidden || q);
  return (
    <main className="mx-auto max-w-6xl px-6">
      <nav aria-label="Filter by tag" className="mt-8 flex flex-wrap gap-2">
        <Link href="/blog" className={`rounded-full border px-4 py-1.5 text-sm ${!tag && !q ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'}`}>
          All
        </Link>
        {Object.entries(schema.tags as Record<string, string>).map(([value, label]) => (
          <Link
            key={value}
            href={`/tag/${value}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${tag === value ? 'border-orange-700 bg-orange-700 text-white' : 'border-stone-300 bg-white hover:border-orange-600'}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <h1 className="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
        {heading} <small className="ml-2 font-normal tracking-normal normal-case">{visible.length} {visible.length === 1 ? 'article' : 'articles'}</small>
      </h1>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post: any) => (
          <PostCard key={post.id} post={post} authors={authors} tags={schema.tags} />
        ))}
      </div>
      {visible.length === 0 && <p className="text-stone-500 italic">Nothing here yet. Try another tag or search.</p>}
    </main>
  );
}
