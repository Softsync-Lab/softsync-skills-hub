import Link from 'next/link';

import { Landing } from '@/components/Landing';
import { PostCard } from '@/components/PostCard';
import { content, links, site } from '@/lib/site';

export default async function Home() {
  const [posts, authors, schema, blocks] = await Promise.all([content().listPosts({ limit: 3 }), content().authors(), content().schema(), content().listItems('site_blocks')]);
  const hasHero = blocks.some((block: any) => block.block === 'hero');
  const doors = [
    { show: links.help, href: '/help', title: 'Help centre', text: 'Answers to the questions we hear most.' },
    { show: links.form, href: '/contact', title: 'Write to us', text: 'A message that reaches us straight away.' },
    { show: links.booking, href: '/book', title: 'Book a time', text: 'Pick a time that suits you.' },
  ].filter((door) => door.show);
  return (
    <main className="mx-auto max-w-6xl px-6">
      <Landing blocks={blocks} />
      {!hasHero && <section className="py-16">
        <h1 className="font-serif text-6xl leading-none font-bold tracking-tight">{site.name}</h1>
        <p className="mt-4 max-w-xl text-xl text-stone-600">{site.tagline}</p>
      </section>}
      {doors.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          {doors.map((door) => (
            <Link key={door.href} href={door.href} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 hover:ring-orange-600">
              <h2 className="font-semibold">{door.title}</h2>
              <p className="mt-1 text-stone-600">{door.text}</p>
            </Link>
          ))}
        </section>
      )}
      <h2 className="mt-14 mb-6 text-sm font-semibold tracking-widest text-stone-500 uppercase">
        From the blog <Link href="/blog" className="ml-2 font-normal tracking-normal normal-case underline">All articles</Link>
      </h2>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} authors={authors} tags={schema.tags} />
        ))}
      </div>
    </main>
  );
}
