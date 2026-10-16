import Link from 'next/link';

import { dayLabel } from '@/lib/seo.js';

interface Post {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  author: string | null;
  publishedOn: string;
  readingMinutes: number;
  cover: { url: string; alt: string } | null;
}

/** One post in a list: picture, tags, title, summary. */
export function PostCard({ post, authors, tags }: { post: Post; authors: Record<string, { name: string }>; tags: Record<string, string> }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden className="block aspect-video bg-stone-100">
        {post.cover && <img src={post.cover.url} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tag/${tag}`} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800 hover:bg-orange-100">
              {tags[tag] ?? tag}
            </Link>
          ))}
        </div>
        <h2 className="font-serif text-2xl leading-snug font-bold tracking-tight">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="flex-1 text-stone-600">{post.summary}</p>
        <p className="text-sm text-stone-500">
          {authors[post.author ?? '']?.name ?? 'The team'} · {dayLabel(post.publishedOn)} · {post.readingMinutes} min read
        </p>
      </div>
    </article>
  );
}
