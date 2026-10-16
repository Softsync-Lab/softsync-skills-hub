import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';

import { PostCard } from '../components/PostCard';
import { listPosts } from '../lib/cms';
import { useHead } from '../lib/useHead';

/** The list, a tag's list and search results are one page with a different filter. */
export function Blog() {
  const { tag } = useParams();
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const searching = useLocation().pathname === '/search';
  const [data, setData] = useState<Awaited<ReturnType<typeof listPosts>>>(null);

  useEffect(() => {
    setData(null);
    listPosts({ tag, q: searching ? q : undefined }).then(setData);
  }, [tag, q, searching]);

  const heading = searching ? (q ? `Results for “${q}”` : 'Search') : tag ? (data?.tags[tag] ?? tag) : 'Latest articles';
  useHead(searching ? 'Search' : tag ? (data?.tags[tag] ?? tag) : 'Blog');

  return (
    <main className="mx-auto max-w-6xl px-6">
      <nav aria-label="Filter by tag" className="mt-8 flex flex-wrap gap-2">
        <Link to="/blog" className={`rounded-full border px-4 py-1.5 text-sm ${!tag && !searching ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white'}`}>
          All
        </Link>
        {Object.entries(data?.tags ?? {}).map(([value, label]) => (
          <Link
            key={value}
            to={`/tag/${value}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${tag === value ? 'border-orange-700 bg-orange-700 text-white' : 'border-stone-300 bg-white hover:border-orange-600'}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <h1 className="mt-10 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
        {heading}
        {data && (
          <small className="ml-2 font-normal tracking-normal normal-case">
            {data.posts.length} {data.posts.length === 1 ? 'article' : 'articles'}
          </small>
        )}
      </h1>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {data?.posts.map((post) => <PostCard key={post.id} post={post} authors={data.authors} tags={data.tags} />)}
      </div>
      {data?.posts.length === 0 && <p className="text-stone-500 italic">Nothing here yet. Try another tag or search.</p>}
    </main>
  );
}
