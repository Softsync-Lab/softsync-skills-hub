import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { PostCard } from '../components/PostCard';
import { Landing } from '../components/Landing';
import { listBlocks, listPosts, type Block } from '../lib/cms';
import { links } from '../lib/config';
import { useHead } from '../lib/useHead';

export function Home({ site }: { site: { name: string; tagline: string } }) {
  const [data, setData] = useState<Awaited<ReturnType<typeof listPosts>>>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  useEffect(() => {
    listPosts().then(setData);
    listBlocks().then(setBlocks);
  }, []);
  useHead(site.name ? `${site.name} — ${site.tagline}` : 'Loading…', site.tagline);

  const doors = [
    { show: links.help, to: '/help', title: 'Help centre', text: 'Answers to the questions we hear most.' },
    { show: links.form, to: '/contact', title: 'Write to us', text: 'A message that reaches us straight away.' },
    { show: links.booking, to: '/book', title: 'Book a time', text: 'Pick a time that suits you.' },
  ].filter((door) => door.show);

  return (
    <main className="mx-auto max-w-6xl px-6">
      <Landing blocks={blocks} />
      {!blocks.some((block) => block.block === 'hero') && <section className="py-16">
        <h1 className="font-serif text-6xl leading-none font-bold tracking-tight">{site.name}</h1>
        <p className="mt-4 max-w-xl text-xl text-stone-600">{site.tagline}</p>
      </section>}
      {doors.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          {doors.map((door) => (
            <Link key={door.to} to={door.to} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 hover:ring-orange-600">
              <h2 className="font-semibold">{door.title}</h2>
              <p className="mt-1 text-stone-600">{door.text}</p>
            </Link>
          ))}
        </section>
      )}
      <h2 className="mt-14 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
        From the blog{' '}
        <Link to="/blog" className="ml-2 font-normal tracking-normal normal-case underline">
          All articles
        </Link>
      </h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {data?.posts.slice(0, 3).map((post) => <PostCard key={post.id} post={post} authors={data.authors} tags={data.tags} />)}
      </div>
    </main>
  );
}
