import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { content, site } from '@/lib/site';
import { dayLabel, postView } from '@/lib/seo.js';

async function load(slug: string) {
  const post = await content().getPost(slug);
  if (!post) return null;
  const [authors, schema] = await Promise.all([content().authors(), content().schema()]);
  return postView({ post, authors, schema, siteUrl: site.url, siteName: site.name });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const view = await load((await params).slug);
  if (!view) return {};
  const { post } = view;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: view.url },
    robots: view.robots,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      url: view.url,
      publishedTime: post.publishedOn,
      modifiedTime: post.updatedAt,
      authors: [view.author.name],
      images: post.cover ? [{ url: post.cover.url, alt: post.cover.alt }] : [],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const view = await load((await params).slug);
  if (!view) notFound();
  const { post, author } = view;
  return (
    <main className="mx-auto max-w-3xl px-6">
      <JsonLd data={view.jsonLd} />
      <article>
        <p className="mt-9 mb-3 text-sm text-stone-500">
          <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {view.categoryLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {view.tagLabels.map((tag: { value: string; label: string }) => (
            <Link key={tag.value} href={`/tag/${tag.value}`} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
              {tag.label}
            </Link>
          ))}
        </div>
        <h1 className="mt-3 font-serif text-5xl leading-tight font-bold tracking-tight">{post.title}</h1>
        <p className="mt-4 text-xl text-stone-700">{post.summary}</p>
        <div className="mt-6 flex items-center gap-3 text-[15px]">
          {author.avatar ? (
            <img src={author.avatar} alt="" className="size-11 rounded-full object-cover" />
          ) : (
            <span className="grid size-11 place-items-center rounded-full bg-orange-700 font-bold text-white">{author.name[0]}</span>
          )}
          <div>
            <b>{author.name}</b>
            <br />
            <small className="text-stone-500">
              Published <time dateTime={post.publishedOn}>{dayLabel(post.publishedOn)}</time> · {post.readingMinutes} min read
            </small>
          </div>
        </div>
        {post.cover && (
          <figure className="my-8">
            <img src={post.cover.url} alt={post.cover.alt} fetchPriority="high" className="w-full rounded-2xl" />
          </figure>
        )}
        {post.takeaways.length > 0 && (
          <aside className="mb-8 rounded-r-2xl border-l-4 border-orange-700 bg-orange-50 px-6 py-5">
            <h2 className="mb-2 text-xs font-bold tracking-widest text-orange-800 uppercase">In short</h2>
            <ul className="list-disc pl-5">
              {post.takeaways.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        )}
        {view.headings.length > 2 && (
          <nav aria-label="On this page" className="mb-8 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[15px]">
            <b>On this page</b>
            {view.headings.map((heading: { id: string; text: string; level: number }) => (
              <a key={heading.id} href={`#${heading.id}`} className={heading.level > 2 ? 'ml-4' : ''}>
                {heading.text}
              </a>
            ))}
          </nav>
        )}
        {/* The post's text is made safe by the Markdown reader: it escapes everything before it adds markup. */}
        <div className="prose prose-stone prose-lg prose-a:text-orange-700 max-w-none" dangerouslySetInnerHTML={{ __html: view.html }} />
        {post.faqs.length > 0 && (
          <section className="mt-12 border-t border-stone-200 pt-4">
            <h2 className="mb-4 font-serif text-2xl font-bold">Questions people ask</h2>
            {post.faqs.map((faq: { question: string; answer: string }) => (
              <details key={faq.question} className="mb-2.5 rounded-xl border border-stone-200 bg-white px-5 py-3.5">
                <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                <p className="mt-2 text-stone-700">{faq.answer}</p>
              </details>
            ))}
          </section>
        )}
        {post.sources.length > 0 && (
          <section className="mt-12 border-t border-stone-200 pt-4 text-[15px] text-stone-600">
            <h2 className="mb-2 font-serif text-2xl font-bold text-stone-900">Sources</h2>
            <ul className="list-disc pl-5">
              {post.sources.map((source: string) => (
                <li key={source}>{/^https?:/.test(source) ? <a href={source} rel="noopener" className="underline">{source}</a> : source}</li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
