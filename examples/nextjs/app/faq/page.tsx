import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { JsonLd } from '@/components/JsonLd';
import { content } from '@/lib/site';
import { faqJsonLd } from '@/lib/seo.js';
import { renderMarkdown } from '@/lib/markdown.js';

export const metadata: Metadata = { title: 'FAQ', description: 'Answers to the questions we hear most, from our help centre.', alternates: { canonical: '/faq' } };

/** The help centre's public articles as a FAQ page. Team-only articles never leave the app. */
export default async function Faq() {
  const [faq, schema] = await Promise.all([content().listFaq(), content().schema()]);
  if (faq.length === 0) notFound();
  const groups = new Map<string, typeof faq>();
  for (const item of faq) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);
  return (
    <main className="mx-auto max-w-3xl px-6">
      <JsonLd data={[faqJsonLd(faq)]} />
      <h1 className="mt-10 font-serif text-5xl font-bold tracking-tight">Frequently asked questions</h1>
      {[...groups].map(([category, items]) => (
        <section key={category} className="mt-10">
          <h2 className="mb-3 font-serif text-2xl font-bold">{schema.articleCategories[category] ?? 'General'}</h2>
          {items.map((item: { id: string; question: string; answer: string }) => (
            <details key={item.id} className="mb-2.5 rounded-xl border border-stone-200 bg-white px-5 py-3.5">
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <div className="prose prose-stone mt-2" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answer).html }} />
            </details>
          ))}
        </section>
      ))}
    </main>
  );
}
