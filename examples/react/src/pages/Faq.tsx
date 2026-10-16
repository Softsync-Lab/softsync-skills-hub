import { useEffect, useState } from 'react';

import { listFaq } from '../lib/cms';
import { renderMarkdown } from '../lib/markdown.js';
import { useHead } from '../lib/useHead';

/** The help centre's public articles as a FAQ page. Team-only articles never leave the app. */
export function Faq() {
  const [data, setData] = useState<Awaited<ReturnType<typeof listFaq>> | undefined>(undefined);
  useEffect(() => {
    listFaq().then(setData);
  }, []);
  useHead('FAQ', 'Answers to the questions we hear most, from our help centre.');

  const groups = new Map<string, NonNullable<typeof data>['items']>();
  for (const item of data?.items ?? []) groups.set(item.category, [...(groups.get(item.category) ?? []), item]);

  return (
    <main className="mx-auto max-w-3xl px-6">
      <h1 className="mt-10 font-serif text-5xl font-bold tracking-tight">Frequently asked questions</h1>
      {[...groups].map(([category, items]) => (
        <section key={category} className="mt-10">
          <h2 className="mb-3 font-serif text-2xl font-bold">{data?.categories[category] ?? 'General'}</h2>
          {items.map((item) => (
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
