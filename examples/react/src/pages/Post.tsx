import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';

import { getPost, type PostPage } from '../lib/cms';
import { dayLabel } from '../lib/seo.js';
import { useHead } from '../lib/useHead';

export function Post() {
  const { slug = '' } = useParams();
  const [view, setView] = useState<PostPage | null | undefined>(undefined);

  useEffect(() => {
    setView(undefined);
    getPost(slug).then(setView);
  }, [slug]);
  useHead(view ? view.post.title : 'Article', view?.post.summary);

  if (view === undefined) return <main className="mx-auto max-w-3xl px-6 py-20 text-stone-500">Loading…</main>;
  if (view === null) return <main className="mx-auto max-w-3xl px-6 py-20 text-xl">We could not find that article.</main>;
  const { post, author } = view;

  return (
    <main className="mx-auto max-w-3xl px-6">
      <article>
        <p className="mt-9 mb-3 text-sm text-stone-500">
          <Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / {view.categoryLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {view.tagLabels.map((tag) => (
            <Link key={tag.value} to={`/tag/${tag.value}`} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
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
            <img src={post.cover.url} alt={post.cover.alt} className="w-full rounded-2xl" />
          </figure>
        )}
        {post.takeaways.length > 0 && (
          <aside className="mb-8 rounded-r-2xl border-l-4 border-orange-700 bg-orange-50 px-6 py-5">
            <h2 className="mb-2 text-xs font-bold tracking-widest text-orange-800 uppercase">In short</h2>
            <ul className="list-disc pl-5">
              {post.takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        )}
        {view.headings.length > 2 && (
          <nav aria-label="On this page" className="mb-8 flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-[15px]">
            <b>On this page</b>
            {view.headings.map((heading) => (
              <a key={heading.id} href={`#${heading.id}`} className={heading.level > 2 ? 'ml-4' : ''}>
                {heading.text}
              </a>
            ))}
          </nav>
        )}
        {/* The small server made this HTML safe: its Markdown reader escapes everything before it adds markup. */}
        <div className="prose prose-stone prose-lg prose-a:text-orange-700 max-w-none" dangerouslySetInnerHTML={{ __html: view.html }} />
        {post.faqs.length > 0 && (
          <section className="mt-12 border-t border-stone-200 pt-4">
            <h2 className="mb-4 font-serif text-2xl font-bold">Questions people ask</h2>
            {post.faqs.map((faq) => (
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
              {post.sources.map((source) => (
                <li key={source}>{/^https?:/.test(source) ? <a href={source} rel="noopener" className="underline">{source}</a> : source}</li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
